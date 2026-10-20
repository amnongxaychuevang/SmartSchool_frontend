<template>
  <div
    class="glass-panel p-4 flex flex-col gap-3 page-enter"
    style="animation-delay: 0.68s"
  >
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span class="w-1.5 h-5 bg-cyan-500 rounded-full" />
          {{ $t('admin.upcoming_events') }}
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          📅 2027-02-01 → 2027-06-30
        </p>
      </div>
      <NuxtLink
        to="/admin/settings/academic-terms"
        class="text-xs text-teal-400 hover:text-teal-300 transition-colors"
      >
        {{ $t('admin.view_all') }} →
      </NuxtLink>
    </div>

    <LoadingSpinner v-if="loading" size="sm" padding="py-8" />
    <div
      v-else-if="events.length === 0"
      class="text-center text-slate-500 py-8 text-sm"
    >
      {{ $t('admin.no_upcoming_events') }}
    </div>
    <div v-else class="space-y-3">
      <div
        v-for="event in events"
        :key="event.id"
        class="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 hover:border-slate-600/60 transition-all group"
      >
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-center text-white text-xs font-bold"
          :class="getEventTypeColor(event.type)">
          <span>{{ formatEventDate(event.date) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors truncate">
            {{ locale === 'lo' ? event.nameLo : event.nameEn }}
          </p>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ formatEventDateTime(event.date) }}
          </p>
          <p v-if="event.descriptionLo || event.descriptionEn" class="text-xs text-slate-600 mt-1 line-clamp-1">
            {{ locale === 'lo' ? event.descriptionLo : event.descriptionEn }}
          </p>
        </div>
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
const { eventsData } = useSocket();
const loading = ref(false);
const events = ref<any[]>([]);

function getEventTypeColor(type: string) {
  const colors: Record<string, string> = {
    holiday: 'from-emerald-500 to-green-500',
    exam: 'from-orange-500 to-red-500',
    event: 'from-purple-500 to-pink-500',
    deadline: 'from-amber-500 to-yellow-500',
  };
  return colors[type] || 'from-blue-500 to-indigo-500';
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function formatEventDateTime(dateStr: string) {
  return f.dateTime(dateStr);
}

async function fetchUpcomingEvents() {
  loading.value = true;
  try {
    const data = await adminRepository.getUpcomingEvents(10);

    // Filter for Term 2 (2027-02-01 to 2027-06-30)
    const term2Start = new Date('2027-02-01');
    const term2End = new Date('2027-06-30');

    const filteredEvents = (data.events || []).filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= term2Start && eventDate <= term2End;
    });

    events.value = filteredEvents.slice(0, 5);
  } catch (err) {
    console.error('Failed to fetch upcoming events:', err);
  } finally {
    loading.value = false;
  }
}

watch(eventsData, (newData) => {
  if (newData) {
    events.value = newData.events;
  }
});

onMounted(() => {
  fetchUpcomingEvents();
});
</script>
