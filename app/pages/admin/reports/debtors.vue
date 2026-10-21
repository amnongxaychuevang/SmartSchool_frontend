<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('report_debtors.title')" :subtitle="$t('report_debtors.subtitle')" />

    <p v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ error }}</p>
    <LoadingSpinner v-if="loading && !report" />

    <template v-else-if="report">
      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative w-full sm:w-80">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="search" type="text" class="search-bar" :placeholder="$t('leave_admin.search_ph')" :aria-label="$t('leave_admin.search_ph')" @input="page = 1">
          <button v-if="search" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear_search')" @click="search = ''; page = 1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <select v-model="classFilter" class="input-field w-auto" :aria-label="$t('fee_report.col_class')" @change="page = 1">
          <option :value="null">{{ $t('assignments.all_classes') }}</option>
          <option v-for="c in classOptions" :key="c.classId" :value="c.classId">{{ pick(c.classNameLo, c.classNameEn) }}</option>
        </select>
        <select v-model="year" class="input-field w-auto" :aria-label="$t('fee_report.year')" @change="page = 1">
          <option :value="null">{{ $t('report_debtors.all_years') }}</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
        <button v-if="canExport" type="button" class="btn-secondary ml-auto" :disabled="exporting || !filtered.length"  @click="exportRows">{{ $t('common.export_excel') }}</button>
      </div>

      <section class="panel overflow-hidden">
        <p v-if="!filtered.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('report_debtors.empty') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th class="w-12 text-center">#</th>
                <th>{{ $t('fee_report.col_student') }}</th>
                <th>{{ $t('fee_report.col_class') }}</th>
                <th>{{ $t('leave_admin.col_parent') }}</th>
                <th>{{ $t('report_debtors.col_phone') }}</th>
                <th>{{ $t('report_debtors.col_fees') }}</th>
                <th class="text-right">{{ $t('report_debtors.col_owed') }}</th>
                <th>{{ $t('report_debtors.col_overdue') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in pageRows" :key="s.studentId">
                <td class="text-center tnum text-ink-subtle">{{ (page - 1) * pageSize + i + 1 }}</td>
                <td>
                  <div class="flex items-center gap-3">
                    <PersonAvatar :name="pick(s.fullNameLo, s.fullNameEn)" :photo-url="s.photoUrl" size="md" />
                    <p class="font-semibold">{{ pick(s.fullNameLo, s.fullNameEn) }}</p>
                  </div>
                </td>
                <td>{{ s.class ? pick(s.class.classNameLo, s.class.classNameEn) : '—' }}</td>
                <td>{{ s.parent ? pick(s.parent.fullNameLo, s.parent.fullNameEn) : '—' }}</td>
                <td class="whitespace-nowrap">
                  <a v-if="s.parent?.phoneNumber" :href="`tel:${s.parent.phoneNumber}`" class="text-primary-ink hover:underline tnum">{{ s.parent.phoneNumber }}</a>
                  <span v-else class="text-ink-subtle">—</span>
                </td>
                <td class="max-w-xs whitespace-normal text-xs text-ink-muted">
                  {{ feeList(s) }}
                </td>
                <td class="text-right font-semibold tnum">{{ f.kip(s.outstanding) }}</td>
                <td>
                  <span :class="bucketBadge[s.bucket]">
                    {{ s.maxDaysOverdue > 0 ? $t('report_debtors.days_overdue', { count: s.maxDaysOverdue }) : $t('report_debtors.bucket_not_due') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PaginationBar
          :current-page="page"
          :total-pages="totalPages"
          :total="filtered.length"
          :page-size="pageSize"
          @update:page="(p) => { page = p; }"
          @update:page-size="(size) => { pageSize = size; }"
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
import type { ApiResponse } from '../../../infrastructure/api/types';

type Bucket = 'not_due' | 'd1_30' | 'd31_60' | 'd60_plus';
interface ClassRef { classId: number; classNameEn: string; classNameLo: string }
interface Debtor {
  studentId: number; studentCode: string; fullNameEn: string; fullNameLo: string; photoUrl: string | null;
  class: ClassRef | null;
  parent: { fullNameEn: string; fullNameLo: string; phoneNumber: string | null } | null;
  invoices: { invoiceId: number; invoiceNo: string; dueDate: string; outstanding: number; daysOverdue: number; academicYear: string; feeType: { nameEn: string; nameLo: string } }[];
  outstanding: number; overdueAmount: number; maxDaysOverdue: number; bucket: Bucket;
}
interface DebtorsReport {
  academicYear: string | null;
  totals: { students: number; outstanding: number; overdue: number };
  buckets: Record<Bucket, { students: number; amount: number }>;
  students: Debtor[];
}

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
useHead({ title: () => t('report_debtors.title') });

const report = ref<DebtorsReport | null>(null);
const year = ref<string | null>(null);
const loading = ref(true);
const error = ref('');
const classFilter = ref<number | null>(null);
const search = ref('');
const page = ref(1);
const pageSize = ref(15);

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const bucketBadge: Record<Bucket, string> = { d60_plus: 'badge-danger', d31_60: 'badge-warning', d1_30: 'badge-info', not_due: 'badge-slate' };
const bucketOf = (days: number): Bucket => (days <= 0 ? 'not_due' : days <= 30 ? 'd1_30' : days <= 60 ? 'd31_60' : 'd60_plus');

// Academic years that have unpaid invoices, newest first.
const yearOptions = computed(() => {
  const set = new Set<string>();
  for (const s of report.value?.students ?? []) for (const inv of s.invoices) if (inv.academicYear) set.add(inv.academicYear);
  return [...set].sort().reverse();
});

// With a year chosen, each student keeps only that year's invoices and their totals are recounted.
const byYear = computed<Debtor[]>(() => {
  const rows = report.value?.students ?? [];
  if (!year.value) return rows;
  return rows.flatMap((s) => {
    const invoices = s.invoices.filter((inv) => inv.academicYear === year.value);
    if (!invoices.length) return [];
    const maxDaysOverdue = Math.max(0, ...invoices.map((inv) => inv.daysOverdue));
    return [{
      ...s,
      invoices,
      outstanding: invoices.reduce((sum, inv) => sum + inv.outstanding, 0),
      overdueAmount: invoices.filter((inv) => inv.daysOverdue > 0).reduce((sum, inv) => sum + inv.outstanding, 0),
      maxDaysOverdue,
      bucket: bucketOf(maxDaysOverdue),
    }];
  });
});

// Fee names, with the academic year added to debts from an older year.
const latestYear = computed(() => {
  const years = (report.value?.students ?? []).flatMap((s) => s.invoices.map((inv) => inv.academicYear));
  return years.sort().at(-1) ?? '';
});
const feeList = (s: Debtor) =>
  s.invoices.map((inv) => {
    const name = pick(inv.feeType.nameLo, inv.feeType.nameEn);
    return inv.academicYear && inv.academicYear !== latestYear.value ? `${name} (${inv.academicYear})` : name;
  }).join(', ');

const classOptions = computed(() => {
  const seen = new Map<number, ClassRef>();
  for (const s of byYear.value) if (s.class) seen.set(s.class.classId, s.class);
  return [...seen.values()].sort((a, b) => a.classNameEn.localeCompare(b.classNameEn));
});

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return byYear.value.filter((s) =>
    (!classFilter.value || s.class?.classId === classFilter.value)
    && (!q || [s.fullNameLo, s.fullNameEn, s.studentCode].some((v) => v?.toLowerCase().includes(q))));
});
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));
const pageRows = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await api<ApiResponse<DebtorsReport>>('/reports/fees/debtors');
    report.value = res.data;
    page.value = 1;
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

// Standard export: built by the server from the report's own filters, and audit-logged.
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'reports.export'));
const { exporting, download } = useServerExport();
const exportRows = () => download('/reports/fees/debtors/export', { academicYear: year.value, classId: classFilter.value, search: search.value }, `debtors-${year.value ?? 'all'}`);

onMounted(load);
</script>
