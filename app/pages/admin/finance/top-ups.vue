<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-white">Top-Up Requests</h1>
      <div class="flex items-center gap-2">
        <select
          v-model="statusFilter"
          class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500"
          @change="handleFilter"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <!-- Loading -->
      <LoadingSpinner v-if="financeStore.topUpRequestsLoading" />

      <!-- Empty -->
      <div v-else-if="financeStore.topUpRequests.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No top-up requests found.</p>
      </div>

      <!-- Data Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Date</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Student / Parent</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Amount (₭)</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Status</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="req in financeStore.topUpRequests" :key="req.requestId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4 text-sm text-slate-300">
              {{ new Date(req.requestedAt).toLocaleString() }}
            </td>
            <td class="px-6 py-4">
              <p class="text-sm font-medium text-white">{{ req.student?.fullNameEn || 'Unknown Student' }}</p>
              <p class="text-xs text-slate-500">Parent: {{ req.parentRequester?.fullNameEn || 'Unknown' }}</p>
            </td>
            <td class="px-6 py-4 text-sm font-bold text-teal-400">
              {{ new Intl.NumberFormat('lo-LA').format(Number(req.amount)) }}
            </td>
            <td class="px-6 py-4">
              <span
class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                :class="{
                  'bg-yellow-500/20 text-yellow-400': req.status === 'pending',
                  'bg-green-500/20 text-green-400': req.status === 'approved',
                  'bg-red-500/20 text-red-400': req.status === 'rejected',
                }">
                {{ req.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div v-if="req.status === 'pending'" class="flex items-center justify-end gap-2">
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
                  title="Approve"
                  @click="handleApprove(req.requestId)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Reject"
                  @click="openRejectModal(req)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Placeholder -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <span class="text-sm text-slate-500">Page {{ financeStore.topUpRequestsPage }} of {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button :disabled="financeStore.topUpRequestsPage === 1" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(financeStore.topUpRequestsPage - 1)">Prev</button>
          <button :disabled="financeStore.topUpRequestsPage === totalPages" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(financeStore.topUpRequestsPage + 1)">Next</button>
        </div>
      </div>
    </div>


    <!-- Reject Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="rejectModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="rejectModal.open = false"/>
          <div class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white">Reject Top-Up</h2>
              <button class="text-slate-400 hover:text-white transition-colors" @click="rejectModal.open = false">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="rejectModal.error" class="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ rejectModal.error }}</div>

            <form class="flex flex-col gap-4" @submit.prevent="handleRejectSubmit">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason for Rejection</label>
                <textarea v-model="rejectModal.form.reason" rows="3" class="modal-input" required placeholder="Provide a reason..."/>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
                <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" @click="rejectModal.open = false">Cancel</button>
                <button
  type="submit" :disabled="rejectModal.saving"
                  class="px-5 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors disabled:opacity-60 flex items-center gap-2">
                  <svg v-if="rejectModal.saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Reject Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { TopUpRequest } from '../../../domain/models/Finance';
import { ref, reactive, computed, onMounted } from 'vue';
import { useFinanceStore } from '../../../application/stores/finance';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Top-Up Requests — Smart School Admin' });

const financeStore = useFinanceStore();
const statusFilter = ref('');

const totalPages = computed(() => Math.ceil(financeStore.topUpRequestsTotal / 15));

onMounted(() => {
  financeStore.fetchTopUpRequests();
});

const handleFilter = () => {
  financeStore.fetchTopUpRequests({ status: statusFilter.value, page: 1 });
};

const changePage = (page: number) => {
  financeStore.fetchTopUpRequests({ status: statusFilter.value, page });
};

const handleApprove = async (requestId: number) => {
  if (confirm('Are you sure you want to approve this top-up?')) {
    try {
      await financeStore.approveTopUpRequest(requestId);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to approve request'));
    }
  }
};

const rejectModal = reactive({
  open: false,
  saving: false,
  error: '',
  requestId: null as number | null,
  form: {
    reason: ''
  }
});

const openRejectModal = (req: TopUpRequest) => {
  rejectModal.requestId = req.requestId;
  rejectModal.form.reason = '';
  rejectModal.error = '';
  rejectModal.open = true;
};

const handleRejectSubmit = async () => {
  if (!rejectModal.requestId) return;
  rejectModal.saving = true;
  rejectModal.error = '';
  try {
    await financeStore.rejectTopUpRequest(rejectModal.requestId, rejectModal.form.reason);
    rejectModal.open = false;
  } catch (err) {
    rejectModal.error = getErrorMessage(err, 'Failed to reject request');
  } finally {
    rejectModal.saving = false;
  }
};
</script>

<style scoped lang="postcss">
.modal-input {
  @apply w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
