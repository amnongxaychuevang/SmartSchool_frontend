<template>
  <div class="glass-panel p-6 flex flex-col h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-teal-400">{{ $t('admin.live_checkin_feed') }}</h3>
      <div class="flex items-center gap-2">
        <span class="relative flex h-3 w-3">
          <span :class="['animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', isConnected ? 'bg-green-400' : 'bg-red-400']"/>
          <span :class="['relative inline-flex rounded-full h-3 w-3', isConnected ? 'bg-green-500' : 'bg-red-500']"/>
        </span>
        <span class="text-xs text-slate-400">{{ isConnected ? $t('admin.connected') : $t('admin.disconnected') }}</span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto space-y-3">
      <transition-group name="list" tag="div">
        <div
          v-for="log in logs"
          :key="log.id"
          class="p-3 rounded-lg border flex items-center gap-4 transition-all"
          :class="log.type === 'check_in' ? 'bg-teal-900/20 border-teal-500/30' : 'bg-orange-900/20 border-orange-500/30'"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            :class="log.type === 'check_in' ? 'bg-teal-500/20 text-teal-400' : 'bg-orange-500/20 text-orange-400'"
          >
            <!-- Icon placeholder -->
            <svg v-if="log.type === 'check_in'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">{{ log.studentName }}</p>
            <p class="text-xs text-slate-400">{{ $t('admin.id') }}: {{ log.studentId }} • {{ log.gate }}</p>
          </div>

          <div class="text-xs text-slate-500 whitespace-nowrap">
            {{ formatTime(log.time) }}
          </div>
        </div>
      </transition-group>
      
      <div v-if="logs.length === 0" class="text-center text-slate-500 py-8">
        {{ $t('admin.waiting_for_scans') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScanResult } from '../domain/models/School';
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSocketClient } from '../infrastructure/websocket/socketClient';

interface AttendanceLog {
  id: string;
  studentId: string;
  studentName: string;
  type: 'check_in' | 'check_out';
  gate: string;
  time: Date;
}

const { t } = useI18n();
const { socket, connect, disconnect, on, off } = useSocketClient();
const isConnected = ref(socket?.connected ?? false);
const logs = ref<AttendanceLog[]>([]);

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

onMounted(() => {
  connect();
  // The socket client is a module-level singleton — if it was already
  // connected from an earlier mount of this component (e.g. navigating
  // away and back), the 'connect' event below won't fire again, so seed
  // the initial state from its current status too.
  isConnected.value = socket?.connected ?? false;

  on('connect', () => { isConnected.value = true; });
  on('disconnect', () => { isConnected.value = false; });

  on('live-feed-update', (data: ScanResult & { studentName?: string; gateLocation?: string }) => {
    // Unshift new log to the top
    logs.value.unshift({
      id: Math.random().toString(36).substring(7),
      studentId: data.studentId ? String(data.studentId) : t('admin.unknown'),
      studentName: data.studentName || t('admin.student_name'), // ideally sent from backend
      type: data.logType,
      gate: data.gateLocation || t('admin.main_gate'),
      time: new Date(data.time)
    });

    // Keep only last 50 logs in memory to prevent overflow
    if (logs.value.length > 50) {
      logs.value.pop();
    }
  });
});

onUnmounted(() => {
  off('connect');
  off('disconnect');
  off('live-feed-update');
  disconnect();
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
