<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-col gap-1">
        <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.reports') }}</p>
        <h2 class="text-2xl font-bold text-white">{{ $t('reports_detail.attendance_analytics') }}</h2>
        <p class="text-sm text-slate-400">{{ $t('reports_detail.attendance_subtitle') }}</p>
      </div>

      <!-- Date Filters -->
      <div class="flex items-center gap-2 bg-[#0d1626]/80 p-1 rounded-xl border border-slate-800">
        <button
v-for="filter in dateFilters" :key="filter.key"
          :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', 
            activeDateFilter === filter.key ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
          ]"
          @click="activeDateFilter = filter.key"
        >
          {{ locale === 'lo' ? filter.labelLo : filter.labelEn }}
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
v-for="stat in summaryStats" :key="stat.titleEn" 
        class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? stat.titleLo : stat.titleEn }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ stat.value }}</span>
          <span :class="['text-[10px] font-semibold flex items-center gap-1', stat.trendingUp ? 'text-teal-400' : 'text-rose-400']">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" :d="stat.trendingUp ? 'M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z' : 'M18 13a1 1 0 01-1 1h-5a1 1 0 110-2h2.586l-4.293-4.293a1 1 0 010-1.414l2-2a1 1 0 011.414 0L15.414 9H13a1 1 0 110-2h5a1 1 0 011 1v5z'" clip-rule="evenodd" />
            </svg>
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
      
      <!-- Class Attendance Bar Chart -->
      <div class="lg:col-span-2 glass-panel p-5 border border-slate-800/80 flex flex-col gap-4">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            {{ $t('reports_detail.rate_by_class') }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ $t('reports_detail.current_term_stats') }}
          </p>
        </div>

        <div class="flex flex-col gap-4 mt-2">
          <div v-for="item in roomStats" :key="item.room" class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-semibold text-slate-300 font-mono">{{ item.room }}</span>
              <span class="text-teal-400 font-bold font-mono">{{ item.rate }}%</span>
            </div>
            <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
class="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000"
                :style="{ width: item.rate + '%' }"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Absence Reason Donut Chart -->
      <div class="glass-panel p-5 border border-slate-800/80 flex flex-col gap-4">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            {{ $t('reports_detail.absence_reasons') }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ $t('reports_detail.excused_vs_unexcused') }}
          </p>
        </div>

        <!-- Custom SVG Donut -->
        <div class="flex items-center justify-center py-4 relative">
          <svg width="160" height="160" viewBox="0 0 160 160" class="-rotate-90">
            <!-- Sick Segment (45%) -> Stroke Dasharray = 2 * PI * r * 0.45 -->
            <circle
cx="80" cy="80" r="50" fill="transparent" stroke="#14b8a6" stroke-width="16"
              stroke-dasharray="141.37 314.16" stroke-dashoffset="0" />
            <!-- Personal Segment (30%) -> Stroke Dasharray = 2 * PI * r * 0.30 -->
            <circle
cx="80" cy="80" r="50" fill="transparent" stroke="#6366f1" stroke-width="16"
              stroke-dasharray="94.25 314.16" stroke-dashoffset="-141.37" />
            <!-- Unexcused Segment (25%) -> Stroke Dasharray = 2 * PI * r * 0.25 -->
            <circle
cx="80" cy="80" r="50" fill="transparent" stroke="#f43f5e" stroke-width="16"
              stroke-dasharray="78.54 314.16" stroke-dashoffset="-235.62" />
          </svg>
          <div class="absolute flex flex-col items-center justify-center text-center">
            <span class="text-xs text-slate-500 font-semibold uppercase tracking-widest">Total</span>
            <span class="text-xl font-bold text-white font-mono">{{ absenteesCount }}</span>
          </div>
        </div>

        <!-- Chart Legends -->
        <div class="flex flex-col gap-2 mt-auto">
          <div v-for="legend in donutLegends" :key="legend.nameEn" class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: legend.color }"/>
              <span class="text-slate-400">{{ locale === 'lo' ? legend.nameLo : legend.nameEn }}</span>
            </div>
            <span class="font-bold text-white font-mono">{{ legend.percentage }}%</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Absentees Directory Table -->
    <div class="glass-panel overflow-hidden flex flex-col gap-4">
      <div class="p-5 pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            {{ $t('reports_detail.absentees_directory') }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ $t('reports_detail.absentees_subtitle') }}
          </p>
        </div>

        <div class="relative max-w-xs w-full">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
v-model="searchQuery" type="text"
            :placeholder="$t('reports_detail.search_student')"
            class="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors" >
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/10">
              <th class="px-6 py-3.5">{{ $t('common.user') }}</th>
              <th class="px-6 py-3.5">{{ $t('common.class') }}</th>
              <th class="px-6 py-3.5">{{ $t('reports_detail.reason_category') }}</th>
              <th class="px-6 py-3.5">{{ $t('reports_detail.notif_status') }}</th>
              <th class="px-6 py-3.5 text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-xs">
            <tr v-for="student in filteredAbsentees" :key="student.id" class="hover:bg-slate-800/10 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold">
                    {{ student.name[0] }}
                  </div>
                  <div>
                    <p class="font-medium text-white">{{ student.name }}</p>
                    <p class="text-[10px] text-slate-500 font-mono">{{ student.code }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 font-mono font-medium text-slate-300">{{ student.class }}</td>
              <td class="px-6 py-4">
                <span
:class="['px-2 py-0.5 rounded-md font-semibold text-[10px]', 
                  student.reasonType === 'sick' ? 'bg-teal-500/10 text-teal-400' :
                  student.reasonType === 'personal' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-rose-500/10 text-rose-400'
                ]">
                  {{ locale === 'lo' ? student.reasonLo : student.reasonEn }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
:class="['inline-flex items-center gap-1 text-[10px] font-semibold', 
                  student.notified ? 'text-teal-400' : 'text-slate-500'
                ]">
                  <span :class="['w-1.5 h-1.5 rounded-full', student.notified ? 'bg-teal-400' : 'bg-slate-600']"/>
                  {{ student.notified ? (locale === 'lo' ? 'ແຈ້ງຜູ້ປົກຄອງແລ້ວ' : 'Parent Notified') : (locale === 'lo' ? 'ຍັງບໍ່ໄດ້ແຈ້ງ' : 'Not Notified') }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
:disabled="student.notified || student.notifying" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-bold rounded-lg border border-slate-700/50 transition-all flex items-center gap-1.5 ml-auto"
                  @click="notifyParent(student.id)">
                  <svg v-if="student.notifying" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>{{ student.notified ? $t('reports_detail.sent') : $t('reports_detail.contact_parent') }}</span>
                </button>
              </td>
            </tr>
            <tr v-if="filteredAbsentees.length === 0">
              <td colspan="5" class="text-center py-8 text-slate-500 font-medium">
                {{ $t('reports_detail.no_students') }}
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
useHead({ title: 'Attendance Analytics — Smart School Admin' });

const { locale } = useI18n();

// Icons mapped manually
const IconChart = shallowRef({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`
});
const IconStar = shallowRef({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>`
});
const IconUserX = shallowRef({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zm-8 12a4 4 0 004 8h1a4 4 0 004-8v-1H5v1zm14-4a3 3 0 00-3-3H6a3 3 0 00-3 3v1h16v-1zm0-4h2m-2 4h2"/></svg>`
});
const IconClock = shallowRef({
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
});

const activeDateFilter = ref('today');
const searchQuery = ref('');

const dateFilters = [
  { key: 'today', labelEn: 'Today', labelLo: 'ມື້ນີ້' },
  { key: '7days', labelEn: 'Last 7 Days', labelLo: '7 ວັນຜ່ານມາ' },
  { key: '30days', labelEn: 'Last 30 Days', labelLo: '30 ວັນຜ່ານມາ' }
];

// Summary Statistics
const summaryStats = computed(() => {
  const isToday = activeDateFilter.value === 'today';
  const is7d = activeDateFilter.value === '7days';

  return [
    {
      titleEn: 'Avg Attendance',
      titleLo: 'ອັດຕາສະເລ່ຍມາຮຽນ',
      value: isToday ? '94.2%' : is7d ? '93.8%' : '92.5%',
      sub: isToday ? '+0.4% vs yesterday' : '+1.2% vs last month',
      trendingUp: true,
      icon: IconChart,
      colorClass: 'text-teal-400'
    },
    {
      titleEn: 'Highest Room',
      titleLo: 'ຫ້ອງມາຮຽນສູງສຸດ',
      value: 'Grade 10A',
      sub: '98.5% attendance rate',
      trendingUp: true,
      icon: IconStar,
      colorClass: 'text-amber-400'
    },
    {
      titleEn: 'Absents Count',
      titleLo: 'ຈຳນວນຂາດຮຽນ',
      value: isToday ? '12' : is7d ? '84' : '312',
      sub: isToday ? '-3 students vs yesterday' : '+8% vs last month',
      trendingUp: false,
      icon: IconUserX,
      colorClass: 'text-rose-400'
    },
    {
      titleEn: 'Excused Absences',
      titleLo: 'ອັດຕາການລາພັກ',
      value: isToday ? '75%' : is7d ? '72%' : '68%',
      sub: 'Based on written requests',
      trendingUp: true,
      icon: IconClock,
      colorClass: 'text-indigo-400'
    }
  ];
});

// Bar charts per room
const roomStats = computed(() => {
  if (activeDateFilter.value === 'today') {
    return [
      { room: 'Grade 10A', rate: 98.5 },
      { room: 'Grade 10B', rate: 96.0 },
      { room: 'Grade 11A', rate: 94.2 },
      { room: 'Grade 11B', rate: 92.0 },
      { room: 'Grade 12A', rate: 91.5 },
      { room: 'Grade 12B', rate: 89.0 }
    ];
  } else if (activeDateFilter.value === '7days') {
    return [
      { room: 'Grade 10A', rate: 97.2 },
      { room: 'Grade 10B', rate: 95.8 },
      { room: 'Grade 11A', rate: 93.9 },
      { room: 'Grade 11B', rate: 91.2 },
      { room: 'Grade 12A', rate: 90.0 },
      { room: 'Grade 12B', rate: 87.5 }
    ];
  } else {
    return [
      { room: 'Grade 10A', rate: 96.0 },
      { room: 'Grade 10B', rate: 94.5 },
      { room: 'Grade 11A', rate: 92.1 },
      { room: 'Grade 11B', rate: 89.8 },
      { room: 'Grade 12A', rate: 88.0 },
      { room: 'Grade 12B', rate: 85.2 }
    ];
  }
});

const absenteesCount = computed(() => {
  if (activeDateFilter.value === 'today') return 12;
  if (activeDateFilter.value === '7days') return 84;
  return 312;
});

// Donut segments metadata
const donutLegends = [
  { nameEn: 'Sick Leave', nameLo: 'ເຈັບປ່ວຍ', color: '#14b8a6', percentage: 45 },
  { nameEn: 'Personal Business', nameLo: 'ວຽກສ່ວນຕົວ', color: '#6366f1', percentage: 30 },
  { nameEn: 'Unexcused / Absent', nameLo: 'ຂາດຮຽນບໍ່ມີເຫດຜົນ', color: '#f43f5e', percentage: 25 }
];

// Absentees details database (Mock list for Today)
const absentees = ref([
  { id: 1, name: 'Somsack Keola', code: 'ST-045', class: 'Grade 10A', reasonType: 'sick', reasonEn: 'Sick', reasonLo: 'ເຈັບປ່ວຍ', notified: false, notifying: false },
  { id: 2, name: 'Anoulack Sengdara', code: 'ST-089', class: 'Grade 10A', reasonType: 'personal', reasonEn: 'Personal', reasonLo: 'ວຽກສ່ວນຕົວ', notified: true, notifying: false },
  { id: 3, name: 'Vanpheng Sysomphone', code: 'ST-112', class: 'Grade 10B', reasonType: 'unexcused', reasonEn: 'Unexcused', reasonLo: 'ຂາດຮຽນບໍ່ມີເຫດຜົນ', notified: false, notifying: false },
  { id: 4, name: 'Phouthone Vongsay', code: 'ST-201', class: 'Grade 11A', reasonType: 'sick', reasonEn: 'Sick', reasonLo: 'ເຈັບປ່ວຍ', notified: false, notifying: false },
  { id: 5, name: 'Souvanh Phommasone', code: 'ST-003', class: 'Grade 11B', reasonType: 'personal', reasonEn: 'Personal', reasonLo: 'ວຽກສ່ວນຕົວ', notified: false, notifying: false },
  { id: 6, name: 'Chanthaphone Inthavong', code: 'ST-312', class: 'Grade 11B', reasonType: 'unexcused', reasonEn: 'Unexcused', reasonLo: 'ຂາດຮຽນບໍ່ມີເຫດຜົນ', notified: false, notifying: false },
  { id: 7, name: 'Bounmy Phengphanh', code: 'ST-194', class: 'Grade 12A', reasonType: 'sick', reasonEn: 'Sick', reasonLo: 'ເຈັບປ່ວຍ', notified: true, notifying: false },
  { id: 8, name: 'Naly Xayyavong', code: 'ST-402', class: 'Grade 12B', reasonType: 'unexcused', reasonEn: 'Unexcused', reasonLo: 'ຂາດຮຽນບໍ່ມີເຫດຜົນ', notified: false, notifying: false }
]);

const filteredAbsentees = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return absentees.value;
  return absentees.value.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.code.toLowerCase().includes(query) ||
    s.class.toLowerCase().includes(query)
  );
});

const notifyParent = async (id: number) => {
  const student = absentees.value.find(s => s.id === id);
  if (!student) return;

  student.notifying = true;
  
  // Simulate API transmission to parent LINE / SMS / Telegram API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  student.notifying = false;
  student.notified = true;
};
</script>
