<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('nav.finance')" :title="$t('wallets_admin.title')" :subtitle="$t('wallets_admin.subtitle')">
      <input v-model="searchInput" type="search" class="input-field w-64" :placeholder="$t('wallets_admin.search')" @input="handleSearch">
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
              <th>{{ $t('wallets_admin.col_student') }}</th>
              <th class="text-right">{{ $t('wallets_admin.col_balance') }}</th>
              <th class="text-right">{{ $t('wallets_admin.col_daily') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('wallets_admin.col_notes') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in financeStore.wallets" :key="w.walletId">
              <td>
                <p class="font-semibold">{{ studentName(w) }}</p>
                <p class="text-xs text-ink-subtle font-mono">{{ w.student?.studentCode }}</p>
              </td>
              <td class="text-right font-semibold tnum">{{ f.kip(w.balance) }}</td>
              <td class="text-right tnum text-ink-muted">
                {{ w.student?.spendingLimit?.dailyMax ? f.kip(w.student.spendingLimit.dailyMax) : $t('wallets_admin.no_limit') }}
              </td>
              <td><span :class="w.status === 'active' ? 'badge-success' : 'badge-danger'">{{ $t(`status.${w.status}`) }}</span></td>
              <td class="max-w-xs truncate text-ink-muted" :title="w.notes ?? undefined">{{ w.notes || '—' }}</td>
              <td class="text-right">
                <div class="inline-flex gap-2">
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
      <PaginationBar :current-page="financeStore.walletsPage" :total-pages="totalPages" @update:page="load" />
    </section>

    <AppModal
      v-model:open="topUp.open"
      :title="$t('wallets_admin.top_up_title')"
      :subtitle="topUp.wallet ? $t('wallets_admin.top_up_for', { name: studentName(topUp.wallet), balance: f.kip(topUp.wallet.balance) }) : ''"
      size="sm"
    >
      <form id="topup-form" class="flex flex-col gap-4" @submit.prevent="handleTopUp">
        <div>
          <label for="t-amount" class="block mb-1.5 text-sm font-semibold">{{ $t('wallets_admin.amount') }}</label>
          <input id="t-amount" v-model.number="topUp.amount" required type="number" min="1000" step="1000" class="input-field tnum">
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

    <ConfirmDialog
      v-model:open="status.open"
      :tone="status.wallet?.status === 'active' ? 'danger' : 'primary'"
      :title="status.wallet?.status === 'active' ? $t('wallets_admin.freeze_title') : $t('wallets_admin.unfreeze_title')"
      :message="status.wallet ? $t(status.wallet.status === 'active' ? 'wallets_admin.freeze_msg' : 'wallets_admin.unfreeze_msg', { name: studentName(status.wallet) }) : ''"
      :confirm-label="status.wallet?.status === 'active' ? $t('wallets_admin.freeze') : $t('wallets_admin.unfreeze')"
      :busy="status.busy"
      :error="status.error"
      @confirm="handleStatus"
    />
  </div>
</template>

<script setup lang="ts">
import type { Wallet } from '../../../domain/models/Finance';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFinanceStore } from '../../../application/stores/finance';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
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
const totalPages = computed(() => Math.ceil(financeStore.walletsTotal / 15));
let searchTimeout: ReturnType<typeof setTimeout>;

const studentName = (w: Wallet) => (locale.value === 'lo' ? w.student?.fullNameLo : w.student?.fullNameEn) || w.student?.fullNameEn || '—';

const load = (page: number) => financeStore.fetchWallets({ search: searchInput.value, status: statusFilter.value, page });
onMounted(() => load(1));
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => load(1), 400);
};

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
