<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-col gap-1">
        <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.reports') }}</p>
        <h2 class="text-2xl font-bold text-white">{{ locale === 'lo' ? 'ລາຍງານກະເປົາເງິນອີເລັກໂທຣນິກ' : 'Wallet & Top-up Report' }}</h2>
        <p class="text-sm text-slate-400">{{ locale === 'lo' ? 'ຕິດຕາມຍອດເງິນ, ການເຕີມເງິນ ແລະ ສະຖານະກະເປົາເງິນຂອງນັກຮຽນ' : 'Monitor wallet balances, top-up requests, and wallet statuses' }}</p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button class="btn-secondary" @click="refreshData">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('common.refresh') }}
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ກະເປົາເງິນທັງໝົດ' : 'Total Wallets' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ totalWallets }}</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-teal-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ຍອດເງິນລວມທັງໝົດ' : 'Total System Balance' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ totalBalance.toLocaleString() }} <span class="text-sm font-normal text-slate-500">LAK</span></span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ລໍຖ້າເຕີມເງິນ' : 'Pending Top-ups' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ pendingTopUps }}</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-amber-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ກະເປົາຖືກລັອກ (Frozen)' : 'Frozen Wallets' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ frozenWallets }}</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-rose-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Filters & Table -->
    <div class="glass-panel overflow-hidden flex flex-col mt-2">
      <div class="p-5 border-b border-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h3 class="text-lg font-bold text-white">{{ locale === 'lo' ? 'ລາຍຊື່ກະເປົາເງິນນັກຮຽນ' : 'Student Wallets Directory' }}</h3>
        
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Filter by Status -->
          <select v-model="filterStatus" class="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500">
            <option value="all">{{ locale === 'lo' ? 'ທັງໝົດ' : 'All Status' }}</option>
            <option value="active">{{ locale === 'lo' ? 'ໃຊ້ງານປົກກະຕິ (Active)' : 'Active' }}</option>
            <option value="frozen">{{ locale === 'lo' ? 'ຖືກລັອກ (Frozen)' : 'Frozen' }}</option>
          </select>
          
          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
v-model="searchQuery" type="text" :placeholder="locale === 'lo' ? 'ຄົ້ນຫາຊື່ ຫຼື ລະຫັດ...' : 'Search student...'"
              class="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              @keyup.enter="refreshData" >
          </div>
        </div>
      </div>

      <div class="overflow-x-auto relative min-h-[300px]">
        <!-- Loading State -->
        <div v-if="financeStore.walletsLoading" class="absolute inset-0 z-10 bg-[#0a101d]/60 backdrop-blur-sm flex flex-col items-center justify-center text-teal-400">
          <svg class="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span class="text-sm font-semibold tracking-wider animate-pulse">{{ $t('common.loading') }}</span>
        </div>

        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/20">
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">{{ locale === 'lo' ? 'ນັກຮຽນ' : 'Student' }}</th>
              <th class="px-6 py-3 text-right">{{ locale === 'lo' ? 'ຍອດເງິນຄົງເຫຼືອ' : 'Balance (LAK)' }}</th>
              <th class="px-6 py-3 text-right">{{ locale === 'lo' ? 'ຈຳກັດລາຍວັນ' : 'Daily Limit' }}</th>
              <th class="px-6 py-3 text-center">{{ locale === 'lo' ? 'ສະຖານະ' : 'Status' }}</th>
              <th class="px-6 py-3 text-right">{{ locale === 'lo' ? 'ອັບເດດລ່າສຸດ' : 'Last Updated' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-xs">
            <tr v-for="wallet in filteredWallets" :key="wallet.walletId" class="hover:bg-slate-800/10 transition-colors">
              <td class="px-6 py-3 text-slate-500 font-mono">#{{ wallet.walletId }}</td>
              <td class="px-6 py-3">
                <div class="flex flex-col">
                  <span class="font-bold text-white">{{ locale === 'lo' ? wallet.student?.fullNameLo : wallet.student?.fullNameEn }}</span>
                  <span class="text-[10px] text-slate-500 font-mono">{{ wallet.student?.studentCode }}</span>
                </div>
              </td>
              <td class="px-6 py-3 text-right">
                <span class="font-bold font-mono text-emerald-400 text-[13px] tracking-wider">
                  {{ Number(wallet.balance).toLocaleString() }}
                </span>
              </td>
              <td class="px-6 py-3 text-right text-slate-400 font-mono">
                {{ wallet.student?.spendingLimit?.dailyMax ? Number(wallet.student.spendingLimit.dailyMax).toLocaleString() : '∞' }}
              </td>
              <td class="px-6 py-3 text-center">
                <span
:class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold tracking-wide',
                  wallet.status === 'active' ? 'bg-teal-500/10 text-teal-400' : 'bg-rose-500/10 text-rose-400'
                ]">
                  {{ wallet.status === 'active' ? (locale === 'lo' ? 'ປົກກະຕິ' : 'Active') : (locale === 'lo' ? 'ຖືກລັອກ' : 'Frozen') }}
                </span>
              </td>
              <td class="px-6 py-3 text-right text-slate-500 font-mono text-[11px]">
                {{ new Date(wallet.updatedAt).toLocaleDateString() }}
              </td>
            </tr>
            <tr v-if="filteredWallets.length === 0 && !financeStore.walletsLoading">
              <td colspan="6" class="text-center py-10 text-slate-500 font-medium">
                {{ locale === 'lo' ? 'ບໍ່ພົບຂໍ້ມູນກະເປົາເງິນ' : 'No wallet records found' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="p-4 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-400 bg-slate-900/20">
        <span>{{ locale === 'lo' ? 'ສະແດງ' : 'Showing' }} {{ filteredWallets.length }} {{ locale === 'lo' ? 'ລາຍການ' : 'records' }}</span>
        <div class="flex items-center gap-1">
          <button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors" :disabled="currentPage === 1" @click="changePage(-1)">
             &laquo; {{ $t('common.prev') }}
          </button>
          <span class="px-3 text-white font-mono">{{ currentPage }}</span>
          <button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white transition-colors" :disabled="financeStore.wallets.length < 20" @click="changePage(1)">
            {{ $t('common.next') }} &raquo;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useFinanceStore } from '~/application/stores/finance';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Wallet Report — Smart School Admin' });

const { locale } = useI18n();
const financeStore = useFinanceStore();

const filterStatus = ref('all');
const searchQuery = ref('');
const currentPage = ref(1);

const refreshData = async () => {
  await financeStore.fetchWallets({ 
    page: currentPage.value,
    search: searchQuery.value,
    status: filterStatus.value === 'all' ? undefined : filterStatus.value
  });
  
  // Also fetch top up requests for the stats
  await financeStore.fetchTopUpRequests({ status: 'pending' });
};

onMounted(() => {
  refreshData();
});

watch([currentPage, filterStatus], () => {
  refreshData();
});

const changePage = (step: number) => {
  if (currentPage.value + step > 0) {
    currentPage.value += step;
  }
};

const filteredWallets = computed(() => {
  return financeStore.wallets || [];
});

// Stats computations
const totalWallets = computed(() => financeStore.walletsTotal || 0);
const totalBalance = computed(() => {
  return (financeStore.wallets || []).reduce((sum, wallet) => sum + Number(wallet.balance), 0);
});
const pendingTopUps = computed(() => financeStore.topUpRequestsTotal || 0);
const frozenWallets = computed(() => (financeStore.wallets || []).filter(w => w.status === 'frozen').length);
</script>
