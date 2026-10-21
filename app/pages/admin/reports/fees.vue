<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader :eyebrow="$t('nav.reports')" :title="$t('reports_detail.fees_analytics')" :subtitle="$t('reports_detail.fees_subtitle')">
      <select v-model="year" class="input-field w-auto" :aria-label="$t('fee_report.year')" @change="load">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <button type="button" class="btn-secondary" :disabled="!report" @click="exportReport">{{ $t('common.export_excel') }}</button>
    </PageHeader>

    <p v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ error }}</p>

    <LoadingSpinner v-if="loading && !report" />

    <template v-else-if="report">
      <!-- Totals -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="stat-card">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('fee_report.billed') }}</p>
          <p class="text-2xl font-bold tnum">{{ f.kip(report.totals.billed) }}</p>
          <p class="text-xs text-ink-subtle tnum">{{ $t('fee_report.invoices', { count: f.number(report.totals.invoices) }) }}</p>
        </div>
        <div class="stat-card">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('fee_report.collected') }}</p>
          <p class="text-2xl font-bold tnum">{{ f.kip(report.totals.collected) }}</p>
          <p class="text-xs text-ink-subtle tnum">{{ $t('fee_report.paid_invoices', { paid: f.number(report.totals.paidCount), total: f.number(report.totals.invoices) }) }}</p>
        </div>
        <div class="stat-card">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('fee_report.outstanding') }}</p>
          <p class="text-2xl font-bold tnum">{{ f.kip(report.totals.outstanding) }}</p>
          <p :class="['text-xs tnum', report.totals.overdueCount ? 'text-danger font-semibold' : 'text-ink-subtle']">
            {{ $t('fee_report.overdue', { count: f.number(report.totals.overdueCount), amount: f.kip(report.totals.overdueAmount) }) }}
          </p>
        </div>
        <div class="stat-card">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('fee_report.rate') }}</p>
          <p class="text-2xl font-bold tnum">{{ report.totals.collectionRate === null ? '—' : f.percent(report.totals.collectionRate) }}</p>
          <p class="text-xs text-ink-subtle">{{ $t('fee_report.rate_sub') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Monthly collections -->
        <section class="lg:col-span-2 panel p-5 flex flex-col gap-4">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider">{{ $t('reports_detail.collection_trend') }}</h3>
            <p class="text-xs text-ink-muted mt-0.5">{{ $t('reports_detail.collection_trend_sub') }}</p>
          </div>
          <div class="flex items-end gap-3 h-48 pt-6" role="img" :aria-label="$t('reports_detail.collection_trend')">
            <div v-for="m in months" :key="m.month" class="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group">
              <span class="text-[11px] tnum text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{{ f.kip(m.amount) }}</span>
              <div
                class="w-full max-w-12 rounded-t bg-primary transition-colors group-hover:bg-primary-hover"
                :style="{ height: barHeight(m.amount) }"
                :title="`${m.label}: ${f.kip(m.amount)}`"
              />
              <span class="text-xs text-ink-muted">{{ m.label }}</span>
            </div>
          </div>
        </section>

        <!-- By fee type -->
        <section class="panel p-5 flex flex-col gap-4">
          <h3 class="text-sm font-bold uppercase tracking-wider">{{ $t('fee_report.by_type') }}</h3>
          <p v-if="!report.byFeeType.length" class="text-sm text-ink-subtle">{{ $t('fee_report.no_data') }}</p>
          <div v-for="ft in report.byFeeType" :key="ft.feeTypeId" class="flex flex-col gap-1.5" :title="`${f.kip(ft.collected)} / ${f.kip(ft.billed)}`">
            <div class="flex justify-between gap-3 text-sm">
              <span class="font-semibold truncate">{{ pick(ft.nameLo, ft.nameEn) }}</span>
              <span class="tnum text-ink-muted shrink-0">{{ ft.collectionRate === null ? '—' : f.percent(ft.collectionRate) }}</span>
            </div>
            <div class="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div class="h-full rounded-full bg-primary" :style="{ width: `${ft.collectionRate ?? 0}%` }" />
            </div>
          </div>
        </section>
      </div>

      <!-- By class -->
      <section class="panel overflow-hidden">
        <h3 class="px-5 py-4 text-sm font-bold uppercase tracking-wider border-b border-line">{{ $t('fee_report.by_class') }}</h3>
        <p v-if="!report.byClass.length" class="py-10 text-center text-sm text-ink-subtle">{{ $t('fee_report.no_data') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th class="w-12 text-center">#</th>
                <th>{{ $t('fee_report.col_class') }}</th>
                <th class="text-right">{{ $t('fee_report.billed') }}</th>
                <th class="text-right">{{ $t('fee_report.collected') }}</th>
                <th class="text-right">{{ $t('fee_report.col_paid') }}</th>
                <th class="w-56">{{ $t('fee_report.rate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in report.byClass" :key="c.classId">
                <td class="text-center tnum text-ink-subtle">{{ i + 1 }}</td>
                <td class="font-semibold">{{ pick(c.classNameLo, c.classNameEn) }}</td>
                <td class="text-right tnum">{{ f.kip(c.billed) }}</td>
                <td class="text-right tnum">{{ f.kip(c.collected) }}</td>
                <td class="text-right tnum text-ink-muted">{{ c.paid }} / {{ c.students }}</td>
                <td>
                  <div class="flex items-center gap-3">
                    <div class="h-2 flex-1 rounded-full bg-surface-2 overflow-hidden">
                      <div class="h-full rounded-full bg-primary" :style="{ width: `${c.collectionRate ?? 0}%` }" />
                    </div>
                    <span class="w-12 text-right text-xs tnum text-ink-muted">{{ c.collectionRate === null ? '—' : f.percent(c.collectionRate) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Recent payments -->
      <section class="panel overflow-hidden">
        <div class="px-5 py-4 border-b border-line">
          <h3 class="text-sm font-bold uppercase tracking-wider">{{ $t('reports_detail.recent_billings') }}</h3>
          <p class="text-xs text-ink-muted mt-0.5">{{ $t('reports_detail.recent_billings_sub') }}</p>
        </div>
        <p v-if="!report.recentPayments.length" class="py-10 text-center text-sm text-ink-subtle">{{ $t('fee_report.no_payments') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th class="w-12 text-center">#</th>
                <th>{{ $t('fee_report.col_receipt') }}</th>
                <th>{{ $t('fee_report.col_code') }}</th>
                <th>{{ $t('fee_report.col_student') }}</th>
                <th>{{ $t('fee_report.col_invoice') }}</th>
                <th class="text-right">{{ $t('fee_report.col_amount') }}</th>
                <th>{{ $t('fee_report.col_method') }}</th>
                <th>{{ $t('fee_report.col_received_by') }}</th>
                <th class="text-right">{{ $t('fee_report.col_date') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in report.recentPayments" :key="p.paymentId">
                <td class="text-center tnum text-ink-subtle">{{ i + 1 }}</td>
                <td class="font-mono text-xs whitespace-nowrap">{{ p.receiptNo }}</td>
                <td class="tnum whitespace-nowrap text-ink-muted">{{ p.invoice.student.studentCode || '—' }}</td>
                <td class="font-semibold">{{ pick(p.invoice.student.fullNameLo, p.invoice.student.fullNameEn) }}</td>
                <td class="font-mono text-xs whitespace-nowrap text-ink-muted">{{ p.invoice.invoiceNo }}</td>
                <td class="text-right font-semibold tnum">{{ f.kip(p.amount) }}</td>
                <td>{{ methodLabel(p.method) }}</td>
                <td class="text-ink-muted">{{ p.receiver ? pick(p.receiver.fullNameLo, p.receiver.fullNameEn) : '—' }}</td>
                <td class="text-right tnum whitespace-nowrap">{{ f.dateTime(p.paidAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import type { ApiResponse } from '../../../infrastructure/api/types';
import { useExport } from '../../../composables/useExport';

interface Named { nameEn: string; nameLo: string }
interface FeeReport {
  academicYear: string;
  totals: {
    invoices: number; billed: number; collected: number; outstanding: number;
    overdueCount: number; overdueAmount: number; paidCount: number; collectionRate: number | null;
  };
  byClass: { classId: number; classNameEn: string; classNameLo: string; billed: number; collected: number; students: number; paid: number; collectionRate: number | null }[];
  byFeeType: (Named & { feeTypeId: number; billed: number; collected: number; collectionRate: number | null })[];
  monthly: { month: string; amount: number }[];
  recentPayments: {
    paymentId: number; receiptNo: string; amount: number; method: 'cash' | 'bank_transfer'; paidAt: string;
    invoice: { invoiceNo: string; student: { studentCode: string; fullNameEn: string; fullNameLo: string } };
    receiver: { fullNameEn: string; fullNameLo: string } | null;
  }[];
}

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
const { exportExcel } = useExport();
useHead({ title: () => t('reports_detail.fees_analytics') });

const report = ref<FeeReport | null>(null);
const years = ref<string[]>([]);
const year = ref('');
const loading = ref(true);
const error = ref('');

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const methodLabel = (m: string) => (m === 'cash' ? t('invoice_print.method_cash') : t('invoice_print.method_bank_transfer'));

// The last six months up to now, empty months included, so the bars keep their places.
const months = computed(() => {
  const byMonth = new Map((report.value?.monthly ?? []).map((m) => [m.month, m.amount]));
  const now = new Date();
  return Array.from({ length: 6 }, (_, k) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + k, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month,
      amount: byMonth.get(month) ?? 0,
      label: d.toLocaleDateString(locale.value === 'lo' ? 'lo-LA' : 'en-US', { month: 'short' }),
    };
  });
});
const maxMonth = computed(() => Math.max(...months.value.map((m) => m.amount), 0));
const barHeight = (amount: number) => (maxMonth.value ? `${Math.max((amount / maxMonth.value) * 100, amount ? 2 : 0)}%` : '0%');

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    const query = year.value ? `?academicYear=${encodeURIComponent(year.value)}` : '';
    const res = await api<ApiResponse<FeeReport>>(`/reports/fees${query}`);
    report.value = res.data;
    year.value = res.data.academicYear;
    if (!years.value.includes(year.value)) years.value = [year.value, ...years.value];
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  years.value = await adminRepository.getClassAcademicYears().catch(() => [] as string[]);
  await load();
});

function exportReport() {
  if (!report.value) return;
  exportExcel(
    report.value.byClass.map((c) => ({
      class: pick(c.classNameLo, c.classNameEn),
      billed: c.billed,
      collected: c.collected,
      outstanding: c.billed - c.collected,
      paid: `${c.paid} / ${c.students}`,
      rate: c.collectionRate ?? '',
    })),
    [
      { key: 'class', label: t('fee_report.col_class') },
      { key: 'billed', label: t('fee_report.billed') },
      { key: 'collected', label: t('fee_report.collected') },
      { key: 'outstanding', label: t('fee_report.outstanding') },
      { key: 'paid', label: t('fee_report.col_paid') },
      { key: 'rate', label: `${t('fee_report.rate')} (%)` },
    ],
    `fee-report-${report.value.academicYear}`,
  );
}
</script>
