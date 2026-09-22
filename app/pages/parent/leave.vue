<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-white">{{ $t('parentPortal.leave_requests') }}</h1>
        <select
v-model="selectedChildId" class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500"
          @change="loadLeaves"
        >
          <option value="">{{ $t('parentPortal.select_child') }}</option>
          <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">
            {{ child.user?.fullNameEn || `Student #${child.studentId}` }}
          </option>
        </select>
      </div>
      <button :disabled="!selectedChildId" class="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" @click="leaveModal.open = true">
        {{ $t('parentPortal.request_leave') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="parentStore.loadingLeaveRequests" class="glass-panel p-12 flex justify-center rounded-2xl">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"/>
    </div>

    <!-- Content -->
    <template v-else-if="selectedChildId">
      <div v-if="!parentStore.leaveRequests || parentStore.leaveRequests.length === 0" class="glass-panel p-12 flex flex-col items-center justify-center text-slate-500 rounded-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
        </svg>
        <p>{{ $t('parentPortal.no_leaves') }}</p>
      </div>
      <div v-else class="glass-panel rounded-2xl overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900/50">
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.date') }}</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.reason') }}</th>
              <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('parentPortal.status') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <tr v-for="leave in parentStore.leaveRequests" :key="leave.leaveId" class="hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4 text-sm text-white">
                {{ new Date(leave.startDate).toLocaleDateString() }} - {{ new Date(leave.endDate).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-300">
                {{ locale === 'lo' ? (leave.reasonLo || leave.reasonEn) : (leave.reasonEn || leave.reasonLo) }}
                <div v-if="leave.documentUrl" class="mt-1">
                  <a :href="leave.documentUrl" target="_blank" class="text-xs text-teal-400 hover:underline">View Document</a>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                  :class="{
                    'bg-amber-500/20 text-amber-400': leave.status === 'pending',
                    'bg-teal-500/20 text-teal-400': leave.status === 'approved',
                    'bg-red-500/20 text-red-400': leave.status === 'rejected'
                  }">
                  {{ $t(`parentPortal.${leave.status}`) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    
    <div v-else class="glass-panel p-12 text-center text-slate-500 rounded-2xl">
      {{ $t('parentPortal.please_select_child') }}
    </div>
  </div>

  <!-- Leave Request Modal -->
  <div v-if="leaveModal.open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="leaveModal.open = false"/>
    <div class="relative glass-panel rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 class="text-xl font-bold text-white">{{ $t('parentPortal.request_leave') }}</h2>
        <button class="text-slate-400 hover:text-white" @click="leaveModal.open = false">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <form class="flex flex-col gap-4" @submit.prevent="submitLeaveRequest">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.start_date') }}</label>
            <input v-model="leaveModal.form.startDate" type="date" required class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" >
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.end_date') }}</label>
            <input v-model="leaveModal.form.endDate" type="date" required class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" >
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.reason') }}</label>
          <textarea v-model="leaveModal.form.reason" required rows="3" class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" placeholder="Reason for leave..."/>
        </div>
        
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('parentPortal.document_url') }}</label>
          <input v-model="leaveModal.form.documentUrl" type="text" class="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500" placeholder="Optional URL to doctor's note" >
        </div>
        
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button type="button" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors" @click="leaveModal.open = false">{{ $t('common.cancel') }}</button>
          <button type="submit" :disabled="leaveModal.saving" class="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors disabled:opacity-50">
            {{ leaveModal.saving ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

definePageMeta({ layout: 'parent' });
useHead({ title: computed(() => `${t('parentPortal.leave_requests')} — ${t('parentPortal.title')}`) });

const parentStore = useParentStore();
const selectedChildId = ref<number | ''>('');

const leaveModal = reactive({
  open: false,
  saving: false,
  form: {
    startDate: '',
    endDate: '',
    reason: '',
    documentUrl: ''
  }
});

onMounted(async () => {
  if (parentStore.children.length === 0) {
    await parentStore.fetchChildren();
  }
  if (parentStore.children.length === 1) {
    selectedChildId.value = parentStore.children[0].studentId;
    loadLeaves();
  }
});

const loadLeaves = () => {
  if (selectedChildId.value) {
    parentStore.fetchLeaveRequests(selectedChildId.value as number);
  }
};

const submitLeaveRequest = async () => {
  if (!selectedChildId.value) return;
  leaveModal.saving = true;
  try {
    const data = {
      startDate: leaveModal.form.startDate,
      endDate: leaveModal.form.endDate,
      reasonEn: leaveModal.form.reason,
      reasonLo: leaveModal.form.reason,
      documentUrl: leaveModal.form.documentUrl
    };
    await parentStore.createLeaveRequest(selectedChildId.value as number, data);
    leaveModal.open = false;
    leaveModal.form = { startDate: '', endDate: '', reason: '', documentUrl: '' };
    loadLeaves();
  } catch (error) {
    alert('Failed to submit leave request');
  } finally {
    leaveModal.saving = false;
  }
};
</script>
