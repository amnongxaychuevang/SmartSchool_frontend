<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.attendance') }}</p>
      <h2 class="text-2xl font-bold text-white">{{ $t('attendance_simulator.title') }}</h2>
      <p class="text-sm text-slate-400">
        {{ $t('attendance_simulator.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Settings Panel -->
      <div class="lg:col-span-1 flex flex-col gap-4 bg-slate-900/20 border border-slate-800/80 p-5 rounded-2xl h-fit">
        <div class="pb-2 border-b border-slate-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        <!-- Gate Location Selection -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('attendance_simulator.gate_location') }}</label>
          <div class="relative">
            <select v-model="gateLocation" class="simulator-input text-slate-300 pr-10 appearance-none">
              <option value="Main Gate">Main Gate (ປະຕູໃຫຍ່)</option>
              <option value="Back Gate">Back Gate (ປະຕູຫຼັງ)</option>
              <option value="Canteen Gate">Canteen Gate (ປະຕູໂຮງອາຫານ)</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Action Selection -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('attendance_simulator.scan_action') }}</label>
          <div class="grid grid-cols-2 gap-2 bg-[#080e1a]/85 p-1 rounded-xl border border-slate-800">
            <button
:class="['py-2 rounded-lg text-xs font-bold transition-all', 
                scanType === 'check_in' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-500 hover:text-slate-300'
              ]"
              @click="scanType = 'check_in'"
            >
              {{ $t('attendance_simulator.check_in') }} (ເຂົ້າຮຽນ)
            </button>
            <button
:class="['py-2 rounded-lg text-xs font-bold transition-all', 
                scanType === 'check_out' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-500 hover:text-slate-300'
              ]"
              @click="scanType = 'check_out'"
            >
              {{ $t('attendance_simulator.check_out') }} (ອອກຮຽນ)
            </button>
          </div>
        </div>

        <!-- Student Dropdown -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('attendance_simulator.select_student') }}</label>
          <div class="relative">
            <select v-model="selectedStudentId" class="simulator-input text-slate-300 pr-10 appearance-none" @change="onStudentSelect">
              <option :value="null" disabled>{{ $t('attendance_simulator.choose_student') }}</option>
              <option v-for="student in adminStore.students" :key="student.studentId" :value="student.studentId">
                {{ student.fullNameEn }} ({{ student.studentCode }})
              </option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- Card UID input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('attendance_simulator.card_uid') }}</label>
          <input v-model="cardUid" type="text" placeholder="e.g. CARD-UID-12345" class="simulator-input font-mono" >
        </div>
      </div>

      <!-- Card Tapper Simulator & Feedback -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Interactive Card Reader Panel -->
        <div class="glass-panel p-6 border border-slate-800/80 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group">
          <!-- Background ripple animations on active scan -->
          <div v-if="scanning" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-[200px] h-[200px] rounded-full border border-teal-500/30 animate-ping absolute"/>
            <div class="w-[300px] h-[300px] rounded-full border border-teal-500/20 animate-ping absolute [animation-delay:0.3s]"/>
          </div>

          <!-- RFID Scanner Ring -->
          <button
:disabled="scanning || !cardUid" :class="['relative w-40 h-40 rounded-full flex flex-col items-center justify-center border-2 transition-all cursor-pointer select-none outline-none ring-offset-current focus:outline-none',
              !cardUid ? 'border-slate-800 text-slate-600 bg-slate-900/10 cursor-not-allowed' :
              scanType === 'check_in' 
                ? 'border-teal-500/30 bg-teal-500/5 hover:border-teal-500/50 hover:shadow-[0_0_25px_rgba(20,184,166,0.15)] text-teal-400' 
                : 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.15)] text-orange-400'
            ]"
            @click="triggerCardScan"
          >
            <!-- NFC/Wireless Waves -->
            <svg
xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2 transition-transform duration-300" 
              :class="{'scale-110': scanning, 'group-hover:translate-y-[-4px]': cardUid}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 9a3 3 0 016 0" />
            </svg>
            <span class="text-[10px] font-bold uppercase tracking-widest text-center max-w-[100px]">
              {{ scanning ? $t('attendance_simulator.scanning') : $t('attendance_simulator.simulate_tap') }}
            </span>
          </button>
        </div>

        <!-- Scan Result display -->
        <Transition name="fade-slide">
          <div
v-if="scanResult" :class="['glass-panel p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300',
            scanResult.success 
              ? (scanResult.logType === 'check_in' ? 'border-teal-500/30 bg-teal-900/10' : 'border-orange-500/30 bg-orange-900/10')
              : 'border-red-500/30 bg-red-900/10'
          ]">
            <div class="flex items-center gap-4">
              <!-- Avatar check indicator -->
              <div
:class="['w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-white',
                scanResult.success 
                  ? (scanResult.logType === 'check_in' ? 'bg-teal-500/20 text-teal-400' : 'bg-orange-500/20 text-orange-400')
                  : 'bg-red-500/20 text-red-400'
              ]">
                <svg v-if="scanResult.success" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <!-- Student and Card details -->
              <div class="flex flex-col gap-0.5">
                <h4 class="text-sm font-bold text-white">
                  {{ scanResult.success ? $t('attendance_simulator.swipe_success') : $t('attendance_simulator.scan_failed') }}
                </h4>
                <p class="text-xs text-slate-300">
                  {{ scanResult.studentName }} ({{ scanResult.studentCode }})
                </p>
                <p class="text-[10px] text-slate-500 font-mono">
                  Gate: {{ scanResult.gateLocation }} • Time: {{ formatTime(scanResult.time) }}
                </p>
              </div>
            </div>

            <!-- Status tag indicator -->
            <div class="shrink-0">
              <span
:class="['px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                scanResult.success 
                  ? (scanResult.logType === 'check_in' ? 'bg-teal-500/20 text-teal-400' : 'bg-orange-500/20 text-orange-400')
                  : 'bg-red-500/20 text-red-400'
              ]">
                {{ scanResult.success ? (scanResult.logType === 'check_in' ? $t('attendance_simulator.check_in') : $t('attendance_simulator.check_out')) : $t('attendance_simulator.scan_failed') }}
              </span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from '../../../infrastructure/api/types';
import type { ScanResult } from '../../../domain/models/School';
import { ref, onMounted } from 'vue';
import { useAdminStore } from '../../../application/stores/admin';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Attendance Scan Simulator — Smart School Admin' });

const { locale } = useI18n();
const adminStore = useAdminStore();
const apiClient = useApiClient();

const gateLocation = ref('Main Gate');
const scanType = ref<'check_in' | 'check_out'>('check_in');
const selectedStudentId = ref<number | null>(null);
const cardUid = ref('');
const scanning = ref(false);
const scanResult = ref<{ success: boolean; studentName: string; studentCode: string; gateLocation: string; logType?: 'check_in' | 'check_out'; time: string } | null>(null);

onMounted(() => {
  adminStore.fetchStudents({ page: 1 });
});

// Automatic card mapping based on selected student code
const onStudentSelect = () => {
  if (!selectedStudentId.value) return;
  const student = adminStore.students.find(s => s.studentId === selectedStudentId.value);
  if (student) {
    cardUid.value = `CARD-UID-${student.studentCode}`;
  }
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString(locale.value === 'lo' ? 'lo-LA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Hit backend /attendance/scan API to record attendance & broadcast event
const triggerCardScan = async () => {
  if (!cardUid.value) return;

  scanning.value = true;
  scanResult.value = null;

  try {
    // Custom simulated latency for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    // Resolve student info locally to show profile details
    let studentName = 'Unknown Student';
    let studentCode = 'STD-XXX';
    
    if (selectedStudentId.value) {
      const student = adminStore.students.find(s => s.studentId === selectedStudentId.value);
      if (student) {
        studentName = student.fullNameEn;
        studentCode = student.studentCode;
      }
    }

    // Call actual backend express endpoint
    // Note: The API /attendance/scan expects: { cardUid, gateLocation }
    const res = await apiClient<ApiResponse<ScanResult>>(API_ENDPOINTS.attendance.scan, {
      method: 'POST',
      body: {
        cardUid: cardUid.value,
        gateLocation: gateLocation.value
        // Note: The backend will set the logType dynamically based on whether it checks in or out
        // However, since we mock checking in, we will enrich the local display response
      }
    });

    if (res && res.success) {
      scanResult.value = {
        success: true,
        studentName,
        studentCode,
        gateLocation: gateLocation.value,
        logType: res.data.logType, // what the server recorded (check-in or check-out)
        time: new Date().toISOString()
      };
    } else {
      throw new Error('Scan failed on server');
    }
  } catch (err) {
    console.error('Scan Error:', err);
    scanResult.value = {
      success: false,
      studentName: 'Invalid Card ID',
      studentCode: 'CARD_ERROR',
      gateLocation: gateLocation.value,
      time: new Date().toISOString()
    };
  } finally {
    scanning.value = false;
  }
};
</script>

<style scoped lang="postcss">
.simulator-input {
  @apply w-full px-3.5 py-2.5 bg-[#080e1a]/85 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all;
}
</style>
