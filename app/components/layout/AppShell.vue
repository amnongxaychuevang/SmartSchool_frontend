<template>
  <div class="min-h-screen bg-canvas text-ink">
    <!-- Mobile drawer backdrop -->
    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-[90] bg-ink/40 lg:hidden"
      @click="drawerOpen = false"
    />

    <!-- ── Sidebar ───────────────────────────────────────── -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-[100] flex flex-col bg-surface border-r border-line transition-[width,transform] duration-200',
        drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        railCollapsed ? 'w-60 lg:w-16' : 'w-60',
      ]"
    >
      <!-- Brand -->
      <div class="h-16 flex items-center gap-3 px-4 border-b border-line shrink-0">
        <div class="w-9 h-9 rounded bg-primary text-white flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div v-show="!railCollapsed" class="min-w-0">
          <p class="text-base font-bold leading-tight text-primary-ink">{{ $t('layout.brand') }}</p>
          <p class="text-[11px] font-semibold text-ink-muted truncate">{{ $t(portalKey) }}</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5" :aria-label="$t(portalKey)">
        <div v-for="section in sections" :key="section.key">
          <component
            :is="section.collapsible ? 'button' : 'p'"
            v-show="!railCollapsed"
            :type="section.collapsible ? 'button' : undefined"
            :aria-expanded="section.collapsible ? isSectionOpen(section) : undefined"
            class="w-full flex items-center justify-between gap-2 px-3 mb-1.5 text-[11px] font-bold tracking-wide text-ink-subtle"
            @click="section.collapsible && toggleSection(section.key)"
          >
            <span class="truncate text-left">
              {{ $t(`navSection.${section.key}`) }}
              <span v-if="tOther(`navSection.${section.key}`)" class="uppercase font-semibold">({{ tOther(`navSection.${section.key}`) }})</span>
            </span>
            <svg
              v-if="section.collapsible"
              xmlns="http://www.w3.org/2000/svg"
              :class="['h-3.5 w-3.5 shrink-0 transition-transform', isSectionOpen(section) ? 'rotate-180' : '']"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </component>

          <ul v-show="railCollapsed || isSectionOpen(section)" class="space-y-0.5">
            <li v-for="item in section.items" :key="item.to">
              <NuxtLink
                :to="item.to"
                :class="['nav-item', isActive(item.to) ? 'active' : '', railCollapsed ? 'lg:justify-center lg:px-0' : '']"
                :title="railCollapsed ? $t(item.key) : undefined"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                @click="drawerOpen = false"
              >
                <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" />
                <span v-show="!railCollapsed" class="min-w-0 flex-1">
                  <span class="block truncate leading-5">{{ $t(item.key) }}</span>
                  <span v-if="tOther(item.key)" class="block truncate text-[11px] font-normal leading-4 text-ink-subtle">{{ tOther(item.key) }}</span>
                </span>
                <span
                  v-if="badges[item.to]"
                  v-show="!railCollapsed"
                  class="min-w-5 h-5 px-1.5 rounded-full bg-danger-soft text-danger text-[11px] font-bold flex items-center justify-center tnum"
                  :aria-label="$t('layout.pending_count', { count: badges[item.to] })"
                >{{ badges[item.to] }}</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Collapse (desktop) -->
      <div class="hidden lg:block border-t border-line p-3 shrink-0">
        <button
          type="button"
          class="btn-ghost w-full"
          :title="railCollapsed ? $t('layout.expand_sidebar') : $t('layout.collapse_sidebar')"
          @click="railCollapsed = !railCollapsed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" :class="['h-4 w-4 transition-transform', railCollapsed ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <span v-show="!railCollapsed">{{ $t('layout.collapse_sidebar') }}</span>
        </button>
      </div>
    </aside>

    <!-- ── Main column ───────────────────────────────────── -->
    <div :class="['flex flex-col min-h-screen transition-[padding] duration-200', railCollapsed ? 'lg:pl-16' : 'lg:pl-60']">
      <header class="sticky top-0 z-40 h-16 flex items-center gap-3 px-4 sm:px-6 bg-surface border-b border-line">
        <button
          type="button"
          class="lg:hidden w-9 h-9 rounded flex items-center justify-center text-ink-muted hover:bg-surface-2 hover:text-ink"
          :aria-label="$t('layout.open_menu')"
          @click="drawerOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="min-w-0">
          <h1 class="text-lg font-bold leading-tight truncate">{{ pageTitle }}</h1>
          <p v-if="pageSubtitle" class="hidden sm:block text-xs text-ink-subtle truncate">{{ pageSubtitle }}</p>
        </div>

        <div class="flex-1" />

        <slot name="topbar" />
        <ActiveTermChip />
        <LangSwitch />
        <ThemeSwitch />

        <!-- Account menu -->
        <div ref="accountEl" class="relative">
          <button
            type="button"
            class="flex items-center gap-2.5 h-10 pl-1.5 pr-2 rounded hover:bg-surface-2"
            :aria-label="$t('layout.account')"
            :aria-expanded="accountOpen"
            @click="accountOpen = !accountOpen"
          >
            <span class="avatar-sm bg-primary-soft text-primary-ink">{{ userInitial }}</span>
            <span class="hidden md:block text-left leading-tight">
              <span class="block text-sm font-semibold text-ink max-w-[10rem] truncate">{{ userName }}</span>
              <span class="block text-[11px] text-ink-subtle">{{ roleLabel }}</span>
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="hidden md:block h-4 w-4 text-ink-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-if="accountOpen" class="panel-float absolute right-0 top-full mt-2 w-56 p-1.5 z-50">
            <div class="px-3 py-2 border-b border-line mb-1 md:hidden">
              <p class="text-sm font-semibold truncate">{{ userName }}</p>
              <p class="text-[11px] text-ink-subtle">{{ roleLabel }}</p>
            </div>
            <button
              type="button"
              class="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-danger hover:bg-danger-soft"
              @click="handleLogout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {{ $t('nav.logout') }}
            </button>
          </div>
        </div>
      </header>

      <main :class="['flex-1 p-4 sm:p-6 lg:p-8', bottomNav.length ? 'pb-24 lg:pb-8' : '']">
        <slot />
      </main>
    </div>

    <!-- ── Mobile bottom tab bar (parent app) ────────────── -->
    <nav
      v-if="bottomNav.length"
      class="lg:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-surface border-t border-line grid"
      :style="{ gridTemplateColumns: `repeat(${bottomNav.length + 1}, minmax(0, 1fr))` }"
    >
      <NuxtLink
        v-for="item in bottomItems"
        :key="item.to"
        :to="item.to"
        :class="['flex flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive(item.to) ? 'text-primary-ink' : 'text-ink-subtle']"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span class="truncate max-w-full px-1">{{ $t(item.tabKey) }}</span>
      </NuxtLink>
      <button
        type="button"
        :class="['flex flex-col items-center justify-center gap-1 text-[11px] font-semibold', moreActive ? 'text-primary-ink' : 'text-ink-subtle']"
        @click="drawerOpen = true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {{ $t('layout.more') }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../application/stores/auth';
import LangSwitch from '../LangSwitch.vue';
import ThemeSwitch from '../ThemeSwitch.vue';
import ActiveTermChip from './ActiveTermChip.vue';
import type { ShellNavSection } from './types';

const props = withDefaults(defineProps<{
  sections: ShellNavSection[];
  /** i18n key of the portal name shown under the brand. */
  portalKey: string;
  /** Pending-item counts keyed by nav route, e.g. { '/admin/finance/top-ups': 3 }. */
  badges?: Record<string, number>;
  /** Mobile bottom tab bar: routes with short tab labels; the rest stay in the drawer. */
  bottomNav?: { to: string; tabKey: string }[];
}>(), {
  badges: () => ({}),
  bottomNav: () => [],
});

const route = useRoute();
const router = useRouter();
const { t, te, locale } = useI18n();
const authStore = useAuthStore();

// The other language, shown as a secondary label (DESIGN.md: bilingual balance).
// Empty when that translation is missing, so a raw key never reaches the screen.
const otherLocale = computed(() => (locale.value === 'lo' ? 'en' : 'lo'));
const tOther = (key: string) => (te(key, otherLocale.value) ? t(key, {}, { locale: otherLocale.value }) : '');

// ── Active route: the single most specific matching link ──
const allItems = computed(() => props.sections.flatMap((s) => s.items));
const activeLink = computed(() => {
  const matches = allItems.value
    .map((i) => i.to)
    .filter((to) => route.path === to || route.path.startsWith(to + '/'));
  return matches.sort((a, b) => b.length - a.length)[0] ?? '';
});
const isActive = (to: string) => activeLink.value === to;
const activeItem = computed(() => allItems.value.find((i) => i.to === activeLink.value));

const pageTitle = computed(() => (activeItem.value ? t(activeItem.value.key) : t(props.portalKey)));
const pageSubtitle = computed(() => (activeItem.value ? tOther(activeItem.value.key) : ''));

// ── Sections ──
const openSections = reactive<Record<string, boolean>>({});
const sectionHasActive = (s: ShellNavSection) => s.items.some((i) => isActive(i.to));
const isSectionOpen = (s: ShellNavSection) => !s.collapsible || openSections[s.key] || sectionHasActive(s);
const toggleSection = (key: string) => {
  const section = props.sections.find((s) => s.key === key);
  openSections[key] = section ? !isSectionOpen(section) : true;
};

// ── Sidebar state ──
const drawerOpen = ref(false);
const railCollapsed = ref(false);
watch(() => route.path, () => { drawerOpen.value = false; accountOpen.value = false; });

// ── Mobile bottom bar ──
const bottomItems = computed(() =>
  props.bottomNav.flatMap((tab) => {
    const item = allItems.value.find((i) => i.to === tab.to);
    return item ? [{ ...item, tabKey: tab.tabKey }] : [];
  }),
);
const moreActive = computed(() => !!activeLink.value && !props.bottomNav.some((tab) => tab.to === activeLink.value));

// ── Account ──
const accountOpen = ref(false);
const accountEl = ref<HTMLElement | null>(null);
const userName = computed(() => {
  const u = authStore.user;
  if (!u) return '';
  return (locale.value === 'lo' ? u.fullNameLo : u.fullNameEn) || u.fullNameEn || u.fullNameLo;
});
const userInitial = computed(() => (authStore.user?.fullNameEn || userName.value || '?').charAt(0).toUpperCase());
const roleLabel = computed(() => {
  const u = authStore.user;
  if (!u) return '';
  const code = typeof u.role === 'string' ? u.role : u.role?.code;
  if (code && te(`layout.role.${code}`)) return t(`layout.role.${code}`);
  // Staff roles created by the school carry their own names.
  return (locale.value === 'lo' ? u.roleNameLo : u.roleNameEn) || code || '';
});

const onDocumentClick = (e: MouseEvent) => {
  if (accountOpen.value && accountEl.value && !accountEl.value.contains(e.target as Node)) {
    accountOpen.value = false;
  }
};
onMounted(() => document.addEventListener('click', onDocumentClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));

const handleLogout = () => {
  accountOpen.value = false;
  authStore.logout();
  router.push('/');
};
</script>
