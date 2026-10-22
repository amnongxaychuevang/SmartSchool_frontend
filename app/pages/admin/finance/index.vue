<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('wallets_admin.title')" :subtitle="$t('wallets_admin.subtitle')">
      <div class="relative w-64">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" class="search-bar" :placeholder="$t('wallets_admin.search')" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <select v-model="statusFilter" class="input-field w-auto" :aria-label="$t('common.status')" @change="load(1)">
        <option value="">{{ $t('wallets_admin.all_status') }}</option>
        <option value="active">{{ $t('status.active') }}</option>
        <option value="frozen">{{ $t('status.frozen') }}</option>
      </select>
    </PageHeader>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="financeStore.walletsLoading" />
      <p v-else-if="!financeStore.wallets.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('wallets_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('wallets_admin.col_code') }}</th>
              <th>{{ $t('wallets_admin.col_student') }}</th>
              <th class="text-right">{{ $t('wallets_admin.col_balance') }}</th>
              <th class="text-right">{{ $t('wallets_admin.col_daily') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('wallets_admin.col_notes') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(w, i) in financeStore.wallets" :key="w.walletId">
              <td class="text-center tnum text-ink-subtle">{{ (financeStore.walletsPage - 1) * WALLETS_PER_PAGE + i + 1 }}</td>
              <td class="tnum whitespace-nowrap text-ink-muted">{{ (w.student && w.student.studentCode) || '—' }}</td>
              <td class="font-semibold">{{ studentName(w) }}</td>
              <td class="text-right font-semibold tnum">{{ f.kip(w.balance) }}</td>
              <td class="text-right tnum text-ink-muted">
                {{ w.student && w.student.spendingLimit && w.student.spendingLimit.dailyMax ? f.kip(w.student.spendingLimit.dailyMax) : $t('wallets_admin.no_limit') }}
              </td>
              <td><span :class="w.status === 'active' ? 'badge-success' : 'badge-danger'">{{ $t(`status.${w.status}`) }}</span></td>
              <td class="max-w-xs truncate text-ink-muted" :title="w.notes || undefined">{{ w.notes || '—' }}</td>
              <td class="text-right">
                <div class="inline-flex gap-2">
                  <button type="button" class="btn-secondary min-h-8 px-3" @click="openHistory(w)">{{ $t('wallets_admin.history') }}</button>
                  <button type="button" :class="w.status === 'active' ? 'btn-danger' : 'btn-secondary'" class="min-h-8 px-3" @click="openStatus(w)">
                    {{ w.status === 'active' ? $t('wallets_admin.freeze') : $t('wallets_admin.unfreeze') }}
                  </button>
                  <button type="button" class="btn-primary min-h-8 px-3" :disabled="w.status === 'frozen'" @click="openTopUp(w)">{{ $t('wallets_admin.top_up') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        :loading="financeStore.walletsLoading"
        :current-page="financeStore.walletsPage"
        :total-pages="totalPages"
        :total="financeStore.walletsTotal"
        :page-size="WALLETS_PER_PAGE"
        @update:page="load"
      />
    </section>

    <AppModal
      :open="topUp.open"
      :title="$t('wallets_admin.top_up_title')"
      :subtitle="topUp.wallet ? $t('wallets_admin.top_up_for', { name: studentName(topUp.wallet), balance: f.kip(topUp.wallet.balance) }) : ''"
      size="sm"
      @update:open="topUp.open = $event"
    >
      <form id="topup-form" class="flex flex-col gap-4" @submit.prevent="handleTopUp">
        <div>
          <label for="t-amount" class="block mb-1.5 text-sm font-semibold">{{ $t('wallets_admin.amount') }}</label>
          <input id="t-amount" v-model.number="topUp.amount" required type="number" min="1000" step="1000" class="input-field tnum font-semibold text-base">
          <div class="flex flex-wrap gap-1.5 mt-2">
            <button
              v-for="amt in [20000, 50000, 100000, 200000, 500000]"
              :key="amt"
              type="button"
              class="px-2.5 py-1 text-xs rounded-lg border transition-all font-medium tnum"
              :class="topUp.amount === amt ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface border-line hover:border-ink-subtle text-ink'"
              @click="topUp.amount = amt"
            >
              {{ f.kip(amt) }}
            </button>
          </div>
        </div>
        <div>
          <label for="t-notes" class="block mb-1.5 text-sm font-semibold">{{ $t('wallets_admin.notes') }}</label>
          <textarea id="t-notes" v-model.trim="topUp.notes" rows="2" class="input-field" :placeholder="$t('wallets_admin.notes_placeholder')" />
        </div>
        <p v-if="topUp.error" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ topUp.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="topUp.saving" @click="topUp.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="topup-form" class="btn-primary" :disabled="topUp.saving || !topUp.amount">
          {{ topUp.saving ? $t('common.saving') : $t('wallets_admin.confirm_top_up') }}
        </button>
      </template>
    </AppModal>

    <!-- Transaction history, with refunds of shop purchases -->
    <AppModal
      :open="history.open"
      :title="$t('wallets_admin.history_title')"
      :subtitle="history.wallet ? `${studentName(history.wallet)} · ${f.kip(history.wallet.balance)}` : ''"
      size="xl"
      @update:open="history.open = $event"
    >
      <LoadingSpinner v-if="history.loading" />
      <p v-else-if="history.error" role="alert" class="text-sm text-danger">{{ history.error }}</p>
      <p v-else-if="!history.items.length" class="py-8 text-center text-sm text-ink-subtle">{{ $t('parentPortal.no_transactions') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('parentPortal.date') }}</th>
              <th>{{ $t('parentPortal.type') }}</th>
              <th>{{ $t('parent_wallet.description') }}</th>
              <th class="text-right">{{ $t('parentPortal.amount') }}</th>
              <th class="text-right">{{ $t('wallets_admin.balance_after') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in history.items" :key="tx.transactionId">
              <td class="tnum whitespace-nowrap">{{ f.dateTime(tx.createdAt) }}</td>
              <td class="whitespace-nowrap">{{ $t(`parent_wallet.tx_${tx.transactionType}`) }}</td>
              <td class="max-w-[14rem] truncate text-ink-muted" :title="txDetail(tx)">{{ txDetail(tx) }}</td>
              <td class="text-right font-semibold tnum" :class="tx.transactionType === 'purchase' ? 'text-danger' : 'text-success'">
                {{ tx.transactionType === 'purchase' ? '−' : '+' }}{{ f.kip(tx.amount) }}
              </td>
              <td class="text-right tnum text-ink-muted">{{ f.kip(tx.balanceAfter) }}</td>
              <td class="text-right">
                <NuxtLink v-if="tx.transactionType === 'top_up'" :to="`/admin/finance/receipt/${tx.transactionId}`" class="btn-secondary min-h-8 px-3">{{ $t('receipt.view') }}</NuxtLink>
                <span v-else-if="tx.refund" class="badge-neutral">{{ $t('wallets_admin.refunded') }}</span>
                <button
                  v-else-if="tx.transactionType === 'purchase' && canRefund"
                  type="button"
                  class="btn-secondary min-h-8 px-3"
                  @click="openRefund(tx)"
                >
                  {{ $t('wallets_admin.refund') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        v-if="history.total > HISTORY_PER_PAGE"
        :loading="history.loading"
        :current-page="history.page"
        :total-pages="Math.ceil(history.total / HISTORY_PER_PAGE)"
        @update:page="loadHistory"
      />
    </AppModal>

    <AppModal
      :open="refund.open"
      :title="$t('wallets_admin.refund_title')"
      :subtitle="refund.tx ? $t('wallets_admin.refund_subtitle', { amount: f.kip(refund.tx.amount), detail: txDetail(refund.tx) }) : ''"
      size="sm"
      @update:open="refund.open = $event"
    >
      <form id="refund-form" class="flex flex-col gap-4" @submit.prevent="handleRefund">
        <div>
          <label for="r-reason" class="block mb-1.5 text-sm font-semibold">{{ $t('wallets_admin.refund_reason') }}</label>
          <textarea id="r-reason" v-model.trim="refund.reason" rows="2" required minlength="3" maxlength="150" class="input-field" :placeholder="$t('wallets_admin.refund_reason_placeholder')" />
        </div>
        <p class="text-xs text-ink-muted">{{ $t('wallets_admin.refund_hint') }}</p>
        <p v-if="refund.error" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ refund.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="refund.saving" @click="refund.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="refund-form" class="btn-primary" :disabled="refund.saving || refund.reason.length < 3">
          {{ refund.saving ? $t('common.saving') : $t('wallets_admin.confirm_refund') }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="status.open"
      :tone="status.wallet && status.wallet.status === 'active' ? 'danger' : 'primary'"
      :title="status.wallet && status.wallet.status === 'active' ? $t('wallets_admin.freeze_title') : $t('wallets_admin.unfreeze_title')"
      :message="status.wallet ? $t(status.wallet.status === 'active' ? 'wallets_admin.freeze_msg' : 'wallets_admin.unfreeze_msg', { name: studentName(status.wallet) }) : ''"
      :confirm-label="status.wallet && status.wallet.status === 'active' ? $t('wallets_admin.freeze') : $t('wallets_admin.unfreeze')"
      :busy="status.busy"
      :error="status.error"
      @update:open="status.open = $event"
      @confirm="handleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import type { Wallet, WalletTransaction } from '../../../domain/models/Finance';
import { financeRepository } from '../../../infrastructure/api/FinanceRepository';
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFinanceStore, WALLETS_PER_PAGE } from '../../../application/stores/finance';
import PageHeader from '../../../components/PageHeader.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('wallets_admin.title') });

const financeStore = useFinanceStore();
const searchInput = ref('');
const statusFilter = ref('');
const totalPages = computed(() => Math.ceil(financeStore.walletsTotal / WALLETS_PER_PAGE));
let searchTimeout: ReturnType<typeof setTimeout>;

const studentName = (w: Wallet) => (locale.value === 'lo' ? w.student?.fullNameLo : w.student?.fullNameEn) || w.student?.fullNameEn || '—';

const load = (page: number) => financeStore.fetchWallets({ search: searchInput.value, status: statusFilter.value, page });
onMounted(() => load(1));
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => load(1), 400);
};
const clearSearch = () => { searchInput.value = ''; load(1); };

const topUp = reactive({ open: false, saving: false, error: '', wallet: null as Wallet | null, amount: 0, notes: '' });
const openTopUp = (w: Wallet) => Object.assign(topUp, { open: true, saving: false, error: '', wallet: w, amount: 0, notes: '' });
async function handleTopUp() {
  if (!topUp.wallet) return;
  topUp.saving = true;
  topUp.error = '';
  try {
    await financeStore.topUpWallet(topUp.wallet.walletId, topUp.amount, topUp.notes || undefined);
    topUp.open = false;
  } catch (err) {
    topUp.error = getErrorMessage(err, t('common.error'));
  } finally {
    topUp.saving = false;
  }
}

// ── Transaction history and refunds ──
const HISTORY_PER_PAGE = 20;
const authStore = useAuthStore();
const canRefund = computed(() => hasPermission(authStore.permissions, 'finance.wallets_manage'));
const history = reactive({
  open: false, loading: false, error: '', wallet: null as Wallet | null,
  items: [] as WalletTransaction[], page: 1, total: 0,
});

const txDetail = (tx: WalletTransaction) => {
  const description = (locale.value === 'lo' ? tx.descriptionLo : tx.descriptionEn) || tx.descriptionEn;
  if (description) return description;
  return (tx.shop && ((locale.value === 'lo' ? tx.shop.shopNameLo : tx.shop.shopNameEn) || tx.shop.shopNameEn)) || '—';
};

async function loadHistory(page: number) {
  if (!history.wallet) return;
  history.loading = true;
  history.error = '';
  try {
    const data = await financeRepository.getWalletTransactions(history.wallet.walletId, page, HISTORY_PER_PAGE);
    Object.assign(history, { items: data.transactions, total: data.total, page });
  } catch (err) {
    history.error = getErrorMessage(err, t('common.error'));
  } finally {
    history.loading = false;
  }
}
const openHistory = (w: Wallet) => {
  Object.assign(history, { open: true, wallet: w, items: [], page: 1, total: 0 });
  loadHistory(1);
};

const refund = reactive({ open: false, saving: false, error: '', tx: null as WalletTransaction | null, reason: '' });
const openRefund = (tx: WalletTransaction) => Object.assign(refund, { open: true, saving: false, error: '', tx, reason: '' });
async function handleRefund() {
  if (!refund.tx) return;
  refund.saving = true;
  refund.error = '';
  try {
    await financeRepository.refundTransaction(refund.tx.transactionId, refund.reason);
    refund.open = false;
    // The balance changed: refresh the list behind the modal and the history itself.
    await Promise.all([loadHistory(history.page), load(financeStore.walletsPage)]);
    const updated = financeStore.wallets.find((w) => w.walletId === history.wallet?.walletId);
    if (updated) history.wallet = updated;
  } catch (err) {
    refund.error = getErrorMessage(err, t('common.error'));
  } finally {
    refund.saving = false;
  }
}

const status = reactive({ open: false, busy: false, error: '', wallet: null as Wallet | null });
const openStatus = (w: Wallet) => Object.assign(status, { open: true, busy: false, error: '', wallet: w });
async function handleStatus() {
  if (!status.wallet) return;
  status.busy = true;
  status.error = '';
  try {
    await financeStore.updateWalletStatus(status.wallet.walletId, status.wallet.status === 'active' ? 'frozen' : 'active');
    status.open = false;
  } catch (err) {
    status.error = getErrorMessage(err, t('common.error'));
  } finally {
    status.busy = false;
  }
}
</script>
