<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden font-sans">
    <!-- Top Header -->
    <header class="h-20 px-8 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shrink-0">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            {{ schoolName }}
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
              Gate Kiosk
            </span>
          </h1>
          <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>{{ $t('attendance_simulator.gate_name') }}:</span>
            <input
              v-model.trim="gateLocation"
              type="text"
              class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium focus:outline-none focus:border-teal-500"
              placeholder="Main Gate"
            >
          </div>
        </div>
      </div>

      <!-- Center: Giant Clock -->
      <div class="text-center">
        <div class="text-3xl lg:text-4xl font-black font-mono tracking-tight text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
          {{ currentTimeStr }}
        </div>
        <div class="text-xs text-slate-400 mt-0.5 font-medium">
          {{ currentDateStr }}
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-3">
        <!-- Sound Toggle -->
        <button
          type="button"
          class="p-2.5 rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          :title="soundEnabled ? 'Mute audio' : 'Unmute audio'"
          @click="soundEnabled = !soundEnabled"
        >
          <svg v-if="soundEnabled" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        </button>

        <!-- Fullscreen Toggle -->
        <button
          type="button"
          class="p-2.5 rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          :title="isFullscreen ? $t('attendance_simulator.exit_fullscreen') : $t('attendance_simulator.fullscreen')"
          @click="toggleFullscreen"
        >
          <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Lang Switch -->
        <LangSwitch />

        <!-- Exit button -->
        <NuxtLink
          to="/admin/attendance"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Exit
        </NuxtLink>
      </div>
    </header>

    <!-- Main Kiosk Body -->
    <main class="flex-1 p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full overflow-hidden">
      <!-- Hidden / Auto-focused RFID input for hardware card readers -->
      <form class="sr-only" @submit.prevent="handleScan">
        <input
          ref="rfidInputRef"
          v-model.trim="cardUidInput"
          type="text"
          autocomplete="off"
          @blur="keepFocus"
        >
      </form>

      <!-- Left / Center: Interactive Card Display (8 Cols) -->
      <div class="lg:col-span-8 flex flex-col items-center justify-center">
        <!-- Active Scan Result Banner -->
        <transition name="pop" mode="out-in">
          <div
            v-if="lastScan"
            :key="lastScan.studentId + '-' + lastScan.time"
            class="w-full max-w-xl rounded-3xl p-8 border-2 shadow-2xl transition-all"
            :class="lastScan.logType === 'check_in'
              ? 'bg-gradient-to-b from-emerald-950/80 to-slate-900 border-emerald-500/50 shadow-emerald-950/50'
              : 'bg-gradient-to-b from-blue-950/80 to-slate-900 border-blue-500/50 shadow-blue-950/50'"
          >
            <!-- Badge -->
            <div class="text-center mb-6">
              <span
                class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider shadow-lg"
                :class="lastScan.logType === 'check_in'
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : 'bg-blue-500 text-white shadow-blue-500/30'"
              >
                <svg v-if="lastScan.logType === 'check_in'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                </svg>
                {{ lastScan.logType === 'check_in' ? $t('attendance_simulator.welcome_in') : $t('attendance_simulator.welcome_out') }}
              </span>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-6">
              <!-- Student Photo -->
              <div class="relative shrink-0">
                <img
                  v-if="lastScan.student?.photoUrl"
                  :src="lastScan.student.photoUrl"
                  :alt="studentDisplayName(lastScan.student)"
                  class="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-2xl border-4 border-slate-700 shadow-xl"
                >
                <div
                  v-else
                  class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl border-4 border-slate-700 bg-slate-800 text-teal-400 flex items-center justify-center text-5xl font-black shadow-xl"
                >
                  {{ (lastScan.student?.fullNameEn || 'S').charAt(0).toUpperCase() }}
                </div>
              </div>

              <!-- Details -->
              <div class="flex-1 text-center sm:text-left min-w-0">
                <h2 class="text-2xl sm:text-3xl font-black text-white truncate">
                  {{ studentDisplayName(lastScan.student) }}
                </h2>
                <p v-if="locale === 'lo' && lastScan.student?.fullNameEn" class="text-sm text-slate-400 mt-1 truncate">
                  {{ lastScan.student.fullNameEn }}
                </p>

                <div class="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span class="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-xs font-bold text-teal-300">
                    ID: {{ lastScan.student?.studentCode || '—' }}
                  </span>
                  <span v-if="lastScan.student?.class" class="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-200">
                    {{ (locale === 'lo' ? lastScan.student.class.classNameLo : lastScan.student.class.classNameEn) || lastScan.student.class.classNameEn }}
                  </span>
                  <span class="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-xs text-slate-400">
                    {{ f.timeWithSeconds(lastScan.time) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Alert Banner -->
          <div
            v-else-if="scanError"
            class="w-full max-w-xl rounded-3xl p-8 bg-red-950/80 border-2 border-red-500/50 text-center shadow-2xl shadow-red-950/50"
          >
            <div class="w-16 h-16 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-white mb-1">{{ $t('attendance_simulator.scan_failed') }}</h2>
            <p class="text-red-300 text-sm">{{ scanError }}</p>
          </div>

          <!-- Idle Radar / Waiting for Tap -->
          <div
            v-else
            class="flex flex-col items-center justify-center p-12 text-center cursor-pointer"
            @click="focusInput"
          >
            <div class="relative w-44 h-44 flex items-center justify-center mb-6">
              <!-- Pulsing Waves -->
              <div class="absolute inset-0 rounded-full bg-teal-500/10 animate-ping opacity-75"></div>
              <div class="absolute inset-4 rounded-full bg-teal-500/15 animate-pulse"></div>
              <div class="w-28 h-28 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-teal-500/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            </div>

            <h2 class="text-2xl font-black text-white tracking-wide">
              {{ $t('attendance_simulator.waiting_scan') }}
            </h2>
            <p class="text-sm text-slate-400 mt-2 max-w-md">
              {{ $t('attendance_simulator.kiosk_instruction') }}
            </p>
          </div>
        </transition>
      </div>

      <!-- Right: Live Session Roll & Counters (4 Cols) -->
      <div class="lg:col-span-4 flex flex-col gap-4 h-full">
        <!-- Session Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <p class="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{{ $t('attendance_simulator.stats_total') }}</p>
            <p class="text-2xl font-black text-white mt-0.5">{{ sessionHistory.length }}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-center">
            <p class="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">{{ $t('attendance_simulator.stats_in') }}</p>
            <p class="text-2xl font-black text-emerald-400 mt-0.5">{{ countIn }}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-900 border border-blue-500/30 text-center">
            <p class="text-[10px] text-blue-400 uppercase tracking-wider font-bold">{{ $t('attendance_simulator.stats_out') }}</p>
            <p class="text-2xl font-black text-blue-400 mt-0.5">{{ countOut }}</p>
          </div>
        </div>

        <!-- Recent Taps Roll -->
        <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex-1 flex flex-col min-h-0">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {{ $t('attendance_simulator.history') }}
          </h3>

          <div v-if="sessionHistory.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-600 text-xs py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ $t('attendance_simulator.history_empty') }}
          </div>

          <div v-else class="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
            <div
              v-for="(item, idx) in sessionHistory"
              :key="idx"
              class="p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors"
              :class="item.logType === 'check_in'
                ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                : 'bg-blue-950/20 border-blue-900/50 text-blue-200'"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span
                  class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                  :class="item.logType === 'check_in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'"
                >
                  {{ item.logType === 'check_in' ? 'IN' : 'OUT' }}
                </span>
                <div class="min-w-0">
                  <p class="font-bold text-white truncate">{{ item.name }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">{{ item.code }}</p>
                </div>
              </div>
              <span class="font-mono text-slate-400 text-[11px] shrink-0">
                {{ f.timeWithSeconds(item.time) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ApiResponse } from '../../../infrastructure/api/types';
import type { ScanResult } from '../../../domain/models/School';
import { useFormat } from '../../../composables/useFormat';
import { getErrorMessage } from '../../../utils/errors';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { useSettingsStore } from '../../../application/stores/settings';
import LangSwitch from '../../../components/LangSwitch.vue';

definePageMeta({ layout: 'default' });

const { t, locale } = useI18n();
const f = useFormat();
const settingsStore = useSettingsStore();

useHead({ title: () => `Gate Kiosk — ${t('attendance_simulator.kiosk_title')}` });

const gateLocation = ref('Main Gate');
const cardUidInput = ref('');
const rfidInputRef = ref<HTMLInputElement | null>(null);
const isFullscreen = ref(false);
const soundEnabled = ref(true);

const lastScan = ref<ScanResult | null>(null);
const scanError = ref('');
let clearTimer: any = null;

interface HistoryItem {
  name: string;
  code: string;
  logType: 'check_in' | 'check_out';
  time: string;
}
const sessionHistory = ref<HistoryItem[]>([]);

const countIn = computed(() => sessionHistory.value.filter((h) => h.logType === 'check_in').length);
const countOut = computed(() => sessionHistory.value.filter((h) => h.logType === 'check_out').length);

const schoolName = computed(() => {
  const info = settingsStore.schoolInfo;
  return (locale.value === 'lo' ? info.schoolNameLo : info.schoolNameEn) || info.schoolNameEn || t('auth.title');
});

// Clock
const now = ref(new Date());
let clockTimer: any = null;

const currentTimeStr = computed(() =>
  now.value.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
);

const currentDateStr = computed(() =>
  now.value.toLocaleDateString(locale.value === 'lo' ? 'lo-LA' : 'en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
);

// Audio Synthesis
function playTone(freq: number, type: OscillatorType, duration: number, delayMs = 0) {
  if (!soundEnabled.value || typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;

  setTimeout(() => {
    try {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      setTimeout(() => ctx.close().catch(() => {}), duration * 1000 + 100);
    } catch {}
  }, delayMs);
}

function playSuccessChime() {
  playTone(523.25, 'sine', 0.12, 0); // C5
  playTone(659.25, 'sine', 0.12, 100); // E5
  playTone(783.99, 'sine', 0.25, 200); // G5
}

function playErrorBuzzer() {
  playTone(180, 'sawtooth', 0.2, 0);
  playTone(140, 'sawtooth', 0.3, 120);
}

const studentDisplayName = (s?: ScanResult['student']) => {
  if (!s) return 'Student';
  return (locale.value === 'lo' ? s.fullNameLo : s.fullNameEn) || s.fullNameEn || s.studentCode;
};

function focusInput() {
  nextTick(() => {
    rfidInputRef.value?.focus();
  });
}

function keepFocus() {
  setTimeout(() => {
    if (document.activeElement?.tagName !== 'INPUT') {
      focusInput();
    }
  }, 250);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    isFullscreen.value = true;
  } else {
    document.exitFullscreen().catch(() => {});
    isFullscreen.value = false;
  }
}

async function handleScan() {
  const uid = cardUidInput.value.trim();
  if (!uid) return;
  cardUidInput.value = '';

  scanError.value = '';

  try {
    const res = await useApiClient()<ApiResponse<ScanResult>>(API_ENDPOINTS.attendance.scanManual, {
      method: 'POST',
      body: {
        cardUid: uid,
        gateLocation: gateLocation.value || 'Main Gate',
      },
    });

    const data = res.data;
    lastScan.value = data;
    playSuccessChime();

    sessionHistory.value.unshift({
      name: studentDisplayName(data.student),
      code: data.student?.studentCode || '',
      logType: data.logType,
      time: data.time,
    });

    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      lastScan.value = null;
    }, 4500);
  } catch (err: any) {
    const msg = getErrorMessage(err);
    scanError.value = msg;
    playErrorBuzzer();

    if (clearTimer) clearTimeout(clearTimer);
    clearTimer = setTimeout(() => {
      scanError.value = '';
    }, 4000);
  } finally {
    focusInput();
  }
}

onMounted(() => {
  settingsStore.loadSettings().catch(() => {});
  clockTimer = setInterval(() => {
    now.value = new Date();
  }, 1000);

  focusInput();

  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (clearTimer) clearTimeout(clearTimer);
});
</script>

<style scoped>
.pop-enter-active {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: popOut 0.2s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}
@keyframes popIn {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes popOut {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>
