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
            {{ ($i18n.locale === 'lo' ? child.fullNameLo : child.fullNameEn) || child.fullNameEn }}
          </option>
        </select>
        <NuxtLink
          v-if="selectedChildId"
          :to="`/parent/report-card/${selectedChildId}`"
          class="h-10 px-3.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ $t('report_card.document_title') }}
        </NuxtLink>
      </div>
    </div>

    <div class="glass-panel overflow-x-auto">
      <LoadingSpinner v-if="parentStore.loadingGrades" color="amber" />
      <div v-else-if="parentStore.childGrades.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>{{ $t('parentPortal.no_grades') }}</p>
      </div>
      <table v-else class="data-table w-full min-w-max">
        <thead>
          <tr>
            <th>{{ $t('parentPortal.subject') }}</th>
            <th>{{ $t('parentPortal.class') }}</th>
            <th>{{ $t('parentPortal.score') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="grade in parentStore.childGrades" :key="grade.gradeId" class="hover:bg-slate-800/40 transition-colors">
            <td class="text-sm text-white font-medium">{{ grade.subject?.subjectNameEn || 'Unknown Subject' }}</td>
            <td class="text-sm text-slate-400">{{ grade.class?.classNameEn || 'Unknown Class' }}</td>
            <td class="text-sm text-teal-400 font-bold">{{ grade.score }}</td>
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
    selectedChildId.value = parentStore.children[0]!.studentId;
    loadGrades();
  }
});

const loadGrades = async () => {
  if (selectedChildId.value) {
    await parentStore.fetchChildGrades(Number(selectedChildId.value));
  }
};
</script>
