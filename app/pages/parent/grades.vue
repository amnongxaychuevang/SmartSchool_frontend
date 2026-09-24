<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-white">{{ $t('parentPortal.childs_grades') }}</h1>
      <div class="flex items-center gap-2">
        <select
v-model="selectedChildId" class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
          @change="loadGrades"
        >
          <option value="">{{ $t('parentPortal.select_child') }}</option>
          <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">
            {{ child.user?.fullNameEn || `Student #${child.studentId}` }}
          </option>
        </select>
      </div>
    </div>

    <div class="glass-panel overflow-hidden">
      <LoadingSpinner v-if="parentStore.loadingGrades" color="amber" />
      <div v-else-if="parentStore.childGrades.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>{{ $t('parentPortal.no_grades') }}</p>
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.subject') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.class') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.score') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="grade in parentStore.childGrades" :key="grade.gradeId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4 text-sm text-white font-medium">{{ grade.subject?.subjectNameEn || 'Unknown Subject' }}</td>
            <td class="px-6 py-4 text-sm text-slate-400">{{ grade.class?.classNameEn || 'Unknown Class' }}</td>
            <td class="px-6 py-4 text-sm text-teal-400 font-bold">{{ grade.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

definePageMeta({ layout: 'parent' });
useHead({ title: computed(() => `${t('parentPortal.childs_grades')} — ${t('parentPortal.title')}`) });

const parentStore = useParentStore();
const selectedChildId = ref<number | ''>('');

onMounted(async () => {
  await parentStore.fetchChildren();
  if (parentStore.children.length > 0) {
    selectedChildId.value = parentStore.children[0].studentId;
    loadGrades();
  }
});

const loadGrades = async () => {
  if (selectedChildId.value) {
    await parentStore.fetchChildGrades(Number(selectedChildId.value));
  }
};
</script>
