<template>
  <div class="min-h-screen flex">
    <!-- ── Sidebar ─────────────────────────────────────── -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-[68px]'
      ]"
      class="bg-white dark:bg-[#080e1a] border-r border-slate-200 dark:border-slate-800"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-4 shrink-0 border-b border-slate-200 dark:border-slate-800">
        <div
class="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
          style="background: linear-gradient(135deg, #ec4899, #be185d); box-shadow: 0 4px 12px rgba(236,72,153,0.35);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <transition name="fade-slide">
          <div v-if="sidebarOpen" class="overflow-hidden">
            <p class="text-slate-800 dark:text-white font-bold text-sm leading-tight">Smart School</p>
            <p class="text-pink-400/70 text-[10px] font-medium tracking-widest uppercase">{{ $t('parentPortal.title') }}</p>
          </div>
        </transition>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-2.5 space-y-1 scrollbar-thin">
        <div v-for="item in navItems" :key="item.to" class="flex flex-col gap-0.5">
          <NuxtLink
            :to="item.to"
            :class="['nav-item', isActive(item.to) ? 'active' : '']"
            :title="!sidebarOpen ? item.label : ''"
          >
            <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" />
            <transition name="fade-slide">
              <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
            </transition>
            <transition name="fade">
              <span
                v-if="sidebarOpen && item.badge && item.badge > 0"
                class="ml-auto px-1.5 py-0.2 text-[10px] font-bold text-white bg-teal-500 rounded-full"
              >
                {{ item.badge }}
              </span>
              <span
                v-else-if="sidebarOpen && isActive(item.to)"
                class="ml-auto w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0"
                style="box-shadow: 0 0 6px #ec4899;"
              />
            </transition>
          </NuxtLink>
        </div>
      </nav>

      <!-- Logout -->
      <div class="border-t border-slate-200 dark:border-slate-800 p-3 shrink-0">
        <button class="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="sidebarOpen">{{ $t('nav.logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- ── Main Content ─────────────────────────────────── -->
    <div :class="['flex flex-col flex-1 min-h-screen transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-[68px]']">
      <!-- Topbar -->
      <header
class="h-16 flex items-center gap-4 px-6 sticky top-0 z-40 shrink-0 bg-white/90 dark:bg-[#080e1a]/85 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <!-- Toggle -->
        <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all shrink-0" @click="sidebarOpen = !sidebarOpen">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-slate-800 dark:text-white font-semibold text-lg">{{ currentPageTitle }}</h1>

        <!-- Spacer -->
        <div class="flex-1"/>

        <!-- Notification Bell -->
        <NotificationBell />

        <!-- Theme Switch -->
        <ThemeSwitch />

        <!-- Lang Switch -->
        <LangSwitch />

        <!-- Profile Button -->
        <div class="relative">
          <button
            class="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition-all group profile-dropdown"
            style="border: 1px solid rgba(148,163,184,0.08);"
            @click="profileOpen = !profileOpen"
          >
            <div
class="w-8 h-8 rounded-lg flex items-center justify-center text-pink-300 font-bold text-sm shrink-0"
              style="background: rgba(236,72,153,0.15);">
              {{ userInitial }}
            </div>
            <div class="text-left hidden sm:block">
              <p class="text-xs font-semibold text-slate-800 dark:text-white leading-tight">{{ authStore.user?.fullNameEn }}</p>
              <p class="text-[10px] text-slate-500 capitalize">{{ authStore.user?.role }}</p>
            </div>
            <svg
xmlns="http://www.w3.org/2000/svg"
              :class="['h-4 w-4 text-slate-500 transition-transform', profileOpen ? 'rotate-180' : '']"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown -->
          <transition name="profile-drop">
            <div
v-if="profileOpen"
              class="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 bg-white dark:bg-[#0a1120] border border-slate-200 dark:border-slate-800 shadow-xl">
              <div class="p-2">
                <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all text-sm" @click="openChangePassword">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  {{ $t('password.change_title') }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
      <ChangePasswordModal v-model:open="passwordOpen" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, resolveComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../application/stores/auth';
import { useChatStore } from '../application/stores/chat';
import LangSwitch from '../components/LangSwitch.vue';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import ChangePasswordModal from '../components/ChangePasswordModal.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const sidebarOpen = ref(true);
const profileOpen = ref(false);

onMounted(() => {
  chatStore.fetchConversations();
});

const userInitial = computed(() => authStore.user?.fullNameEn?.[0]?.toUpperCase() ?? 'P');

const navItems = computed(() => [
  { to: '/parent',            label: t('parentPortal.dashboard'),  icon: resolveComponent('IconDashboard') },
  { to: '/parent/chat',       label: t('chat.title'),              icon: resolveComponent('IconChat'), badge: chatStore.totalUnreadCount },
  { to: '/parent/attendance', label: t('parentPortal.childs_attendance'), icon: resolveComponent('IconAttendance') },
  { to: '/parent/grades',     label: t('parentPortal.childs_grades'),     icon: resolveComponent('IconReports') },
  { to: '/parent/wallet',     label: t('parentPortal.childs_wallet'),     icon: resolveComponent('IconStudents') },
  { to: '/parent/fees',       label: t('parent_fees.title'),              icon: resolveComponent('IconWallet') },
  { to: '/parent/assignments', label: t('assignments.title'),             icon: resolveComponent('IconLeave') },
  { to: '/parent/behavior',   label: t('parent_behavior.title'),          icon: resolveComponent('IconBehavior') },
  { to: '/parent/transport',  label: t('parent_transport.title'),         icon: resolveComponent('IconBus') },
  { to: '/parent/library',    label: t('parent_library.title'),           icon: resolveComponent('IconBook') },
  { to: '/parent/schedule',   label: t('parentPortal.schedule'),          icon: resolveComponent('IconSchedule') },
  { to: '/parent/calendar',   label: t('calendar.title'),                 icon: resolveComponent('IconSchedule') },
  { to: '/parent/leave',      label: t('parentPortal.leave_requests'),    icon: resolveComponent('IconLeave') },
  { to: '/parent/announcements', label: t('parentPortal.announcements'),  icon: resolveComponent('IconNotifications') },
]);

const isActive = (to: string) => {
  if (to === '/parent') return route.path === '/parent';
  return route.path.startsWith(to);
};

const currentPageTitle = computed(() => {
  const current = navItems.value.find(item => isActive(item.to));
  return current ? current.label : t('parentPortal.title');
});

const passwordOpen = ref(false);
const openChangePassword = () => {
  profileOpen.value = false;
  passwordOpen.value = true;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped lang="postcss">
.nav-item {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all duration-200;
}
.nav-item.active {
  @apply bg-pink-500/10 text-pink-400;
  border: 1px solid rgba(236, 72, 153, 0.15);
}
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-slide-enter-from { opacity: 0; transform: translateX(-6px); }
.fade-slide-leave-to   { opacity: 0; transform: translateX(-6px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.profile-drop-enter-active, .profile-drop-leave-active { transition: opacity 0.2s, transform 0.2s; }
.profile-drop-enter-from { opacity: 0; transform: translateY(-8px) scale(0.97); }
.profile-drop-leave-to   { opacity: 0; transform: translateY(-8px) scale(0.97); }
</style>
