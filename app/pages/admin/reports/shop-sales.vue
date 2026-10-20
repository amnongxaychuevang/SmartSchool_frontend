<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('nav.reports')" :title="$t('shop_sales.title')" :subtitle="$t('shop_sales.subtitle')">
      <div class="flex items-center gap-3">
        <select v-model="rangePreset" class="input-field w-auto" @change="applyPreset">
          <option value="today">{{ $t('shop_sales.today') }}</option>
          <option value="week">{{ $t('shop_sales.this_week') }}</option>
          <option value="month">{{ $t('shop_sales.this_month') }}</option>
          <option value="custom">{{ $t('shop_sales.custom') }}</option>
        </select>
        <template v-if="rangePreset === 'custom'">
          <input v-model="dateFrom" type="date" class="input-field w-auto" @change="load">
          <span class="text-ink-subtle">—</span>
          <input v-model="dateTo" type="date" class="input-field w-auto" @change="load">
        </template>
      </div>
    </PageHeader>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ $t('shop_sales.grand_total') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ f.kip(report.grandTotal) }}</p>
      </div>
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ $t('shop_sales.total_transactions') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ f.number(report.totalTransactions) }}</p>
      </div>
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ $t('shop_sales.shops_active') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ f.number(report.summary.length) }}</p>
      </div>
    </div>

    <!-- Table -->
    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="loading" />
      <p v-else-if="!report.summary.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('shop_sales.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('shop_sales.col_shop') }}</th>
              <th>{{ $t('shop_sales.col_location') }}</th>
              <th class="text-right">{{ $t('shop_sales.col_transactions') }}</th>
              <th class="text-right">{{ $t('shop_sales.col_total') }}</th>
              <th class="text-right">{{ $t('shop_sales.col_share') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in report.summary" :key="row.shopId">
              <td class="text-center text-ink-muted">{{ i + 1 }}</td>
              <td class="font-semibold">{{ shopName(row) }}</td>
              <td class="text-ink-muted">{{ shopLocation(row) || '—' }}</td>
              <td class="text-right tnum">{{ f.number(row.transactionCount) }}</td>
              <td class="text-right font-bold tnum">{{ f.kip(row.totalAmount) }}</td>
              <td class="text-right tnum text-ink-muted">{{ sharePercent(row) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-line-strong font-bold">
              <td colspan="3" class="text-right uppercase text-xs tracking-wider text-ink-subtle">{{ $t('shop_sales.total') }}</td>
              <td class="text-right tnum">{{ f.number(report.totalTransactions) }}</td>
              <td class="text-right tnum">{{ f.kip(report.grandTotal) }}</td>
              <td class="text-right tnum text-ink-muted">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { financeRepository, type ShopSalesReport, type ShopSalesSummary } from '../../../infrastructure/api/FinanceRepository';
import PageHeader from '../../../components/PageHeader.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('shop_sales.title') });

const loading = ref(false);
const rangePreset = ref('today');
const dateFrom = ref('');
const dateTo = ref('');

const emptyReport: ShopSalesReport = { summary: [], grandTotal: 0, totalTransactions: 0, from: '', to: '' };
const report = ref<ShopSalesReport>(emptyReport);

const toLocalDate = (d: Date) => d.toISOString().slice(0, 10);

function applyPreset() {
  const now = new Date();
  if (rangePreset.value === 'today') {
    dateFrom.value = toLocalDate(now);
    dateTo.value = toLocalDate(now);
  } else if (rangePreset.value === 'week') {
    const day = now.getDay();
    const sun = new Date(now);
    sun.setDate(now.getDate() - day);
    dateFrom.value = toLocalDate(sun);
    dateTo.value = toLocalDate(now);
  } else if (rangePreset.value === 'month') {
    dateFrom.value = toLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
    dateTo.value = toLocalDate(now);
  }
  if (rangePreset.value !== 'custom') load();
}

async function load() {
  loading.value = true;
  try {
    report.value = await financeRepository.getShopSales({ from: dateFrom.value, to: dateTo.value });
  } catch {
    report.value = emptyReport;
  } finally {
    loading.value = false;
  }
}

const shopName = (row: ShopSalesSummary) => {
  if (!row.shop) return '—';
  return (locale.value === 'lo' ? row.shop.shopNameLo : row.shop.shopNameEn) || row.shop.shopNameEn;
};

const shopLocation = (row: ShopSalesSummary) => {
  if (!row.shop) return '';
  return (locale.value === 'lo' ? (row.shop.locationLo || row.shop.locationEn) : (row.shop.locationEn || row.shop.locationLo)) || '';
};

const sharePercent = (row: ShopSalesSummary) => {
  if (!report.value.grandTotal) return '0%';
  return f.percent((row.totalAmount / report.value.grandTotal) * 100, 1);
};

onMounted(() => {
  applyPreset();
});
</script>
