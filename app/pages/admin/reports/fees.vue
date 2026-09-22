<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-col gap-1">
        <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.reports') }}</p>
        <h2 class="text-2xl font-bold text-white">{{ $t('reports_detail.fees_analytics') }}</h2>
        <p class="text-sm text-slate-400">{{ $t('reports_detail.fees_subtitle') }}</p>
      </div>

      <!-- Term & Year Filters -->
      <div class="flex items-center gap-3">
        <select v-model="selectedYear" class="filter-select font-mono font-medium">
          <option value="2025-2026">2025 - 2026</option>
          <option value="2026-2027">2026 - 2027</option>
        </select>
        <select v-model="selectedTerm" class="filter-select font-mono font-medium">
          <option value="sem1">Semester 1</option>
          <option value="sem2">Semester 2</option>
        </select>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
v-for="stat in summaryStats" :key="stat.titleEn" 
        class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider font-semibold">
            {{ locale === 'lo' ? stat.titleLo : stat.titleEn }}
          </span>
          <span class="text-xl font-bold text-white font-mono shrink-0">{{ stat.value }}</span>
          <span class="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            {{ stat.sub }}
          </span>
        </div>
        <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60', stat.colorClass]">
          <component :is="stat.icon" class="h-5 w-5" />
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Monthly Collections SVG Line Chart -->
      <div class="lg:col-span-2 glass-panel p-5 border border-slate-800/80 flex flex-col gap-4">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            {{ $t('reports_detail.collection_trend') }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ $t('reports_detail.collection_trend_sub') }}
          </p>
        </div>

        <!-- Custom SVG Line Chart -->
        <div class="relative w-full h-[180px] mt-4 select-none">
          <svg viewBox="0 0 500 180" class="w-full h-full">
            <!-- Grid Lines -->
            <line x1="40" y1="20" x2="480" y2="20" stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4" />
            <line x1="40" y1="70" x2="480" y2="70" stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4" />
            <line x1="40" y1="120" x2="480" y2="120" stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4" />
            <line x1="40" y1="150" x2="480" y2="150" stroke="#334155" stroke-width="1" />

            <!-- Y Axis Label -->
            <text x="5" y="25" fill="#64748b" font-size="8" font-family="monospace">40M</text>
            <text x="5" y="75" fill="#64748b" font-size="8" font-family="monospace">25M</text>
            <text x="5" y="125" fill="#64748b" font-size="8" font-family="monospace">10M</text>
            <text x="5" y="153" fill="#64748b" font-size="8" font-family="monospace">0</text>

            <!-- Gradient Area under Line -->
            <path d="M 60,130 Q 130,50 200,90 T 340,30 T 460,70 L 460,150 L 60,150 Z" fill="url(#chartGrad)" opacity="0.1" />

            <!-- Smooth Spline Path -->
            <path d="M 60,130 Q 130,50 200,90 T 340,30 T 460,70" fill="none" stroke="#a855f7" stroke-width="3" stroke-linecap="round" />

            <!-- Data Nodes -->
            <circle cx="60" cy="130" r="5" fill="#a855f7" stroke="#0d1626" stroke-width="2" />
            <circle cx="140" cy="72" r="5" fill="#a855f7" stroke="#0d1626" stroke-width="2" />
            <circle cx="220" cy="98" r="5" fill="#a855f7" stroke="#0d1626" stroke-width="2" />
            <circle cx="300" cy="54" r="5" fill="#a855f7" stroke="#0d1626" stroke-width="2" />
            <circle cx="380" cy="42" r="5" fill="#a855f7" stroke="#0d1626" stroke-width="2" />
            <circle cx="460" cy="70" r="5" fill="#a855f7" stroke="#0d1626" stroke-width="2" />

            <!-- X Axis Labels -->
            <text x="50" y="168" fill="#64748b" font-size="8">Oct</text>
            <text x="130" y="168" fill="#64748b" font-size="8">Nov</text>
            <text x="210" y="168" fill="#64748b" font-size="8">Dec</text>
            <text x="290" y="168" fill="#64748b" font-size="8">Jan</text>
            <text x="370" y="168" fill="#64748b" font-size="8">Feb</text>
            <text x="450" y="168" fill="#64748b" font-size="8">Mar</text>

            <!-- Definitions -->
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#a855f7" />
                <stop offset="100%" stop-color="#a855f7" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <!-- Payment Progress by Class -->
      <div class="glass-panel p-5 border border-slate-800/80 flex flex-col gap-4">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            {{ $t('reports_detail.payment_by_grade') }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ $t('reports_detail.tuition_completion_sub') }}
          </p>
        </div>

        <div class="flex flex-col gap-4 mt-2">
          <div v-for="item in progressStats" :key="item.grade" class="flex flex-col gap-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="font-semibold text-slate-300">{{ item.grade }}</span>
              <span class="text-slate-400 font-mono">{{ item.paid }}/{{ item.total }} {{ locale === 'lo' ? 'ຄົນ' : 'Paid' }}</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div
class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                  :style="{ width: item.percent + '%' }"/>
              </div>
              <span class="text-[10px] font-bold text-purple-400 font-mono shrink-0 w-8 text-right">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Recent Billings Log -->
    <div class="glass-panel overflow-hidden flex flex-col gap-4">
      <div class="p-5 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            {{ $t('reports_detail.recent_billings') }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ $t('reports_detail.recent_billings_sub') }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button :class="['px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all', statusFilter === 'all' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300']" @click="statusFilter = 'all'">All</button>
          <button :class="['px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all', statusFilter === 'mobile_banking' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300']" @click="statusFilter = 'mobile_banking'">BCELOne</button>
          <button :class="['px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all', statusFilter === 'cash' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300']" @click="statusFilter = 'cash'">Cash</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/10">
              <th class="px-6 py-3.5">{{ locale === 'lo' ? 'ເລກອ້າງອີງ' : 'Ref No' }}</th>
              <th class="px-6 py-3.5">{{ $t('common.user') }}</th>
              <th class="px-6 py-3.5">{{ locale === 'lo' ? 'ຈຳນວນເງິນ' : 'Amount' }}</th>
              <th class="px-6 py-3.5">{{ locale === 'lo' ? 'ຊ່ອງທາງ' : 'Payment Method' }}</th>
              <th class="px-6 py-3.5">{{ locale === 'lo' ? 'ວັນເວລາ' : 'Date / Time' }}</th>
              <th class="px-6 py-3.5 text-right">{{ $t('common.status') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-xs font-medium">
            <tr v-for="tx in filteredTransactions" :key="tx.ref" class="hover:bg-slate-800/10 transition-colors">
              <td class="px-6 py-4 font-mono text-slate-400 font-semibold">{{ tx.ref }}</td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-white">{{ tx.studentName }}</p>
                  <p class="text-[10px] text-slate-500 font-mono">{{ tx.studentCode }} ({{ tx.class }})</p>
                </div>
              </td>
              <td class="px-6 py-4 font-mono font-bold text-slate-200">{{ formatAmount(tx.amount) }} LAK</td>
              <td class="px-6 py-4">
                <span
:class="['px-2 py-0.5 rounded-md font-semibold text-[10px]', 
                  tx.method === 'BCELOne' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                ]">
                  {{ tx.method }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-500 font-mono text-[11px]">{{ tx.datetime }}</td>
              <td class="px-6 py-4 text-right">
                <span class="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] font-bold rounded-full">
                  {{ $t('reports_detail.approved') }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="6" class="text-center py-8 text-slate-500">
                No billing logs found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Fee Reports — Smart School Admin' });

const { locale } = useI18n();

// Icons
const IconDatabase = shallowRef({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"/></svg>`
});
const IconCheckCircle = shallowRef({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
});
const IconTrendingDown = shallowRef({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>`
});
const IconPercent = shallowRef({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h-3a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3m-7.707-1.707l7-7m0 0h-3m3 0v3"/></svg>`
});

const selectedYear = ref('2025-2026');
const selectedTerm = ref('sem1');
const statusFilter = ref('all');

// Formats big cash sums
const formatAmount = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Summary stats dependent on filter
const summaryStats = computed(() => {
  const isSem1 = selectedTerm.value === 'sem1';
  return [
    {
      titleEn: 'Total Invoiced',
      titleLo: 'ຍອດອອກໃບບິນທັງໝົດ',
      value: isSem1 ? '180,000,000' : '220,000,000',
      sub: 'Tuition + Material fees',
      trendingUp: true,
      icon: IconDatabase,
      colorClass: 'text-purple-400'
    },
    {
      titleEn: 'Total Collected',
      titleLo: 'ຍອດເກັບເງິນໄດ້ແລ້ວ',
      value: isSem1 ? '142,500,000' : '110,000,000',
      sub: isSem1 ? '79.2% collection rate' : '50.0% collection rate',
      trendingUp: true,
      icon: IconCheckCircle,
      colorClass: 'text-teal-400'
    },
    {
      titleEn: 'Outstanding Balance',
      titleLo: 'ຍອດຄ້າງຊຳລະ',
      value: isSem1 ? '37,500,000' : '110,000,000',
      sub: 'Unpaid invoice balance',
      trendingUp: false,
      icon: IconTrendingDown,
      colorClass: 'text-rose-400'
    },
    {
      titleEn: 'Payment Completion',
      titleLo: 'ອັດຕາຊຳລະສຳເລັດ',
      value: isSem1 ? '79.2%' : '50.0%',
      sub: isSem1 ? '+2.4% vs last year' : 'Under billing phase',
      trendingUp: true,
      icon: IconPercent,
      colorClass: 'text-indigo-400'
    }
  ];
});

// Grade payment progress stats
const progressStats = computed(() => {
  if (selectedTerm.value === 'sem1') {
    return [
      { grade: 'Grade 10', paid: 34, total: 40, percent: 85 },
      { grade: 'Grade 11', paid: 31, total: 40, percent: 78 },
      { grade: 'Grade 12', paid: 29, total: 40, percent: 74 }
    ];
  } else {
    return [
      { grade: 'Grade 10', paid: 22, total: 40, percent: 55 },
      { grade: 'Grade 11', paid: 20, total: 40, percent: 50 },
      { grade: 'Grade 12', paid: 18, total: 40, percent: 45 }
    ];
  }
});

// Mock transaction history
const transactions = [
  { ref: 'TX-50493', studentName: 'Somsack Keola', studentCode: 'ST-045', class: '10A', amount: 1500000, method: 'BCELOne', methodKey: 'mobile_banking', datetime: '2026-07-03 11:20' },
  { ref: 'TX-50492', studentName: 'Anoulack Sengdara', studentCode: 'ST-089', class: '10A', amount: 1500000, method: 'Cash', methodKey: 'cash', datetime: '2026-07-03 09:45' },
  { ref: 'TX-50489', studentName: 'Keo Outhaivong', studentCode: 'ST-103', class: '11A', amount: 1500000, method: 'BCELOne', methodKey: 'mobile_banking', datetime: '2026-07-02 16:30' },
  { ref: 'TX-50487', studentName: 'Malayphone Chanthasack', studentCode: 'ST-294', class: '12B', amount: 2000000, method: 'BCELOne', methodKey: 'mobile_banking', datetime: '2026-07-02 14:15' },
  { ref: 'TX-50485', studentName: 'Phouthone Vongsay', studentCode: 'ST-201', class: '11B', amount: 1500000, method: 'Cash', methodKey: 'cash', datetime: '2026-07-02 10:05' }
];

const filteredTransactions = computed(() => {
  if (statusFilter.value === 'all') return transactions;
  return transactions.filter(t => t.methodKey === statusFilter.value);
});
</script>

<style scoped lang="postcss">
.filter-select {
  @apply px-3 py-1.5 bg-[#0d1626]/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors cursor-pointer;
}
</style>
