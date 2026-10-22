<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('pos.title')" :subtitle="$t('pos.subtitle')">
      <div class="flex items-center gap-3">
        <!-- Sound toggle -->
        <button
          type="button"
          class="btn-secondary flex items-center gap-2 text-xs"
          :class="soundEnabled ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-400'"
          @click="soundEnabled = !soundEnabled"
        >
          <svg v-if="soundEnabled" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <span>{{ $t('pos.sound_enabled') }}</span>
        </button>
      </div>
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: scan + student info -->
      <div class="lg:col-span-2 flex flex-col gap-5">
        <!-- Shop selector & Mode -->
        <section class="panel p-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label class="block mb-1.5 text-sm font-semibold">{{ $t('pos.select_shop') }}</label>
              <select v-model.number="shopId" class="input-field" @change="focusUid">
                <option :value="0" disabled>{{ $t('pos.choose_shop') }}</option>
                <option v-for="s in shops" :key="s.shopId" :value="s.shopId">
                  {{ locale === 'lo' ? s.shopNameLo : s.shopNameEn }}
                  <template v-if="s.locationLo || s.locationEn"> — {{ locale === 'lo' ? (s.locationLo || s.locationEn) : (s.locationEn || s.locationLo) }}</template>
                </option>
              </select>
            </div>

            <!-- Fixed price mode toggle for rapid lunch queue -->
            <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {{ locale === 'lo' ? 'ໂໝດລາຄາຄົງທີ່ (ຄິວຍາວ)' : 'Fixed Price Mode (Rapid Queue)' }}
                </span>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="fixedPriceMode" type="checkbox" class="sr-only peer">
                  <div class="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>
              <div v-if="fixedPriceMode" class="flex items-center gap-2">
                <input
                  v-model.number="fixedAmount"
                  type="number"
                  min="1000"
                  step="1000"
                  class="input-field text-sm font-bold py-1 px-2.5 tnum text-teal-600 dark:text-teal-400"
                  placeholder="15000"
                >
                <span class="text-xs text-ink-muted">₭</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Card scan input with live indicator -->
        <section class="panel p-5 relative overflow-hidden" :class="{ 'ring-2 ring-teal-500/50': !student }">
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-sm font-semibold flex items-center gap-2">
              <span>{{ $t('pos.card_uid') }}</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </label>
            <span class="text-xs text-teal-600 dark:text-teal-400 font-medium">{{ $t('pos.ready_to_scan') }}</span>
          </div>

          <div class="flex gap-3">
            <input
              ref="uidInput"
              v-model.trim="cardUid"
              type="text"
              class="input-field flex-1 font-mono text-base"
              :placeholder="$t('pos.scan_placeholder')"
              :disabled="!shopId"
              autofocus
              @keydown.enter.prevent="lookupCard"
            >
            <button
              type="button"
              class="btn-primary"
              :disabled="!shopId || !cardUid || lookingUp"
              @click="lookupCard"
            >
              <svg v-if="lookingUp" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>{{ $t('pos.lookup') }}</span>
            </button>
          </div>
          <p v-if="lookupError" class="mt-2 text-sm text-danger font-medium">{{ lookupError }}</p>
        </section>

        <!-- Student info + Amount presets & charge -->
        <section v-if="student" class="panel p-5 flex flex-col gap-4 border-2 border-teal-500/30">
          <div class="flex items-center gap-4">
            <PersonAvatar :name="studentDisplayName" :photo-url="student.photoUrl" size="lg" />
            <div class="flex-1 min-w-0">
              <p class="text-lg font-bold truncate text-slate-800 dark:text-white">{{ studentDisplayName }}</p>
              <p class="text-sm text-ink-muted font-mono">{{ student.studentCode }}</p>
              <p v-if="student.class" class="text-sm text-teal-600 dark:text-teal-400 font-medium">
                {{ locale === 'lo' ? (student.class.classNameLo || student.class.classNameEn) : (student.class.classNameEn || student.class.classNameLo) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-ink-subtle uppercase">{{ $t('pos.balance') }}</p>
              <template v-if="wallet">
                <p class="text-2xl font-bold tnum" :class="wallet.status === 'frozen' ? 'text-danger' : 'text-emerald-500'">
                  {{ f.kip(wallet.balance) }}
                </p>
                <p v-if="wallet.status === 'frozen'" class="text-xs text-danger font-semibold">{{ $t('pos.frozen') }}</p>
              </template>
              <p v-else class="text-sm text-danger font-semibold">{{ $t('pos.no_wallet') }}</p>
            </div>
          </div>

          <div v-if="wallet && wallet.status !== 'frozen'" class="flex flex-col gap-4 pt-4 border-t border-line">
            <!-- Preset Amount Buttons -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-ink-subtle">{{ $t('pos.quick_presets') }}</span>
                <button
                  v-if="amount"
                  type="button"
                  class="text-xs text-red-500 hover:underline font-medium"
                  @click="clearAmount"
                >
                  {{ $t('pos.clear_amount') }}
                </button>
              </div>
              <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
                <button
                  v-for="preset in PRESET_AMOUNTS"
                  :key="preset"
                  type="button"
                  class="py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95"
                  :class="amount === preset ? 'bg-teal-500 text-white border-teal-500 shadow-teal-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500/50'"
                  @click="setPreset(preset)"
                >
                  {{ preset >= 1000 ? (preset / 1000) + 'k' : preset }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold">{{ $t('pos.amount') }}</label>
              <div class="relative">
                <input
                  ref="amountInput"
                  v-model.number="amount"
                  type="number"
                  min="1000"
                  step="1000"
                  class="input-field text-2xl font-bold tnum text-center py-3 bg-white dark:bg-slate-900 border-teal-500/50"
                  :placeholder="$t('pos.enter_amount')"
                  @keydown.enter.prevent="handlePurchase"
                >
              </div>
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                class="btn-secondary flex-1 py-3 text-sm font-semibold"
                @click="resetStudent"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="button"
                class="btn-primary flex-2 py-3 text-base font-bold flex items-center justify-center gap-2"
                :disabled="!amount || amount <= 0 || processing"
                @click="handlePurchase"
              >
                <svg v-if="processing" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{{ processing ? $t('pos.processing') : $t('pos.pay') + (amount ? ' (' + f.kip(amount) + ')' : '') }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Result alert banner -->
        <section
          v-if="lastResult"
          class="panel p-5 border-l-4 transition-all"
          :class="lastResult.ok ? 'border-l-success bg-success/5' : 'border-l-danger bg-danger/5'"
        >
          <div v-if="lastResult.ok" class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p class="font-bold text-success text-base">{{ $t('pos.success') }}</p>
              <p class="text-sm text-ink-muted">{{ $t('pos.deducted', { amount: f.kip(lastResult.amount) }) }}</p>
              <p class="text-sm text-ink-muted">{{ $t('pos.new_balance', { balance: f.kip(lastResult.balanceAfter) }) }}</p>
            </div>
          </div>
          <div v-else class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <p class="font-bold text-danger text-base">{{ $t('pos.failed') }}</p>
              <p class="text-sm text-ink-muted">{{ lastResult.error }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Right: session history & quick refund -->
      <div class="flex flex-col gap-4">
        <section class="panel p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-subtle">{{ $t('pos.session_history') }}</h3>
            <span class="text-xs text-ink-muted font-mono">{{ history.length }} {{ $t('pos.transactions') }}</span>
          </div>
          <p v-if="!history.length" class="text-sm text-ink-subtle py-8 text-center">{{ $t('pos.no_transactions') }}</p>
          <ul v-else class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto divide-y divide-line">
            <li v-for="(h, i) in history" :key="i" class="flex items-center justify-between gap-2 py-2.5">
              <div class="min-w-0">
                <p class="text-sm font-semibold truncate">{{ h.studentName }}</p>
                <p class="text-xs text-ink-muted">{{ h.time }} · {{ h.shopName }}</p>
                <span v-if="h.refunded" class="inline-block mt-0.5 text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                  {{ $t('wallets_admin.refunded') }}
                </span>
              </div>
              <div class="text-right flex flex-col items-end gap-1">
                <span class="text-sm font-bold tnum whitespace-nowrap" :class="h.refunded ? 'text-slate-400 line-through' : (h.ok ? 'text-success' : 'text-danger')">
                  {{ h.ok ? '-' + f.kip(h.amount) : $t('pos.failed') }}
                </span>
                <button
                  v-if="h.ok && !h.refunded && h.transactionId"
                  type="button"
                  class="text-[11px] text-red-500 hover:underline font-semibold"
                  @click="openRefundModal(h)"
                >
                  {{ $t('pos.undo') }}
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section class="panel p-5 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-subtle mb-1">{{ $t('pos.session_total') }}</h3>
          <p class="text-3xl font-extrabold tnum text-teal-600 dark:text-teal-400">{{ f.kip(sessionTotal) }}</p>
          <p class="text-xs text-ink-muted mt-1">{{ successCount }} {{ $t('pos.successful') }}</p>
        </section>
      </div>
    </div>

    <!-- Confirm Undo / Refund Modal -->
    <ConfirmDialog
      :open="refundModal.open"
      :title="$t('pos.undo')"
      :message="refundModal.entry ? $t('pos.undo_confirm', { amount: f.kip(refundModal.entry.amount), name: refundModal.entry.studentName }) : ''"
      :confirm-label="$t('pos.undo')"
      :busy="refundModal.busy"
      :error="refundModal.error"
      @update:open="refundModal.open = $event"
      @confirm="handleRefundConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import type { Shop } from '../../../domain/models/Finance';
import { financeRepository, type PosCard } from '../../../infrastructure/api/FinanceRepository';
import PageHeader from '../../../components/PageHeader.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('pos.title') });

interface HistoryEntry {
  transactionId?: number | string;
  studentName: string;
  shopName: string;
  amount: number;
  time: string;
  ok: boolean;
  refunded?: boolean;
}

interface LastResult {
  ok: boolean;
  amount?: number;
  balanceAfter?: number;
  error?: string;
}

const PRESET_AMOUNTS = [3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000];

const shops = ref<Shop[]>([]);
const shopId = ref(0);
const cardUid = ref('');
const lookingUp = ref(false);
const lookupError = ref('');
const student = ref<PosCard['student'] | null>(null);
const wallet = ref<PosCard['wallet']>(null);
const scannedUid = ref('');
const amount = ref<number | null>(null);
const processing = ref(false);
const lastResult = ref<LastResult | null>(null);
const history = ref<HistoryEntry[]>([]);

// Audio & Rapid mode
const soundEnabled = ref(true);
const fixedPriceMode = ref(false);
const fixedAmount = ref<number>(15000);

// Undo refund modal
const refundModal = ref<{
  open: boolean;
  entry: HistoryEntry | null;
  busy: boolean;
  error: string;
}>({
  open: false,
  entry: null,
  busy: false,
  error: '',
});

const uidInput = ref<HTMLInputElement | null>(null);
const amountInput = ref<HTMLInputElement | null>(null);

const studentDisplayName = computed(() => {
  if (!student.value) return '';
  return (locale.value === 'lo' ? student.value.fullNameLo : student.value.fullNameEn) || student.value.fullNameEn;
});

const sessionTotal = computed(() =>
  history.value.filter(h => h.ok && !h.refunded).reduce((sum, h) => sum + h.amount, 0),
);

const successCount = computed(() => history.value.filter(h => h.ok && !h.refunded).length);

// Web Audio API chime & buzzer
function playTone(freq: number, type: OscillatorType, duration: number, delay = 0) {
  if (!soundEnabled.value || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    }, delay);
  } catch {}
}

function playSuccessChime() {
  playTone(587.33, 'sine', 0.12, 0); // D5
  playTone(880, 'sine', 0.25, 110);   // A5
}

function playErrorBuzzer() {
  playTone(180, 'sawtooth', 0.22, 0);
  playTone(140, 'sawtooth', 0.3, 140);
}

// Known server refusals, shown in the cashier's language.
const SERVER_ERRORS: Record<string, string> = {
  'Card not found': 'pos.card_not_found',
  'Card has expired': 'pos.card_expired',
  'Insufficient balance': 'pos.err_insufficient',
  'This student has no wallet yet': 'pos.no_wallet',
  'Wallet is frozen. Cannot process transaction.': 'pos.frozen',
  'This shop is blocked for this student': 'pos.err_shop_blocked',
  'Amount exceeds the per-transaction spending limit': 'pos.err_per_tx',
  'This purchase would exceed the daily spending limit': 'pos.err_daily',
  'This purchase would exceed the weekly spending limit': 'pos.err_weekly',
  'Wallet balance changed concurrently — please retry the transaction': 'pos.err_retry',
};

const posError = (err: unknown, fallbackKey: string) => {
  const message = getErrorMessage(err, '');
  if (message.startsWith('Card is ')) return t('pos.card_inactive');
  const key = SERVER_ERRORS[message];
  return key ? t(key) : message || t(fallbackKey);
};

function focusUid() {
  nextTick(() => {
    if (uidInput.value) uidInput.value.focus();
  });
}

function setPreset(val: number) {
  amount.value = val;
  if (amountInput.value) amountInput.value.focus();
}

function clearAmount() {
  amount.value = null;
  if (amountInput.value) amountInput.value.focus();
}

function resetStudent() {
  student.value = null;
  wallet.value = null;
  scannedUid.value = '';
  amount.value = null;
  cardUid.value = '';
  focusUid();
}

onMounted(async () => {
  const res = await financeRepository.getShops({ limit: 200 });
  shops.value = (res.shops || []).filter((s: Shop) => s.isActive);
  const firstShop = shops.value[0];
  if (shops.value.length === 1 && firstShop) {
    shopId.value = firstShop.shopId;
  }
  focusUid();
});

async function lookupCard() {
  if (!cardUid.value || !shopId.value) return;
  lookingUp.value = true;
  lookupError.value = '';
  student.value = null;
  wallet.value = null;
  scannedUid.value = '';
  lastResult.value = null;

  try {
    const res = await financeRepository.lookupPosCard(cardUid.value);
    student.value = res.student;
    wallet.value = res.wallet;
    scannedUid.value = res.cardUid;

    // In fixed price mode: charge immediately!
    if (fixedPriceMode.value && fixedAmount.value && fixedAmount.value > 0) {
      amount.value = fixedAmount.value;
      await handlePurchase();
      return;
    }

    await nextTick();
    if (amountInput.value) amountInput.value.focus();
  } catch (err) {
    lookupError.value = posError(err, 'pos.lookup_failed');
    playErrorBuzzer();
    focusUid();
  } finally {
    lookingUp.value = false;
  }
}

async function handlePurchase() {
  if (!student.value || !amount.value || amount.value <= 0 || !shopId.value) return;
  processing.value = true;
  lastResult.value = null;

  const shopName = (() => {
    const s = shops.value.find(sh => sh.shopId === shopId.value);
    if (!s) return '';
    return (locale.value === 'lo' ? s.shopNameLo : s.shopNameEn) || s.shopNameEn;
  })();

  const chargedAmount = amount.value;
  const currentStudentName = studentDisplayName.value;

  try {
    const res = await financeRepository.processTransaction({
      cardUid: scannedUid.value,
      amount: chargedAmount,
      shopId: shopId.value,
    });

    lastResult.value = { ok: true, amount: res.amount, balanceAfter: res.balanceAfter };
    playSuccessChime();

    history.value.unshift({
      transactionId: res.transactionId,
      studentName: currentStudentName,
      shopName,
      amount: chargedAmount,
      time: f.time(new Date()),
      ok: true,
    });

    amount.value = null;
    cardUid.value = '';
    student.value = null;
    wallet.value = null;
    scannedUid.value = '';

    focusUid();
  } catch (err) {
    const errorMsg = posError(err, 'pos.transaction_failed');
    lastResult.value = { ok: false, error: errorMsg };
    playErrorBuzzer();

    history.value.unshift({
      studentName: currentStudentName,
      shopName,
      amount: chargedAmount || 0,
      time: f.time(new Date()),
      ok: false,
    });

    focusUid();
  } finally {
    processing.value = false;
  }
}

function openRefundModal(entry: HistoryEntry) {
  refundModal.value = {
    open: true,
    entry,
    busy: false,
    error: '',
  };
}

async function handleRefundConfirm() {
  const entry = refundModal.value.entry;
  if (!entry || !entry.transactionId) return;

  refundModal.value.busy = true;
  refundModal.value.error = '';

  try {
    await financeRepository.refundTransaction(Number(entry.transactionId), 'POS Cashier Undo');
    entry.refunded = true;
    playSuccessChime();
    refundModal.value.open = false;
  } catch (err: any) {
    refundModal.value.error = getErrorMessage(err, t('common.error_occurred'));
    playErrorBuzzer();
  } finally {
    refundModal.value.busy = false;
  }
}
</script>
