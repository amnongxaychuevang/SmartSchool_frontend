<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.my_classes') }}</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-if="teacherStore.loadingClasses" class="col-span-full py-12 flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"/>
      </div>
      <div v-else-if="teacherStore.myClasses.length === 0" class="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p class="text-lg">{{ $t('teacherPortal.no_classes_assigned') }}</p>
      </div>
      <div v-for="c in teacherStore.myClasses" v-else :key="c.classId" class="glass-panel p-6 rounded-2xl flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ locale === 'lo' ? c.classNameLo : c.classNameEn }}</h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
            {{ $t('teacherPortal.active') }}
          </span>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ locale === 'lo' ? c.classNameEn : c.classNameLo }}</p>
        <div class="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <div class="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {{ $t('teacherPortal.capacity') }}: {{ c.capacity }}
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <NuxtLink :to="`/teacher/attendance?classId=${c.classId}`" class="px-4 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {{ $t('teacherPortal.take_attendance') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTeacherStore } from '../../application/stores/teacher';

definePageMeta({ layout: 'teacher' });

const { t, locale } = useI18n();
useHead({ title: computed(() => `${t('teacherPortal.my_classes')} — Teacher Portal`) });

const teacherStore = useTeacherStore();

onMounted(() => {
  teacherStore.fetchMyClasses();
});
</script>
