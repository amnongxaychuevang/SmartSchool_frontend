<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('students_report.title')" :subtitle="$t('students_report.subtitle')">
      <button type="button" class="btn-secondary" :disabled="loading" @click="load">{{ $t('common.refresh') }}</button>
      <button v-if="canExport" type="button" class="btn-secondary" :disabled="exporting || !stats?.total" @click="exportStudents">
        {{ exporting ? $t('common.loading') : $t('common.export_excel') }}
      </button>
    </PageHeader>

    <p v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ error }}</p>
    <LoadingSpinner v-if="loading && !stats" />

    <template v-else-if="stats">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="c in cards" :key="c.key" class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ c.label }}</p>
          <p class="text-xl font-bold tnum">
            {{ f.number(c.value) }}
            <span v-if="c.share !== undefined" class="text-sm font-normal text-ink-muted">({{ c.share }}%)</span>
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section v-for="group in distributions" :key="group.key" class="panel p-5 flex flex-col gap-4">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider">{{ group.title }}</h3>
            <p v-if="group.hint" class="text-xs text-ink-muted mt-0.5">{{ group.hint }}</p>
          </div>
          <div v-for="row in group.rows" :key="row.key" class="flex flex-col gap-1.5">
            <div class="flex justify-between gap-3 text-sm">
              <span class="font-semibold">{{ row.label }}</span>
              <span class="tnum text-ink-muted">{{ f.number(row.value) }} · {{ pct(row.value, group.total) }}%</span>
            </div>
            <div class="h-2 rounded-full bg-surface-2 overflow-hidden">
              <div class="h-full rounded-full" :class="row.bar" :style="{ width: `${pct(row.value, group.total)}%` }" />
            </div>
          </div>
        </section>
      </div>

      <section class="panel overflow-hidden">
        <h3 class="px-5 py-4 text-sm font-bold uppercase tracking-wider border-b border-line">{{ $t('students_report.by_class') }}</h3>
        <p v-if="!stats.classes.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('students_report.no_classes') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th class="w-12 text-center">#</th>
                <th>{{ $t('common.class') }}</th>
                <th>{{ $t('students_report.grade_level') }}</th>
                <th>{{ $t('students_report.academic_year') }}</th>
                <th class="text-right">{{ $t('students_report.students') }}</th>
                <th class="text-right">{{ $t('gender.male') }}</th>
                <th class="text-right">{{ $t('gender.female') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in stats.classes" :key="c.classId">
                <td class="text-center tnum text-ink-subtle">{{ i + 1 }}</td>
                <td class="font-semibold">{{ pick(c.classNameLo, c.classNameEn) }}</td>
                <td class="text-ink-muted">{{ pick(c.gradeLevelLo, c.gradeLevelEn) || '—' }}</td>
                <td class="tnum text-ink-muted">{{ c.academicYear }}</td>
                <td class="text-right tnum font-semibold">{{ c.students }}</td>
                <td class="text-right tnum">{{ c.male }}</td>
                <td class="text-right tnum">{{ c.female }}</td>
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
import type { ApiResponse } from '../../../infrastructure/api/types';
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { useServerExport } from '../../../composables/useServerExport';

interface StudentStats {
  total: number;
  status: { active: number; inactive: number; graduated: number; transferred: number };
  gender: { male: number; female: number; other: number; unknown: number };
  classes: {
    classId: number; classNameEn: string; classNameLo: string; gradeLevelEn: string | null; gradeLevelLo: string | null;
    academicYear: string; students: number; male: number; female: number;
  }[];
}

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
useHead({ title: () => t('page_titles.students_report') });

const stats = ref<StudentStats | null>(null);
const loading = ref(true);
const error = ref('');

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 1000) / 10 : 0);

// Gender counts cover active students; the status counts cover everyone on record.
const activeTotal = computed(() => {
  const g = stats.value?.gender;
  return g ? g.male + g.female + g.other + g.unknown : 0;
});

const cards = computed(() => {
  const s = stats.value!;
  return [
    { key: 'total', label: t('students_report.total'), value: s.total },
    { key: 'active', label: t('students_report.active'), value: s.status.active, share: pct(s.status.active, s.total) },
    { key: 'male', label: t('students_report.male'), value: s.gender.male, share: pct(s.gender.male, activeTotal.value) },
    { key: 'female', label: t('students_report.female'), value: s.gender.female, share: pct(s.gender.female, activeTotal.value) },
  ];
});

const distributions = computed(() => {
  const s = stats.value!;
  const gender = [
    { key: 'male', label: t('gender.male'), value: s.gender.male, bar: 'bg-primary' },
    { key: 'female', label: t('gender.female'), value: s.gender.female, bar: 'bg-primary/60' },
  ];
  if (s.gender.other) gender.push({ key: 'other', label: t('gender.other'), value: s.gender.other, bar: 'bg-primary/35' });
  if (s.gender.unknown) gender.push({ key: 'unknown', label: t('students_report.gender_unknown'), value: s.gender.unknown, bar: 'bg-line-strong' });
  return [
    {
      key: 'status', title: t('students_report.status_distribution'), hint: '', total: s.total,
      rows: [
        { key: 'active', label: t('students_report.status_active'), value: s.status.active, bar: 'bg-success' },
        { key: 'graduated', label: t('students_report.status_graduated'), value: s.status.graduated, bar: 'bg-primary' },
        { key: 'transferred', label: t('students_report.status_transferred'), value: s.status.transferred, bar: 'bg-warning' },
        { key: 'inactive', label: t('students_report.status_inactive'), value: s.status.inactive, bar: 'bg-line-strong' },
      ],
    },
    { key: 'gender', title: t('students_report.gender_distribution'), hint: t('students_report.gender_hint'), total: activeTotal.value, rows: gender },
  ];
});

const load = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await api<ApiResponse<StudentStats>>('/reports/students');
    stats.value = res.data;
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

// Standard export: the full student list, built and audit-logged by the server.
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'students.export'));
const { exporting, download } = useServerExport();
const exportStudents = () => download('/students/export', {}, 'students');

onMounted(load);
</script>
