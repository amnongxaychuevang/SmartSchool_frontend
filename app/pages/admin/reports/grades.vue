<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader :eyebrow="$t('nav.reports')" :title="t('grades_report.title')" :subtitle="t('grades_report.subtitle')" />

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ t('grades_report.total') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ totalRecords }}</p>
      </div>
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ t('grades_report.pass_rate') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ averagePassRate }}%</p>
      </div>
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ t('grades_report.published') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ publishedCount }}</p>
      </div>
      <div class="panel px-4 py-3">
        <p class="text-xs font-semibold text-ink-subtle uppercase tracking-wider">{{ t('grades_report.unpublished') }}</p>
        <p class="mt-1 text-2xl font-bold tnum">{{ unpublishedCount }}</p>
      </div>
    </div>

    <!-- Search + Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="t('grades_report.search_placeholder')" class="search-bar" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear')" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="filterStatus" class="input-field w-auto" @change="applyFilters">
          <option value="all">{{ t('grades_report.all_status') }}</option>
          <option value="published">{{ t('grades_report.published') }}</option>
          <option value="unpublished">{{ t('grades_report.unpublished') }}</option>
        </select>
        <input v-model="filterMonth" type="month" class="input-field w-auto" @change="applyFilters">
      </div>
      <button class="btn-secondary ml-auto" @click="exportGrades">
        {{ $t('common.export_excel') }}
      </button>
    </div>

    <!-- Table -->
    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="academicsStore.gradesLoading && !academicsStore.grades.length" />
      <p v-else-if="!filteredGrades.length" class="py-12 text-center text-sm text-ink-subtle">{{ t('grades_report.empty') }}</p>
      <div v-else class="overflow-x-auto">

        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ locale === 'lo' ? 'ນັກຮຽນ' : 'Student' }}</th>
              <th>{{ locale === 'lo' ? 'ວິຊາຮຽນ' : 'Subject' }}</th>
              <th>{{ locale === 'lo' ? 'ປະເພດຄະແນນ' : 'Grade Type' }}</th>
              <th class="text-right">{{ locale === 'lo' ? 'ຄະແນນ' : 'Score' }}</th>
              <th class="text-center">{{ locale === 'lo' ? 'ສະຖານະ' : 'Status' }}</th>
              <th class="text-right">{{ locale === 'lo' ? 'ວັນທີບັນທຶກ' : 'Date' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grade in filteredGrades" :key="grade.gradeId">
              <td>
                <p class="font-semibold">{{ studentName(grade) }}</p>
                <p class="text-xs text-ink-subtle">{{ studentCode(grade) }}</p>
              </td>
              <td>{{ subjectName(grade) }}</td>
              <td class="text-ink-muted">{{ gradeTypeName(grade) }}</td>
              <td class="text-right">
                <span class="font-bold tnum" :class="getScoreColor(Number(grade.score || 0), Number(grade.maxScore))">
                  {{ Number(grade.score).toFixed(1) }} <span class="text-ink-subtle text-xs">/ {{ Number(grade.maxScore).toFixed(0) }}</span>
                </span>
              </td>
              <td class="text-center">
                <span :class="grade.isPublished ? 'badge-success' : 'badge-warning'">
                  {{ grade.isPublished ? (locale === 'lo' ? 'ປະກາດແລ້ວ' : 'Published') : (locale === 'lo' ? 'ລໍຖ້າປະກາດ' : 'Pending') }}
                </span>
              </td>
              <td class="text-right tnum whitespace-nowrap">{{ fmt.date(grade.recordedAt) }}</td>
            </tr>
            <tr v-if="filteredGrades.length === 0 && !academicsStore.gradesLoading">
              <td colspan="6" class="text-center py-8 text-ink-subtle">
                {{ locale === 'lo' ? 'ບໍ່ພົບຂໍ້ມູນຄະແນນ' : 'No grade records found' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <PaginationBar :loading="academicsStore.gradesLoading" :current-page="currentPage" :total-pages="totalPages" @update:page="onPageChange" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAcademicsStore } from '~/application/stores/academics';
import { useExport } from '../../../composables/useExport';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';

definePageMeta({ layout: 'admin' });

const { locale, t } = useI18n();
useHead({ title: () => t('page_titles.grades_report') });
const fmt = useFormat();
const { exportExcel } = useExport();
const academicsStore = useAcademicsStore();

const searchInput = ref('');
const filterStatus = ref('all');
const filterMonth = ref('');
const currentPage = ref(1);
const PAGE_SIZE = 50;
const totalPages = computed(() => Math.ceil((academicsStore.gradesTotal || 1) / PAGE_SIZE));

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { currentPage.value = 1; }, 300);
};
const clearSearch = () => { searchInput.value = ''; currentPage.value = 1; };
const applyFilters = () => { currentPage.value = 1; };

const refreshData = async () => {
  await academicsStore.fetchGrades({ page: currentPage.value });
};

onMounted(() => {
  refreshData();
});

watch([currentPage], () => {
  refreshData();
});

const onPageChange = (page: number) => {
  currentPage.value = page;
};

const studentName = (g: any) => {
  const s = g.student;
  if (!s) return '—';
  return (locale.value === 'lo' ? s.fullNameLo : s.fullNameEn) || s.fullNameEn;
};
const studentCode = (g: any) => g.student ? g.student.studentCode : '';
const subjectName = (g: any) => {
  const s = g.subject;
  if (!s) return '—';
  return (locale.value === 'lo' ? s.subjectNameLo : s.subjectNameEn) || s.subjectNameEn;
};
const gradeTypeName = (g: any) => {
  const gt = g.gradeType;
  if (!gt) return '—';
  return (locale.value === 'lo' ? gt.typeNameLo : gt.typeNameEn) || gt.typeNameEn;
};

const filteredGrades = computed(() => {
  let result = academicsStore.grades || [];

  if (searchInput.value) {
    const q = searchInput.value.toLowerCase();
    result = result.filter((g: any) => {
      const sn = g.student ? (g.student.fullNameLo + ' ' + g.student.fullNameEn + ' ' + g.student.studentCode).toLowerCase() : '';
      const sub = g.subject ? (g.subject.subjectNameLo + ' ' + g.subject.subjectNameEn).toLowerCase() : '';
      return sn.includes(q) || sub.includes(q);
    });
  }

  if (filterStatus.value === 'published') {
    result = result.filter(g => g.isPublished);
  } else if (filterStatus.value === 'unpublished') {
    result = result.filter(g => !g.isPublished);
  }

  if (filterMonth.value) {
    result = result.filter(g => g.gradeMonth === filterMonth.value);
  }

  return result;
});

// Stats computations
const totalRecords = computed(() => academicsStore.gradesTotal || academicsStore.grades.length);
const publishedCount = computed(() => (academicsStore.grades || []).filter(g => g.isPublished).length);
const unpublishedCount = computed(() => (academicsStore.grades || []).filter(g => !g.isPublished).length);
const averagePassRate = computed(() => {
  const grades = academicsStore.grades || [];
  if (grades.length === 0) return 0;
  
  // Assume pass is > 50% of maxScore
  const passes = grades.filter(g => Number(g.score) >= (Number(g.maxScore) / 2));
  return Math.round((passes.length / grades.length) * 100);
});

function exportGrades() {
  const data = filteredGrades.value.map((g: any) => ({
    student: locale.value === 'lo' ? g.student?.fullNameLo : g.student?.fullNameEn,
    studentCode: g.student?.studentCode,
    subject: locale.value === 'lo' ? g.classSubject?.subject?.subjectNameLo : g.classSubject?.subject?.subjectNameEn,
    class: locale.value === 'lo' ? g.classSubject?.class?.classNameLo : g.classSubject?.class?.classNameEn,
    gradeType: locale.value === 'lo' ? g.gradeType?.typeNameLo : g.gradeType?.typeNameEn,
    score: g.score,
    maxScore: g.maxScore,
    percent: g.maxScore > 0 ? Math.round((g.score / g.maxScore) * 100) : 0,
    published: g.isPublished ? 'Yes' : 'No',
  }));
  exportExcel(data, [
    { key: 'student', label: 'Student' },
    { key: 'studentCode', label: 'Code' },
    { key: 'subject', label: 'Subject' },
    { key: 'class', label: 'Class' },
    { key: 'gradeType', label: 'Grade Type' },
    { key: 'score', label: 'Score' },
    { key: 'maxScore', label: 'Max Score' },
    { key: 'percent', label: '%' },
    { key: 'published', label: 'Published' },
  ], 'grades-report');
}

const getScoreColor = (score: number, maxScore: number) => {
  const percent = (Number(score) / Number(maxScore)) * 100;
  if (percent >= 80) return 'text-emerald-400';
  if (percent >= 50) return 'text-amber-400';
  return 'text-rose-400';
};
</script>
