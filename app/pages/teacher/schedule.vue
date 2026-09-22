<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.my_schedule') }}</h1>
    </div>

    <div v-if="teacherStore.loadingSchedules" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"/>
    </div>
    <div v-else-if="teacherStore.mySchedules.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-lg">{{ $t('teacherPortal.no_schedule') }}</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="day in 7" :key="day">
        <h2 class="text-lg font-bold text-amber-500 dark:text-amber-400 mb-4">{{ days[day - 1] }}</h2>
        <div class="space-y-4">
          <div v-for="s in schedulesByDay(day - 1)" :key="s.scheduleId" class="glass-panel p-4 rounded-xl flex flex-col gap-2">
            <div class="flex justify-between items-start">
              <span class="text-sm font-medium text-slate-900 dark:text-white">{{ locale === 'lo' ? s.subject?.subjectNameLo : s.subject?.subjectNameEn }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ formatTime(s.startTime) }} - {{ formatTime(s.endTime) }}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ locale === 'lo' ? s.class?.classNameLo : s.class?.classNameEn }} • {{ $t('teacherPortal.room') }} {{ s.roomNumber || 'N/A' }}</p>
          </div>
          <div v-if="schedulesByDay(day - 1).length === 0" class="text-sm text-slate-500 italic p-2">
            {{ $t('teacherPortal.no_classes') }}
          </div>
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
useHead({ title: computed(() => `${t('teacherPortal.my_schedule')} — Teacher Portal`) });

const teacherStore = useTeacherStore();

const days = computed(() => {
  if (locale.value === 'lo') return ['ວັນອາທິດ', 'ວັນຈັນ', 'ວັນອັງຄານ', 'ວັນພຸດ', 'ວັນພະຫັດ', 'ວັນສຸກ', 'ວັນເສົາ'];
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
});

onMounted(() => {
  teacherStore.fetchSchedules();
});

const schedulesByDay = (dayOfWeek: number) => {
  return teacherStore.mySchedules.filter(s => s.dayOfWeek === dayOfWeek);
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>
