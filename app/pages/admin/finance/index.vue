<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          :placeholder="'Search wallets...'"
          class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch"
        >
      </div>
      <div class="flex items-center gap-2">
        <select
          v-model="statusFilter"
          class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500"
          @change="handleFilter"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="frozen">Frozen</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <!-- Loading -->
      <div v-if="financeStore.walletsLoading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"/>
      </div>

      <!-- Empty -->
      <div v-else-if="financeStore.wallets.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p>No wallets found.</p>
      </div>

      <!-- Data Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Student</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Wallet ID</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Balance (₭)</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Status</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="wallet in financeStore.wallets" :key="wallet.walletId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold shrink-0">
                  {{ wallet.student?.fullNameEn?.[0] || '?' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-white">{{ wallet.student?.fullNameEn || 'Unknown' }}</p>
                  <p class="text-xs text-slate-500">{{ wallet.student?.studentCode }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-300 font-mono">{{ wallet.walletId }}</td>
            <td class="px-6 py-4 text-sm font-medium text-teal-400">
              {{ new Intl.NumberFormat('lo-LA').format(wallet.balance) }}
            </td>
            <td class="px-6 py-4">
              <span
class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-teal-500/20 text-teal-400': wallet.status === 'active',
                  'bg-slate-500/20 text-slate-400': wallet.status === 'inactive',
                  'bg-red-500/20 text-red-400': wallet.status === 'frozen',
                }">
                {{ wallet.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
                  title="Top Up"
                  @click="openTopUpModal(wallet)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Placeholder -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <span class="text-sm text-slate-500">Page {{ financeStore.walletsPage }} of {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button :disabled="financeStore.walletsPage === 1" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(financeStore.walletsPage - 1)">Prev</button>
          <button :disabled="financeStore.walletsPage === totalPages" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(financeStore.walletsPage + 1)">Next</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Top Up Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="topUpModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="topUpModal.open = false"/>
        <div class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">Top Up Wallet</h2>
            <button class="text-slate-400 hover:text-white transition-colors" @click="topUpModal.open = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="topUpModal.error" class="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ topUpModal.error }}</div>

          <form class="flex flex-col gap-4" @submit.prevent="handleTopUpSubmit">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount (₭) *</label>
              <input v-model.number="topUpModal.form.amount" required type="number" class="modal-input" min="1000" >
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</label>
              <textarea v-model="topUpModal.form.notes" rows="2" class="modal-input"/>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
              <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" @click="topUpModal.open = false">Cancel</button>
              <button
type="submit" :disabled="topUpModal.saving"
                class="px-5 py-2 rounded-lg text-sm font-semibold bg-green-500 hover:bg-green-400 text-white transition-colors disabled:opacity-60 flex items-center gap-2">
                <svg v-if="topUpModal.saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Confirm Top Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useFinanceStore } from '../../../application/stores/finance';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Wallets — Smart School Admin' });

const financeStore = useFinanceStore();
const searchInput = ref('');
const statusFilter = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(financeStore.walletsTotal / 15));

onMounted(() => {
  financeStore.fetchWallets();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    financeStore.fetchWallets({ search: searchInput.value, status: statusFilter.value, page: 1 });
  }, 400);
};

const handleFilter = () => {
  financeStore.fetchWallets({ search: searchInput.value, status: statusFilter.value, page: 1 });
};

const changePage = (page: number) => {
  financeStore.fetchWallets({ search: searchInput.value, status: statusFilter.value, page });
};

const topUpModal = reactive({
  open: false,
  saving: false,
  error: '',
  walletId: null as number | null,
  form: {
    amount: 0,
    notes: ''
  }
});

const openTopUpModal = (wallet: any) => {
  topUpModal.walletId = wallet.walletId;
  topUpModal.form.amount = 0;
  topUpModal.form.notes = '';
  topUpModal.error = '';
  topUpModal.open = true;
};

const handleTopUpSubmit = async () => {
  if (!topUpModal.walletId) return;
  topUpModal.saving = true;
  topUpModal.error = '';
  try {
    await financeStore.topUpWallet(topUpModal.walletId, topUpModal.form.amount, topUpModal.form.notes);
    topUpModal.open = false;
  } catch (err: any) {
    topUpModal.error = err.message || 'Failed to top up wallet';
  } finally {
    topUpModal.saving = false;
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
