<template>
  <div class="flex flex-col gap-6 print-document">
    <PageHeader :title="$t('report_cash.title')" :subtitle="report ? f.date(report.date) : $t('report_cash.subtitle')">
      <input v-model="date" type="date" class="input-field w-auto print:hidden" :max="todayStr" :aria-label="$t('report_cash.date')" @change="load">
      <button v-if="canExport" type="button" class="btn-secondary print:hidden" :disabled="exporting || !report?.entries.length"  @click="exportRows">{{ $t('common.export_excel') }}</button>
      <button type="button" class="btn-primary print:hidden" :disabled="!report" @click="print">{{ $t('report_cash.print') }}</button>
    </PageHeader>

    <p v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ error }}</p>
    <LoadingSpinner v-if="loading && !report" />

    <template v-else-if="report">
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="c in cards" :key="c.key" class="stat-card py-3 gap-1" :class="c.key === 'all' ? 'col-span-2 lg:col-span-1' : ''">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ c.label }}</p>
          <p class="text-xl font-bold tnum">{{ f.kip(c.value) }}</p>
        </div>
      </div>

      <section class="panel overflow-hidden">
        <h2 class="px-5 py-4 text-sm font-semibold border-b border-line">{{ $t('report_cash.by_staff') }}</h2>
        <p v-if="!report.staff.length" class="py-8 text-center text-sm text-ink-subtle">{{ $t('report_cash.empty') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th>{{ $t('report_cash.col_staff') }}</th>
                <th class="text-right">{{ $t('report_cash.col_count') }}</th>
                <th class="text-right">{{ $t('report_cash.cash') }}</th>
                <th class="text-right">{{ $t('report_cash.transfer') }}</th>
                <th class="text-right">{{ $t('report_cash.col_total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in report.staff" :key="s.userId">
                <td class="font-semibold">{{ pick(s.fullNameLo, s.fullNameEn) }}</td>
                <td class="text-right tnum">{{ s.count }}</td>
                <td class="text-right tnum">{{ f.kip(s.cash) }}</td>
                <td class="text-right tnum">{{ f.kip(s.transfer) }}</td>
                <td class="text-right tnum font-semibold">{{ f.kip(s.cash + s.transfer) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel overflow-hidden">
        <h2 class="px-5 py-4 text-sm font-semibold border-b border-line">{{ $t('report_cash.entries') }}</h2>
        <p v-if="!report.entries.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('report_cash.empty') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th>{{ $t('report_cash.col_time') }}</th>
                <th>{{ $t('report_cash.col_type') }}</th>
                <th>{{ $t('report_cash.col_ref') }}</th>
                <th>{{ $t('fee_report.col_student') }}</th>
                <th>{{ $t('fee_report.col_method') }}</th>
                <th>{{ $t('report_cash.col_staff') }}</th>
                <th class="text-right">{{ $t('fee_report.col_amount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in report.entries" :key="`${e.kind}-${e.id}`">
                <td class="tnum whitespace-nowrap">{{ f.time(e.time) }}</td>
                <td><span :class="e.kind === 'fee' ? 'badge-info' : 'badge-teal'">{{ e.kind === 'fee' ? $t('report_cash.kind_fee') : $t('report_cash.kind_topup') }}</span></td>
                <td class="font-mono text-xs">{{ e.reference }}</td>
                <td>{{ pick(e.student.fullNameLo, e.student.fullNameEn) }} <span class="text-xs text-ink-muted tnum">{{ e.student.studentCode }}</span></td>
                <td>{{ e.method === 'cash' ? $t('report_cash.cash') : $t('report_cash.transfer') }}</td>
                <td class="text-ink-muted">{{ e.staff ? pick(e.staff.fullNameLo, e.staff.fullNameEn) : '—' }}</td>
                <td class="text-right font-semibold tnum">{{ f.kip(e.amount) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-line font-bold">
                <td colspan="6" class="px-4 py-2.5 text-right">{{ $t('report_cash.col_total') }}</td>
                <td class="px-4 py-2.5 text-right tnum">{{ f.kip(report.totals.all) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { useServerExport } from '../../../composables/useServerExport';
import { ref, computed, onMounted } from 'vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import type { ApiResponse } from '../../../infrastructure/api/types';

interface Person { fullNameEn: string; fullNameLo: string }
interface CashReport {
  date: string;
  totals: { all: number; fees: number; topUps: number; cash: number; transfer: number; count: number };
  staff: (Person & { userId: number; cash: number; transfer: number; count: number })[];
  entries: {
    kind: 'fee' | 'topup'; id: number; time: string; amount: number; method: 'cash' | 'bank_transfer'; reference: string;
    student: Person & { studentCode: string }; staff: Person | null;
  }[];
}

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
useHead({ title: () => t('report_cash.title') });

const todayStr = new Date().toLocaleDateString('en-CA');
const date = ref(todayStr);
const report = ref<CashReport | null>(null);
const loading = ref(true);
const error = ref('');

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const cards = computed(() => {
  const x = report.value!.totals;
  return [
    { key: 'all', label: t('report_cash.total'), value: x.all },
    { key: 'fees', label: t('report_cash.fees'), value: x.fees },
    { key: 'topups', label: t('report_cash.topups'), value: x.topUps },
    { key: 'cash', label: t('report_cash.cash'), value: x.cash },
    { key: 'transfer', label: t('report_cash.transfer'), value: x.transfer },
  ];
});

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await api<ApiResponse<CashReport>>(`/reports/daily-cash?date=${date.value}`);
    report.value = res.data;
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

const print = () => window.print();

// Standard export: built by the server from the report's own filters, and audit-logged.
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'reports.export'));
const { exporting, download } = useServerExport();
const exportRows = () => download('/reports/daily-cash/export', { date: date.value }, `daily-cash-${date.value}`);

onMounted(load);
</script>
