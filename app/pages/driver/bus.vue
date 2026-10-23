<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
    <!-- Top Navigation Bar -->
    <header class="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
      <div class="flex items-center gap-3">
        <NuxtLink to="/admin/transport" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title="Back to Transport">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </NuxtLink>
        <img
          src="/logo.png"
          alt="Smart School Logo"
          class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-0.5 object-contain shrink-0 shadow-md shadow-amber-500/10"
        />
        <div>
          <h1 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>{{ $t('driver_console.title') }}</span>
            <span v-if="isRunActive" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              {{ $t('driver_console.broadcasting') }}
            </span>
          </h1>
          <p class="text-xs text-slate-400">{{ activeVehiclePlate || $t('driver_console.select_vehicle_prompt') }}</p>
        </div>
      </div>

      <!-- Controls: Clock, Sound, Fullscreen -->
      <div class="flex items-center gap-2 sm:gap-3">
        <div class="hidden sm:flex flex-col text-right">
          <span class="text-sm font-bold text-slate-200 tnum">{{ currentTime }}</span>
          <span class="text-[10px] text-slate-400">{{ currentDate }}</span>
        </div>

        <button
          type="button"
          class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          :title="soundEnabled ? 'Mute' : 'Unmute'"
          @click="soundEnabled = !soundEnabled"
        >
          <span v-if="soundEnabled">🔊</span>
          <span v-else>🔇</span>
        </button>

        <button
          type="button"
          class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Toggle Fullscreen"
          @click="toggleFullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Console Body -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Left Column: Run Setup, Scanner & Stats (5 cols) -->
      <div class="lg:col-span-5 flex flex-col gap-5">
        
        <!-- Run Configuration Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h2 class="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>{{ $t('driver_console.run_settings') }}</span>
            <span :class="['px-2.5 py-0.5 rounded-full text-[11px] font-semibold', isRunActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400']">
              {{ isRunActive ? $t('driver_console.status_on_road') : $t('driver_console.status_idle') }}
            </span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">{{ $t('driver_console.vehicle') }}</label>
              <select v-model="selectedVehicleId" :disabled="isRunActive" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500">
                <option :value="null">{{ $t('driver_console.choose_vehicle') }}</option>
                <option v-for="v in vehicles" :key="v.vehicleId" :value="v.vehicleId">
                  {{ v.plateNumber }} ({{ v.model || 'Bus' }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 mb-1">{{ $t('driver_console.route') }}</label>
              <select v-model="selectedRouteId" :disabled="isRunActive" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500" @change="loadStudents">
                <option :value="null">{{ $t('driver_console.choose_route') }}</option>
                <option v-for="r in routes" :key="r.routeId" :value="r.routeId">
                  {{ pick(r.routeNameLo, r.routeNameEn) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Direction Toggle -->
          <div class="mb-5">
            <label class="block text-xs font-semibold text-slate-400 mb-1.5">{{ $t('driver_console.direction') }}</label>
            <div class="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <button
                type="button"
                :class="['py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2', direction === 'to_school' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200']"
                :disabled="isRunActive"
                @click="direction = 'to_school'"
              >
                <span>🌅</span>
                <span>{{ $t('driver_console.to_school') }}</span>
              </button>
              <button
                type="button"
                :class="['py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2', direction === 'to_home' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200']"
                :disabled="isRunActive"
                @click="direction = 'to_home'"
              >
                <span>🌇</span>
                <span>{{ $t('driver_console.to_home') }}</span>
              </button>
            </div>
          </div>

          <!-- Start / End Run Button -->
          <div class="flex items-center gap-3">
            <button
              v-if="!isRunActive"
              type="button"
              class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              :disabled="!selectedVehicleId || !selectedRouteId"
              @click="startTrip"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ $t('driver_console.start_run_btn') }}</span>
            </button>

            <button
              v-else
              type="button"
              class="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2"
              @click="endTrip"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span>{{ $t('driver_console.end_run_btn') }}</span>
            </button>
          </div>
        </div>

        <!-- Live GPS & Telemetry Card -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" :class="isBroadcasting ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'"></span>
              <span>{{ $t('driver_console.gps_telemetry') }}</span>
            </h3>
            <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input v-model="simulateGps" type="checkbox" class="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0">
              <span>{{ $t('driver_console.simulate_gps') }}</span>
            </label>
          </div>

          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-800">
              <p class="text-[11px] text-slate-400 uppercase">{{ $t('driver_console.speed') }}</p>
              <p class="text-xl font-black text-amber-400 tnum">{{ Math.round(currentSpeed) }} <span class="text-xs font-normal text-slate-400">km/h</span></p>
            </div>
            <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-800">
              <p class="text-[11px] text-slate-400 uppercase">Latitude</p>
              <p class="text-xs font-mono font-bold text-slate-300 truncate mt-1">{{ currentLat.toFixed(5) }}</p>
            </div>
            <div class="bg-slate-800/60 rounded-xl p-3 border border-slate-800">
              <p class="text-[11px] text-slate-400 uppercase">Longitude</p>
              <p class="text-xs font-mono font-bold text-slate-300 truncate mt-1">{{ currentLng.toFixed(5) }}</p>
            </div>
          </div>
          <p class="text-[11px] text-slate-500 mt-2 text-center">
            {{ isRunActive ? $t('driver_console.broadcasting_hint') : $t('driver_console.start_to_broadcast') }}
          </p>
        </div>

        <!-- RFID Quick Card Tap Input -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div class="flex items-center justify-between mb-2">
            <label for="rfid-input" class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span class="text-base">💳</span>
              <span>{{ $t('driver_console.rfid_scan_input') }}</span>
            </label>
            <span class="text-[11px] text-amber-400 font-semibold">{{ $t('driver_console.auto_focused') }}</span>
          </div>

          <form @submit.prevent="handleCardSubmit">
            <div class="relative">
              <input
                id="rfid-input"
                ref="cardInputRef"
                v-model.trim="cardInput"
                type="text"
                autocomplete="off"
                placeholder="Scan student NFC/RFID card..."
                class="w-full bg-slate-950 border-2 border-amber-500/50 focus:border-amber-400 rounded-xl px-4 py-3 text-slate-100 font-mono text-base placeholder-slate-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                @blur="refocusInput"
              >
              <button
                type="submit"
                class="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                :disabled="!cardInput"
              >
                Scan
              </button>
            </div>
          </form>

          <!-- Last Scan Result Banner -->
          <transition name="pop">
            <div
              v-if="lastScan"
              :class="['mt-3 p-3 rounded-xl border flex items-center gap-3', lastScan.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300']"
            >
              <div class="text-2xl shrink-0">{{ lastScan.success ? (lastScan.logType === 'board' ? '🚌' : '🏡') : '⚠️' }}</div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-bold leading-tight">{{ lastScan.name }}</p>
                <p class="text-[11px] opacity-80 truncate">{{ lastScan.message }}</p>
              </div>
              <span class="text-[10px] font-mono shrink-0">{{ lastScan.time }}</span>
            </div>
          </transition>
        </div>

      </div>

      <!-- Right Column: Passenger Manifest & Quick Boarding List (7 cols) -->
      <div class="lg:col-span-7 flex flex-col gap-5">
        
        <!-- Live Passenger Counts Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span class="text-[11px] font-semibold text-slate-400 uppercase">{{ $t('driver_console.total_assigned') }}</span>
            <span class="text-2xl font-black text-slate-100 tnum">{{ students.length }}</span>
          </div>
          <div class="bg-slate-900 border border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between bg-emerald-950/10">
            <span class="text-[11px] font-semibold text-emerald-400 uppercase">{{ $t('driver_console.on_board') }}</span>
            <span class="text-2xl font-black text-emerald-400 tnum">{{ onBoardCount }}</span>
          </div>
          <div class="bg-slate-900 border border-blue-900/40 rounded-2xl p-4 flex flex-col justify-between bg-blue-950/10">
            <span class="text-[11px] font-semibold text-blue-400 uppercase">{{ $t('driver_console.alighted') }}</span>
            <span class="text-2xl font-black text-blue-400 tnum">{{ alightedCount }}</span>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <span class="text-[11px] font-semibold text-amber-400 uppercase">{{ $t('driver_console.pending') }}</span>
            <span class="text-2xl font-black text-amber-400 tnum">{{ pendingCount }}</span>
          </div>
        </div>

        <!-- Passenger Manifest Table / Cards -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col min-h-[460px]">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 class="text-base font-bold text-white">{{ $t('driver_console.passenger_manifest') }}</h2>
              <p class="text-xs text-slate-400">{{ activeRouteName || $t('driver_console.choose_route_hint') }}</p>
            </div>

            <div class="relative w-full sm:w-64">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('driver_console.search_student')"
                class="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
              >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Student List -->
          <div class="flex-1 overflow-y-auto space-y-2.5 max-h-[500px] pr-1">
            <div v-if="loading" class="py-12 text-center text-slate-500 text-sm">
              {{ $t('common.loading') }}
            </div>

            <div v-else-if="!filteredStudents.length" class="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
              <span class="text-3xl">🚌</span>
              <p>{{ $t('driver_console.no_students_assigned') }}</p>
            </div>

            <div
              v-for="s in filteredStudents"
              :key="s.studentId"
              class="bg-slate-800/60 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
            >
              <!-- Avatar & Details -->
              <div class="flex items-center gap-3 min-w-0">
                <img
                  v-if="s.photoUrl"
                  :src="s.photoUrl"
                  :alt="s.fullNameEn"
                  class="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                >
                <div v-else class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center justify-center shrink-0">
                  {{ s.fullNameEn?.charAt(0) || 'S' }}
                </div>

                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-200 truncate">{{ pick(s.fullNameLo, s.fullNameEn) }}</p>
                  <p class="text-[11px] text-slate-400 truncate">
                    <span class="font-mono text-amber-400/90">{{ s.studentCode }}</span>
                    <span v-if="s.className"> · {{ s.className }}</span>
                    <span v-if="s.stop"> · 📍 {{ s.stop }}</span>
                  </p>
                </div>
              </div>

              <!-- Status & Quick Action Buttons -->
              <div class="flex items-center gap-2 shrink-0">
                <span
                  :class="[
                    'px-2.5 py-1 rounded-lg text-xs font-bold border',
                    s.status === 'boarded' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    s.status === 'alighted' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  ]"
                >
                  {{ s.status === 'boarded' ? $t('driver_console.on_bus') : s.status === 'alighted' ? $t('driver_console.alighted_tag') : $t('driver_console.waiting') }}
                </span>

                <!-- Manual Tap buttons for driver if card forgotten -->
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-colors"
                  :title="$t('driver_console.board_btn')"
                  @click="manualScan(s, 'board')"
                >
                  {{ $t('driver_console.board_btn') }}
                </button>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  :title="$t('driver_console.alight_btn')"
                  @click="manualScan(s, 'alight')"
                >
                  {{ $t('driver_console.alight_btn') }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApiClient } from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS as endpoints } from '../../infrastructure/api/endpoints';

definePageMeta({ layout: 'default' });

const { t, locale } = useI18n();
const api = useApiClient();

interface Vehicle {
  vehicleId: number;
  plateNumber: string;
  model?: string;
  capacity?: number;
}

interface BusRoute {
  routeId: number;
  routeNameEn: string;
  routeNameLo: string;
  vehicleId?: number;
}

interface StudentItem {
  studentId: number;
  studentCode: string;
  fullNameEn: string;
  fullNameLo: string;
  photoUrl?: string;
  className?: string;
  stop?: string;
  cardUid?: string;
  status: 'waiting' | 'boarded' | 'alighted';
}

const vehicles = ref<Vehicle[]>([]);
const routes = ref<BusRoute[]>([]);
const students = ref<StudentItem[]>([]);
const loading = ref(false);

const selectedVehicleId = ref<number | null>(null);
const selectedRouteId = ref<number | null>(null);
const direction = ref<'to_school' | 'to_home'>('to_school');
const isRunActive = ref(false);
const isBroadcasting = ref(false);

const soundEnabled = ref(true);
const cardInput = ref('');
const cardInputRef = ref<HTMLInputElement | null>(null);
const searchQuery = ref('');

// Telemetry & GPS State
const currentLat = ref(17.9757); // Vientiane center default
const currentLng = ref(102.6331);
const currentSpeed = ref(0);
const simulateGps = ref(false);
let gpsWatchId: number | null = null;
let simulationTimer: any = null;

// Clock
const currentTime = ref('');
const currentDate = ref('');
let clockTimer: any = null;

const lastScan = ref<{ success: boolean; name: string; message: string; logType?: string; time: string } | null>(null);

const pick = (lo?: string | null, en?: string | null) => {
  if (locale.value === 'lo') return lo || en || '';
  return en || lo || '';
};

const activeVehiclePlate = computed(() => {
  return vehicles.value.find((v) => v.vehicleId === selectedVehicleId.value)?.plateNumber || '';
});

const activeRouteName = computed(() => {
  const r = routes.value.find((r) => r.routeId === selectedRouteId.value);
  return r ? pick(r.routeNameLo, r.routeNameEn) : '';
});

const onBoardCount = computed(() => students.value.filter((s) => s.status === 'boarded').length);
const alightedCount = computed(() => students.value.filter((s) => s.status === 'alighted').length);
const pendingCount = computed(() => students.value.filter((s) => s.status === 'waiting').length);

const filteredStudents = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return students.value;
  return students.value.filter((s) =>
    s.fullNameEn.toLowerCase().includes(q) ||
    s.fullNameLo.includes(q) ||
    s.studentCode.toLowerCase().includes(q) ||
    (s.stop && s.stop.toLowerCase().includes(q))
  );
});

// Sound synthesizers (Web Audio API)
const playChime = (success: boolean) => {
  if (!soundEnabled.value) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (success) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch {}
};

const updateClock = () => {
  const d = new Date();
  currentTime.value = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  currentDate.value = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

const refocusInput = () => {
  setTimeout(() => {
    cardInputRef.value?.focus();
  }, 100);
};

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
};

async function loadData() {
  try {
    const [vehRes, routeRes] = await Promise.all([
      api<any>(endpoints.bus.vehicles),
      api<any>(endpoints.bus.routes),
    ]);
    vehicles.value = vehRes.data?.vehicles || [];
    routes.value = routeRes.data?.routes || [];

    if (vehicles.value.length > 0 && !selectedVehicleId.value) {
      selectedVehicleId.value = vehicles.value[0]?.vehicleId ?? null;
    }
    if (routes.value.length > 0 && !selectedRouteId.value) {
      selectedRouteId.value = routes.value[0]?.routeId ?? null;
      await loadStudents();
    }
  } catch (err) {
    console.error('Failed to load bus metadata:', err);
  }
}

async function loadStudents() {
  if (!selectedRouteId.value) return;
  loading.value = true;
  try {
    const res = await api<any>(`${endpoints.bus.students}?routeId=${selectedRouteId.value}`);
    const list = res.data?.students || [];
    students.value = list.map((item: any) => ({
      studentId: item.student?.studentId ?? item.studentId,
      studentCode: item.student?.studentCode ?? item.studentCode ?? '',
      fullNameEn: item.student?.fullNameEn ?? item.fullNameEn ?? '',
      fullNameLo: item.student?.fullNameLo ?? item.fullNameLo ?? '',
      photoUrl: item.student?.photoUrl ?? item.photoUrl,
      className: item.student?.classStudents?.[0]?.class?.classNameEn,
      stop: direction.value === 'to_school' ? item.pickupStop : item.dropoffStop,
      cardUid: item.student?.cards?.[0]?.cardUid,
      status: 'waiting',
    }));
  } catch (err) {
    console.error('Failed to load students for route:', err);
  } finally {
    loading.value = false;
  }
}

// ── GPS Broadcasting ──────────────────────────────────────
function startGpsBroadcasting() {
  isBroadcasting.value = true;

  if (simulateGps.value) {
    // Simulate gentle movement across Vientiane
    let step = 0;
    simulationTimer = setInterval(() => {
      step += 0.0003;
      currentLat.value = 17.9757 + Math.sin(step) * 0.008;
      currentLng.value = 102.6331 + Math.cos(step) * 0.008;
      currentSpeed.value = 35 + Math.floor(Math.sin(step * 3) * 10);
      postLocation();
    }, 4000);
    return;
  }

  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        currentLat.value = pos.coords.latitude;
        currentLng.value = pos.coords.longitude;
        currentSpeed.value = (pos.coords.speed || 0) * 3.6; // convert m/s to km/h
        postLocation();
      },
      (err) => {
        console.warn('Geolocation warning, switching to fallback simulation:', err.message);
        simulateGps.value = true;
        startGpsBroadcasting();
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );
  } else {
    simulateGps.value = true;
    startGpsBroadcasting();
  }
}

function stopGpsBroadcasting() {
  isBroadcasting.value = false;
  if (gpsWatchId != null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
}

async function postLocation() {
  if (!selectedVehicleId.value || !isRunActive.value) return;
  try {
    await api(endpoints.bus.location, {
      method: 'POST',
      body: {
        vehicleId: selectedVehicleId.value,
        routeId: selectedRouteId.value || undefined,
        latitude: currentLat.value,
        longitude: currentLng.value,
        speed: currentSpeed.value,
      },
    });
  } catch (e) {
    // non-blocking
  }
}

function startTrip() {
  if (!selectedVehicleId.value || !selectedRouteId.value) return;
  isRunActive.value = true;
  startGpsBroadcasting();
  refocusInput();
}

function endTrip() {
  isRunActive.value = false;
  stopGpsBroadcasting();
}

// ── Smart Card Scan ──────────────────────────────────────
async function handleCardSubmit() {
  const uid = cardInput.value.trim();
  if (!uid) return;
  cardInput.value = '';

  await performScan({ cardUid: uid });
  refocusInput();
}

async function manualScan(student: StudentItem, logType: 'board' | 'alight') {
  if (!student.cardUid) {
    // If no card registered, pass mock card UID or notify
    student.status = logType === 'board' ? 'boarded' : 'alighted';
    playChime(true);
    lastScan.value = {
      success: true,
      name: pick(student.fullNameLo, student.fullNameEn),
      message: `Manual check: ${logType === 'board' ? 'Boarded bus' : 'Alighted at stop'}`,
      logType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    return;
  }

  await performScan({ cardUid: student.cardUid, logType, studentName: pick(student.fullNameLo, student.fullNameEn) });
}

async function performScan(opts: { cardUid: string; logType?: 'board' | 'alight'; studentName?: string }) {
  try {
    const res = await api<any>(endpoints.bus.scan, {
      method: 'POST',
      body: {
        cardUid: opts.cardUid,
        vehicleId: selectedVehicleId.value || undefined,
        direction: direction.value,
        logType: opts.logType || undefined,
      },
    });

    const student = res.data?.log?.student;
    const logType = res.data?.log?.logType || opts.logType || 'board';
    const name = student ? pick(student.fullNameLo, student.fullNameEn) : (opts.studentName || 'Student');

    // Update student in local manifest
    const target = students.value.find((s) => s.studentId === student?.studentId || s.cardUid === opts.cardUid);
    if (target) {
      target.status = logType === 'board' ? 'boarded' : 'alighted';
    }

    playChime(true);
    lastScan.value = {
      success: true,
      name,
      message: logType === 'board' ? t('driver_console.boarded_success') : t('driver_console.alighted_success'),
      logType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err: any) {
    playChime(false);
    lastScan.value = {
      success: false,
      name: opts.cardUid,
      message: err.message || 'Card scan rejected or unregistered',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
  loadData();
  refocusInput();
});

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer);
  stopGpsBroadcasting();
});
</script>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
