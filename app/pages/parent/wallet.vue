<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('parentPortal.title')" :title="$t('parentPortal.childs_wallet')">
      <select v-model="selectedChildId" class="input-field w-auto" :aria-label="$t('parentPortal.select_child')" @change="loadChild">
        <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">
          {{ personName(child) }}
        </option>
      </select>
      <button type="button" class="btn-primary" :disabled="!selectedChildId" @click="openTopUp">
        {{ $t('parentPortal.top_up') }}
      </button>
    </PageHeader>

    <p v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ loadError }}</p>

    <LoadingSpinner v-if="loading" />

    <p v-else-if="!parentStore.children.length" class="panel p-12 text-center text-sm text-ink-subtle">
      {{ $t('parentPortal.please_select_child') }}
    </p>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Balance -->
        <section class="panel p-6 flex flex-col gap-3">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parentPortal.current_balance') }}</p>
          <p class="text-3xl font-bold tnum" :class="frozen ? 'text-danger' : 'text-ink'">{{ fmt.kip(balance) }}</p>
          <span v-if="frozen" class="badge-danger self-start">{{ $t('pos.frozen') }}</span>
          <dl class="flex flex-col gap-1 text-sm text-ink-muted">
            <div v-for="row in limitRows" :key="row.label" class="flex justify-between gap-3">
              <dt>{{ row.label }}</dt>
              <dd class="tnum font-medium text-ink">{{ row.value }}</dd>
            </div>
          </dl>
          <button type="button" class="btn-secondary mt-1" @click="openLimits">{{ $t('parentPortal.spending_limits') }}</button>
        </section>

        <!-- Top-up requests -->
        <section class="lg:col-span-2 panel overflow-hidden">
          <h2 class="px-5 py-4 text-sm font-semibold uppercase tracking-wider text-ink-muted border-b border-line">
            {{ $t('parent_wallet.requests') }}
          </h2>
          <p v-if="!requests.length" class="py-10 text-center text-sm text-ink-subtle">{{ $t('parent_wallet.no_requests') }}</p>
          <ul v-else class="divide-y divide-line">
            <li v-for="req in requests" :key="req.requestId" class="px-5 py-3 flex items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="font-semibold tnum">{{ fmt.kip(req.amount) }}</p>
                <p class="text-xs text-ink-subtle">{{ fmt.dateTime(req.requestedAt) }} · {{ $t(`topups.method.${req.method}`) }}</p>
                <p v-if="req.status === 'rejected' && req.rejectReason" class="mt-1 text-xs text-danger">
                  {{ $t('parent_wallet.reason', { reason: req.rejectReason }) }}
                </p>
              </div>
              <span :class="['shrink-0', STATUS_BADGE[req.status]]">{{ $t(`parentPortal.${req.status}`) }}</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Transactions -->
      <section class="panel overflow-hidden">
        <h2 class="px-5 py-4 text-sm font-semibold uppercase tracking-wider text-ink-muted border-b border-line">
          {{ $t('parentPortal.recent_transactions') }}
        </h2>
        <p v-if="!transactions.length" class="py-10 text-center text-sm text-ink-subtle">{{ $t('parentPortal.no_transactions') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th>{{ $t('parentPortal.date') }}</th>
                <th>{{ $t('parentPortal.type') }}</th>
                <th>{{ $t('parent_wallet.description') }}</th>
                <th class="text-right">{{ $t('parentPortal.amount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.transactionId">
                <td class="tnum whitespace-nowrap">{{ fmt.dateTime(tx.createdAt) }}</td>
                <td>
                  {{ $t(`parent_wallet.tx_${tx.transactionType}`) }}
                  <span v-if="tx.refund" class="badge-neutral ml-1">{{ $t('wallets_admin.refunded') }}</span>
                </td>
                <td class="text-ink-muted">{{ txDetail(tx) }}</td>
                <td class="text-right font-semibold tnum" :class="tx.transactionType === 'purchase' ? 'text-danger' : 'text-success'">
                  {{ tx.transactionType === 'purchase' ? '−' : '+' }}{{ fmt.kip(tx.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Student cards: a lost card is blocked at once -->
      <section class="panel overflow-hidden">
        <div class="px-5 py-4 border-b border-line">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-ink-muted">{{ $t('parent_cards.title') }}</h2>
          <p class="mt-1 text-xs text-ink-subtle">{{ $t('parent_cards.subtitle') }}</p>
        </div>
        <p v-if="!cards.length" class="py-10 text-center text-sm text-ink-subtle">{{ $t('parent_cards.empty') }}</p>
        <ul v-else class="divide-y divide-line">
          <li v-for="card in cards" :key="card.cardId" class="px-5 py-3 flex items-center justify-between gap-4">
            <div class="min-w-0">
              <p class="font-semibold font-mono tnum">{{ card.cardUid }}</p>
              <p class="text-xs text-ink-subtle">
                {{ $t('parent_cards.issued', { date: fmt.date(card.issuedDate) }) }}
                <template v-if="card.expiredDate"> · {{ $t('parent_cards.expires', { date: fmt.date(card.expiredDate) }) }}</template>
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span :class="CARD_BADGE[card.status]">{{ $t(`parent_cards.status_${card.status}`) }}</span>
              <button v-if="card.status === 'active'" type="button" class="btn-danger min-h-8 px-3" @click="reportLost(card)">
                {{ $t('parent_cards.report_lost') }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <!-- Top-up request -->
    <AppModal v-model:open="topUp.open" :title="$t('parentPortal.request_top_up')" :subtitle="selectedChildName">
      <form id="topup-form" class="flex flex-col gap-4" @submit.prevent="submitTopUp">
        <div class="flex flex-col gap-1.5">
          <label for="topup-method" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parentPortal.top_up_method') }}</label>
          <select id="topup-method" v-model="topUp.method" class="input-field">
            <option value="mobile_banking">{{ $t('parentPortal.method_mobile_banking') }}</option>
            <option value="cash">{{ $t('parentPortal.method_cash') }}</option>
          </select>
        </div>

        <!-- Where to transfer -->
        <template v-if="topUp.method === 'mobile_banking'">
          <div v-if="paymentInfo" class="rounded-lg border border-line bg-surface-2 p-4 flex gap-4">
            <div class="flex-1 min-w-0 flex flex-col gap-1">
              <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_wallet.pay_to') }}</p>
              <p class="font-semibold">{{ paymentInfo.bankName }}</p>
              <p class="text-sm">{{ paymentInfo.accountName }}</p>
              <div class="flex items-center gap-2">
                <span class="text-lg font-bold tnum">{{ paymentInfo.accountNumber }}</span>
                <button type="button" class="text-xs text-primary hover:underline" @click="copyAccount">
                  {{ copied ? $t('parent_wallet.copied') : $t('parent_wallet.copy') }}
                </button>
              </div>
              <p v-if="paymentInfo.note" class="text-xs text-ink-muted mt-1">{{ paymentInfo.note }}</p>
            </div>
            <img v-if="mediaUrl(paymentInfo.qrUrl)" :src="mediaUrl(paymentInfo.qrUrl)!" :alt="$t('payment_info.qr')" class="w-28 h-28 shrink-0 rounded border border-line bg-white object-contain">
          </div>
          <p v-else class="rounded-lg border border-warning-line bg-warning-soft text-warning px-4 py-3 text-sm">{{ $t('parent_wallet.no_payment_info') }}</p>
        </template>
        <p v-else class="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-ink-muted">{{ $t('parent_wallet.cash_hint') }}</p>

        <div class="flex flex-col gap-1.5">
          <label for="topup-amount" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parentPortal.amount') }}</label>
          <input id="topup-amount" v-model.number="topUp.amount" type="number" required min="1000" step="1000" class="input-field tnum" :placeholder="$t('wallet_ui.ph_amount')">
        </div>

        <div v-if="topUp.method === 'mobile_banking'" class="flex flex-col gap-1.5">
          <label for="topup-slip" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parentPortal.upload_slip') }}</label>
          <input id="topup-slip" type="file" required accept="image/jpeg,image/png,image/webp" class="input-field" @change="onSlipChange">
          <img v-if="slipPreview" :src="slipPreview" :alt="$t('topups.slip_image')" class="mt-1 max-h-48 rounded border border-line object-contain self-start">
        </div>

        <p v-if="topUp.error" role="alert" class="text-sm text-danger">{{ topUp.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="topUp.saving" @click="topUp.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="topup-form" class="btn-primary" :disabled="topUp.saving || (topUp.method === 'mobile_banking' && !paymentInfo)">
          {{ topUp.saving ? $t('common.saving') : $t('parentPortal.submit_request') }}
        </button>
      </template>
    </AppModal>

    <!-- Spending limits -->
    <AppModal v-model:open="limits.open" :title="$t('parentPortal.spending_limits')" :subtitle="selectedChildName" size="sm">
      <form id="limits-form" class="flex flex-col gap-4" @submit.prevent="saveLimits">
        <div v-for="field in LIMIT_FIELDS" :key="field.key" class="flex flex-col gap-1.5">
          <label :for="`limit-${field.key}`" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t(field.label) }}</label>
          <input :id="`limit-${field.key}`" v-model.number="limits.form[field.key]" type="number" min="0" step="1000" class="input-field tnum" :placeholder="$t('parentPortal.no_limit')">
        </div>
        <p v-if="limits.error" role="alert" class="text-sm text-danger">{{ limits.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="limits.saving" @click="limits.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="limits-form" class="btn-primary" :disabled="limits.saving">
          {{ limits.saving ? $t('common.saving') : $t('parentPortal.save_limits') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { parentRepository } from '../../infrastructure/api/ParentRepository';
import type { TopUpRequest, WalletTransaction, StudentCard } from '../../domain/models/Finance';
import type { PaymentInfo } from '../../application/stores/settings';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const fmt = useFormat();
const mediaUrl = useMediaUrl();
const dialog = useDialog();
useHead({ title: () => `${t('parentPortal.childs_wallet')} — ${t('parentPortal.title')}` });

const STATUS_BADGE: Record<TopUpRequest['status'], string> = {
  pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger',
};
type LimitKey = 'dailyMax' | 'weeklyMax' | 'perTransactionMax';
const LIMIT_FIELDS: { key: LimitKey; label: string }[] = [
  { key: 'dailyMax', label: 'parentPortal.daily_max' },
  { key: 'weeklyMax', label: 'parentPortal.weekly_max' },
  { key: 'perTransactionMax', label: 'parentPortal.per_transaction_max' },
];

const parentStore = useParentStore();
const selectedChildId = ref<number | null>(null);
const requests = ref<TopUpRequest[]>([]);
const paymentInfo = ref<PaymentInfo | null>(null);
const loading = ref(true);
const loadError = ref('');

const personName = (p: { fullNameEn: string; fullNameLo: string }) =>
  (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;
const selectedChildName = computed(() => {
  const child = parentStore.children.find((c) => c.studentId === selectedChildId.value);
  return child ? personName(child) : '';
});

// A child who was never topped up has no wallet yet: show it as empty, not missing.
const balance = computed(() => Number(parentStore.wallet?.balance ?? 0));
const frozen = computed(() => parentStore.wallet?.status === 'frozen');
const transactions = computed<WalletTransaction[]>(() => parentStore.wallet?.transactions ?? []);
const limitRows = computed(() => {
  const sl = parentStore.spendingLimits;
  return LIMIT_FIELDS.map((f) => ({
    label: t(f.label),
    value: sl?.[f.key] ? fmt.kip(sl[f.key]!) : t('parentPortal.no_limit'),
  }));
});

const txDetail = (tx: WalletTransaction) => {
  if (tx.shop) return personName({ fullNameEn: tx.shop.shopNameEn, fullNameLo: tx.shop.shopNameLo });
  return (locale.value === 'lo' ? tx.descriptionLo : tx.descriptionEn) || tx.descriptionEn || '—';
};

const loadChild = async () => {
  if (!selectedChildId.value) return;
  const studentId = selectedChildId.value;
  loadError.value = '';
  try {
    const [, , reqs, childCards] = await Promise.all([
      parentStore.fetchChildWallet(studentId),
      parentStore.fetchSpendingLimits(studentId),
      parentRepository.getTopUpRequests(studentId),
      parentRepository.getChildCards(studentId),
    ]);
    requests.value = reqs;
    cards.value = childCards;
  } catch (err) {
    loadError.value = getErrorMessage(err);
  }
};

onMounted(async () => {
  try {
    const [, info] = await Promise.all([parentStore.fetchChildren(), parentRepository.getPaymentInfo()]);
    paymentInfo.value = info;
    selectedChildId.value = parentStore.children[0]?.studentId ?? null;
    await loadChild();
  } catch (err) {
    loadError.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
});

// ── Top-up request ──
const topUp = reactive({ open: false, saving: false, error: '', method: 'mobile_banking', amount: 50000 });
const slipFile = ref<File | null>(null);
const slipPreview = computed(() => (slipFile.value ? URL.createObjectURL(slipFile.value) : ''));
const copied = ref(false);

const openTopUp = () => {
  Object.assign(topUp, { open: true, saving: false, error: '', method: 'mobile_banking', amount: 50000 });
  slipFile.value = null;
};
const onSlipChange = (e: Event) => {
  slipFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
};
const copyAccount = async () => {
  if (!paymentInfo.value) return;
  await navigator.clipboard.writeText(paymentInfo.value.accountNumber);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
};

const submitTopUp = async () => {
  if (!selectedChildId.value) return;
  if (topUp.method === 'mobile_banking' && !slipFile.value) {
    topUp.error = t('parentPortal.slip_required');
    return;
  }
  topUp.saving = true;
  topUp.error = '';
  try {
    const slipUrl = topUp.method === 'mobile_banking' && slipFile.value
      ? (await parentStore.uploadSlip(slipFile.value)).data.url
      : undefined;
    await parentStore.requestTopUp({ studentId: selectedChildId.value, amount: topUp.amount, method: topUp.method, slipUrl });
    topUp.open = false;
    requests.value = await parentRepository.getTopUpRequests(selectedChildId.value);
    dialog.success(t('parent_wallet.request_sent'));
  } catch (err) {
    topUp.error = getErrorMessage(err);
  } finally {
    topUp.saving = false;
  }
};

// ── Cards ──
const cards = ref<StudentCard[]>([]);
const CARD_BADGE: Record<StudentCard['status'], string> = {
  active: 'badge-success', lost: 'badge-danger', deactivated: 'badge-neutral',
};

const reportLost = async (card: StudentCard) => {
  const studentId = selectedChildId.value;
  if (!studentId) return;
  const ok = await dialog.confirm({
    title: t('parent_cards.confirm_title'),
    message: t('parent_cards.confirm_msg', { uid: card.cardUid, name: selectedChildName.value }),
    confirmLabel: t('parent_cards.report_lost'),
    tone: 'danger',
    onConfirm: async () => {
      const updated = await parentRepository.reportCardLost(studentId, card.cardId);
      cards.value = cards.value.map((c) => (c.cardId === updated.cardId ? updated : c));
    },
  });
  if (ok) dialog.success(t('parent_cards.reported'));
};

// ── Spending limits ──
const limits = reactive({
  open: false,
  saving: false,
  error: '',
  form: { dailyMax: null, weeklyMax: null, perTransactionMax: null } as Record<LimitKey, number | null>,
});

const openLimits = () => {
  const sl = parentStore.spendingLimits;
  for (const f of LIMIT_FIELDS) limits.form[f.key] = sl?.[f.key] ? Number(sl[f.key]) : null;
  Object.assign(limits, { open: true, saving: false, error: '' });
};

const saveLimits = async () => {
  if (!selectedChildId.value) return;
  limits.saving = true;
  limits.error = '';
  try {
    await parentStore.updateSpendingLimits(selectedChildId.value, {
      dailyMax: limits.form.dailyMax || null,
      weeklyMax: limits.form.weeklyMax || null,
      perTransactionMax: limits.form.perTransactionMax || null,
      alertThreshold: null,
    });
    await parentStore.fetchSpendingLimits(selectedChildId.value);
    limits.open = false;
    dialog.success(t('parent_wallet.limits_saved'));
  } catch (err) {
    limits.error = getErrorMessage(err);
  } finally {
    limits.saving = false;
  }
};
</script>
