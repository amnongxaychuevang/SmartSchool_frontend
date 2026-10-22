<template>
  <div class="flex flex-col gap-6" :class="{ 'fixed inset-0 z-50 bg-surface-ground p-6 overflow-y-auto': isFullscreen }">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <PageHeader
        :title="$t('attendance_simulator.title')"
        :subtitle="$t('attendance_simulator.subtitle')"
      />

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <!-- Mode Tabs -->
        <div class="inline-flex rounded-lg p-1 bg-surface-sunken border border-line">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
            :class="activeTab === 'kiosk' ? 'bg-surface shadow text-ink' : 'text-ink-subtle hover:text-ink'"
            @click="activeTab = 'kiosk'"
          >
            {{ $t('attendance_simulator.tab_kiosk') }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
            :class="activeTab === 'simulator' ? 'bg-surface shadow text-ink' : 'text-ink-subtle hover:text-ink'"
            @click="activeTab = 'simulator'"
          >
            {{ $t('attendance_simulator.tab_simulator') }}
          </button>
        </div>

        <button
          v-if="activeTab === 'kiosk'"
          type="button"
          class="btn-secondary !py-1.5 text-xs inline-flex items-center gap-1.5"
          @click="toggleFullscreen"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!isFullscreen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ isFullscreen ? $t('attendance_simulator.exit_fullscreen') : $t('attendance_simulator.fullscreen') }}
        </button>
      </div>
    </div>

    <!-- TAB 1: KIOSK MODE -->
    <div v-if="activeTab === 'kiosk'" class="flex flex-col gap-6">
      <!-- Top Status & Clock Bar -->
      <div class="panel p-4 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-teal-500/10 via-brand-500/5 to-transparent">
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-500/10 text-brand-500">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </span>
          <div>
            <h2 class="font-bold text-ink">{{ $t('attendance_simulator.kiosk_title') }}</h2>
            <div class="flex items-center gap-2 text-xs text-ink-subtle">
              <span>{{ $t('attendance_simulator.gate_name') }}:</span>
              <input
                v-model.trim="gate"
                type="text"
                class="px-2 py-0.5 rounded border border-line bg-surface text-xs font-medium focus:ring-1 focus:ring-brand-500"
                placeholder="Main Gate"
              >
            </div>
          </div>
        </div>

        <!-- Live Clock -->
        <div class="text-right">
          <div class="text-2xl sm:text-3xl font-black font-mono tracking-tight text-ink">
            {{ currentTimeStr }}
          </div>
          <div class="text-xs text-ink-subtle">
            {{ currentDateStr }}
          </div>
        </div>
      </div>

      <!-- Quick Session Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="panel p-4 text-center">
          <p class="text-xs text-ink-subtle uppercase tracking-wider font-semibold">{{ $t('attendance_simulator.stats_total') }}</p>
          <p class="text-2xl sm:text-3xl font-extrabold text-ink mt-1">{{ history.length }}</p>
        </div>
        <div class="panel p-4 text-center border-l-4 border-l-emerald-500">
          <p class="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">{{ $t('attendance_simulator.stats_in') }}</p>
          <p class="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{{ checkInCount }}</p>
        </div>
        <div class="panel p-4 text-center border-l-4 border-l-blue-500">
          <p class="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">{{ $t('attendance_simulator.stats_out') }}</p>
          <p class="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{{ checkOutCount }}</p>
        </div>
      </div>

      <!-- Main Kiosk Scanning Card & Display -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Scan / Display Box (7 cols) -->
        <div class="lg:col-span-7 flex flex-col gap-4">
          <!-- Hidden / Continuous RFID input -->
          <div class="panel p-4 bg-surface border-2 border-dashed border-line">
            <form @submit.prevent="handleKioskSubmit" class="flex gap-2">
              <input
                ref="kioskInputRef"
                v-model.trim="kioskUid"
                type="text"
                class="input-field flex-1 font-mono text-center text-lg tracking-wider"
                :placeholder="$t('attendance_simulator.scan_input_placeholder')"
                :disabled="scanning"
                autocomplete="off"
                @blur="handleInputBlur"
              >
              <button
                type="submit"
                class="btn-primary shrink-0"
                :disabled="!kioskUid || scanning"
              >
                {{ scanning ? $t('attendance_simulator.scanning') : $t('attendance_simulator.simulate_tap') }}
              </button>
            </form>
            <p class="text-xs text-ink-subtle text-center mt-2">
              {{ $t('attendance_simulator.kiosk_instruction') }}
            </p>
          </div>

          <!-- Dynamic Result Banner -->
          <div
            v-if="kioskLastScan"
            class="panel p-6 rounded-2xl transition-all shadow-md"
            :class="kioskLastScan.logType === 'check_in'
              ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30'
              : 'bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-transparent border-blue-500/30'"
          >
            <div class="flex flex-col sm:flex-row items-center gap-6">
              <!-- Student Photo / Avatar -->
              <div class="relative shrink-0">
                <img
                  v-if="kioskLastScan.student?.photoUrl"
                  :src="kioskLastScan.student.photoUrl"
                  :alt="studentDisplayName(kioskLastScan.student)"
                  class="w-28 h-28 sm:w-36 sm:h-36 object-cover rounded-2xl border-4 border-surface shadow-md"
                >
                <div
                  v-else
                  class="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-surface shadow-md bg-brand-500/20 text-brand-600 flex items-center justify-center text-4xl font-black"
                >
                  {{ (kioskLastScan.student?.fullNameEn || 'S').charAt(0).toUpperCase() }}
                </div>

                <!-- Check badge icon -->
                <span
                  class="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg font-bold"
                  :class="kioskLastScan.logType === 'check_in' ? 'bg-emerald-500' : 'bg-blue-500'"
                >
                  <svg v-if="kioskLastScan.logType === 'check_in'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                </span>
              </div>

              <!-- Student Details & Big Greeting -->
              <div class="flex-1 text-center sm:text-left min-w-0">
                <span
                  class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2"
                  :class="kioskLastScan.logType === 'check_in'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'"
                >
                  {{ kioskLastScan.logType === 'check_in' ? $t('attendance_simulator.welcome_in') : $t('attendance_simulator.welcome_out') }}
                </span>

                <h3 class="text-xl sm:text-2xl font-black text-ink truncate">
                  {{ studentDisplayName(kioskLastScan.student) }}
                </h3>

                <p v-if="locale === 'lo' && kioskLastScan.student?.fullNameEn" class="text-sm text-ink-subtle truncate">
                  {{ kioskLastScan.student.fullNameEn }}
                </p>

                <div class="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span class="px-2.5 py-1 rounded-md bg-surface border border-line font-mono font-semibold text-ink">
                    ID: {{ kioskLastScan.student?.studentCode || '—' }}
                  </span>
                  <span v-if="kioskLastScan.student?.class" class="px-2.5 py-1 rounded-md bg-surface border border-line font-medium text-ink">
                    {{ (locale === 'lo' ? kioskLastScan.student.class.classNameLo : kioskLastScan.student.class.classNameEn) || kioskLastScan.student.class.classNameEn }}
                  </span>
                  <span class="px-2.5 py-1 rounded-md bg-surface border border-line font-mono text-ink-subtle">
                    {{ f.timeWithSeconds(kioskLastScan.time) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Alert Card -->
          <div
            v-else-if="kioskError"
            role="alert"
            class="panel p-6 rounded-2xl bg-danger-soft border-2 border-danger-line text-center flex flex-col items-center justify-center gap-3 animate-shake"
          >
            <span class="w-12 h-12 rounded-full bg-danger/20 text-danger flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <div>
              <p class="font-bold text-danger text-lg">{{ $t('attendance_simulator.scan_failed') }}</p>
              <p class="text-sm text-danger mt-1">{{ kioskError }}</p>
            </div>
          </div>

          <!-- Waiting Idle State Card -->
          <div
            v-else
            class="panel p-10 rounded-2xl border-2 border-dashed border-line text-center flex flex-col items-center justify-center gap-4 text-ink-subtle"
          >
            <div class="relative w-20 h-20 rounded-full bg-surface-sunken flex items-center justify-center text-ink-subtle">
              <span class="absolute inset-0 rounded-full animate-ping opacity-25 bg-brand-500"></span>
              <svg class="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-ink">{{ $t('attendance_simulator.waiting_scan') }}</p>
              <p class="text-xs text-ink-subtle mt-1 max-w-sm">
                {{ $t('attendance_simulator.kiosk_instruction') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Live Session Feed (5 cols) -->
        <div class="lg:col-span-5">
          <section class="panel overflow-hidden h-full flex flex-col">
            <div class="p-4 border-b border-line flex items-center justify-between">
              <h3 class="font-bold text-ink">{{ $t('attendance_simulator.history') }}</h3>
              <span class="text-xs text-ink-subtle">{{ history.length }} {{ $t('attendance_simulator.recorded') }}</span>
            </div>

            <div class="flex-1 overflow-y-auto max-h-[460px]">
              <p v-if="!history.length" class="p-8 text-center text-sm text-ink-subtle">
                {{ $t('attendance_simulator.history_empty') }}
              </p>
              <ul v-else class="divide-y divide-line">
                <li
                  v-for="h in history"
                  :key="`${h.cardUid}:${h.time}`"
                  class="flex items-center justify-between gap-3 p-3.5 hover:bg-surface-sunken/40 transition-colors"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      v-if="h.photoUrl"
                      :src="h.photoUrl"
                      :alt="h.name"
                      class="w-10 h-10 rounded-full object-cover border border-line shrink-0"
                    >
                    <div
                      v-else
                      class="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 font-bold flex items-center justify-center shrink-0 text-sm"
                    >
                      {{ (h.name || 'S').charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-ink text-sm truncate">{{ h.name }}</p>
                      <p class="text-xs text-ink-subtle font-mono truncate">
                        {{ h.code }}<template v-if="h.className"> · {{ h.className }}</template>
                      </p>
                    </div>
                  </div>

                  <div class="text-right shrink-0">
                    <span
                      class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                      :class="h.logType === 'check_in'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-blue-500/15 text-blue-700 dark:text-blue-300'"
                    >
                      {{ h.logType === 'check_in' ? $t('attendance_simulator.check_in') : $t('attendance_simulator.check_out') }}
                    </span>
                    <p class="text-xs text-ink-subtle font-mono mt-0.5">
                      {{ f.timeWithSeconds(h.time) }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- TAB 2: MANUAL SIMULATOR MODE (ORIGINAL DROPDOWN) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Tap form -->
      <form
        class="panel p-5 lg:col-span-2 flex flex-col gap-4"
        @submit.prevent="tapSimulator"
      >
        <div>
          <label for="card-search" class="block mb-1.5 text-sm font-semibold">{{
            $t("attendance_simulator.card")
          }}</label>
          <input
            id="card-search"
            v-model="search"
            type="search"
            class="input-field mb-2"
            :placeholder="$t('attendance_simulator.search_card')"
          >
          <select
            v-model="selectedCardId"
            class="input-field"
            required
            :disabled="!cards.length"
          >
            <option :value="null" disabled>
              {{
                cards.length
                  ? $t("attendance_simulator.choose_card")
                  : $t("attendance_simulator.no_cards")
              }}
            </option>
            <option
              v-for="c in filteredCards"
              :key="c.cardId"
              :value="c.cardId"
            >
              {{ cardStudentName(c) }} · {{ c.student?.studentCode }} ·
              {{ c.cardUid }}
            </option>
          </select>
        </div>

        <div>
          <label for="gate" class="block mb-1.5 text-sm font-semibold">{{
            $t("attendance_simulator.gate_optional")
          }}</label>
          <input
            id="gate"
            v-model.trim="gate"
            type="text"
            maxlength="50"
            class="input-field"
            :placeholder="$t('attendance_simulator.gate_placeholder')"
          >
        </div>

        <p class="text-xs text-ink-subtle">
          {{ $t("attendance_simulator.auto_direction") }}
        </p>

        <button
          type="submit"
          class="btn-primary"
          :disabled="!selectedCard || scanning"
        >
          {{
            scanning
              ? $t("attendance_simulator.scanning")
              : $t("attendance_simulator.simulate_tap")
          }}
        </button>

        <p
          v-if="error"
          role="alert"
          class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {{ $t("attendance_simulator.scan_failed") }}: {{ error }}
        </p>
      </form>

      <!-- Taps recorded in this session -->
      <section class="panel lg:col-span-3 overflow-hidden">
        <h3 class="px-5 pt-5 pb-3 font-bold">
          {{ $t("attendance_simulator.history") }}
        </h3>
        <p v-if="!history.length" class="px-5 pb-8 text-sm text-ink-subtle">
          {{ $t("attendance_simulator.history_empty") }}
        </p>
        <ul v-else class="divide-y divide-line border-t border-line">
          <li
            v-for="h in history"
            :key="`${h.cardUid}:${h.time}`"
            class="flex items-center justify-between gap-4 px-5 py-3"
          >
            <div class="min-w-0">
              <p class="font-semibold truncate">{{ h.name }}</p>
              <p class="text-xs text-ink-subtle font-mono">
                {{ h.code }} · {{ h.cardUid
                }}<template v-if="h.gate"> · {{ h.gate }}</template>
              </p>
            </div>
            <div class="text-right shrink-0">
              <span
                :class="
                  h.logType === 'check_in' ? 'badge-success' : 'badge-info'
                "
              >
                {{
                  h.logType === "check_in"
                    ? $t("attendance_simulator.check_in")
                    : $t("attendance_simulator.check_out")
                }}
              </span>
              <p class="mt-1 text-xs text-ink-subtle tnum">
                {{ f.timeWithSeconds(h.time) }}
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import type { ApiResponse } from "../../../infrastructure/api/types";
import type { ScanResult } from "../../../domain/models/School";
import type { Card } from "../../../domain/models/Academics";
import PageHeader from "../../../components/PageHeader.vue";
import { useFormat } from "../../../composables/useFormat";
import { getErrorMessage } from "../../../utils/errors";
import { useApiClient } from "../../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../../infrastructure/api/endpoints";
import { academicsRepository } from "../../../infrastructure/api/AcademicsRepository";

definePageMeta({ layout: "admin" });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t("attendance_simulator.title") });

const activeTab = ref<"kiosk" | "simulator">("kiosk");
const isFullscreen = ref(false);

// Web Audio API Synthesizer for instant audible feedback
function playTone(freq: number, type: OscillatorType, duration: number, delayMs = 0) {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  setTimeout(() => {
    try {
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      setTimeout(() => ctx.close().catch(() => {}), duration * 1000 + 100);
    } catch {
      // Audio autoplay policy may suppress; ignore safely
    }
  }, delayMs);
}

function playSuccessChime() {
  playTone(523.25, 'sine', 0.12, 0);   // C5
  playTone(659.25, 'sine', 0.12, 100); // E5
  playTone(783.99, 'sine', 0.25, 200); // G5
}

function playErrorBuzzer() {
  playTone(180, 'sawtooth', 0.22, 0);
  playTone(140, 'sawtooth', 0.3, 140);
}

// Live Digital Clock
const now = ref(new Date());
let timerId: any = null;

const currentTimeStr = computed(() => {
  return now.value.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
});

const currentDateStr = computed(() => {
  return now.value.toLocaleDateString(locale.value === 'lo' ? 'lo-LA' : 'en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// Cards and Form
const cards = ref<Card[]>([]);
const search = ref("");
const selectedCardId = ref<number | null>(null);
const gate = ref("Main Gate");
const scanning = ref(false);
const error = ref("");

// Kiosk specific state
const kioskUid = ref("");
const kioskInputRef = ref<HTMLInputElement | null>(null);
const kioskLastScan = ref<ScanResult | null>(null);
const kioskError = ref("");
let kioskClearTimer: any = null;

interface HistoryEntry {
  cardUid: string;
  name: string;
  code: string;
  className?: string;
  photoUrl?: string | null;
  gate: string;
  logType: ScanResult["logType"];
  time: string;
}

const history = ref<HistoryEntry[]>([]);

const checkInCount = computed(() => history.value.filter(h => h.logType === 'check_in').length);
const checkOutCount = computed(() => history.value.filter(h => h.logType === 'check_out').length);

const cardStudentName = (c: Card) =>
  (locale.value === "lo" ? c.student?.fullNameLo : c.student?.fullNameEn) ||
  c.student?.fullNameEn ||
  "";

const studentDisplayName = (s?: ScanResult['student']) => {
  if (!s) return 'Student';
  return (locale.value === 'lo' ? s.fullNameLo : s.fullNameEn) || s.fullNameEn || s.studentCode;
};

const filteredCards = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return cards.value;
  return cards.value.filter((c) =>
    [
      c.cardUid,
      c.student?.studentCode,
      c.student?.fullNameEn,
      c.student?.fullNameLo,
    ].some((v) => v?.toLowerCase().includes(q)),
  );
});

const selectedCard = computed(
  () => cards.value.find((c) => c.cardId === selectedCardId.value) ?? null,
);

function focusKioskInput() {
  nextTick(() => {
    if (kioskInputRef.value && activeTab.value === 'kiosk') {
      kioskInputRef.value.focus();
    }
  });
}

function handleInputBlur() {
  if (activeTab.value === 'kiosk' && !scanning.value) {
    // Keep focus on reader input for continuous hands-free RFID scanning
    setTimeout(() => {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
        focusKioskInput();
      }
    }, 300);
  }
}

function toggleFullscreen() {
  if (typeof document === 'undefined') return;
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
    isFullscreen.value = true;
  } else {
    document.exitFullscreen?.().catch(() => {});
    isFullscreen.value = false;
  }
}

onMounted(async () => {
  timerId = setInterval(() => {
    now.value = new Date();
  }, 1000);

  focusKioskInput();

  try {
    const res = await academicsRepository.getCards({
      status: "active",
      limit: 500,
    });
    cards.value = res.cards;
  } catch (err) {
    error.value = getErrorMessage(err);
  }
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
  if (kioskClearTimer) clearTimeout(kioskClearTimer);
});

async function processCardUid(uid: string) {
  scanning.value = true;
  error.value = "";
  kioskError.value = "";

  try {
    const res = await useApiClient()<ApiResponse<ScanResult>>(
      API_ENDPOINTS.attendance.scanManual,
      {
        method: "POST",
        body: {
          cardUid: uid,
          ...(gate.value ? { gateLocation: gate.value } : {}),
        },
      },
    );

    const scanData = res.data;
    kioskLastScan.value = scanData;
    playSuccessChime();

    const studentInfo = scanData.student;
    const studentNameStr = studentDisplayName(studentInfo);
    const classNameStr = studentInfo?.class
      ? ((locale.value === 'lo' ? studentInfo.class.classNameLo : studentInfo.class.classNameEn) || studentInfo.class.classNameEn)
      : '';

    history.value.unshift({
      cardUid: uid,
      name: studentNameStr,
      code: studentInfo?.studentCode || '',
      className: classNameStr,
      photoUrl: studentInfo?.photoUrl,
      gate: gate.value,
      logType: scanData.logType,
      time: scanData.time,
    });

    if (kioskClearTimer) clearTimeout(kioskClearTimer);
    kioskClearTimer = setTimeout(() => {
      kioskLastScan.value = null;
    }, 7000);

    return true;
  } catch (err) {
    const msg = getErrorMessage(err);
    kioskError.value = msg;
    error.value = msg;
    playErrorBuzzer();

    if (kioskClearTimer) clearTimeout(kioskClearTimer);
    kioskClearTimer = setTimeout(() => {
      kioskError.value = "";
    }, 5000);

    return false;
  } finally {
    scanning.value = false;
    focusKioskInput();
  }
}

async function handleKioskSubmit() {
  const uid = kioskUid.value.trim();
  if (!uid || scanning.value) return;
  kioskUid.value = "";
  await processCardUid(uid);
}

async function tapSimulator() {
  const card = selectedCard.value;
  if (!card) return;
  await processCardUid(card.cardUid);
}
</script>
