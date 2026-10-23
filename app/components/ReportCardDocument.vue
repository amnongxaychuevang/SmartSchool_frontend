<template>
  <div class="flex flex-col gap-6">
    <!-- Screen-only toolbar -->
    <div class="print:hidden flex items-center gap-3 flex-wrap">
      <button
        type="button"
        class="btn-secondary !px-0 w-9 h-9 flex items-center justify-center rounded-lg"
        :aria-label="$t('common.back')"
        @click="goBack"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-xl font-bold text-ink leading-tight">{{ $t('report_card.title') }}</h1>
      <div class="ml-auto flex items-center gap-3">
        <!-- Term selector -->
        <select
          v-model.number="selectedTermId"
          class="h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
          @change="loadGrades"
        >
          <option v-for="term in terms" :key="term.termId" :value="term.termId">
            {{ termLabel(term) }}
          </option>
        </select>
        <!-- Print button -->
        <button
          type="button"
          class="h-9 px-4 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
          @click="handlePrint"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          {{ $t('report_card.print') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="glass-panel p-12 flex justify-center print:hidden">
      <LoadingSpinner />
    </div>

    <!-- Error message if not found -->
    <div v-else-if="!student" class="glass-panel p-8 text-center text-ink-muted print:hidden">
      {{ $t('students.no_students') }}
    </div>

    <!-- Report card document -->
    <div v-else id="report-card" class="report-card-page bg-white text-slate-900 mx-auto print:mx-0 print:shadow-none shadow-lg">
      <!-- Decorative top border -->
      <div class="h-2 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 print:from-slate-700 print:via-slate-600 print:to-slate-500"></div>

      <div class="px-10 py-8 print:px-8 print:py-6">
        <!-- School Header -->
        <header class="text-center mb-8 border-b-2 border-slate-200 pb-6">
          <div class="flex items-center justify-center gap-4 mb-3">
            <img src="/logo.png" alt="School Logo" class="w-16 h-16 object-contain" />
          </div>
          <h1 class="text-2xl font-bold text-slate-800 tracking-wide">
            {{ schoolName }}
          </h1>
          <p v-if="settingsStore.schoolInfo.contactPhone || settingsStore.schoolInfo.contactEmail" class="text-sm text-slate-500 mt-1">
            {{ settingsStore.schoolInfo.contactPhone }} &middot; {{ settingsStore.schoolInfo.contactEmail }}
          </p>
          <h2 class="text-lg font-semibold text-teal-700 print:text-slate-700 mt-4 uppercase tracking-widest">
            {{ $t('report_card.document_title') }}
          </h2>
        </header>

        <!-- Student Info -->
        <section class="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 text-sm">
          <div class="flex">
            <span class="font-semibold text-slate-600 w-36 shrink-0">{{ $t('report_card.student_name') }}:</span>
            <span class="text-slate-900 font-medium">{{ personName(student) }}</span>
          </div>
          <div class="flex">
            <span class="font-semibold text-slate-600 w-36 shrink-0">{{ $t('report_card.student_code') }}:</span>
            <span class="text-slate-900 font-mono">{{ student.studentCode }}</span>
          </div>
          <div class="flex">
            <span class="font-semibold text-slate-600 w-36 shrink-0">{{ $t('report_card.class') }}:</span>
            <span class="text-slate-900">{{ studentClassName }}</span>
          </div>
          <div class="flex">
            <span class="font-semibold text-slate-600 w-36 shrink-0">{{ $t('report_card.academic_year') }}:</span>
            <span class="text-slate-900">{{ currentTerm?.academicYear ?? '—' }}</span>
          </div>
          <div class="flex">
            <span class="font-semibold text-slate-600 w-36 shrink-0">{{ $t('report_card.term') }}:</span>
            <span class="text-slate-900">{{ currentTerm ? termLabel(currentTerm) : '—' }}</span>
          </div>
          <div class="flex">
            <span class="font-semibold text-slate-600 w-36 shrink-0">{{ $t('report_card.date_of_birth') }}:</span>
            <span class="text-slate-900">{{ student.dateOfBirth ? f.date(student.dateOfBirth) : '—' }}</span>
          </div>
        </section>

        <!-- Grades Table -->
        <section class="mb-8">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr class="bg-teal-50 print:bg-slate-100">
                <th class="border border-slate-300 px-3 py-2.5 text-left font-semibold text-slate-700 w-10 text-center">#</th>
                <th class="border border-slate-300 px-3 py-2.5 text-left font-semibold text-slate-700">{{ $t('report_card.col_subject') }}</th>
                <th class="border border-slate-300 px-3 py-2.5 text-center font-semibold text-slate-700 w-20">{{ $t('report_card.col_score') }}</th>
                <th class="border border-slate-300 px-3 py-2.5 text-center font-semibold text-slate-700 w-20">{{ $t('report_card.col_max_score') }}</th>
                <th class="border border-slate-300 px-3 py-2.5 text-center font-semibold text-slate-700 w-24">{{ $t('report_card.col_percentage') }}</th>
                <th class="border border-slate-300 px-3 py-2.5 text-center font-semibold text-slate-700 w-20">{{ $t('report_card.col_grade') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in subjectRows" :key="row.subjectId" class="even:bg-slate-50 print:even:bg-slate-50">
                <td class="border border-slate-300 px-3 py-2 text-center text-slate-500">{{ idx + 1 }}</td>
                <td class="border border-slate-300 px-3 py-2 font-medium text-slate-800">{{ row.subjectName }}</td>
                <td class="border border-slate-300 px-3 py-2 text-center tabular-nums">{{ f.number(row.totalScore, 2) }}</td>
                <td class="border border-slate-300 px-3 py-2 text-center tabular-nums">{{ f.number(row.totalMaxScore, 2) }}</td>
                <td class="border border-slate-300 px-3 py-2 text-center tabular-nums font-semibold" :class="percentColor(row.percentage)">
                  {{ f.percent(row.percentage, 1) }}
                </td>
                <td class="border border-slate-300 px-3 py-2 text-center font-bold" :class="letterGradeColor(row.letterGrade)">
                  {{ row.letterGrade }}
                </td>
              </tr>
              <tr v-if="!subjectRows.length">
                <td colspan="6" class="border border-slate-300 px-3 py-6 text-center text-slate-400">
                  {{ $t('report_card.no_grades') }}
                </td>
              </tr>
            </tbody>
            <!-- Summary footer -->
            <tfoot v-if="subjectRows.length">
              <tr class="bg-teal-50 print:bg-slate-100 font-semibold">
                <td colspan="2" class="border border-slate-300 px-3 py-2.5 text-right text-slate-700 uppercase tracking-wide text-xs">
                  {{ $t('report_card.overall_average') }}
                </td>
                <td class="border border-slate-300 px-3 py-2.5 text-center tabular-nums text-slate-800">
                  {{ f.number(overallTotalScore, 2) }}
                </td>
                <td class="border border-slate-300 px-3 py-2.5 text-center tabular-nums text-slate-800">
                  {{ f.number(overallTotalMaxScore, 2) }}
                </td>
                <td class="border border-slate-300 px-3 py-2.5 text-center tabular-nums font-bold text-lg" :class="percentColor(overallPercentage)">
                  {{ f.percent(overallPercentage, 1) }}
                </td>
                <td class="border border-slate-300 px-3 py-2.5 text-center font-bold text-lg" :class="letterGradeColor(overallLetterGrade)">
                  {{ overallLetterGrade }}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <!-- Grading Scale -->
        <section class="mb-10 text-xs text-slate-500">
          <p class="font-semibold text-slate-600 mb-1">{{ $t('report_card.grading_scale') }}:</p>
          <p>A = 90-100% &nbsp;&middot;&nbsp; B = 80-89% &nbsp;&middot;&nbsp; C = 70-79% &nbsp;&middot;&nbsp; D = 60-69% &nbsp;&middot;&nbsp; F = &lt;60%</p>
        </section>

        <!-- Signatures -->
        <section class="grid grid-cols-3 gap-8 mt-12 pt-2">
          <div class="text-center">
            <div class="border-b border-slate-400 mb-2 h-16"></div>
            <p class="text-sm font-semibold text-slate-700">{{ $t('report_card.class_teacher') }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ $t('report_card.signature_date') }}</p>
          </div>
          <div class="text-center">
            <div class="border-b border-slate-400 mb-2 h-16"></div>
            <p class="text-sm font-semibold text-slate-700">{{ $t('report_card.parent_guardian') }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ $t('report_card.signature_date') }}</p>
          </div>
          <div class="text-center">
            <div class="border-b border-slate-400 mb-2 h-16"></div>
            <p class="text-sm font-semibold text-slate-700">{{ $t('report_card.school_director') }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ $t('report_card.signature_date') }}</p>
          </div>
        </section>

        <!-- Footer -->
        <footer class="mt-10 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>{{ $t('report_card.footer_note') }}</p>
          <p class="mt-1">{{ $t('report_card.printed_on') }}: {{ f.dateTime(new Date()) }}</p>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { adminRepository } from '../infrastructure/api/AdminRepository';
import { academicsRepository, type AcademicTerm } from '../infrastructure/api/AcademicsRepository';
import { parentRepository } from '../infrastructure/api/ParentRepository';
import { useSettingsStore } from '../application/stores/settings';
import { useFormat } from '../composables/useFormat';
import type { Student } from '../domain/models/Student';
import type { Grade } from '../domain/models/Academics';
import LoadingSpinner from './LoadingSpinner.vue';

const props = withDefaults(
  defineProps<{
    studentId: number;
    backRoute?: string;
    portal?: 'admin' | 'teacher' | 'parent';
  }>(),
  {
    backRoute: undefined,
    portal: 'admin',
  }
);

const { t, locale } = useI18n();
const router = useRouter();
const f = useFormat();
const settingsStore = useSettingsStore();

const loading = ref(true);
const student = ref<Student | null>(null);
const terms = ref<AcademicTerm[]>([]);
const selectedTermId = ref<number | null>(null);
const grades = ref<Grade[]>([]);

const goBack = () => {
  if (props.backRoute) {
    router.push(props.backRoute);
  } else {
    router.back();
  }
};

const handlePrint = () => window.print();

const schoolName = computed(() => {
  const info = settingsStore.schoolInfo;
  return (locale.value === 'lo' ? info.schoolNameLo : info.schoolNameEn) || info.schoolNameEn || t('auth.title');
});

const termLabel = (term: AcademicTerm) => {
  const name = locale.value === 'lo' ? term.termNameLo : term.termNameEn;
  return `${name} (${term.academicYear})`;
};

const currentTerm = computed(() => terms.value.find((t) => t.termId === selectedTermId.value));

const personName = (p?: { fullNameLo?: string; fullNameEn?: string } | null) => {
  if (!p) return '—';
  return (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn || '—';
};

const studentClassName = computed(() => {
  if (!student.value?.classStudents?.[0]?.class) return '—';
  const cls = student.value.classStudents[0].class;
  return (locale.value === 'lo' ? cls.classNameLo : cls.classNameEn) || cls.classNameEn;
});

function getLetterGrade(pct: number): string {
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

interface SubjectSummary {
  subjectId: number;
  subjectName: string;
  totalScore: number;
  totalMaxScore: number;
  percentage: number;
  letterGrade: string;
}

const subjectRows = computed<SubjectSummary[]>(() => {
  const map = new Map<number, { name: string; score: number; maxScore: number }>();

  for (const g of grades.value) {
    const sId = g.subjectId || (g as any).classSubject?.subjectId;
    if (!sId) continue;
    const sName = (locale.value === 'lo' ? g.subject?.subjectNameLo : g.subject?.subjectNameEn) || g.subject?.subjectNameEn || `Subject #${sId}`;

    const scoreNum = Number(g.score) || 0;
    const maxScoreNum = Number(g.maxScore) || 100;

    const existing = map.get(sId);
    if (existing) {
      existing.score += scoreNum;
      existing.maxScore += maxScoreNum;
    } else {
      map.set(sId, {
        name: sName,
        score: scoreNum,
        maxScore: maxScoreNum,
      });
    }
  }

  return Array.from(map.entries()).map(([subjectId, data]) => {
    const pct = data.maxScore > 0 ? (data.score / data.maxScore) * 100 : 0;
    return {
      subjectId,
      subjectName: data.name,
      totalScore: data.score,
      totalMaxScore: data.maxScore,
      percentage: pct,
      letterGrade: getLetterGrade(pct),
    };
  });
});

const overallTotalScore = computed(() => subjectRows.value.reduce((sum, r) => sum + r.totalScore, 0));
const overallTotalMaxScore = computed(() => subjectRows.value.reduce((sum, r) => sum + r.totalMaxScore, 0));
const overallPercentage = computed(() =>
  overallTotalMaxScore.value > 0 ? (overallTotalScore.value / overallTotalMaxScore.value) * 100 : 0
);
const overallLetterGrade = computed(() => getLetterGrade(overallPercentage.value));

const percentColor = (pct: number) => {
  if (pct >= 80) return 'text-emerald-700 print:text-slate-800';
  if (pct >= 60) return 'text-amber-700 print:text-slate-700';
  return 'text-red-600 print:text-slate-900';
};

const letterGradeColor = (grade: string) => {
  if (grade === 'A') return 'text-emerald-700 print:text-slate-800';
  if (grade === 'B') return 'text-teal-700 print:text-slate-700';
  if (grade === 'C') return 'text-amber-700 print:text-slate-700';
  if (grade === 'D') return 'text-orange-600 print:text-slate-700';
  return 'text-red-600 print:text-slate-900';
};

async function loadGrades() {
  if (!selectedTermId.value || !props.studentId) return;

  if (props.portal === 'parent') {
    // Parent fetching child grades
    const res = await parentRepository.getChildGrades(props.studentId);
    const allChildGrades = res.data ?? [];
    grades.value = allChildGrades.filter(
      (g: any) => g.termId === selectedTermId.value || g.classSubject?.termId === selectedTermId.value
    );
  } else {
    // Admin or Teacher
    const res = await academicsRepository.getGrades({
      studentId: props.studentId,
      termId: selectedTermId.value,
      limit: 500,
    });
    grades.value = res.grades;
  }
}

onMounted(async () => {
  settingsStore.loadSettings().catch(() => {});
  try {
    let studentData: Student | null = null;
    if (props.portal === 'parent') {
      const res = await parentRepository.getMyChildren();
      const myChildren = res.data ?? [];
      studentData = myChildren.find((c: any) => c.studentId === props.studentId) || null;
    } else {
      studentData = await adminRepository.getStudent(props.studentId);
    }

    const termsData = await academicsRepository.getTerms();
    student.value = studentData;
    terms.value = termsData;

    const active = termsData.find((t) => t.status === 'active');
    selectedTermId.value = active?.termId ?? termsData[0]?.termId ?? null;

    if (selectedTermId.value) {
      await loadGrades();
    }
  } catch (err) {
    console.error('Failed to load report card data:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.report-card-page {
  width: 210mm;
  min-height: 297mm;
  max-width: 100%;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }
  body {
    background: white !important;
    color: black !important;
  }
}
</style>
