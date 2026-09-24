<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-white">{{ $t('parentPortal.childs_attendance') }}</h1>
      <div class="flex items-center gap-2">
        <select
v-model="selectedChildId" class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
          @change="loadAttendance"
        >
          <option value="">{{ $t('parentPortal.select_child') }}</option>
          <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">
            {{ ($i18n.locale === 'lo' ? child.fullNameLo : child.fullNameEn) || child.fullNameEn }}
          </option>
        </select>
      </div>
    </div>

    <div class="glass-panel overflow-hidden">
      <LoadingSpinner v-if="parentStore.loadingAttendance" color="amber" />
      <div v-else-if="parentStore.childAttendance.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>{{ $t('parentPortal.no_attendance') }}</p>
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.date') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.status') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="att in parentStore.childAttendance" :key="att.id" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4 text-sm text-white">{{ att.date.slice(0, 10) }}</td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="STATUS_CLASS[att.status]">
                {{ $t(`teacherPortal.${att.status}`) }}
              </span>
              <span v-if="att.firstCheckIn" class="ml-2 text-xs text-slate-500">{{ checkInTime(att.firstCheckIn) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

definePageMeta({ layout: 'parent' });
useHead({ title: computed(() => `${t('parentPortal.childs_attendance')} — ${t('parentPortal.title')}`) });

const parentStore = useParentStore();

const STATUS_CLASS = {
  present: 'bg-teal-500/20 text-teal-400',
  late: 'bg-amber-500/20 text-amber-400',
  excused: 'bg-blue-500/20 text-blue-400',
  absent: 'bg-red-500/20 text-red-400',
} as const;
const checkInTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const selectedChildId = ref<number | ''>('');

onMounted(async () => {
  await parentStore.fetchChildren();
  if (parentStore.children.length > 0) {
    selectedChildId.value = parentStore.children[0]!.studentId;
    loadAttendance();
  }
});

const loadAttendance = async () => {
  if (selectedChildId.value) {
    await parentStore.fetchChildAttendance(Number(selectedChildId.value));
  }
};
</script>
