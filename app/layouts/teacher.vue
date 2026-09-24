<template>
  <div class="min-h-screen flex">
    <!-- ── Sidebar ─────────────────────────────────────── -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out',
        sidebarOpen ? 'w-64' : 'w-[68px]'
      ]"
      style="background: rgba(8,14,26,0.95); border-right: 1px solid rgba(148,163,184,0.07); backdrop-filter: blur(20px);"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-4 shrink-0" style="border-bottom: 1px solid rgba(148,163,184,0.07);">
        <div
class="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
          style="background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 12px rgba(245,158,11,0.35);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <transition name="fade-slide">
          <div v-if="sidebarOpen" class="overflow-hidden">
            <p class="text-white font-bold text-sm leading-tight">Smart School</p>
            <p class="text-amber-400/70 text-[10px] font-medium tracking-widest uppercase">Teacher Portal</p>
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
v-if="sidebarOpen && isActive(item.to)"
                class="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                style="box-shadow: 0 0 6px #f59e0b;"
              />
            </transition>
          </NuxtLink>
        </div>
      </nav>

      <!-- Logout -->
      <div class="border-t border-slate-800 p-3 shrink-0" style="border-top: 1px solid rgba(148,163,184,0.07);">
        <button class="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="sidebarOpen">Logout</span>
        </button>
      </div>
    </aside>

    <!-- ── Main Content ─────────────────────────────────── -->
    <div :class="['flex flex-col flex-1 min-h-screen transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-[68px]']">
      <!-- Topbar -->
      <header
class="h-16 flex items-center gap-4 px-6 sticky top-0 z-40 shrink-0"
        style="background: rgba(8,14,26,0.85); border-bottom: 1px solid rgba(148,163,184,0.07); backdrop-filter: blur(20px);">
        <!-- Toggle -->
        <button class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all shrink-0" @click="sidebarOpen = !sidebarOpen">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-white font-semibold text-lg">{{ currentPageTitle }}</h1>

        <!-- Spacer -->
        <div class="flex-1"/>

        <!-- Theme Switch -->
        <ThemeSwitch />

        <!-- Lang Switch -->
        <LangSwitch />

        <!-- Profile Button -->
        <div class="relative">
          <button
            class="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition-all group"
            style="border: 1px solid rgba(148,163,184,0.08);"
            @click="profileOpen = !profileOpen"
          >
            <div
class="w-8 h-8 rounded-lg flex items-center justify-center text-amber-300 font-bold text-sm shrink-0"
              style="background: rgba(245,158,11,0.15);">
              {{ userInitial }}
            </div>
            <div class="text-left hidden sm:block">
              <p class="text-xs font-semibold text-white leading-tight">{{ authStore.user?.fullNameEn }}</p>
              <p class="text-[10px] text-slate-500 capitalize">{{ authStore.user?.role }}</p>
            </div>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, resolveComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../application/stores/auth';
import LangSwitch from '../components/LangSwitch.vue';
import ThemeSwitch from '../components/ThemeSwitch.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const sidebarOpen = ref(true);
const profileOpen = ref(false);

const userInitial = computed(() => authStore.user?.fullNameEn?.[0]?.toUpperCase() ?? 'T');

const navItems = computed(() => [
  { to: '/teacher',               label: t('nav.dashboard'),      icon: resolveComponent('IconDashboard') },
  { to: '/teacher/schedule',      label: t('teacherPortal.my_schedule'),    icon: resolveComponent('IconSchedule') },
  { to: '/teacher/classes',       label: t('nav.classes'),     icon: resolveComponent('IconClasses') },
  { to: '/teacher/students',      label: t('nav.students'),       icon: resolveComponent('IconStudents') },
  { to: '/teacher/attendance',    label: t('nav.attendance'),     icon: resolveComponent('IconAttendance') },
  { to: '/teacher/leaves',        label: t('teacherPortal.leave_approvals'),icon: resolveComponent('IconLeave') },
  { to: '/teacher/grades',        label: t('nav.grades'),         icon: resolveComponent('IconReports') },
  { to: '/teacher/announcements', label: t('nav.announcements'),  icon: resolveComponent('IconNotifications') },
]);

const isActive = (to: string) => {
  if (to === '/teacher') return route.path === '/teacher';
  return route.path.startsWith(to);
};

const currentPageTitle = computed(() => {
  const current = navItems.value.find(item => isActive(item.to));
  return current ? current.label : 'Teacher Portal';
});

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
  @apply bg-amber-500/10 text-amber-400;
  border: 1px solid rgba(245, 158, 11, 0.15);
}
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-slide-enter-from { opacity: 0; transform: translateX(-6px); }
.fade-slide-leave-to   { opacity: 0; transform: translateX(-6px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
