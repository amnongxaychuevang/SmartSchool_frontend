<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.announcements') }}</h1>
    </div>

    <LoadingSpinner v-if="teacherStore.loadingAnnouncements" color="amber" padding="py-12" />
    <EmptyState v-else-if="teacherStore.announcements.length === 0" icon="megaphone" :title="$t('teacherPortal.no_announcements')" />
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
const fmt = useFormat();
useHead({ title: computed(() => `${t('teacherPortal.announcements')} — Teacher Portal`) });

const teacherStore = useTeacherStore();

onMounted(() => {
  teacherStore.fetchAnnouncements();
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return fmt.date(dateStr);
};
</script>
