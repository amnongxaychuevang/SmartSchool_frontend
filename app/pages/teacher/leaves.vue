<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.leave_approvals') }}</h1>
    </div>

    <LoadingSpinner v-if="teacherStore.loadingLeaveRequests" color="amber" padding="py-12" />
    <div v-else-if="teacherStore.leaveRequests.length === 0" class="py-12 flex flex-col items-center justify-center text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-lg">{{ $t('teacherPortal.no_leaves') }}</p>
    </div>
    <div v-else class="space-y-4">
      <div v-for="req in teacherStore.leaveRequests" :key="req.leaveId" class="glass-panel p-6 rounded-2xl flex flex-col gap-4">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ locale === 'lo' ? req.student?.fullNameLo : req.student?.fullNameEn }} ({{ req.student?.studentCode }})</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('teacherPortal.parent') }}: {{ locale === 'lo' ? req.parent?.fullNameLo : req.parent?.fullNameEn }} ({{ req.parent?.phoneNumber }})</p>
          </div>
          <span
:class="[
            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
            req.status === 'pending' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
            req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
            'bg-red-500/20 text-red-600 dark:text-red-400'
          ]">
            {{ $t(`status.${req.status}`) }}
          </span>
        </div>
        
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
          <p class="text-sm text-slate-700 dark:text-slate-300"><span class="font-semibold text-slate-900 dark:text-slate-400">{{ $t('teacherPortal.dates') }}</span> {{ formatDate(req.startDate) }} - {{ formatDate(req.endDate) }}</p>
          <p class="text-sm text-slate-700 dark:text-slate-300 mt-2"><span class="font-semibold text-slate-900 dark:text-slate-400">{{ $t('teacherPortal.reason') }}</span> {{ req.reason }}</p>
          <div v-if="req.documentUrl" class="mt-2">
            <a :href="req.documentUrl" target="_blank" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">{{ $t('teacherPortal.view_document') }}</a>
          </div>
        </div>

        <div v-if="req.status === 'pending'" class="flex justify-end gap-3 mt-2 border-t border-slate-200 dark:border-slate-800 pt-4">
          <button class="px-4 py-2 rounded-lg text-sm bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors" @click="updateStatus(req.leaveId, 'rejected')">
            {{ $t('teacherPortal.reject') }}
          </button>
          <button class="px-4 py-2 rounded-lg text-sm bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/30 transition-colors" @click="updateStatus(req.leaveId, 'approved')">
            {{ $t('teacherPortal.approve') }}
          </button>
        </div>
        <div v-else-if="req.approver" class="text-xs text-slate-500 text-right">
          {{ $t('teacherPortal.processed_by') }} {{ locale === 'lo' ? req.approver.fullNameLo : req.approver.fullNameEn }}
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
const fmt = useFormat();
useHead({ title: computed(() => `${t('teacherPortal.leave_approvals')} — Teacher Portal`) });

const teacherStore = useTeacherStore();

onMounted(() => {
  teacherStore.fetchLeaveRequests();
});

const updateStatus = async (leaveId: number, status: 'approved' | 'rejected') => {
  if (confirm(t(status === 'approved' ? 'leave_ui.confirm_approve' : 'leave_ui.confirm_reject'))) {
    await teacherStore.updateLeaveRequestStatus(leaveId, status);
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return fmt.date(dateStr);
};
</script>
