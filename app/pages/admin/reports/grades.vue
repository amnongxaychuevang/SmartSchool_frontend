<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-col gap-1">
        <p class="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{{ $t('nav.reports') }}</p>
        <h2 class="text-2xl font-bold text-white">{{ locale === 'lo' ? 'ບົດລາຍງານຜົນການຮຽນ' : 'Academic Grades Report' }}</h2>
        <p class="text-sm text-slate-400">{{ locale === 'lo' ? 'ວິເຄາະຜົນການຮຽນ ແລະ ຄະແນນຂອງນັກຮຽນ' : 'Analyze academic performance and student grades' }}</p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button class="btn-secondary" @click="refreshData">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('common.refresh') }}
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ຄະແນນທັງໝົດ' : 'Total Grades' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ totalRecords }}</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-indigo-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ອັດຕາຜ່ານສະເລ່ຍ' : 'Average Pass Rate' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ averagePassRate }}%</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ປະກາດແລ້ວ' : 'Published' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ publishedCount }}</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ຍັງບໍ່ປະກາດ' : 'Unpublished' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ unpublishedCount }}</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Filters & Table -->
    <div class="glass-panel overflow-hidden flex flex-col">
      <div class="p-5 border-b border-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 class="text-lg font-bold text-white">{{ locale === 'lo' ? 'ຂໍ້ມູນຄະແນນລາຍບຸກຄົນ' : 'Detailed Grade Records' }}</h3>
        
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Filter by Status -->
          <select v-model="filterStatus" class="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500">
            <option value="all">{{ locale === 'lo' ? 'ທັງໝົດ' : 'All Status' }}</option>
            <option value="published">{{ locale === 'lo' ? 'ປະກາດແລ້ວ' : 'Published' }}</option>
            <option value="unpublished">{{ locale === 'lo' ? 'ຍັງບໍ່ປະກາດ' : 'Unpublished' }}</option>
          </select>
          
          <!-- Month filter -->
          <input v-model="filterMonth" type="month" class="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500" >
        </div>
      </div>

      <div class="overflow-x-auto relative min-h-[300px]">
        <!-- Loading State -->
        <div v-if="academicsStore.gradesLoading" class="absolute inset-0 z-10 bg-[#0a101d]/60 backdrop-blur-sm flex flex-col items-center justify-center text-indigo-400">
          <svg class="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span class="text-sm font-semibold tracking-wider animate-pulse">{{ $t('common.loading') }}</span>
        </div>

        <table class="w-full text-left border-collapse min-w-max">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/20">
              <th class="px-6 py-3">{{ locale === 'lo' ? 'ນັກຮຽນ' : 'Student' }}</th>
              <th class="px-6 py-3">{{ locale === 'lo' ? 'ວິຊາຮຽນ' : 'Subject' }}</th>
              <th class="px-6 py-3">{{ locale === 'lo' ? 'ປະເພດຄະແນນ' : 'Grade Type' }}</th>
              <th class="px-6 py-3 text-right">{{ locale === 'lo' ? 'ຄະແນນ' : 'Score' }}</th>
              <th class="px-6 py-3 text-center">{{ locale === 'lo' ? 'ສະຖານະ' : 'Status' }}</th>
              <th class="px-6 py-3 text-right">{{ locale === 'lo' ? 'ວັນທີບັນທຶກ' : 'Date' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-xs">
            <tr v-for="grade in filteredGrades" :key="grade.gradeId" class="hover:bg-slate-800/10 transition-colors">
              <td class="px-6 py-3">
                <div class="flex flex-col">
                  <span class="font-bold text-white">{{ locale === 'lo' ? grade.student?.fullNameLo : grade.student?.fullNameEn }}</span>
                  <span class="text-[10px] text-slate-500 font-mono">{{ grade.student?.studentCode }}</span>
                </div>
              </td>
              <td class="px-6 py-3 font-medium text-slate-300">
                {{ locale === 'lo' ? grade.subject?.subjectNameLo : grade.subject?.subjectNameEn }}
              </td>
              <td class="px-6 py-3 text-slate-400">
                {{ locale === 'lo' ? grade.gradeType?.typeNameLo : grade.gradeType?.typeNameEn }}
              </td>
              <td class="px-6 py-3 text-right">
                <span class="font-bold font-mono text-[13px]" :class="getScoreColor(Number(grade.score ?? 0), Number(grade.maxScore))">
                  {{ Number(grade.score).toFixed(1) }} <span class="text-slate-600 text-[10px]">/ {{ Number(grade.maxScore).toFixed(0) }}</span>
                </span>
              </td>
              <td class="px-6 py-3 text-center">
                <span
:class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold tracking-wide',
                  grade.isPublished ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'
                ]">
                  {{ grade.isPublished ? (locale === 'lo' ? 'ປະກາດແລ້ວ' : 'Published') : (locale === 'lo' ? 'ລໍຖ້າປະກາດ' : 'Pending') }}
                </span>
              </td>
              <td class="px-6 py-3 text-right text-slate-500 font-mono text-[11px]">
                {{ fmt.date(grade.recordedAt) }}
              </td>
            </tr>
            <tr v-if="filteredGrades.length === 0 && !academicsStore.gradesLoading">
              <td colspan="6" class="text-center py-10 text-slate-500 font-medium">
                {{ locale === 'lo' ? 'ບໍ່ພົບຂໍ້ມູນຄະແນນ' : 'No grade records found' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="p-4 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-400 bg-slate-900/20">
        <span>{{ locale === 'lo' ? 'ສະແດງ' : 'Showing' }} {{ filteredGrades.length }} {{ locale === 'lo' ? 'ລາຍການ' : 'records' }}</span>
        <div class="flex items-center gap-1">
          <button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors" :disabled="currentPage === 1" @click="changePage(-1)">
             &laquo; {{ $t('common.prev') }}
          </button>
          <span class="px-3 text-white font-mono">{{ currentPage }}</span>
          <button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors" :disabled="academicsStore.grades.length < 50" @click="changePage(1)">
            {{ $t('common.next') }} &raquo;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAcademicsStore } from '~/application/stores/academics';

definePageMeta({ layout: 'admin' });
useHead({ title: () => t('page_titles.grades_report') });

const { locale, t } = useI18n();
const fmt = useFormat();
const academicsStore = useAcademicsStore();

const filterStatus = ref('all');
const filterMonth = ref('');
const currentPage = ref(1);

const refreshData = async () => {
  await academicsStore.fetchGrades({ 
    page: currentPage.value
  });
};

onMounted(() => {
  refreshData();
});

watch([currentPage], () => {
  refreshData();
});

const changePage = (step: number) => {
  if (currentPage.value + step > 0) {
    currentPage.value += step;
  }
};

const filteredGrades = computed(() => {
  let result = academicsStore.grades || [];
  
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

const getScoreColor = (score: number, maxScore: number) => {
  const percent = (Number(score) / Number(maxScore)) * 100;
  if (percent >= 80) return 'text-emerald-400';
  if (percent >= 50) return 'text-amber-400';
  return 'text-rose-400';
};
</script>
