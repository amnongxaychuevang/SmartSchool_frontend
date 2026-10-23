import { ref, onMounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../application/stores/auth';

let socketInstance: Socket | null = null;

export const usePushNotifications = () => {
  const isSupported = ref(false);
  const permission = ref<NotificationPermission>('default');
  const lastNotification = ref<any>(null);

  if (typeof window !== 'undefined' && 'Notification' in window) {
    isSupported.value = true;
    permission.value = Notification.permission;
  }

  // Play subtle pleasant chime using Web Audio API (Zero external audio file needed!)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay may be restricted until user gesture
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) return false;
    try {
      const res = await Notification.requestPermission();
      permission.value = res;
      if (res === 'granted') {
        showNotification('Smart School Notifications Enabled', {
          body: 'You will receive real-time updates for attendance, bus rides, homework, and chat.',
          icon: '/favicon.ico',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  };

  const registerServiceWorker = async () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (err) {
        // Service worker optional in non-https local dev
      }
    }
  };

  const showNotification = async (title: string, options?: NotificationOptions) => {
    if (!isSupported.value || permission.value !== 'granted') return;

    try {
      playChime();
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            badge: '/favicon.ico',
            icon: '/favicon.ico',
            ...options,
          });
          return;
        }
      }

      const notif = new Notification(title, {
        badge: '/favicon.ico',
        icon: '/favicon.ico',
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.error('Error displaying notification:', err);
    }
  };

  const initSocketListeners = () => {
    const auth = useAuthStore();

    if (!socketInstance) {
      const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : (typeof window !== 'undefined' ? window.location.origin : '');

      socketInstance = io(backendUrl);

      socketInstance.on('connect', () => {
        if (auth.user?.userId) {
          socketInstance?.emit('join:user', auth.user.userId);
        }
      });

      // 1. General in-app push (attendance, bus board/alight, homework)
      socketInstance.on('new-notification', (notif: any) => {
        lastNotification.value = notif;
        const title = notif.titleLo || notif.titleEn || 'Smart School Notice';
        const body = notif.messageLo || notif.messageEn || '';
        showNotification(title, { body });
      });

      // 2. Chat messages notification
      socketInstance.on('chat:notification', (data: any) => {
        const sender = data.senderName || 'New Message';
        const body = data.message?.content || 'Sent you a message';
        showNotification(`💬 ${sender}`, { body });
      });
    }

    if (socketInstance.connected && auth.user?.userId) {
      socketInstance.emit('join:user', auth.user.userId);
    }
  };

  onMounted(() => {
    registerServiceWorker();
    initSocketListeners();
  });

  return {
    isSupported,
    permission,
    lastNotification,
    requestPermission,
    showNotification,
    playChime,
  };
};
