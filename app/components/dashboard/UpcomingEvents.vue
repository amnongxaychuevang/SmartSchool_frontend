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
      </div>
      <NuxtLink
        to="/admin/calendar"
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
        <div
class="w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-center text-white text-xs font-bold"
          :class="getEventTypeColor(event.type)">
          <span>{{ formatEventDate(event.date) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors truncate">
            {{ locale === 'lo' ? event.nameLo : event.nameEn }}
          </p>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ formatRange(event) }}
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
import { adminRepository, type DashboardEvent } from '../../infrastructure/api/AdminRepository';

const { locale } = useI18n();
const f = useFormat();
const { eventsData } = useSocket();
const loading = ref(false);
const events = ref<DashboardEvent[]>([]);

// Calendar event types (see the school calendar) plus "term" for a term's first day.
function getEventTypeColor(type: string) {
  const colors: Record<string, string> = {
    holiday: 'from-red-500 to-rose-500',
    exam: 'from-orange-500 to-amber-500',
    activity: 'from-blue-500 to-indigo-500',
    meeting: 'from-emerald-500 to-green-500',
    term: 'from-purple-500 to-pink-500',
  };
  return colors[type] || 'from-slate-500 to-slate-600';
}

// Events are whole school days stored as UTC midnight: read the date in UTC.
function formatEventDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
}

function formatRange(event: { date: string; endDate?: string }) {
  const start = event.date.slice(0, 10);
  const end = event.endDate?.slice(0, 10);
  return end && end !== start ? `${f.date(event.date)} – ${f.date(event.endDate!)}` : f.date(event.date);
}

async function fetchUpcomingEvents() {
  loading.value = true;
  try {
    const data = await adminRepository.getUpcomingEvents(5);
    events.value = data.events || [];
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
