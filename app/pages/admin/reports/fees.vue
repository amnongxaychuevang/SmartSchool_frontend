<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader :title="$t('reports_detail.fees_analytics')" :subtitle="$t('reports_detail.fees_subtitle')">
      <select v-model="year" class="input-field w-auto" :aria-label="$t('fee_report.year')" @change="load">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <button v-if="canExport" type="button" class="btn-secondary" :disabled="exporting || !report"  @click="exportReport">{{ $t('common.export_excel') }}</button>
    </PageHeader>

    <p v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ error }}</p>

    <LoadingSpinner v-if="loading && !report" />

    <template v-else-if="report">
      <!-- Totals -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('fee_report.billed') }}</p>
          <p class="text-xl font-bold tnum">{{ f.kip(report.totals.billed) }}</p>
          <p class="text-xs text-ink-subtle tnum">{{ $t('fee_report.invoices', { count: f.number(report.totals.invoices) }) }}</p>
        </div>
        <div class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('fee_report.collected') }}</p>
          <p class="text-xl font-bold tnum">{{ f.kip(report.totals.collected) }}</p>
          <p class="text-xs text-ink-subtle tnum">{{ $t('fee_report.paid_invoices', { paid: f.number(report.totals.paidCount), total: f.number(report.totals.invoices) }) }}</p>
        </div>
        <div class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('fee_report.outstanding') }}</p>
          <p class="text-xl font-bold tnum">{{ f.kip(report.totals.outstanding) }}</p>
          <p :class="['text-xs tnum', report.totals.overdueCount ? 'text-danger font-semibold' : 'text-ink-subtle']">
            {{ $t('fee_report.overdue', { count: f.number(report.totals.overdueCount), amount: f.kip(report.totals.overdueAmount) }) }}
          </p>
        </div>
        <div class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('fee_report.rate') }}</p>
          <p class="text-xl font-bold tnum">{{ report.totals.collectionRate === null ? '—' : f.percent(report.totals.collectionRate) }}</p>
          <p class="text-xs text-ink-subtle">{{ $t('fee_report.rate_sub') }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2"
          :class="activeTab === tab.id ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <template v-if="activeTab === 'overview'">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Monthly collections -->
          <section class="lg:col-span-2 panel p-5 flex flex-col gap-4">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 class="text-sm font-bold uppercase tracking-wider">{{ $t('reports_detail.collection_trend') }}</h3>
                <p class="text-xs text-ink-muted mt-0.5">{{ $t('reports_detail.collection_trend_sub') }}</p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold leading-tight">{{ f.kip(trendTotal) }}</p>
                <p class="text-xs text-ink-muted">{{ $t('fee_report.trend_avg', { amount: compactKip(trendAvg) }) }}</p>
              </div>
            </div>

            <div class="flex gap-3">
              <!-- Y axis -->
              <div class="relative w-12 h-40 shrink-0 text-[11px] text-ink-subtle tnum" aria-hidden="true">
                <span
                  v-for="tick in yTicks"
                  :key="tick"
                  class="absolute right-0 translate-y-1/2 leading-none"
                  :style="{ bottom: `${(tick / yMax) * 100}%` }"
                >{{ compactKip(tick) }}</span>
              </div>

              <div class="flex-1 min-w-0 flex flex-col gap-2">
                <!-- Plot -->
                <div class="relative h-40" @mouseleave="hovered = null">
                  <div
                    v-for="tick in yTicks"
                    :key="tick"
                    class="absolute inset-x-0 h-px"
                    :class="tick === 0 ? 'bg-line-strong' : 'bg-line'"
                    :style="{ bottom: `${(tick / yMax) * 100}%` }"
                    aria-hidden="true"
                  />

                  <!-- Hover guide -->
                  <div
                    v-if="hoveredPoint"
                    class="absolute top-0 bottom-0 w-px bg-line-strong pointer-events-none"
                    :style="{ left: `${hoveredPoint.x}%` }"
                    aria-hidden="true"
                  />

                  <!-- Area + line (stretched to the box; strokes stay 2px) -->
                  <svg class="absolute inset-0 w-full h-full overflow-visible" :viewBox="`0 0 ${CHART_W} ${CHART_H}`" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="fee-trend-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgb(var(--primary))" stop-opacity="0.28" />
                        <stop offset="100%" stop-color="rgb(var(--primary))" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <path :d="trendPaths.area" fill="url(#fee-trend-fill)" />
                    <path :d="trendPaths.done" fill="none" stroke="rgb(var(--primary))" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
                    <path :d="trendPaths.current" fill="none" stroke="rgb(var(--primary))" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round" vector-effect="non-scaling-stroke" />
                  </svg>

                  <!-- Points (HTML so they stay round at any width) -->
                  <template v-for="(pt, i) in trendPoints" :key="pt.month">
                    <span
                      class="absolute rounded-full bg-primary ring-2 ring-surface -translate-x-1/2 translate-y-1/2 pointer-events-none transition-all"
                      :class="hovered === i ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'"
                      :style="{ left: `${pt.x}%`, bottom: `${pt.y}%` }"
                      aria-hidden="true"
                    />
                    <!-- Direct label: peak and current month only -->
                    <span
                      v-if="pt.amount && (pt.isCurrent || pt.isPeak) && hovered !== i"
                      class="absolute -translate-x-1/2 text-[11px] font-semibold text-ink-muted tnum whitespace-nowrap pointer-events-none"
                      :style="{ left: `${pt.x}%`, bottom: `calc(${pt.y}% + 10px)` }"
                      aria-hidden="true"
                    >{{ compactKip(pt.amount) }}</span>
                  </template>

                  <!-- Tooltip -->
                  <div
                    v-if="hoveredPoint"
                    class="pointer-events-none absolute z-10 px-2.5 py-1.5 rounded-lg bg-ink text-surface shadow-float whitespace-nowrap"
                    :style="{ left: `${hoveredPoint.x}%`, bottom: `calc(${hoveredPoint.y}% + 14px)`, transform: `translateX(${tooltipShift})` }"
                    aria-hidden="true"
                  >
                    <p class="text-[11px] opacity-70">{{ hoveredPoint.longLabel }}<template v-if="hoveredPoint.isCurrent"> · {{ $t('fee_report.trend_in_progress') }}</template></p>
                    <p class="text-sm font-semibold tnum">{{ f.kip(hoveredPoint.amount) }}</p>
                  </div>

                  <!-- Hit areas: one column per month -->
                  <div class="absolute inset-0 flex">
                    <button
                      v-for="(m, i) in months"
                      :key="m.month"
                      type="button"
                      class="flex-1 h-full outline-none focus-visible:bg-surface-2/50 rounded-md"
                      :aria-label="`${m.longLabel}: ${f.kip(m.amount)}`"
                      @mouseenter="hovered = i"
                      @focus="hovered = i"
                      @blur="hovered = null"
                    />
                  </div>
                </div>
                <!-- X axis -->
                <div class="flex" aria-hidden="true">
                  <span
                    v-for="m in months"
                    :key="m.month"
                    class="flex-1 text-center text-xs"
                    :class="m.isCurrent ? 'font-semibold text-ink' : 'text-ink-muted'"
                  >{{ m.label }}</span>
                </div>
              </div>
            </div>

            <!-- Same data for screen readers -->
            <table class="sr-only">
              <caption>{{ $t('reports_detail.collection_trend') }}</caption>
              <tbody>
                <tr v-for="m in months" :key="m.month">
                  <th scope="row">{{ m.longLabel }}</th>
                  <td>{{ f.kip(m.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- By fee type: on wide screens it takes the trend card's height and scrolls inside -->
          <section class="panel p-5 flex flex-col gap-4 lg:h-0 lg:min-h-full">
            <h3 class="text-sm font-bold uppercase tracking-wider shrink-0">{{ $t('fee_report.by_type') }}</h3>
            <p v-if="!report.byFeeType.length" class="text-sm text-ink-subtle">{{ $t('fee_report.no_data') }}</p>
            <div v-else class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pr-1 [&>*]:my-auto">
              <div v-for="ft in report.byFeeType" :key="ft.feeTypeId" class="flex flex-col gap-1.5" :title="`${f.kip(ft.collected)} / ${f.kip(ft.billed)}`">
                <div class="flex justify-between gap-3 text-sm">
                  <span class="font-semibold truncate">{{ pick(ft.nameLo, ft.nameEn) }}</span>
                  <span class="tnum text-ink-muted shrink-0">{{ ft.collectionRate === null ? '—' : f.percent(ft.collectionRate) }}</span>
                </div>
                <div class="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div class="h-full rounded-full bg-primary" :style="{ width: `${ft.collectionRate ?? 0}%` }" />
                </div>
                <p class="text-xs text-ink-muted tnum">{{ compactKip(ft.collected) }} / {{ compactKip(ft.billed) }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- By class -->
        <section class="panel overflow-hidden">
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
      </template>

      <!-- Recent payments -->
      <section v-else class="panel overflow-hidden">
        <LoadingSpinner v-if="paymentsLoading && !payments.length" />
        <p v-else-if="!payments.length" class="py-10 text-center text-sm text-ink-subtle">{{ $t('fee_report.no_payments') }}</p>
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
              <tr v-for="(p, i) in payments" :key="p.paymentId">
                <td class="text-center tnum text-ink-subtle">{{ (paymentsPage - 1) * paymentsPageSize + i + 1 }}</td>
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
        <PaginationBar
          :loading="paymentsLoading"
          :current-page="paymentsPage"
          :total-pages="paymentsTotalPages"
          :total="paymentsTotal"
          :page-size="paymentsPageSize"
          @update:page="loadPayments"
          @update:page-size="(size) => { paymentsPageSize = size; }"
        />
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
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import type { ApiResponse } from '../../../infrastructure/api/types';

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
}
interface FeePaymentRow {
  paymentId: number; receiptNo: string; amount: number; method: 'cash' | 'bank_transfer'; paidAt: string;
  invoice: { invoiceNo: string; student: { studentCode: string; fullNameEn: string; fullNameLo: string } };
  receiver: { fullNameEn: string; fullNameLo: string } | null;
}

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
useHead({ title: () => t('reports_detail.fees_analytics') });

const report = ref<FeeReport | null>(null);
const years = ref<string[]>([]);
const year = ref('');

type TabId = 'overview' | 'payments';
const activeTab = ref<TabId>('overview');
const tabs = computed<{ id: TabId; label: string }[]>(() => [
  { id: 'overview', label: t('fee_report.tab_overview') },
  { id: 'payments', label: t('fee_report.tab_payments') },
]);
const loading = ref(true);
const error = ref('');

// Payment history is fetched page by page, separately from the report totals.
const payments = ref<FeePaymentRow[]>([]);
const paymentsPage = ref(1);
const paymentsPageSize = ref(15);
const paymentsTotal = ref(0);
const paymentsTotalPages = ref(1);
const paymentsLoading = ref(false);

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const methodLabel = (m: string) => (m === 'cash' ? t('invoice_print.method_cash') : t('invoice_print.method_bank_transfer'));

// The last six months up to now, empty months included, so the bars keep their places.
const months = computed(() => {
  const byMonth = new Map((report.value?.monthly ?? []).map((m) => [m.month, m.amount]));
  const now = new Date();
  const dateLocale = locale.value === 'lo' ? 'lo-LA' : 'en-US';
  const rows = Array.from({ length: 6 }, (_, k) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + k, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return {
      month,
      amount: byMonth.get(month) ?? 0,
      label: d.toLocaleDateString(dateLocale, { month: 'short' }),
      longLabel: d.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' }),
      isCurrent: k === 5,
      isPeak: false,
    };
  });
  const peak = rows.reduce<typeof rows[0]>((best, r) => (r.amount > best.amount ? r : best), rows[0]!);
  if (peak.amount > 0) peak.isPeak = true;
  return rows;
});
const trendTotal = computed(() => months.value.reduce((sum, m) => sum + m.amount, 0));
const trendAvg = computed(() => trendTotal.value / months.value.length);

// Y axis: three or four clean steps (1 / 2 / 2.5 / 5 x 10^n) that cover the tallest bar.
const trendMax = computed(() => Math.max(...months.value.map((m) => m.amount), 0));
const yStep = computed(() => {
  if (!trendMax.value) return 1;
  const raw = trendMax.value / 3;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 2.5, 5, 10].find((n) => n * pow >= raw) ?? 10) * pow;
});
const yMax = computed(() => (trendMax.value ? Math.ceil(trendMax.value / yStep.value) * yStep.value : 1));
const yTicks = computed(() => Array.from({ length: Math.round(yMax.value / yStep.value) + 1 }, (_, i) => i * yStep.value));

// ── Trend line geometry ──
// Points sit at the centre of each month's column; x and y are percentages of the plot box.
const CHART_W = 600;
const CHART_H = 200;
const hovered = ref<number | null>(null);
const trendPoints = computed(() =>
  months.value.map((m, i) => ({ ...m, x: ((i + 0.5) / months.value.length) * 100, y: (m.amount / yMax.value) * 100 })),
);
const hoveredPoint = computed(() => (hovered.value === null ? null : trendPoints.value[hovered.value] ?? null));
const tooltipShift = computed(() => {
  if (hovered.value === 0) return '-20%';
  if (hovered.value === months.value.length - 1) return '-80%';
  return '-50%';
});

// Monotone cubic (Fritsch–Carlson): smooth, but never overshoots a data point or dips below zero.
const trendPaths = computed(() => {
  const pts = trendPoints.value.map((p) => ({ x: (p.x / 100) * CHART_W, y: CHART_H - (p.y / 100) * CHART_H }));
  const n = pts.length;
  if (n < 2) return { area: '', done: '', current: '' };
  const d = pts.slice(0, -1).map((p, i) => (pts[i + 1]!.y - p.y) / (pts[i + 1]!.x - p.x));
  const m = pts.map((_, i) => {
    if (i === 0) return d[0]!;
    if (i === n - 1) return d[n - 2]!;
    return d[i - 1]! * d[i]! <= 0 ? 0 : (d[i - 1]! + d[i]!) / 2;
  });
  // Clamp tangents so each segment stays monotone.
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i]! / d[i]!;
    const b = m[i + 1]! / d[i]!;
    const h = a * a + b * b;
    if (h > 9) { const t = 3 / Math.sqrt(h); m[i] = t * a * d[i]!; m[i + 1] = t * b * d[i]!; }
  }
  const seg = (i: number) => {
    const p0 = pts[i]!;
    const p1 = pts[i + 1]!;
    const dx = (p1.x - p0.x) / 3;
    return `C ${p0.x + dx} ${p0.y + m[i]! * dx} ${p1.x - dx} ${p1.y - m[i + 1]! * dx} ${p1.x} ${p1.y}`;
  };
  const move = (i: number) => `M ${pts[i]!.x} ${pts[i]!.y}`;
  const segments = Array.from({ length: n - 1 }, (_, i) => seg(i));
  const full = `${move(0)} ${segments.join(' ')}`;
  return {
    area: `${full} L ${pts[n - 1]!.x} ${CHART_H} L ${pts[0]!.x} ${CHART_H} Z`,
    done: `${move(0)} ${segments.slice(0, -1).join(' ')}`,
    current: `${move(n - 2)} ${segments[n - 2]!}`,
  };
});

const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const compactKip = (value: number) => `₭ ${compactFormatter.format(value)}`;

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    const query = year.value ? `?academicYear=${encodeURIComponent(year.value)}` : '';
    const res = await api<ApiResponse<FeeReport>>(`/reports/fees${query}`);
    report.value = res.data;
    year.value = res.data.academicYear;
    if (!years.value.includes(year.value)) years.value = [year.value, ...years.value];
    await loadPayments(1);
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

const loadPayments = async (page: number) => {
  paymentsLoading.value = true;
  try {
    const query = new URLSearchParams({ academicYear: year.value, page: String(page), limit: String(paymentsPageSize.value) });
    const res = await api<ApiResponse<FeePaymentRow[]>>(`/reports/fees/payments?${query}`);
    payments.value = res.data;
    paymentsPage.value = res.meta?.page ?? page;
    paymentsTotal.value = res.meta?.total ?? res.data.length;
    paymentsTotalPages.value = res.meta?.totalPages ?? 1;
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    paymentsLoading.value = false;
  }
};

onMounted(async () => {
  years.value = await adminRepository.getClassAcademicYears().catch(() => [] as string[]);
  await load();
});

// Standard export: built by the server from the report's own filters, and audit-logged.
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'reports.export'));
const { exporting, download } = useServerExport();
const exportReport = () => download('/reports/fees/export', { academicYear: year.value }, `fees-${year.value}`);
</script>
