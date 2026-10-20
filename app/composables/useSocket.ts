import { ref, onMounted, onBeforeUnmount } from 'vue';
import { io, Socket } from 'socket.io-client';

interface FinanceData {
  incomeToday: number;
  expensesToday: number;
  currentBalance: number;
}

interface TopPerformersData {
  classes: any[];
}

interface AnnouncementsData {
  announcements: any[];
}

interface EventsData {
  events: any[];
}

export const useSocket = () => {
  const socket = ref<Socket | null>(null);
  const financeData = ref<FinanceData | null>(null);
  const topPerformersData = ref<TopPerformersData | null>(null);
  const announcementsData = ref<AnnouncementsData | null>(null);
  const eventsData = ref<EventsData | null>(null);
  const isConnected = ref(false);

  const connect = () => {
    if (socket.value) return;

    const backendUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : window.location.origin;

    socket.value = io(backendUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.value.on('connect', () => {
      console.log('Socket.io connected:', socket.value?.id);
      isConnected.value = true;
    });

    socket.value.on('disconnect', () => {
      console.log('Socket.io disconnected');
      isConnected.value = false;
    });

    // Listen for finance updates
    socket.value.on('dashboard:finance-updated', (data: FinanceData) => {
      console.log('Finance update:', data);
      financeData.value = data;
    });

    // Listen for top performers updates
    socket.value.on('dashboard:top-performers-updated', (data: TopPerformersData) => {
      console.log('Top performers update:', data);
      topPerformersData.value = data;
    });

    // Listen for announcements updates
    socket.value.on('dashboard:announcements-updated', (data: AnnouncementsData) => {
      console.log('Announcements update:', data);
      announcementsData.value = data;
    });

    // Listen for events updates
    socket.value.on('dashboard:events-updated', (data: EventsData) => {
      console.log('Events update:', data);
      eventsData.value = data;
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
    }
  };

  onMounted(() => {
    connect();
  });

  onBeforeUnmount(() => {
    disconnect();
  });

  return {
    socket,
    financeData,
    topPerformersData,
    announcementsData,
    eventsData,
    isConnected,
    connect,
    disconnect,
  };
};
