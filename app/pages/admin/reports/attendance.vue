<template>
  <div class="flex flex-col gap-6">
    <PageHeader
      :eyebrow="$t('nav.reports')"
      :title="$t('reports_detail.attendance_analytics')"
      :subtitle="report ? $t('attendance_report.period', { days: report.schoolDays, students: report.students }) : $t('reports_detail.attendance_subtitle')"
    >
      <div class="inline-flex h-9 p-0.5 rounded border border-line bg-surface-2" role="group">
        <button
          v-for="r in ranges"
          :key="r"
          type="button"
          :aria-pressed="range === r"
          :class="['px-3 rounded-sm text-sm font-semibold transition-colors', range === r ? 'bg-surface text-primary-ink shadow-float' : 'text-ink-muted hover:text-ink']"
          @click="range = r"
        >
          {{ $t(`attendance_report.range_${r}`) }}
        </button>
      </div>
      <button type="button" class="btn-secondary" :disabled="loading" @click="load">
        {{ $t('common.refresh') }}
      </button>
    </PageHeader>

    <div v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm flex items-center justify-between gap-4">
      <span>{{ $t('attendance_report.load_error') }}: {{ error }}</span>
      <button type="button" class="btn-secondary" @click="load">{{ $t('common.refresh') }}</button>
    </div>

    <LoadingSpinner v-if="loading && !report" />

    <template v-if="report">
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
          <h3 class="font-bold">{{ $t('reports_detail.rate_by_class') }}</h3>
          <p class="text-xs text-ink-subtle">{{ $t('attendance_report.by_class_sub') }}</p>
          <p v-if="!report.classes.length" class="py-8 text-center text-sm text-ink-subtle">{{ $t('attendance_report.no_classes') }}</p>
          <ul v-else class="mt-5 space-y-4">
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
        <section class="panel p-5">
          <h3 class="font-bold">{{ $t('attendance_report.breakdown') }}</h3>
          <p class="text-xs text-ink-subtle">{{ $t('attendance_report.breakdown_sub') }}</p>
          <div class="mt-5 flex h-3 rounded-full overflow-hidden bg-surface-2" role="img" :aria-label="breakdownLabel">
            <div
              v-for="b in breakdown"
              :key="b.key"
              :class="b.bar"
              :style="{ width: `${b.share}%` }"
            />
          </div>
          <ul class="mt-5 space-y-2.5">
            <li v-for="b in breakdown" :key="b.key" class="flex items-center justify-between text-sm">
              <span class="flex items-center gap-2">
                <span :class="['w-2.5 h-2.5 rounded-full', b.bar]" />
                {{ $t(`attendance_report.status.${b.key}`) }}
              </span>
              <span class="tnum">
                <span class="font-semibold">{{ f.number(b.count) }}</span>
                <span class="text-ink-subtle"> · {{ f.percent(b.share) }}</span>
              </span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Students who missed school -->
      <section class="panel overflow-hidden">
        <div class="p-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h3 class="font-bold">{{ $t('attendance_report.absentees') }}</h3>
            <p class="text-xs text-ink-subtle">{{ $t('attendance_report.absentees_sub') }}</p>
          </div>
          <input v-model="search" type="search" class="input-field sm:max-w-xs" :placeholder="$t('reports_detail.search_student')">
        </div>

        <div class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
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
              <tr v-for="a in visibleAbsentees" :key="`${a.studentId}:${a.date}`">
                <td>
                  <p class="font-semibold">{{ studentName(a) }}</p>
                  <p class="text-xs text-ink-subtle font-mono">{{ a.studentCode }}</p>
                </td>
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
              <tr v-if="!visibleAbsentees.length">
                <td colspan="7" class="py-10 text-center text-sm text-ink-subtle">
                  {{ search ? $t('attendance_report.no_match') : $t('attendance_report.no_absentees') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="filteredAbsentees.length > visibleAbsentees.length" class="px-5 py-3 text-xs text-ink-subtle border-t border-line">
          {{ $t('attendance_report.showing', { shown: visibleAbsentees.length, total: filteredAbsentees.length }) }}
        </p>
      </section>

      <p v-if="toast" role="status" class="fixed bottom-6 right-6 z-50 panel-float px-4 py-3 text-sm">{{ toast }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
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
watch(range, load);
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

const search = ref('');
const filteredAbsentees = computed(() => {
  const list = report.value?.absentees ?? [];
  const q = search.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter((a) =>
    [a.fullNameEn, a.fullNameLo, a.studentCode, a.classNameEn, a.classNameLo].some((v) => v?.toLowerCase().includes(q)));
});
const visibleAbsentees = computed(() => filteredAbsentees.value.slice(0, 100));

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
