<template>
  <div
    class="glass-panel p-4 flex flex-col gap-3 page-enter"
    style="animation-delay: 0.72s"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-white flex items-center gap-2">
        <span class="w-1.5 h-5 bg-rose-500 rounded-full" />
        {{ $t('admin.announcements') }}
      </h3>
      <NuxtLink
        to="/admin/announcements"
        class="text-xs text-teal-400 hover:text-teal-300 transition-colors"
      >
        {{ $t('admin.view_all') }} →
      </NuxtLink>
    </div>

    <LoadingSpinner v-if="loading" size="sm" padding="py-8" />
    <div
      v-else-if="announcements.length === 0"
      class="text-center text-slate-500 py-8 text-sm"
    >
      {{ $t('admin.no_announcements') }}
    </div>
    <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
      <div
        v-for="announcement in announcements"
        :key="announcement.id"
        class="p-4 rounded-lg bg-gradient-to-r transition-all duration-300 hover:shadow-lg cursor-pointer group"
        :class="getAnnouncementClass(announcement.priority)"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <h4 class="font-semibold text-sm text-white group-hover:text-teal-200 flex-1">
            {{ locale === 'lo' ? announcement.titleLo : announcement.titleEn }}
          </h4>
          <span class="text-xs px-2 py-1 rounded-full flex-shrink-0"
            :class="getPriorityClass(announcement.priority)">
            {{ $t(`admin.priority_${announcement.priority}`) }}
          </span>
        </div>
        <p class="text-xs text-slate-300 line-clamp-2">
          {{ locale === 'lo' ? announcement.contentLo : announcement.contentEn }}
        </p>
        <p class="text-xs text-slate-500 mt-2">
          {{ f.dateTime(announcement.createdAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFormat } from '../../composables/useFormat';
import { useSocket } from '../../composables/useSocket';
import { adminRepository } from '../../infrastructure/api/AdminRepository';

const { locale } = useI18n();
const f = useFormat();
const { announcementsData } = useSocket();
const loading = ref(false);
const announcements = ref<any[]>([]);

function getAnnouncementClass(priority: string) {
  const classes: Record<string, string> = {
    high: 'from-red-500/10 to-rose-500/5 border border-red-500/30 hover:border-red-500/50 bg-red-950/20',
    medium: 'from-amber-500/10 to-yellow-500/5 border border-amber-500/30 hover:border-amber-500/50 bg-amber-950/20',
    low: 'from-blue-500/10 to-cyan-500/5 border border-blue-500/30 hover:border-blue-500/50 bg-blue-950/20',
  };
  return classes[priority] || classes.low;
}

function getPriorityClass(priority: string) {
  const classes: Record<string, string> = {
    high: 'bg-red-500/20 text-red-300',
    medium: 'bg-amber-500/20 text-amber-300',
    low: 'bg-blue-500/20 text-blue-300',
  };
  return classes[priority] || classes.low;
}

async function fetchAnnouncements() {
  loading.value = true;
  try {
    const data = await adminRepository.getAnnouncements(5);
    announcements.value = data.announcements || [];
  } catch (err) {
    console.error('Failed to fetch announcements:', err);
  } finally {
    loading.value = false;
  }
}

watch(announcementsData, (newData) => {
  if (newData) {
    announcements.value = newData.announcements;
  }
});

onMounted(() => {
  fetchAnnouncements();
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
