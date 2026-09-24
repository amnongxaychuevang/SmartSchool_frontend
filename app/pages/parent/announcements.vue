<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-white">{{ $t('parentPortal.announcements') }}</h1>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="parentStore.loadingAnnouncements" color="indigo" padding="p-12" class="glass-panel rounded-2xl" />

    <!-- Content -->
    <template v-else>
      <div v-if="!parentStore.announcements || parentStore.announcements.length === 0" class="glass-panel p-12 flex flex-col items-center justify-center text-slate-500 rounded-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p>{{ $t('parentPortal.no_announcements') }}</p>
      </div>
      
      <div v-else class="grid gap-4">
        <div
v-for="announcement in parentStore.announcements" :key="announcement.announcementId" 
          class="glass-panel p-6 rounded-2xl hover:bg-slate-800/30 transition-colors"
        >
          <div class="flex items-start justify-between gap-4 mb-3">
            <h2 class="text-lg font-bold text-white">
              {{ locale === 'lo' ? (announcement.titleLo || announcement.titleEn) : (announcement.titleEn || announcement.titleLo) }}
            </h2>
            <span class="text-xs text-slate-400 whitespace-nowrap bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
              {{ fmt.date(announcement.publishDate) }}
            </span>
          </div>
          <p class="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
            {{ locale === 'lo' ? (announcement.contentLo || announcement.contentEn) : (announcement.contentEn || announcement.contentLo) }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const fmt = useFormat();

definePageMeta({ layout: 'parent' });
useHead({ title: computed(() => `${t('parentPortal.announcements')} — ${t('parentPortal.title')}`) });

const parentStore = useParentStore();

onMounted(async () => {
  await parentStore.fetchAnnouncements();
});
</script>
