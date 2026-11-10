<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-white">{{ $t('parentPortal.announcements') }}</h1>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="parentStore.loadingAnnouncements" color="indigo" padding="p-12" class="glass-panel rounded-2xl" />

    <!-- Content -->
    <template v-else>
      <div v-if="!parentStore.announcements || parentStore.announcements.length === 0" class="glass-panel">
        <EmptyState icon="megaphone" :title="$t('parentPortal.no_announcements')" />
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
