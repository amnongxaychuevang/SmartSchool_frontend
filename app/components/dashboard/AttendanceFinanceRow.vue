<template>
  <div class="flex flex-col gap-4">
    <!-- Header: Live School Attendance Status -->
    <div
      class="glass-panel p-6 page-enter"
      style="animation-delay: 0.48s"
    >
      <h3 class="text-lg font-bold text-white flex items-center gap-2">
        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        {{ $t('admin.attendance_status') }}
      </h3>
    </div>

    <!-- Finance Cards (3 Columns) -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Income Card -->
      <div
        class="glass-panel p-6 flex flex-col gap-3 page-enter relative overflow-hidden group"
        style="animation-delay: 0.52s"
      >
        <div class="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wide text-slate-400">{{ $t('admin.income_today') }}</span>
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-white tnum">{{ f.kip(incomeToday) }}</h3>
          <p class="text-xs text-slate-500 mt-1">{{ incomeTodayDelta }}</p>
        </div>
      </div>

      <!-- Expenses Card -->
      <div
        class="glass-panel p-6 flex flex-col gap-3 page-enter relative overflow-hidden group"
        style="animation-delay: 0.56s"
      >
        <div class="absolute -top-8 -right-8 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wide text-slate-400">{{ $t('admin.expenses_today') }}</span>
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v20M7 19h10M12 2a8 8 0 0 1 8 8v4a8 8 0 0 1-16 0v-4a8 8 0 0 1 8-8z" />
              </svg>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-white tnum">{{ f.kip(expensesToday) }}</h3>
          <p class="text-xs text-slate-500 mt-1">{{ expensesTodayDelta }}</p>
        </div>
      </div>

      <!-- Balance Card -->
      <div
        class="glass-panel p-6 flex flex-col gap-3 page-enter relative overflow-hidden group"
        style="animation-delay: 0.6s"
      >
        <div class="absolute -top-8 -right-8 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase tracking-wide text-slate-400">{{ $t('admin.current_balance') }}</span>
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <h3 class="text-2xl font-bold text-white tnum">{{ f.kip(currentBalance) }}</h3>
          <p class="text-xs text-slate-500 mt-1">{{ balanceInfo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useFormat } from '../../composables/useFormat';
import { useSocket } from '../../composables/useSocket';
import { adminRepository } from '../../infrastructure/api/AdminRepository';

const f = useFormat();
const { t } = useI18n();
const { financeData } = useSocket();

const incomeToday = ref(0);
const expensesToday = ref(0);
const currentBalance = ref(0);

const incomeTodayDelta = computed(() => {
  if (incomeToday.value > 0) return t('admin.increase_from_yesterday');
  return t('admin.no_income');
});

const expensesTodayDelta = computed(() => {
  if (expensesToday.value > 0) return t('admin.expenses_this_session');
  return t('admin.no_expenses');
});

const balanceInfo = computed(() => {
  if (currentBalance.value > 1000000) return t('admin.healthy_balance');
  if (currentBalance.value > 500000) return t('admin.moderate_balance');
  return t('admin.low_balance');
});

async function fetchFinanceOverview() {
  try {
    const data = await adminRepository.getFinanceOverview();
    incomeToday.value = data.incomeToday || 0;
    expensesToday.value = data.expensesToday || 0;
    currentBalance.value = data.currentBalance || 0;
  } catch (err) {
    console.error('Failed to fetch finance overview:', err);
  }
}

watch(financeData, (newData) => {
  if (newData) {
    incomeToday.value = newData.incomeToday;
    expensesToday.value = newData.expensesToday;
    currentBalance.value = newData.currentBalance;
  }
});

onMounted(() => {
  fetchFinanceOverview();
});
</script>
