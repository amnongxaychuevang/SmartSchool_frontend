<template>
  <div class="flex flex-col gap-4">
    <!-- Map Control Bar -->
    <div class="panel p-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">
              {{ $t('transport.fleet_map_title') }}
            </h3>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {{ activeVehiclesCount }} {{ $t('transport.buses_active') }}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ $t('transport.fleet_map_subtitle') }}
          </p>
        </div>
      </div>

      <!-- Action Controls -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
          @click="fitAllBuses"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          {{ $t('transport.fit_bounds') }}
        </button>

        <button
          type="button"
          class="text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all font-semibold"
          :class="isSimulating ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'btn-primary py-1.5'"
          @click="toggleSimulation"
        >
          <span v-if="isSimulating" class="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ isSimulating ? $t('transport.stop_simulation') : $t('transport.start_simulation') }}
        </button>

        <button
          type="button"
          class="btn-secondary text-xs p-2 shrink-0"
          :title="$t('common.refresh')"
          @click="fetchFleet"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Map & Fleet Sidebar Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
      <!-- Main Map (3 cols on lg) -->
      <div class="lg:col-span-3 relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner">
        <div id="admin-fleet-map" ref="mapContainer" class="w-full h-full z-10" />

        <!-- Map Loading Overlay -->
        <div v-if="loading" class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center z-20">
          <LoadingSpinner />
          <p class="mt-2 text-xs text-slate-500">{{ $t('transport.loading_fleet') }}</p>
        </div>

        <!-- Legend Overlay -->
        <div class="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs shadow-sm flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-white font-bold">🚌</span>
            <span>{{ $t('transport.legend_active_bus') }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>{{ $t('transport.legend_route') }}</span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>{{ $t('transport.legend_school') }}</span>
          </div>
        </div>
      </div>

      <!-- Fleet Bus List (1 col on lg) -->
      <div class="panel p-4 flex flex-col gap-3 max-h-[520px] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ $t('transport.fleet_list') }} ({{ fleet.length }})
          </h4>
          <span class="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Live GPS</span>
        </div>

        <div v-if="!fleet.length && !loading" class="text-center py-8 text-xs text-slate-400">
          {{ $t('transport.no_vehicles') }}
        </div>

        <div
          v-for="bus in fleet"
          :key="bus.vehicleId"
          class="p-3 rounded-xl border transition-all cursor-pointer hover:border-teal-400 dark:hover:border-teal-600 group"
          :class="selectedVehicleId === bus.vehicleId ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'"
          @click="focusBus(bus)"
        >
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center text-sm font-bold">
                🚌
              </span>
              <div>
                <p class="font-bold text-xs text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {{ bus.plateNumber }}
                </p>
                <p class="text-[10px] text-slate-400">{{ bus.model || 'School Bus' }}</p>
              </div>
            </div>
            <span
              class="px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase"
              :class="(bus.speed && bus.speed > 0) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'"
            >
              {{ (bus.speed && bus.speed > 0) ? `${Math.round(bus.speed)} km/h` : $t('transport.parked') }}
            </span>
          </div>

          <div class="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
            <p class="flex items-center gap-1.5">
              <span>👤</span>
              <span class="truncate">{{ bus.driverName || '—' }}</span>
              <span v-if="bus.driverPhone" class="text-[10px] text-slate-400">({{ bus.driverPhone }})</span>
            </p>
            <p v-if="bus.routes?.length" class="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-[10px]">
              <span>📍</span>
              <span class="truncate">{{ locale === 'lo' ? (bus.routes[0].routeNameLo || bus.routes[0].routeNameEn) : (bus.routes[0].routeNameEn || bus.routes[0].routeNameLo) }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { io, Socket } from 'socket.io-client';
import LoadingSpinner from '../LoadingSpinner.vue';
import { useApiClient } from '../../infrastructure/api/apiClient';

const { locale, t } = useI18n();
const apiClient = useApiClient();

const mapContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
const isSimulating = ref(false);
const selectedVehicleId = ref<number | null>(null);

const fleet = ref<any[]>([]);

let mapInstance: any = null;
let markersMap = new Map<number, any>();
let socketInstance: Socket | null = null;
let simInterval: any = null;

// Default Vientiane, Laos Coordinates (Smart International School Area)
const VIENTIANE_CENTER = { lat: 17.9757, lng: 102.6331 };

// Simulation paths for demonstration
const SIM_ROUTES: Record<number, { lat: number; lng: number }[]> = {
  1: [
    { lat: 17.9650, lng: 102.6150 },
    { lat: 17.9690, lng: 102.6200 },
    { lat: 17.9730, lng: 102.6280 },
    { lat: 17.9760, lng: 102.6330 },
    { lat: 17.9810, lng: 102.6400 },
    { lat: 17.9880, lng: 102.6490 },
  ],
  2: [
    { lat: 17.9920, lng: 102.6100 },
    { lat: 17.9860, lng: 102.6200 },
    { lat: 17.9810, lng: 102.6280 },
    { lat: 17.9760, lng: 102.6330 },
    { lat: 17.9700, lng: 102.6450 },
  ],
};

const activeVehiclesCount = computed(() => {
  return fleet.value.filter(v => v.currentLat && v.currentLng).length || fleet.value.length;
});

function loadLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    if ((window as any).L) return resolve((window as any).L);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => resolve((window as any).L);
    document.head.appendChild(script);
  });
}

async function fetchFleet() {
  try {
    const res = await apiClient<any>('/bus/fleet-locations');
    const data = (res as any)?.fleet || res || [];
    fleet.value = Array.isArray(data) ? data : [];
    renderFleetMarkers();
  } catch (err) {
    console.error('Failed to load fleet locations:', err);
  }
}

async function initMap() {
  try {
    const L = await loadLeaflet();
    if (!mapContainer.value) return;

    mapInstance = L.map(mapContainer.value, {
      zoomControl: true,
      attributionControl: false,
    }).setView([VIENTIANE_CENTER.lat, VIENTIANE_CENTER.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance);

    // School landmark icon
    const schoolIcon = L.divIcon({
      className: 'school-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2563eb;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        ">
          🏫
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([17.9880, 102.6490], { icon: schoolIcon })
      .bindPopup('<b>Smart International School</b><br>Main Campus Hub')
      .addTo(mapInstance);

    await fetchFleet();
  } catch (e) {
    console.error('Failed to init admin fleet map:', e);
  } finally {
    loading.value = false;
  }
}

function createBusIcon(L: any, bus: any) {
  const isMoving = bus.speed && bus.speed > 0;
  return L.divIcon({
    className: 'admin-bus-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      ">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f59e0b;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transform: rotate(${bus.heading || 0}deg);
          transition: transform 0.3s ease;
        ">
          🚌
        </div>
        <div style="
          margin-top: 2px;
          padding: 1px 6px;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.88);
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        ">
          ${bus.plateNumber || 'Bus'}
        </div>
      </div>
    `,
    iconSize: [40, 56],
    iconAnchor: [20, 28],
  });
}

function renderFleetMarkers() {
  if (!mapInstance || !(window as any).L) return;
  const L = (window as any).L;

  fleet.value.forEach((bus, idx) => {
    // Provide sensible default coords if null
    const lat = bus.currentLat || (VIENTIANE_CENTER.lat + (idx * 0.008 - 0.004));
    const lng = bus.currentLng || (VIENTIANE_CENTER.lng + (idx * 0.009 - 0.005));

    let marker = markersMap.get(bus.vehicleId);
    if (!marker) {
      marker = L.marker([lat, lng], {
        icon: createBusIcon(L, bus),
      }).addTo(mapInstance);

      const routeName = bus.routes?.[0]
        ? (locale.value === 'lo' ? (bus.routes[0].routeNameLo || bus.routes[0].routeNameEn) : (bus.routes[0].routeNameEn || bus.routes[0].routeNameLo))
        : 'General Route';

      marker.bindPopup(`
        <div style="min-width: 180px; font-family: inherit; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #0f172a;">🚌 ${bus.plateNumber}</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 999px; background: #e0f2fe; color: #0369a1;">
              ${bus.model || 'School Bus'}
            </span>
          </div>
          <p style="font-size: 11px; margin: 2px 0; color: #475569;">
            <b>👤 Driver:</b> ${bus.driverName || '—'}
          </p>
          <p style="font-size: 11px; margin: 2px 0; color: #475569;">
            <b>📞 Phone:</b> <a href="tel:${bus.driverPhone}" style="color: #0d9488;">${bus.driverPhone || '—'}</a>
          </p>
          <p style="font-size: 11px; margin: 2px 0; color: #475569;">
            <b>📍 Route:</b> ${routeName}
          </p>
          <p style="font-size: 11px; margin: 4px 0 0; color: #059669; font-weight: 600;">
            ⚡ Speed: ${Math.round(bus.speed || 0)} km/h
          </p>
        </div>
      `);

      marker.on('click', () => {
        selectedVehicleId.value = bus.vehicleId;
      });

      markersMap.set(bus.vehicleId, marker);
    } else {
      marker.setLatLng([lat, lng]);
      marker.setIcon(createBusIcon(L, bus));
    }
  });
}

function focusBus(bus: any) {
  selectedVehicleId.value = bus.vehicleId;
  const marker = markersMap.get(bus.vehicleId);
  if (marker && mapInstance) {
    const latLng = marker.getLatLng();
    mapInstance.flyTo(latLng, 16, { duration: 1 });
    marker.openPopup();
  }
}

function fitAllBuses() {
  if (!mapInstance || markersMap.size === 0) return;
  const L = (window as any).L;
  const group = L.featureGroup(Array.from(markersMap.values()));
  mapInstance.fitBounds(group.getBounds().pad(0.15));
}

function toggleSimulation() {
  isSimulating.value = !isSimulating.value;
  if (isSimulating.value) {
    let step = 0;
    simInterval = setInterval(() => {
      step++;
      fleet.value.forEach((bus, i) => {
        const routeKey = (i % 2) + 1;
        const path: { lat: number; lng: number }[] = SIM_ROUTES[routeKey] ?? SIM_ROUTES[1] ?? [];
        if (!path.length) return;
        const point = path[step % path.length]!;
        const nextPoint = path[(step + 1) % path.length]!;

        const dLat = nextPoint.lat - point.lat;
        const dLng = nextPoint.lng - point.lng;
        const heading = (Math.atan2(dLng, dLat) * 180 / Math.PI + 360) % 360;

        bus.currentLat = point.lat;
        bus.currentLng = point.lng;
        bus.speed = Math.floor(25 + Math.random() * 20);
        bus.heading = Math.round(heading);

        const marker = markersMap.get(bus.vehicleId);
        if (marker && (window as any).L) {
          const L = (window as any).L;
          marker.setLatLng([point.lat, point.lng]);
          marker.setIcon(createBusIcon(L, bus));
        }
      });
    }, 2500);
  } else {
    clearInterval(simInterval);
    simInterval = null;
    fleet.value.forEach(bus => {
      bus.speed = 0;
    });
    renderFleetMarkers();
  }
}

function initSocket() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    socketInstance = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('bus:location-update', (data: any) => {
      const idx = fleet.value.findIndex(v => v.vehicleId === data.vehicleId);
      if (idx !== -1) {
        fleet.value[idx].currentLat = data.latitude;
        fleet.value[idx].currentLng = data.longitude;
        fleet.value[idx].speed = data.speed;
        fleet.value[idx].heading = data.heading;
        fleet.value[idx].lastGpsUpdate = data.timestamp;

        const marker = markersMap.get(data.vehicleId);
        if (marker && (window as any).L) {
          const L = (window as any).L;
          marker.setLatLng([data.latitude, data.longitude]);
          marker.setIcon(createBusIcon(L, fleet.value[idx]));
        }
      } else {
        fetchFleet();
      }
    });
  } catch (err) {
    console.error('Socket connection error on admin fleet map:', err);
  }
}

onMounted(() => {
  initMap();
  initSocket();
});

onBeforeUnmount(() => {
  if (simInterval) clearInterval(simInterval);
  if (socketInstance) socketInstance.disconnect();
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<style scoped>
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 14px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  padding: 2px;
}
:deep(.leaflet-popup-content) {
  margin: 10px 12px;
  line-height: 1.4;
}
</style>
