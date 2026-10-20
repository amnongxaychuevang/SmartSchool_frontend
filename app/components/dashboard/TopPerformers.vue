<template>
  <div
    class="glass-panel p-4 flex flex-col gap-3 page-enter"
    style="animation-delay: 0.65s"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <span class="w-1.5 h-5 bg-amber-500 rounded-full" />
        {{ $t('admin.top_performers') }}
      </h3>
      <NuxtLink
        to="/admin/students"
        class="text-xs text-teal-400 hover:text-teal-300 transition-colors"
      >
        {{ $t('admin.view_all') }} →
      </NuxtLink>
    </div>

    <LoadingSpinner v-if="loading" size="sm" padding="py-8" />
    <div
      v-else-if="classesData.length === 0"
      class="text-center text-slate-500 py-8 text-sm"
    >
      {{ $t('admin.no_data') }}
    </div>
    <div v-else class="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
      <div v-for="classGroup in classesData" :key="classGroup.className" class="rounded-lg bg-slate-800/30 p-4 border border-slate-700/40">
        <h4 class="text-sm font-bold text-teal-300 mb-3">
          {{ locale === 'lo' ? classGroup.classNameLo : classGroup.classNameEn }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="(student, idx) in classGroup.topStudents"
            :key="student.studentId"
            class="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-all"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                :class="getRankColor(Number(idx))">
                {{ Number(idx) + 1 }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-white truncate">
                  {{ locale === 'lo' ? student.fullNameLo : student.fullNameEn }}
                </p>
              </div>
            </div>
            <div class="text-right ml-2 flex-shrink-0">
              <span
                class="px-2 py-1 text-xs font-bold rounded-md"
                :class="getGradeColor(Number(student.averageGrade) || 0)"
              >
                {{ (Number(student.averageGrade) || 0).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSocket } from '../../composables/useSocket';
import { adminRepository } from '../../infrastructure/api/AdminRepository';

const { locale } = useI18n();
const { topPerformersData } = useSocket();
const loading = ref(false);
const classesData = ref<any[]>([]);

function getRankColor(rank: number) {
  const colors = [
    'bg-gradient-to-br from-amber-500 to-yellow-500',
    'bg-gradient-to-br from-slate-400 to-gray-500',
    'bg-gradient-to-br from-orange-600 to-red-700',
  ];
  return colors[rank] || colors[2];
}

function getGradeColor(grade: number) {
  if (grade >= 90) return 'bg-emerald-500/30 text-emerald-300';
  if (grade >= 80) return 'bg-teal-500/30 text-teal-300';
  if (grade >= 70) return 'bg-blue-500/30 text-blue-300';
  return 'bg-slate-500/30 text-slate-300';
}

async function fetchTopPerformers() {
  loading.value = true;
  try {
    const data = await adminRepository.getTopPerformers();
    classesData.value = data.classes || [];
  } catch (err) {
    console.error('Failed to fetch top performers:', err);
  } finally {
    loading.value = false;
  }
}

watch(topPerformersData, (newData) => {
  if (newData) {
    classesData.value = newData.classes;
  }
});

onMounted(() => {
  fetchTopPerformers();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.3);
  border-radius: 2px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.5);
}
</style>
