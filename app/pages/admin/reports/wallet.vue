<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader :title="t('wallet_report.title')" :subtitle="t('wallet_report.subtitle')" />

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ t('wallet_report.total_wallets') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ totalWallets }}</p>
      </div>
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ $t('wallet_ui.total_balance') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ f.kip(totalBalance) }}</p>
      </div>
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ t('wallet_report.pending_topups') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ pendingTopUps }}</p>
      </div>
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ t('wallet_report.frozen') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ frozenWallets }}</p>
      </div>
    </div>

    <!-- Search + Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="text" :placeholder="t('wallet_report.search_placeholder')" class="search-bar" @input="handleSearch">
        <button v-if="searchQuery" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear')" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="filterStatus" class="input-field w-auto" @change="applyFilter">
          <option value="all">{{ t('wallet_report.all_status') }}</option>
          <option value="active">{{ t('wallet_report.active') }}</option>
          <option value="frozen">{{ t('wallet_report.frozen') }}</option>
        </select>
      </div>
      <div class="flex items-center gap-3 ml-auto">
        <button class="btn-secondary" @click="refreshData">
          {{ $t('common.refresh') }}
        </button>
        <button v-if="canExport" class="btn-secondary"  :disabled="exporting" @click="exportWallets">
          {{ $t('common.export_excel') }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="financeStore.walletsLoading && !financeStore.wallets.length" />
      <p v-else-if="!filteredWallets.length" class="py-12 text-center text-sm text-ink-subtle">{{ t('wallet_report.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('wallet_ui.col_code') }}</th>
              <th class="w-auto">{{ $t('wallet_ui.col_student') }}</th>
              <th class="w-36 text-right">{{ $t('wallet_ui.col_balance') }}</th>
              <th class="w-36 text-right">{{ $t('wallet_ui.col_daily') }}</th>
              <th class="w-28 text-center">{{ $t('wallet_ui.col_status') }}</th>
              <th class="w-36 text-right">{{ $t('wallet_ui.col_updated') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(wallet, i) in filteredWallets" :key="wallet.walletId">
              <td class="text-center tnum text-ink-subtle">{{ (currentPage - 1) * WALLETS_PER_PAGE + i + 1 }}</td>
              <td class="tnum whitespace-nowrap text-ink-muted">{{ walletStudentCode(wallet) || '—' }}</td>
              <td class="font-semibold">{{ walletStudentName(wallet) }}</td>
              <td class="text-right font-bold tnum text-primary-ink">{{ f.kip(wallet.balance) }}</td>
              <td class="text-right tnum text-ink-muted">{{ walletDailyLimit(wallet) }}</td>
              <td class="text-center">
                <span :class="wallet.status === 'active' ? 'badge-success' : 'badge-danger'">
                  {{ wallet.status === 'active' ? t('wallet_report.active') : t('wallet_report.frozen') }}
                </span>
              </td>
              <td class="text-right tnum whitespace-nowrap">{{ f.date(wallet.updatedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        :loading="financeStore.walletsLoading"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="financeStore.walletsTotal"
        :page-size="WALLETS_PER_PAGE"
        @update:page="onPageChange"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { useServerExport } from '../../../composables/useServerExport';
import { ref, computed, onMounted, watch } from 'vue';
import { useFinanceStore, WALLETS_PER_PAGE } from '~/application/stores/finance';
import PageHeader from '../../../components/PageHeader.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';

definePageMeta({ layout: 'admin' });

const { locale, t } = useI18n();
useHead({ title: () => t('page_titles.wallet_report') });
const f = useFormat();
const financeStore = useFinanceStore();

const filterStatus = ref('all');
const searchQuery = ref('');
const currentPage = ref(1);
const totalPages = computed(() => Math.ceil((financeStore.walletsTotal || 1) / WALLETS_PER_PAGE));

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { currentPage.value = 1; refreshData(); }, 300);
};
const clearSearch = () => { searchQuery.value = ''; currentPage.value = 1; refreshData(); };
const applyFilter = () => { currentPage.value = 1; refreshData(); };
const onPageChange = (page: number) => { currentPage.value = page; };

const refreshData = async () => {
  await financeStore.fetchWallets({
    page: currentPage.value,
    search: searchQuery.value || undefined,
    status: filterStatus.value === 'all' ? undefined : filterStatus.value
  });
  await financeStore.fetchTopUpRequests({ status: 'pending' });
};

onMounted(() => {
  refreshData();
});

watch([currentPage], () => {
  refreshData();
});

const filteredWallets = computed(() => financeStore.wallets || []);

const walletStudentName = (w: any) => {
  const s = w.student;
  if (!s) return '—';
  return (locale.value === 'lo' ? s.fullNameLo : s.fullNameEn) || s.fullNameEn;
};
const walletStudentCode = (w: any) => w.student ? w.student.studentCode : '';
const walletDailyLimit = (w: any) => {
  const limit = w.student?.spendingLimit?.dailyMax;
  return limit ? f.kip(limit) : t('wallet_ui.no_limit');
};

const totalWallets = computed(() => financeStore.walletsTotal || 0);
const totalBalance = computed(() => (financeStore.wallets || []).reduce((sum, wallet) => sum + Number(wallet.balance), 0));
const pendingTopUps = computed(() => financeStore.topUpRequestsTotal || 0);
const frozenWallets = computed(() => (financeStore.wallets || []).filter(w => w.status === 'frozen').length);

// Standard export: built by the server from the report's own filters, and audit-logged.
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'reports.export'));
const { exporting, download } = useServerExport();
const exportWallets = () => download('/reports/wallet/export', { search: searchQuery.value, status: filterStatus.value === 'all' ? '' : filterStatus.value }, 'wallets');
</script>
