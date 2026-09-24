<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-col gap-1">
        <p class="text-xs font-semibold text-rose-400 uppercase tracking-widest">{{ $t('nav.reports') }}</p>
        <h2 class="text-2xl font-bold text-white">{{ locale === 'lo' ? 'ບົດລາຍງານສະຖິຕິນັກຮຽນ' : 'Student Demographics Report' }}</h2>
        <p class="text-sm text-slate-400">{{ locale === 'lo' ? 'ພາບລວມຂໍ້ມູນສະຖິຕິ ແລະ ປະຊາກອນສາດຂອງນັກຮຽນ' : 'Overview of student statistics and demographics' }}</p>
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

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ນັກຮຽນທັງໝົດ' : 'Total Students' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ totalStudents }}</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ກຳລັງຮຽນຢູ່' : 'Active Status' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ activeStudents }}</span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-emerald-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ນັກຮຽນຊາຍ' : 'Male Students' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ maleStudents }} <span class="text-sm text-slate-500 font-normal">({{ Math.round((maleStudents/totalStudents)*100) || 0 }}%)</span></span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-sky-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="10" cy="14" r="5"/>
            <line x1="13.5" y1="10.5" x2="19" y2="5"/>
            <polyline points="14 5 19 5 19 10"/>
          </svg>
        </div>
      </div>

      <div class="glass-panel p-5 border border-slate-800/80 flex items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">
            {{ locale === 'lo' ? 'ນັກຮຽນຍິງ' : 'Female Students' }}
          </span>
          <span class="text-2xl font-bold text-white font-mono">{{ femaleStudents }} <span class="text-sm text-slate-500 font-normal">({{ Math.round((femaleStudents/totalStudents)*100) || 0 }}%)</span></span>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-800/60 text-pink-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="10" r="5"/>
            <line x1="12" y1="15" x2="12" y2="21"/>
            <line x1="9" y1="18" x2="15" y2="18"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Distribution Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Status Distribution -->
      <div class="glass-panel p-5 border border-slate-800/80 flex flex-col gap-4">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            {{ locale === 'lo' ? 'ສະຖານະນັກຮຽນ' : 'Status Distribution' }}
          </h3>
        </div>
        <div class="flex flex-col gap-4 mt-2">
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-semibold text-emerald-400">{{ locale === 'lo' ? 'ກຳລັງຮຽນ' : 'Active' }}</span>
              <span class="font-mono text-slate-300">{{ activeStudents }}</span>
            </div>
            <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-400 rounded-full" :style="{ width: `${(activeStudents/totalStudents)*100 || 0}%` }"/>
            </div>
          </div>
          
          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-semibold text-indigo-400">{{ locale === 'lo' ? 'ຮຽນຈົບແລ້ວ' : 'Graduated' }}</span>
              <span class="font-mono text-slate-300">{{ graduatedStudents }}</span>
            </div>
            <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-400 rounded-full" :style="{ width: `${(graduatedStudents/totalStudents)*100 || 0}%` }"/>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-semibold text-rose-400">{{ locale === 'lo' ? 'ຍ້າຍໂຮງຮຽນ' : 'Transferred' }}</span>
              <span class="font-mono text-slate-300">{{ transferredStudents }}</span>
            </div>
            <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-rose-400 rounded-full" :style="{ width: `${(transferredStudents/totalStudents)*100 || 0}%` }"/>
            </div>
          </div>
        </div>
      </div>

      <!-- Gender Distribution Bar -->
      <div class="glass-panel p-5 border border-slate-800/80 flex flex-col gap-4">
        <div>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider">
            {{ locale === 'lo' ? 'ອັດຕາສ່ວນເພດ' : 'Gender Ratio' }}
          </h3>
        </div>
        
        <div class="flex items-center justify-center py-6">
          <div class="w-full flex h-8 rounded-xl overflow-hidden shadow-lg border border-slate-700/50">
            <div
class="bg-sky-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all" 
                 :style="{ width: `${(maleStudents/totalStudents)*100 || 50}%` }">
              {{ maleStudents > 0 ? (locale === 'lo' ? 'ຊາຍ' : 'Male') : '' }}
            </div>
            <div
class="bg-pink-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all" 
                 :style="{ width: `${(femaleStudents/totalStudents)*100 || 50}%` }">
              {{ femaleStudents > 0 ? (locale === 'lo' ? 'ຍິງ' : 'Female') : '' }}
            </div>
          </div>
        </div>
        
        <div class="flex justify-between text-xs mt-auto">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-sky-500"/>
            <span class="text-slate-400">{{ maleStudents }} {{ locale === 'lo' ? 'ຄົນ' : 'Students' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-pink-500"/>
            <span class="text-slate-400">{{ femaleStudents }} {{ locale === 'lo' ? 'ຄົນ' : 'Students' }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '~/application/stores/admin';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Student Demographics — Smart School Admin' });

const { locale } = useI18n();
const adminStore = useAdminStore();

const refreshData = async () => {
  // Fetch up to 1000 students to get a good demographic overview
  // Real world: backend should have a dedicated /analytics/students endpoint
  await adminStore.fetchStudents({ page: 1 }); 
};

onMounted(() => {
  refreshData();
});

// Computed properties for analytics
const studentsList = computed(() => adminStore.students || []);

const totalStudents = computed(() => adminStore.studentsTotal || studentsList.value.length);

const activeStudents = computed(() => studentsList.value.filter(s => s.status === 'active').length);
const graduatedStudents = computed(() => studentsList.value.filter(s => s.status === 'graduated').length);
const transferredStudents = computed(() => studentsList.value.filter(s => s.status === 'transferred').length);

const maleStudents = computed(() => studentsList.value.filter(s => s.gender === 'male').length);
const femaleStudents = computed(() => studentsList.value.filter(s => s.gender === 'female').length);
</script>
