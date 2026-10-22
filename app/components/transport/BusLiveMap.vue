<template>
  <div class="flex flex-col gap-3">
    <!-- Map Header with Live Status & Controls -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 text-white shadow-sm border border-slate-800">
      <div class="flex items-center gap-3">
        <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping" />
        </div>
        <div>
          <h3 class="text-sm font-bold flex items-center gap-2">
            <span>{{ $t('bus_map.live_tracking') }}</span>
            <span class="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ● {{ isLive ? $t('bus_map.active') : $t('bus_map.standby') }}
            </span>
          </h3>
          <p class="text-xs text-slate-400">
            {{ vehicle?.plateNumber }} ({{ vehicle?.driverName }}) ·
            <span v-if="currentGps">
              {{ $t('bus_map.speed') }}: {{ Math.round(currentGps.speed || 0) }} km/h
            </span>
            <span v-else>{{ $t('bus_map.waiting_gps') }}</span>
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 inline-flex items-center gap-1.5 transition-colors"
          @click="centerOnBus"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ $t('bus_map.recenter') }}
        </button>

        <button
          type="button"
          class="text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-all font-semibold"
          :class="isSimulating ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-teal-600 hover:bg-teal-500 text-white'"
          @click="toggleSimulation"
        >
          <span v-if="isSimulating" class="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ isSimulating ? $t('bus_map.stop_simulation') : $t('bus_map.start_simulation') }}
        </button>
      </div>
    </div>

    <!-- Map Canvas Container -->
    <div class="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner">
      <div id="bus-leaflet-map" ref="mapContainer" class="w-full h-full z-10" />

      <!-- Map Loading / Fallback overlay -->
      <div v-if="mapLoading" class="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center z-20">
        <LoadingSpinner />
        <p class="mt-2 text-xs text-slate-500">{{ $t('bus_map.loading_map') }}</p>
      </div>

      <!-- Quick Legend Overlay -->
      <div class="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] shadow-sm flex items-center gap-3">
        <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span class="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white font-bold">🚌</span>
          <span>{{ $t('bus_map.school_bus') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span class="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span>{{ $t('bus_map.bus_stops') }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span>{{ $t('bus_map.school') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { io, Socket } from 'socket.io-client';
import LoadingSpinner from '../LoadingSpinner.vue';
import { useApiClient } from '../../infrastructure/api/apiClient';

interface Props {
  routeId?: number;
  vehicle?: any;
  stops?: any[];
}

const props = defineProps<Props>();
const mapContainer = ref<HTMLElement | null>(null);
const mapLoading = ref(true);
const isLive = ref(true);
const isSimulating = ref(false);

const currentGps = ref<{
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
} | null>(null);

let mapInstance: any = null;
let busMarker: any = null;
let stopMarkers: any[] = [];
let routeLine: any = null;
let socketInstance: Socket | null = null;
let simInterval: any = null;

// Default Vientiane, Laos Coordinates (centered around That Luang & school district)
const DEFAULT_CENTER = { lat: 17.9757, lng: 102.6331 };

// Sample route path through Vientiane
const DEFAULT_ROUTE_PATH = [
  { lat: 17.9650, lng: 102.6150, name: 'Sengdara / Dongpalan Stop' },
  { lat: 17.9710, lng: 102.6220, name: 'Phonsinuan Station' },
  { lat: 17.9760, lng: 102.6330, name: 'That Luang Square Stop' },
  { lat: 17.9820, lng: 102.6410, name: 'Saphanthong Neua' },
  { lat: 17.9880, lng: 102.6490, name: 'Smart International School' },
];

function loadLeaflet(): Promise<any> {
  return new Promise((resolve) => {
    if ((window as any).L) {
      return resolve((window as any).L);
    }

    // Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Inject JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      resolve((window as any).L);
    };
    document.head.appendChild(script);
  });
}

async function initMap() {
  try {
    const L = await loadLeaflet();
    if (!mapContainer.value) return;

    const initialLat = props.vehicle?.currentLat || DEFAULT_CENTER.lat;
    const initialLng = props.vehicle?.currentLng || DEFAULT_CENTER.lng;

    currentGps.value = {
      latitude: initialLat,
      longitude: initialLng,
      speed: props.vehicle?.speed || 0,
      heading: props.vehicle?.heading || 0,
    };

    mapInstance = L.map(mapContainer.value, {
      zoomControl: true,
      attributionControl: false,
    }).setView([initialLat, initialLng], 14);

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(mapInstance);

    // Custom Bus Icon
    const busIcon = L.divIcon({
      className: 'bus-pulse-marker',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f59e0b;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transform: rotate(${currentGps.value?.heading || 0}deg);
          transition: transform 0.3s ease;
        ">
          🚌
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    busMarker = L.marker([initialLat, initialLng], { icon: busIcon }).addTo(mapInstance);
    busMarker.bindPopup(`<b>${props.vehicle?.plateNumber || 'School Bus'}</b><br>${props.vehicle?.driverName || ''}`);

    // Draw route & stops
    renderRouteStops(L);

    mapLoading.value = false;
  } catch (err) {
    console.error('Failed to init Leaflet map:', err);
    mapLoading.value = false;
  }
}

function renderRouteStops(L: any) {
  if (!mapInstance) return;

  const stops = props.stops?.length
    ? props.stops
    : DEFAULT_ROUTE_PATH;

  const pathCoords: [number, number][] = [];

  // Stop Icon
  const stopIcon = (isSchool: boolean) => L.divIcon({
    className: 'stop-marker',
    html: `
      <div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: ${isSchool ? '#2563eb' : '#0d9488'};
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  stops.forEach((s: any, idx: number) => {
    const lat = s.lat || s.latitude || (DEFAULT_ROUTE_PATH[idx] ? DEFAULT_ROUTE_PATH[idx]!.lat : DEFAULT_CENTER.lat);
    const lng = s.lng || s.longitude || (DEFAULT_ROUTE_PATH[idx] ? DEFAULT_ROUTE_PATH[idx]!.lng : DEFAULT_CENTER.lng);
    const isSchool = idx === stops.length - 1;

    pathCoords.push([lat, lng]);

    const marker = L.marker([lat, lng], { icon: stopIcon(isSchool) }).addTo(mapInstance);
    marker.bindPopup(`<b>${isSchool ? '🏫 ' : '📍 '}${s.name || s.nameEn || s.nameLo || 'Stop ' + (idx + 1)}</b>`);
    stopMarkers.push(marker);
  });

  // Polyline path
  if (pathCoords.length > 1) {
    routeLine = L.polyline(pathCoords, {
      color: '#0d9488',
      weight: 4,
      opacity: 0.7,
      dashArray: '8, 8',
    }).addTo(mapInstance);
  }
}

function updateBusLocation(lat: number, lng: number, speed?: number, heading?: number) {
  if (!busMarker) return;
  const newLatLng = [lat, lng];
  busMarker.setLatLng(newLatLng);

  currentGps.value = {
    latitude: lat,
    longitude: lng,
    speed: speed != null ? speed : currentGps.value?.speed,
    heading: heading != null ? heading : currentGps.value?.heading,
  };
}

function centerOnBus() {
  if (mapInstance && currentGps.value) {
    mapInstance.setView([currentGps.value.latitude, currentGps.value.longitude], 15, {
      animate: true,
    });
  }
}

function setupSocket() {
  const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : (typeof window !== 'undefined' ? window.location.origin : '');

  socketInstance = io(backendUrl);

  socketInstance.on('connect', () => {
    if (props.routeId) {
      socketInstance?.emit('join:bus', props.routeId);
    }
  });

  socketInstance.on('bus:location-update', (loc: any) => {
    if (loc.vehicleId === props.vehicle?.vehicleId || loc.routeId === props.routeId) {
      updateBusLocation(loc.latitude, loc.longitude, loc.speed, loc.heading);
    }
  });
}

// Interactive Simulation for Testing/Demo
let simStep = 0;
function toggleSimulation() {
  if (isSimulating.value) {
    clearInterval(simInterval);
    isSimulating.value = false;
    return;
  }

  isSimulating.value = true;
  const points = DEFAULT_ROUTE_PATH;

  simInterval = setInterval(async () => {
    simStep = (simStep + 1) % points.length;
    const pt = points[simStep]!;
    // slight random offset along the road
    const lat = pt.lat + (Math.random() - 0.5) * 0.001;
    const lng = pt.lng + (Math.random() - 0.5) * 0.001;
    const speed = Math.floor(25 + Math.random() * 20);
    const heading = Math.floor(Math.random() * 360);

    updateBusLocation(lat, lng, speed, heading);

    // Also notify backend so other parents / listeners receive it!
    if (props.vehicle?.vehicleId) {
      useApiClient()('/bus/location', {
        method: 'POST',
        body: {
          vehicleId: props.vehicle.vehicleId,
          routeId: props.routeId,
          latitude: lat,
          longitude: lng,
          speed,
          heading,
        },
      }).catch(() => {});
    }
  }, 3500);
}

onMounted(async () => {
  await initMap();
  setupSocket();
});

onBeforeUnmount(() => {
  if (simInterval) clearInterval(simInterval);
  if (socketInstance) {
    if (props.routeId) socketInstance.emit('leave:bus', props.routeId);
    socketInstance.disconnect();
  }
  if (mapInstance) {
    mapInstance.remove();
  }
});
</script>

<style>
/* Leaflet custom styles */
.leaflet-container {
  font-family: inherit;
}
.leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 4px;
}
</style>
