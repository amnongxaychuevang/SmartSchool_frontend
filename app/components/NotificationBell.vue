<template>
  <div ref="containerRef" class="relative">
    <!-- Bell Trigger Button -->
    <button
      type="button"
      class="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      :title="tooltip"
      :aria-label="$t('notifications.title')"
      @click="toggleDropdown"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>

      <!-- Unread Count Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center shadow-xs animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
      <span
        v-else-if="permission === 'default'"
        class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"
      />
    </button>

    <!-- Notification Dropdown Popover -->
    <transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[520px]"
      >
        <!-- Header -->
        <div class="p-3.5 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-800/40">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">{{ $t('notifications.title') }}</h3>
            <span
              v-if="unreadCount > 0"
              class="px-2 py-0.2 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 rounded-full"
            >
              {{ unreadCount }} {{ $t('notifications.new') }}
            </span>
          </div>

          <button
            v-if="unreadCount > 0"
            type="button"
            class="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
            @click="markAllAsRead"
          >
            {{ $t('notifications.mark_all_read') }}
          </button>
        </div>

        <!-- System Push Permission Banner if not enabled yet -->
        <div
          v-if="permission === 'default'"
          class="p-3 bg-amber-500/10 border-b border-amber-500/20 text-xs flex items-center justify-between gap-2 text-amber-700 dark:text-amber-300"
        >
          <div class="flex items-center gap-2">
            <span>🔔</span>
            <span class="text-[11px] leading-tight">{{ $t('notifications.enable_push_prompt') }}</span>
          </div>
          <button
            type="button"
            class="btn-primary text-[11px] px-2.5 py-1 shrink-0 rounded-lg"
            @click="requestPermission"
          >
            {{ $t('notifications.enable') }}
          </button>
        </div>

        <!-- Notification Items List -->
        <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          <LoadingSpinner v-if="loading && !notifications.length" class="py-8" />

          <div
            v-else-if="!notifications.length"
            class="py-12 px-4 text-center text-xs text-slate-400 flex flex-col items-center gap-2"
          >
            <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p>{{ $t('notifications.empty') }}</p>
          </div>

          <div
            v-for="item in notifications"
            :key="item.notificationId"
            class="p-3.5 px-4 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
            :class="{ 'bg-teal-50/40 dark:bg-teal-950/20': !item.isRead }"
            @click="handleNotificationClick(item)"
          >
            <!-- Type Icon -->
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0"
              :class="getIconStyle(item)"
            >
              {{ getIconEmoji(item) }}
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <p class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {{ pick(item.titleLo, item.titleEn) || $t('notifications.default_title') }}
                </p>
                <span class="text-[10px] text-slate-400 whitespace-nowrap">
                  {{ formatRelativeTime(item.sentAt || item.createdAt) }}
                </span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {{ pick(item.messageLo, item.messageEn) }}
              </p>
            </div>

            <!-- Unread Dot -->
            <span
              v-if="!item.isRead"
              class="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LoadingSpinner from './LoadingSpinner.vue';
import { useApiClient } from '../infrastructure/api/apiClient';
import { usePushNotifications } from '../composables/usePushNotifications';
import type { ApiResponse } from '../infrastructure/api/types';

interface NotificationItem {
  notificationId: number;
  type: string;
  titleEn?: string | null;
  titleLo?: string | null;
  messageEn: string;
  messageLo: string;
  link?: string | null;
  isRead: boolean;
  sentAt: string;
  createdAt?: string;
}

const router = useRouter();
const { t, locale } = useI18n();
const { isSupported, permission, requestPermission } = usePushNotifications();

const isOpen = ref(false);
const loading = ref(false);
const unreadCount = ref(0);
const notifications = ref<NotificationItem[]>([]);
const containerRef = ref<HTMLElement | null>(null);

const tooltip = computed(() => {
  if (unreadCount.value > 0) {
    return `${unreadCount.value} unread notifications`;
  }
  return t('notifications.title');
});

const pick = (lo?: string | null, en?: string | null) => {
  if (locale.value === 'lo') return lo || en || '';
  return en || lo || '';
};

function getIconEmoji(item: NotificationItem): string {
  const text = (item.titleEn + ' ' + item.titleLo + ' ' + item.type + ' ' + (item.link || '')).toLowerCase();
  if (text.includes('leave') || text.includes('ລາພັກ')) return '🏖️';
  if (text.includes('bus') || text.includes('transport') || text.includes('ລົດ')) return '🚌';
  if (text.includes('homework') || text.includes('assignment') || text.includes('ວຽກບ້ານ')) return '📝';
  if (text.includes('chat') || text.includes('ສົນທະນາ') || text.includes('message')) return '💬';
  if (text.includes('wallet') || text.includes('fee') || text.includes('ເງິນ')) return '💳';
  if (text.includes('check_in') || text.includes('attendance') || text.includes('ເຊັກຊື່')) return '✅';
  return '📢';
}

function getIconStyle(item: NotificationItem): string {
  const text = (item.titleEn + ' ' + item.type).toLowerCase();
  if (text.includes('leave')) return 'bg-amber-500/10 text-amber-500';
  if (text.includes('bus')) return 'bg-blue-500/10 text-blue-500';
  if (text.includes('homework')) return 'bg-purple-500/10 text-purple-500';
  if (text.includes('chat')) return 'bg-teal-500/10 text-teal-500';
  return 'bg-emerald-500/10 text-emerald-500';
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return t('notifications.just_now');
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

async function fetchUnreadCount() {
  try {
    const res = await useApiClient()<ApiResponse<{ unreadCount: number }>>('/notifications/unread-count');
    unreadCount.value = res.data?.unreadCount || 0;
  } catch {
    // ignore
  }
}

async function fetchNotifications() {
  loading.value = true;
  try {
    const res = await useApiClient()<ApiResponse<{ notifications: NotificationItem[]; total: number }>>('/notifications/my?limit=25');
    notifications.value = res.data?.notifications || [];
  } catch (err) {
    console.error('Failed to load notifications:', err);
  } finally {
    loading.value = false;
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    fetchNotifications();
    fetchUnreadCount();
  }
}

async function handleNotificationClick(item: NotificationItem) {
  if (!item.isRead) {
    item.isRead = true;
    if (unreadCount.value > 0) unreadCount.value--;
    useApiClient()(`/notifications/${item.notificationId}/read`, { method: 'PUT' }).catch(() => {});
  }

  isOpen.value = false;
  if (item.link) {
    router.push(item.link);
  }
}

async function markAllAsRead() {
  notifications.value.forEach((n) => { n.isRead = true; });
  unreadCount.value = 0;
  await useApiClient()('/notifications/read-all', { method: 'PUT' }).catch(() => {});
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  fetchUnreadCount();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
</style>
