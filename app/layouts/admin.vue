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
          style="background: linear-gradient(135deg, #2dd4bf, #0d9488); box-shadow: 0 4px 12px rgba(45,212,191,0.35);">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <transition name="fade-slide">
          <div v-if="sidebarOpen" class="overflow-hidden">
            <p class="text-white font-bold text-sm leading-tight">Smart School</p>
            <p class="text-teal-400/70 text-[10px] font-medium tracking-widest uppercase">Admin Portal</p>
          </div>
        </transition>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-2.5 space-y-1 scrollbar-thin">
        <div v-for="item in navItems" :key="item.key" class="flex flex-col gap-0.5">
          <!-- If item has children (collapsible submenu) -->
          <template v-if="item.children">
            <button
              :class="['nav-item w-full text-left flex items-center justify-between transition-all duration-200', isSubActive(item) ? 'text-teal-400 bg-teal-500/5' : '']"
              :title="!sidebarOpen ? $t(item.key) : ''"
              @click="toggleMenu(item.key)"
            >
              <div class="flex items-center gap-3">
                <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" />
                <transition name="fade-slide">
                  <span v-if="sidebarOpen" class="truncate">{{ $t(item.key) }}</span>
                </transition>
              </div>
              <transition name="fade">
                <svg v-if="sidebarOpen" xmlns="http://www.w3.org/2000/svg" :class="['h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0', openMenus[item.key] ? 'rotate-180 text-teal-400' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </transition>
            </button>

            <!-- Collapsible Items -->
            <transition name="expand">
              <div v-show="sidebarOpen && openMenus[item.key]" class="flex flex-col gap-1 pl-9 mt-0.5 overflow-hidden">
                <NuxtLink
                  v-for="sub in item.children"
                  :key="sub.to"
                  :to="sub.to"
                  :class="['flex items-center gap-2.5 py-1.5 px-3 rounded-lg text-xs transition-all duration-200 hover:bg-slate-800/40 text-slate-400', isActive(sub.to) ? 'bg-teal-500/10 text-teal-300 font-semibold border border-teal-500/15' : '']"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" :class="[isActive(sub.to) ? 'bg-teal-400' : '']"/>
                  <span>{{ $t(sub.key) }}</span>
                </NuxtLink>
              </div>
            </transition>
          </template>

          <!-- Else regular Nav Link -->
          <template v-else>
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              :class="['nav-item', isActive(item.to) ? 'active' : '']"
              :title="!sidebarOpen ? $t(item.key) : ''"
            >
              <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" />
              <transition name="fade-slide">
                <span v-if="sidebarOpen" class="truncate">{{ $t(item.key) }}</span>
              </transition>
              <transition name="fade">
                <span
v-if="sidebarOpen && isActive(item.to)"
                  class="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0"
                  style="box-shadow: 0 0 6px #2dd4bf;"
                />
              </transition>
            </NuxtLink>
          </template>
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

        <!-- Lang Switch -->
        <LangSwitch />

        <!-- Theme Switch -->
        <ThemeSwitch />

        <!-- Profile Button -->
        <div class="relative">
          <button
            class="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800/80 transition-all group"
            style="border: 1px solid rgba(148,163,184,0.08);"
            @click="profileOpen = !profileOpen"
          >
            <div
class="w-8 h-8 rounded-lg flex items-center justify-center text-teal-300 font-bold text-sm shrink-0"
              style="background: rgba(45,212,191,0.15);">
              {{ userInitial }}
            </div>
            <div class="text-left hidden sm:block">
              <p class="text-xs font-semibold text-white leading-tight">{{ authStore.user && authStore.user.fullNameEn }}</p>
              <p class="text-[10px] text-slate-500 capitalize">{{ authStore.user && authStore.user.role }}</p>
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
              class="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden shadow-2xl z-50"
              style="background: rgba(10,17,32,0.98); border: 1px solid rgba(148,163,184,0.1); backdrop-filter: blur(20px);">
              <!-- Actions -->
              <div class="p-2">
                <button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../application/stores/auth';
import LangSwitch from '../components/LangSwitch.vue';
import ThemeSwitch from '../components/ThemeSwitch.vue';

interface NavSubItem {
  to: string;
  key: string;
}

interface NavItem {
  to?: string;
  key: string;
  icon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  children?: NavSubItem[];
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const sidebarOpen = ref(true);
const profileOpen = ref(false);

const userInitial = computed((): string => {
  const fullName = authStore.user?.fullNameEn || '';
  return fullName.charAt(0).toUpperCase() || 'A';
});

const navItems: NavItem[] = [
  { to: '/admin',            key: 'nav.dashboard',  icon: resolveComponent('IconDashboard') },
  { to: '/admin/students',   key: 'nav.students',   icon: resolveComponent('IconStudents') },
  { to: '/admin/teachers',   key: 'nav.teachers',   icon: resolveComponent('IconTeachers') },
  { to: '/admin/parents',    key: 'nav.parents',    icon: resolveComponent('IconParents') },
  { to: '/admin/classes',    key: 'nav.classes',    icon: resolveComponent('IconClasses') },
  { to: '/admin/attendance', key: 'nav.attendance', icon: resolveComponent('IconAttendance') },
  
   { 
    key: 'nav.settings',  
    icon: resolveComponent('IconSettings'),
    children: [
      { to: '/admin/settings',               key: 'nav.settings' },
      { to: '/admin/users',                  key: 'nav.users' },
      { to: '/admin/settings/permissions',   key: 'nav.permissions' },
      { to: '/admin/settings/shops',         key: 'nav.shops' },
      { to: '/admin/settings/notifications', key: 'nav.notifications' },
      { to: '/admin/announcements',          key: 'nav.announcements' },
      { to: '/admin/audit-logs',             key: 'nav.auditLogs' },
    ]
  },
  { 
    key: 'nav.reports',   
    icon: resolveComponent('IconReports'),
    children: [
      { to: '/admin/reports',            key: 'nav.reports' },
      { to: '/admin/reports/attendance', key: 'nav.attendance' },
      { to: '/admin/reports/fees',       key: 'nav.fees' },
      { to: '/admin/reports/grades',     key: 'nav.grades' },
      { to: '/admin/reports/students',   key: 'nav.students' },
      { to: '/admin/reports/wallet',     key: 'nav.wallet' },
    ]
  },
 
];

const openMenus = reactive<Record<string, boolean>>({
  'nav.reports': false,
  'nav.settings': false,
});

const toggleMenu = (key: string) => {
  if (!sidebarOpen.value) {
    sidebarOpen.value = true;
  }
  openMenus[key] = !openMenus[key];
};

const isActive = (to: string) => {
  if (to === '/admin') return route.path === '/admin';
  return route.path === to || (to !== '/admin' && route.path.startsWith(to + '/'));
};

const isSubActive = (item: NavItem): boolean => {
  return item.children?.some((sub: NavSubItem) => isActive(sub.to)) ?? false;
};

onMounted(() => {
  navItems.forEach((item: NavItem) => {
    if (item.children && isSubActive(item)) {
      openMenus[item.key] = true;
    }
  });
});

const currentPageTitle = computed((): string => {
  for (const item of navItems) {
    if (item.children) {
      const child = item.children.find((c: NavSubItem) => isActive(c.to));
      if (child) return t(child.key);
    } else if (item.to && isActive(item.to)) {
      return t(item.key);
    }
  }
  return 'Admin';
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped lang="postcss">
.fade-slide-enter-active, .fade-slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-slide-enter-from { opacity: 0; transform: translateX(-6px); }
.fade-slide-leave-to   { opacity: 0; transform: translateX(-6px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.profile-drop-enter-active, .profile-drop-leave-active { transition: opacity 0.2s, transform 0.2s; }
.profile-drop-enter-from { opacity: 0; transform: translateY(-8px) scale(0.97); }
.profile-drop-leave-to   { opacity: 0; transform: translateY(-8px) scale(0.97); }

.lang-btn {
  @apply px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-white transition-all;
}
.lang-btn-active {
  background: rgba(45,212,191,0.15);
  color: #2dd4bf;
  box-shadow: 0 0 10px rgba(45,212,191,0.1);
}

/* Submenu expand transition */
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease-out;
  max-height: 120px;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}
</style>
