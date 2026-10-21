<template>
  <div class="flex flex-col gap-6">
    <PageHeader
      :title="$t('reports_detail.attendance_analytics')"
      :subtitle="report ? $t('attendance_report.period', { days: report.schoolDays, students: report.students }) : $t('reports_detail.attendance_subtitle')"
    >
      <div class="flex gap-6 mr-4" role="group">
        <button
          v-for="r in ranges"
          :key="r"
          type="button"
          :aria-pressed="range === r"
          class="pb-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2"
          :class="range === r ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          @click="range = r"
        >
          {{ $t(`attendance_report.range_${r}`) }}
        </button>
      </div>
      <button type="button" class="btn-secondary" :disabled="loading" @click="load">
        {{ $t('common.refresh') }}
      </button>
      <button v-if="canExport" type="button" class="btn-secondary" :disabled="exporting || !report"  @click="exportAttendance">
        {{ $t('common.export_excel') }}
      </button>
    </PageHeader>

    <div v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm flex items-center justify-between gap-4">
      <span>{{ $t('attendance_report.load_error') }}: {{ error }}</span>
      <button type="button" class="btn-secondary" @click="load">{{ $t('common.refresh') }}</button>
    </div>

    <!-- ══ TABS NAVIGATION ══ -->
    <div class="flex gap-6">
      <button
        type="button"
        class="pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2"
        :class="activeTab === 'overview' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
        @click="activeTab = 'overview'"
      >
        {{ $t('attendance_report.tab_overview') }}
      </button>
      <button
        type="button"
        class="pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2"
        :class="activeTab === 'absentees' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
        @click="activeTab = 'absentees'"
      >
        {{ $t('attendance_report.tab_absentees') }}
      </button>
    </div>

    <LoadingSpinner v-if="loading && !report" />

    <template v-if="report">
      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- TAB 1: OVERVIEW & ANALYTICS                             -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'overview'" class="flex flex-col gap-6">
        <!-- KPI tiles -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div class="stat-card">
            <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('attendance_report.attendance_rate') }}</p>
            <p class="text-3xl font-bold tnum">{{ f.percent(report.attendanceRate) }}</p>
            <p v-if="rateDelta !== null" :class="['text-xs font-semibold', rateDelta >= 0 ? 'text-success' : 'text-danger']">
              {{ $t('attendance_report.vs_previous', { delta: $t('attendance_report.points', { n: `${rateDelta >= 0 ? '+' : ''}${f.number(rateDelta, 1)}` }) }) }}
            </p>
            <p v-else class="text-xs text-ink-subtle">{{ $t('attendance_report.no_previous') }}</p>
          </div>

          <div class="stat-card">
            <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('attendance_report.best_class') }}</p>
            <p class="text-3xl font-bold">{{ bestClass ? className(bestClass) : '—' }}</p>
            <p class="text-xs text-ink-subtle tnum">{{ bestClass ? f.percent(bestClass.rate) : $t('attendance_report.no_classes') }}</p>
          </div>

          <div class="stat-card">
            <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('attendance_report.missed') }}</p>
            <p class="text-3xl font-bold tnum">{{ f.number(report.notInClass) }}</p>
            <p class="text-xs text-ink-subtle">
              {{ report.notArrivedToday ? $t('attendance_report.not_arrived', { count: report.notArrivedToday }) : $t('attendance_report.missed_sub') }}
            </p>
          </div>

          <div class="stat-card">
            <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('attendance_report.excused_share') }}</p>
            <p class="text-3xl font-bold tnum">{{ f.percent(report.excusedShare) }}</p>
            <p class="text-xs text-ink-subtle">{{ $t('attendance_report.excused_share_sub') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Rate by class -->
          <section class="panel p-5 lg:col-span-2">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-base">{{ $t('reports_detail.rate_by_class') }}</h3>
                <p class="text-xs text-ink-subtle">{{ $t('attendance_report.by_class_sub') }}</p>
              </div>
            </div>
            <p v-if="!report.classes.length" class="py-8 text-center text-sm text-ink-subtle">{{ $t('attendance_report.no_classes') }}</p>
            <ul v-else class="space-y-4">
              <li v-for="c in report.classes" :key="c.classId">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-semibold">{{ className(c) }}</span>
                  <span class="tnum text-ink-muted">
                    <span class="font-bold text-ink">{{ f.percent(c.rate) }}</span>
                    · {{ f.number(c.attended) }}/{{ f.number(c.expected) }}
                  </span>
                </div>
                <div class="mt-1.5 h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div class="h-full rounded-full bg-primary" :style="{ width: `${c.rate ?? 0}%` }" />
                </div>
              </li>
            </ul>
          </section>

          <!-- Breakdown -->
          <section class="panel p-5 flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-base">{{ $t('attendance_report.breakdown') }}</h3>
              <p class="text-xs text-ink-subtle">{{ $t('attendance_report.breakdown_sub') }}</p>
              <div class="mt-5 flex h-3.5 rounded-full overflow-hidden bg-surface-2" role="img" :aria-label="breakdownLabel">
                <div
                  v-for="b in breakdown"
                  :key="b.key"
                  :class="b.bar"
                  :style="{ width: `${b.share}%` }"
                />
              </div>
              <ul class="mt-6 space-y-3">
                <li v-for="b in breakdown" :key="b.key" class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2">
                    <span :class="['w-2.5 h-2.5 rounded-full', b.bar]" />
                    <span>{{ $t(`attendance_report.status.${b.key}`) }}</span>
                  </span>
                  <span class="tnum">
                    <span class="font-semibold">{{ f.number(b.count) }}</span>
                    <span class="text-ink-subtle"> · {{ f.percent(b.share) }}</span>
                  </span>
                </li>
              </ul>
            </div>
            <div class="pt-6 mt-6 border-t border-line">
              <button
                type="button"
                class="w-full btn-secondary text-xs flex items-center justify-center gap-1.5"
                @click="activeTab = 'absentees'"
              >
                <span>{{ $t('attendance_report.tab_absentees') }}</span>
                <span class="font-bold">({{ report.absentees.length }})</span>
                <span>&rarr;</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════ -->
      <!-- TAB 2: ABSENTEES & FOLLOW-UP (WITH PAGINATION)           -->
      <!-- ═════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'absentees'" class="flex flex-col gap-5">
        <!-- Quick Stats Mini Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="panel p-3.5 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-ink-muted shrink-0">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p class="text-xs text-ink-muted">{{ $t('attendance_report.missed') }}</p>
              <p class="text-xl font-bold">{{ absenteeStats.total }}</p>
            </div>
          </div>

          <div class="panel p-3.5 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-danger-soft text-danger flex items-center justify-center shrink-0">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <p class="text-xs text-ink-muted">{{ $t('attendance_report.status.absent') }}</p>
              <p class="text-xl font-bold text-danger">{{ absenteeStats.absentCount }}</p>
            </div>
          </div>

          <div class="panel p-3.5 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-primary-soft text-primary-ink flex items-center justify-center shrink-0">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <p class="text-xs text-ink-muted">{{ $t('attendance_report.status.excused') }}</p>
              <p class="text-xl font-bold text-primary-ink">{{ absenteeStats.excusedCount }}</p>
            </div>
          </div>

          <div class="panel p-3.5 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-success-soft text-success flex items-center justify-center shrink-0">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p class="text-xs text-ink-muted">{{ $t('attendance_report.notice_sent') }}</p>
              <p class="text-xl font-bold text-success">{{ absenteeStats.notifiedCount }}</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative w-full sm:w-80">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="search"
              type="text"
              class="search-bar"
              :placeholder="$t('reports_detail.search_student')"
            >
            <button
              v-if="search"
              type="button"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
              :aria-label="$t('common.clear_search')"
              @click="search = ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <select v-model="statusFilter" class="input-field w-full sm:w-48" :aria-label="$t('common.status')">
            <option value="all">{{ $t('attendance_report.filter_all') }}</option>
            <option value="absent">{{ $t('attendance_report.status.absent') }}</option>
            <option value="excused">{{ $t('attendance_report.status.excused') }}</option>
          </select>
        </div>

        <section class="panel overflow-hidden">
          <!-- Absentees Table -->
          <div class="overflow-x-auto">
            <table class="data-table w-full min-w-max">
              <thead>
                <tr>
                  <th class="w-12 text-center">#</th>
                  <th>{{ $t('attendance_report.col_code') }}</th>
                  <th>{{ $t('attendance_report.col_student') }}</th>
                  <th>{{ $t('attendance_report.col_class') }}</th>
                  <th>{{ $t('attendance_report.col_date') }}</th>
                  <th>{{ $t('attendance_report.col_status') }}</th>
                  <th>{{ $t('attendance_report.col_reason') }}</th>
                  <th>{{ $t('attendance_report.col_notice') }}</th>
                  <th class="text-right">{{ $t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in paginatedAbsentees" :key="`${a.studentId}:${a.date}`">
                  <td class="text-center tnum text-ink-subtle">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                  <td class="tnum whitespace-nowrap text-ink-muted">{{ a.studentCode || '—' }}</td>
                  <td class="font-semibold">{{ studentName(a) }}</td>
                  <td>{{ className(a) ?? $t('attendance_report.no_class') }}</td>
                  <td class="tnum">{{ f.date(a.date) }}</td>
                  <td><span :class="statusBadge[a.status]">{{ $t(`attendance_report.status.${a.status}`) }}</span></td>
                  <td class="max-w-xs truncate text-ink-muted" :title="a.leaveReason ?? undefined">{{ a.leaveReason ?? '—' }}</td>
                  <td>
                    <span :class="noticeBadge(a.notification)">{{ $t(`attendance_report.notice_${a.notification ?? 'none'}`) }}</span>
                  </td>
                  <td class="text-right">
                    <button
                      type="button"
                      class="btn-secondary min-h-8 px-3 text-xs"
                      :disabled="!!a.notification || notifying.has(key(a))"
                      @click="notify(a)"
                    >
                      {{ $t('attendance_report.notify') }}
                    </button>
                  </td>
                </tr>
                <tr v-if="!filteredAbsentees.length">
                  <td colspan="9" class="py-12 text-center text-sm text-ink-subtle">
                    {{ search || statusFilter !== 'all' ? $t('attendance_report.no_match') : $t('attendance_report.no_absentees') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <PaginationBar
            :current-page="currentPage"
            :total-pages="totalPages"
            :total="filteredAbsentees.length"
            :page-size="pageSize"
            @update:page="(p) => currentPage = p"
            @update:page-size="(s) => { pageSize = s; currentPage = 1; }"
          />
        </section>
      </div>

      <p v-if="toast" role="status" class="fixed bottom-6 right-6 z-50 panel-float px-4 py-3 text-sm">{{ toast }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { useServerExport } from '../../../composables/useServerExport';
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '../../../components/PageHeader.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';
import { getErrorMessage } from '../../../utils/errors';
import {
  reportRepository,
  type AttendanceReport, type AbsenceEntry, type ReportRange, type AttendanceBucket,
} from '../../../infrastructure/api/ReportRepository';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('reports_detail.attendance_analytics') });

const activeTab = ref<'overview' | 'absentees'>('overview');
const statusFilter = ref<'all' | 'absent' | 'excused' | 'unrecorded'>('all');

// Pagination
const currentPage = ref(1);
const pageSize = ref(15);

const ranges: ReportRange[] = ['today', '7d', '30d'];
const range = ref<ReportRange>('today');
const report = ref<AttendanceReport | null>(null);
const loading = ref(false);
const error = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    report.value = await reportRepository.getAttendance(range.value);
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}
watch(range, () => {
  currentPage.value = 1;
  load();
});
onMounted(load);

const className = (c: { classNameEn: string | null; classNameLo: string | null }) =>
  (locale.value === 'lo' ? c.classNameLo : c.classNameEn) ?? c.classNameEn;
const studentName = (a: AbsenceEntry) => (locale.value === 'lo' ? a.fullNameLo : a.fullNameEn) || a.fullNameEn;

const rateDelta = computed(() => {
  const r = report.value;
  if (!r || r.attendanceRate === null || r.previousRate === null) return null;
  return Math.round((r.attendanceRate - r.previousRate) * 10) / 10;
});
const bestClass = computed(() => report.value?.classes.find((c) => c.rate !== null) ?? null);

// Status colours follow DESIGN.md: emerald present, amber late, sapphire excused,
// crimson absent, slate for missing records.
const BAR: Record<AttendanceBucket, string> = {
  present: 'bg-emerald-500', late: 'bg-amber-500', excused: 'bg-primary', absent: 'bg-red-500', unrecorded: 'bg-slate-400', notArrived: 'bg-slate-300',
};
const breakdown = computed(() => {
  const b = report.value?.breakdown;
  if (!b) return [];
  const total = Object.values(b).reduce((s, n) => s + n, 0) || 1;
  return (Object.keys(BAR) as AttendanceBucket[])
    .filter((key) => b[key] > 0)
    .map((key) => ({ key, count: b[key], share: Math.round((b[key] / total) * 1000) / 10, bar: BAR[key] }));
});
const breakdownLabel = computed(() =>
  breakdown.value.map((b) => `${t(`attendance_report.status.${b.key}`)} ${b.share}%`).join(', '));

const statusBadge: Record<AbsenceEntry['status'], string> = {
  excused: 'badge-info', absent: 'badge-danger', unrecorded: 'badge-neutral',
};
const noticeBadge = (n: AbsenceEntry['notification']) =>
  n === 'sent' ? 'badge-success' : n === 'failed' ? 'badge-danger' : n === 'pending' ? 'badge-warning' : 'badge-neutral';

const absenteeStats = computed(() => {
  const list = report.value?.absentees ?? [];
  const absentCount = list.filter((a) => a.status === 'absent').length;
  const excusedCount = list.filter((a) => a.status === 'excused').length;
  const unrecordedCount = list.filter((a) => a.status === 'unrecorded').length;
  const notifiedCount = list.filter((a) => a.notification === 'sent').length;
  return { total: list.length, absentCount, excusedCount, unrecordedCount, notifiedCount };
});

const search = ref('');
const filteredAbsentees = computed(() => {
  let list = report.value?.absentees ?? [];
  if (statusFilter.value !== 'all') {
    list = list.filter((a) => a.status === statusFilter.value);
  }
  const q = search.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((a) =>
    [a.fullNameEn, a.fullNameLo, a.studentCode, a.classNameEn, a.classNameLo, a.leaveReason].some((v) => v?.toLowerCase().includes(q)));
});

// Pagination computed
const totalPages = computed(() => Math.max(1, Math.ceil(filteredAbsentees.value.length / pageSize.value)));
const paginatedAbsentees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredAbsentees.value.slice(start, start + pageSize.value);
});

// Reset page when search or filter changes
watch([search, statusFilter, pageSize], () => {
  currentPage.value = 1;
});

// Standard export: built by the server from the report's own filters, and audit-logged.
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'reports.export'));
const { exporting, download } = useServerExport();
const exportAttendance = () => download('/reports/attendance/export', { range: range.value }, `attendance-${range.value}`);

const key = (a: AbsenceEntry) => `${a.studentId}:${a.date}`;
const notifying = reactive(new Set<string>());
const toast = ref('');
async function notify(a: AbsenceEntry) {
  notifying.add(key(a));
  try {
    const res = await reportRepository.notifyAbsence(a.studentId, a.date);
    a.notification = res.notification;
    toast.value = t('attendance_report.notify_done', { count: res.recipients });
  } catch (err) {
    toast.value = getErrorMessage(err);
  } finally {
    notifying.delete(key(a));
    setTimeout(() => { toast.value = ''; }, 4000);
  }
}
</script>
