<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-white">{{ $t('parentPortal.schedule') }}</h1>
      <div class="flex items-center gap-2">
        <select
v-model="selectedChildId" class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500"
          @change="loadSchedule"
        >
          <option value="">{{ $t('parentPortal.select_child') }}</option>
          <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">
            {{ child.user?.fullNameEn || `Student #${child.studentId}` }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="parentStore.loadingSchedule" color="indigo" padding="p-12" class="glass-panel rounded-2xl" />

    <!-- Content -->
    <template v-else-if="selectedChildId">
      <div v-if="!parentStore.childSchedule || parentStore.childSchedule.length === 0" class="glass-panel p-12 flex flex-col items-center justify-center text-slate-500 rounded-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>{{ $t('parentPortal.no_schedule') }}</p>
      </div>
      <div v-else class="glass-panel rounded-2xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900/50">
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.date') }}</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.time') }}</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.subject') }}</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.room') }}</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.teacher') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="sched in parentStore.childSchedule" :key="sched.scheduleId" class="hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-indigo-400">{{ getDayName(sched.dayOfWeek) }}</td>
              <td class="px-6 py-4 text-sm text-white">{{ formatTime(sched.startTime) }} - {{ formatTime(sched.endTime) }}</td>
              <td class="px-6 py-4 text-sm text-slate-300">{{ sched.subject?.subjectNameEn || '-' }}</td>
              <td class="px-6 py-4 text-sm text-slate-400">{{ sched.roomNumber || '-' }}</td>
              <td class="px-6 py-4 text-sm text-slate-400">{{ sched.teacher?.fullNameEn || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    
    <div v-else class="glass-panel p-12 text-center text-slate-500 rounded-2xl">
      {{ $t('parentPortal.please_select_child') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

definePageMeta({ layout: 'parent' });
useHead({ title: computed(() => `${t('parentPortal.schedule')} — ${t('parentPortal.title')}`) });

const parentStore = useParentStore();
const selectedChildId = ref<number | ''>('');

onMounted(async () => {
  if (parentStore.children.length === 0) {
    await parentStore.fetchChildren();
  }
  if (parentStore.children.length === 1) {
    selectedChildId.value = parentStore.children[0].studentId;
    loadSchedule();
  }
});

const loadSchedule = () => {
  if (selectedChildId.value) {
    parentStore.fetchChildSchedule(selectedChildId.value as number);
  }
};

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDayName = (dayOfWeek: number) => {
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysLo = ['ວັນອາທິດ', 'ວັນຈັນ', 'ວັນອັງຄານ', 'ວັນພຸດ', 'ວັນພະຫັດ', 'ວັນສຸກ', 'ວັນເສົາ'];
  return locale.value === 'lo' ? daysLo[dayOfWeek] : daysEn[dayOfWeek];
};
</script>
