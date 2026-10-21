<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('pos.title')" :subtitle="$t('pos.subtitle')" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: scan + student info -->
      <div class="lg:col-span-2 flex flex-col gap-5">
        <!-- Shop selector -->
        <section class="panel p-5">
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('pos.select_shop') }}</label>
          <select v-model.number="shopId" class="input-field">
            <option :value="0" disabled>{{ $t('pos.choose_shop') }}</option>
            <option v-for="s in shops" :key="s.shopId" :value="s.shopId">
              {{ locale === 'lo' ? s.shopNameLo : s.shopNameEn }}
              <template v-if="s.locationLo || s.locationEn"> — {{ locale === 'lo' ? (s.locationLo || s.locationEn) : (s.locationEn || s.locationLo) }}</template>
            </option>
          </select>
        </section>

        <!-- Card scan -->
        <section class="panel p-5">
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('pos.card_uid') }}</label>
          <div class="flex gap-3">
            <input
              ref="uidInput"
              v-model.trim="cardUid"
              type="text"
              class="input-field flex-1"
              :placeholder="$t('pos.scan_placeholder')"
              :disabled="!shopId"
              @keydown.enter="lookupCard"
            >
            <button type="button" class="btn-primary" :disabled="!shopId || !cardUid || lookingUp" @click="lookupCard">
              {{ $t('pos.lookup') }}
            </button>
          </div>
          <p v-if="lookupError" class="mt-2 text-sm text-danger">{{ lookupError }}</p>
        </section>

        <!-- Student info + amount -->
        <section v-if="student" class="panel p-5 flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <PersonAvatar :name="studentDisplayName" :photo-url="student.photoUrl" size="lg" />
            <div class="flex-1 min-w-0">
              <p class="text-lg font-bold truncate">{{ studentDisplayName }}</p>
              <p class="text-sm text-ink-muted font-mono">{{ student.studentCode }}</p>
              <p v-if="student.class" class="text-sm text-ink-subtle">{{ locale === 'lo' ? (student.class.classNameLo || student.class.classNameEn) : (student.class.classNameEn || student.class.classNameLo) }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-semibold text-ink-subtle uppercase">{{ $t('pos.balance') }}</p>
              <template v-if="wallet">
                <p class="text-2xl font-bold tnum" :class="wallet.status === 'frozen' ? 'text-danger' : 'text-success'">
                  {{ f.kip(wallet.balance) }}
                </p>
                <p v-if="wallet.status === 'frozen'" class="text-xs text-danger font-semibold">{{ $t('pos.frozen') }}</p>
              </template>
              <p v-else class="text-sm text-danger font-semibold">{{ $t('pos.no_wallet') }}</p>
            </div>
          </div>

          <div v-if="wallet && wallet.status !== 'frozen'" class="flex flex-col gap-3 pt-4 border-t border-line">
            <label class="text-sm font-semibold">{{ $t('pos.amount') }}</label>
            <input
              ref="amountInput"
              v-model.number="amount"
              type="number"
              min="1000"
              step="1000"
              class="input-field text-2xl font-bold tnum text-center py-3"
              :placeholder="$t('pos.enter_amount')"
              @keydown.enter="handlePurchase"
            >
            <button
              type="button"
              class="btn-primary w-full py-3 text-base font-bold"
              :disabled="!amount || amount <= 0 || processing"
              @click="handlePurchase"
            >
              <svg v-if="processing" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ processing ? $t('pos.processing') : $t('pos.pay') }}
            </button>
          </div>
        </section>

        <!-- Success result -->
        <section v-if="lastResult" class="panel p-5 border-l-4" :class="lastResult.ok ? 'border-l-success bg-success/5' : 'border-l-danger bg-danger/5'">
          <div v-if="lastResult.ok" class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
            <div>
              <p class="font-bold text-success">{{ $t('pos.success') }}</p>
              <p class="text-sm text-ink-muted">{{ $t('pos.deducted', { amount: f.kip(lastResult.amount) }) }}</p>
              <p class="text-sm text-ink-muted">{{ $t('pos.new_balance', { balance: f.kip(lastResult.balanceAfter) }) }}</p>
            </div>
          </div>
          <div v-else class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            <div>
              <p class="font-bold text-danger">{{ $t('pos.failed') }}</p>
              <p class="text-sm text-ink-muted">{{ lastResult.error }}</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Right: session history -->
      <div class="flex flex-col gap-4">
        <section class="panel p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-subtle">{{ $t('pos.session_history') }}</h3>
            <span class="text-xs text-ink-muted font-mono">{{ history.length }} {{ $t('pos.transactions') }}</span>
          </div>
          <p v-if="!history.length" class="text-sm text-ink-subtle py-6 text-center">{{ $t('pos.no_transactions') }}</p>
          <ul v-else class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
            <li v-for="(h, i) in history" :key="i" class="flex items-center justify-between gap-2 py-2 border-b border-line last:border-0">
              <div class="min-w-0">
                <p class="text-sm font-semibold truncate">{{ h.studentName }}</p>
                <p class="text-xs text-ink-muted">{{ h.time }} · {{ h.shopName }}</p>
              </div>
              <span class="text-sm font-bold tnum whitespace-nowrap" :class="h.ok ? 'text-success' : 'text-danger'">
                {{ h.ok ? '-' + f.kip(h.amount) : $t('pos.failed') }}
              </span>
            </li>
          </ul>
        </section>

        <section class="panel p-5">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-subtle mb-2">{{ $t('pos.session_total') }}</h3>
          <p class="text-3xl font-bold tnum">{{ f.kip(sessionTotal) }}</p>
          <p class="text-xs text-ink-muted mt-1">{{ successCount }} {{ $t('pos.successful') }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import type { Shop } from '../../../domain/models/Finance';
import { financeRepository, type PosCard } from '../../../infrastructure/api/FinanceRepository';
import PageHeader from '../../../components/PageHeader.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('pos.title') });

interface HistoryEntry {
  studentName: string;
  shopName: string;
  amount: number;
  time: string;
  ok: boolean;
}

interface LastResult {
  ok: boolean;
  amount?: number;
  balanceAfter?: number;
  error?: string;
}

const shops = ref<Shop[]>([]);
const shopId = ref(0);
const cardUid = ref('');
const lookingUp = ref(false);
const lookupError = ref('');
const student = ref<PosCard['student'] | null>(null);
const wallet = ref<PosCard['wallet']>(null);
// The UID the server matched, so editing the input after a lookup can't change who is charged.
const scannedUid = ref('');
const amount = ref<number | null>(null);
const processing = ref(false);
const lastResult = ref<LastResult | null>(null);
const history = ref<HistoryEntry[]>([]);

const uidInput = ref<HTMLInputElement | null>(null);
const amountInput = ref<HTMLInputElement | null>(null);

const studentDisplayName = computed(() => {
  if (!student.value) return '';
  return (locale.value === 'lo' ? student.value.fullNameLo : student.value.fullNameEn) || student.value.fullNameEn;
});

const sessionTotal = computed(() =>
  history.value.filter(h => h.ok).reduce((sum, h) => sum + h.amount, 0),
);

const successCount = computed(() => history.value.filter(h => h.ok).length);

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

onMounted(async () => {
  const res = await financeRepository.getShops({ limit: 200 });
  shops.value = (res.shops || []).filter((s: Shop) => s.isActive);
  await nextTick();
  if (uidInput.value) uidInput.value.focus();
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

    await nextTick();
    if (amountInput.value) amountInput.value.focus();
  } catch (err) {
    lookupError.value = posError(err, 'pos.lookup_failed');
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

  try {
    const res = await financeRepository.processTransaction({
      cardUid: scannedUid.value,
      amount: amount.value,
      shopId: shopId.value,
    });

    lastResult.value = { ok: true, amount: res.amount, balanceAfter: res.balanceAfter };

    history.value.unshift({
      studentName: studentDisplayName.value,
      shopName,
      amount: amount.value,
      time: f.time(new Date()),
      ok: true,
    });

    amount.value = null;
    cardUid.value = '';
    student.value = null;
    wallet.value = null;
    scannedUid.value = '';

    await nextTick();
    if (uidInput.value) uidInput.value.focus();
  } catch (err) {
    const errorMsg = posError(err, 'pos.transaction_failed');
    lastResult.value = { ok: false, error: errorMsg };

    history.value.unshift({
      studentName: studentDisplayName.value,
      shopName,
      amount: amount.value || 0,
      time: f.time(new Date()),
      ok: false,
    });
  } finally {
    processing.value = false;
  }
}
</script>
