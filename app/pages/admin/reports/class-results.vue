<template>
  <div class="flex flex-col gap-6 print-document">
    <PageHeader
      :title="$t('report_results.title')"
      :subtitle="data ? `${pick(data.class.classNameLo, data.class.classNameEn)} · ${pick(data.term.termNameLo, data.term.termNameEn)} · ${data.term.academicYear}` : $t('report_results.subtitle')"
    >
      <select v-model="termId" class="input-field w-auto print:hidden" :aria-label="$t('report_results.term')" @change="onTermChange">
        <option v-for="term in terms" :key="term.termId" :value="term.termId">{{ pick(term.termNameLo, term.termNameEn) }} · {{ term.academicYear }}</option>
      </select>
      <select v-model="classId" class="input-field w-auto print:hidden" :aria-label="$t('fee_report.col_class')" @change="load">
        <option :value="null" disabled>{{ $t('assignments.select_class') }}</option>
        <option v-for="c in termClasses" :key="c.classId" :value="c.classId">{{ pick(c.classNameLo, c.classNameEn) }}</option>
      </select>
      <button v-if="canExport" type="button" class="btn-secondary print:hidden" :disabled="exporting || !data?.students.length"  @click="exportRows">{{ $t('common.export_excel') }}</button>
      <button type="button" class="btn-primary print:hidden" :disabled="!data" @click="print">{{ $t('report_cash.print') }}</button>
    </PageHeader>

    <p v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ error }}</p>
    <LoadingSpinner v-if="loading" />
    <p v-else-if="!classId" class="panel p-12 text-center text-sm text-ink-subtle">{{ $t('report_results.pick_class') }}</p>

    <template v-else-if="data">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('report_results.students') }}</p>
          <p class="text-xl font-bold tnum">{{ data.summary.graded }} / {{ data.summary.students }}</p>
          <p class="text-xs text-ink-subtle">{{ $t('report_results.graded_hint') }}</p>
        </div>
        <div class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('report_results.class_average') }}</p>
          <p class="text-xl font-bold tnum">{{ pct(data.summary.classAverage) }}</p>
        </div>
        <div class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('report_results.pass_rate') }}</p>
          <p class="text-xl font-bold tnum">{{ pct(data.summary.passRate) }}</p>
          <p class="text-xs text-ink-subtle">{{ $t('report_results.pass_hint') }}</p>
        </div>
        <div class="stat-card py-3 gap-1">
          <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ $t('report_results.top_student') }}</p>
          <p class="text-base font-bold truncate">{{ top ? pick(top.fullNameLo, top.fullNameEn) : '—' }}</p>
          <p class="text-xs text-ink-subtle tnum">{{ top ? pct(top.average) : '' }}</p>
        </div>
      </div>

      <section class="panel overflow-hidden">
        <p v-if="!data.students.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('report_results.empty') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <thead>
              <tr>
                <th class="w-14 text-center">{{ $t('report_results.rank') }}</th>
                <th>{{ $t('fee_report.col_student') }}</th>
                <th v-for="sub in data.subjects" :key="sub.subjectId" class="text-right">{{ pick(sub.subjectNameLo, sub.subjectNameEn) }}</th>
                <th class="text-right">{{ $t('report_results.average') }}</th>
                <th class="text-center">{{ $t('report_results.grade') }}</th>
                <th class="print:hidden" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in data.students" :key="s.studentId">
                <td class="text-center tnum font-bold" :class="s.rank && s.rank <= 3 ? 'text-primary-ink' : 'text-ink-muted'">{{ s.rank ?? '—' }}</td>
                <td>
                  <div class="flex items-center gap-3">
                    <PersonAvatar :name="pick(s.fullNameLo, s.fullNameEn)" :photo-url="s.photoUrl" size="md" class="print:hidden" />
                    <div>
                      <p class="font-semibold">{{ pick(s.fullNameLo, s.fullNameEn) }}</p>
                      <p class="text-xs text-ink-muted tnum">{{ s.studentCode }}</p>
                    </div>
                  </div>
                </td>
                <td v-for="sub in data.subjects" :key="sub.subjectId" class="text-right tnum" :class="scoreTone(s.scores[sub.subjectId])">
                  {{ s.scores[sub.subjectId] ?? '—' }}
                </td>
                <td class="text-right tnum font-bold">{{ pct(s.average) }}</td>
                <td class="text-center font-bold">{{ s.letter ?? '—' }}</td>
                <td class="text-right print:hidden">
                  <NuxtLink :to="`/admin/students/${s.studentId}/report-card`" class="text-xs text-primary-ink hover:underline whitespace-nowrap">{{ $t('report_results.report_card') }}</NuxtLink>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-line">
                <td />
                <td class="px-4 py-2.5 font-semibold">{{ $t('report_results.subject_average') }}</td>
                <td v-for="sub in data.subjects" :key="sub.subjectId" class="px-4 py-2.5 text-right tnum font-semibold">{{ data.subjectAverages[sub.subjectId] ?? '—' }}</td>
                <td class="px-4 py-2.5 text-right tnum font-bold">{{ pct(data.summary.classAverage) }}</td>
                <td colspan="2" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      <p class="text-xs text-ink-subtle">{{ $t('report_results.footnote') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { useServerExport } from '../../../composables/useServerExport';
import { ref, computed, onMounted } from 'vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { academicsRepository, type AcademicTerm } from '../../../infrastructure/api/AcademicsRepository';
import type { ApiResponse } from '../../../infrastructure/api/types';

interface ClassOption { classId: number; classNameEn: string; classNameLo: string; academicYear: string }
interface ResultRow {
  studentId: number; studentCode: string; fullNameEn: string; fullNameLo: string; photoUrl: string | null;
  scores: Record<number, number | null>; average: number | null; letter: string | null; rank: number | null;
}
interface ClassResults {
  class: ClassOption;
  term: { termId: number; termNameEn: string; termNameLo: string; academicYear: string };
  subjects: { subjectId: number; subjectNameEn: string; subjectNameLo: string }[];
  subjectAverages: Record<number, number | null>;
  summary: { students: number; graded: number; classAverage: number | null; passRate: number | null };
  students: ResultRow[];
}

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
useHead({ title: () => t('report_results.title') });

const terms = ref<AcademicTerm[]>([]);
const classes = ref<ClassOption[]>([]);
const termId = ref<number | null>(null);
const classId = ref<number | null>(null);
const data = ref<ClassResults | null>(null);
const loading = ref(true);
const error = ref('');

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const pct = (v: number | null) => (v === null ? '—' : f.percent(v));
const scoreTone = (v: number | null) => (v === null ? 'text-ink-subtle' : v < 50 ? 'text-danger font-semibold' : '');

const currentTerm = computed(() => terms.value.find((x) => x.termId === termId.value) ?? null);
const termClasses = computed(() => classes.value.filter((c) => !currentTerm.value || c.academicYear === currentTerm.value.academicYear));
const top = computed(() => data.value?.students.find((s) => s.rank === 1) ?? null);

const load = async () => {
  if (!classId.value || !termId.value) { data.value = null; return; }
  loading.value = true;
  error.value = '';
  try {
    const res = await api<ApiResponse<ClassResults>>(`/reports/class-results?classId=${classId.value}&termId=${termId.value}`);
    data.value = res.data;
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

const onTermChange = () => {
  if (!termClasses.value.some((c) => c.classId === classId.value)) classId.value = termClasses.value[0]?.classId ?? null;
  load();
};

const print = () => window.print();

// Standard export: built by the server from the report's own filters, and audit-logged.
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'reports.export'));
const { exporting, download } = useServerExport();
const exportRows = () => download('/reports/class-results/export', { classId: classId.value, termId: termId.value }, 'class-results');

onMounted(async () => {
  try {
    const [termList, classRes] = await Promise.all([
      academicsRepository.getTerms(),
      api<ApiResponse<ClassOption[]>>('/classes/all'),
    ]);
    terms.value = termList;
    classes.value = classRes.data;
    termId.value = termList.find((x) => x.status === 'active')?.termId ?? termList[0]?.termId ?? null;
    classId.value = termClasses.value[0]?.classId ?? null;
    await load();
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
});
</script>
