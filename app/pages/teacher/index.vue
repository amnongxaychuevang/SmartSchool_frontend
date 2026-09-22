<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('nav.dashboard') }}</h1>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{{ $t('teacherPortal.my_classes') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ teacherStore.myClasses.length }}</p>
        </div>
      </div>
      <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{{ $t('admin.total_students') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ totalStudentsCount }}</p>
        </div>
      </div>
      <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{{ $t('parentPortal.attendance_rate') }}</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-white">95%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTeacherStore } from '../../application/stores/teacher';

definePageMeta({ layout: 'teacher' });
useHead({ title: 'Dashboard — Teacher Portal' });

const teacherStore = useTeacherStore();

onMounted(async () => {
  await teacherStore.fetchMyClasses();
});

const totalStudentsCount = computed(() => {
  // A rough estimate: sum of capacities or just a placeholder
  return teacherStore.myClasses.reduce((acc, c) => acc + (c.capacity || 0), 0);
});
</script>
