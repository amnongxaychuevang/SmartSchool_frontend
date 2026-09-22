<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.announcements') }}</h1>
    </div>

    <div v-if="teacherStore.loadingAnnouncements" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"/>
    </div>
    <div v-else-if="teacherStore.announcements.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
      <p class="text-lg">{{ $t('teacherPortal.no_announcements') }}</p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="ann in teacherStore.announcements" :key="ann.announcementId" class="glass-panel p-6 rounded-2xl flex flex-col gap-3">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ locale === 'lo' ? ann.titleLo : ann.titleEn }}</h3>
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(ann.publishDate) }}</span>
        </div>
        <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ locale === 'lo' ? ann.contentLo : ann.contentEn }}</p>
        <p class="text-xs text-slate-500 mt-2">{{ $t('teacherPortal.by') }} {{ locale === 'lo' ? ann.author?.fullNameLo : ann.author?.fullNameEn || 'Admin' }}</p>
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
useHead({ title: computed(() => `${t('teacherPortal.announcements')} — Teacher Portal`) });

const teacherStore = useTeacherStore();

onMounted(() => {
  teacherStore.fetchAnnouncements();
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};
</script>
