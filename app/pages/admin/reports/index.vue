<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('reports.title')" :subtitle="$t('reports.subtitle')" />

    <section v-for="group in visibleGroups" :key="group.key" class="flex flex-col gap-3">
      <h2 class="text-xs font-bold uppercase tracking-wider text-ink-muted">{{ $t(`reports.group_${group.key}`) }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <NuxtLink
          v-for="card in group.cards"
          :key="card.to"
          :to="card.to"
          class="panel p-5 flex items-start gap-4 hover:border-primary/40 hover:shadow-float transition-all group"
        >
          <span class="w-11 h-11 rounded-xl bg-primary-soft text-primary-ink flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon" />
            </svg>
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-2">
              <span class="font-semibold group-hover:text-primary-ink transition-colors">{{ $t(card.title) }}</span>
              <span v-if="card.isNew" class="badge-teal">{{ $t('reports.new') }}</span>
            </span>
            <span class="block mt-1 text-xs text-ink-muted leading-relaxed">{{ $t(card.desc) }}</span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-1 text-ink-subtle group-hover:text-primary-ink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission, permissionForPath } from '../../../components/layout/adminNav';

definePageMeta({ layout: 'admin' });
const { t } = useI18n();
useHead({ title: () => t('page_titles.reports') });
const authStore = useAuthStore();

const ICONS = {
  attendance: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  people: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  trophy: 'M5 3h14M7 3v4a5 5 0 0010 0V3M5 5H3v1a3 3 0 003 3m13-4h2v1a3 3 0 01-3 3M12 12v4m-4 5h8m-6-5h4v5h-4z',
  card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  cash: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  wallet: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm13 5h.01',
  shop: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
};

const GROUPS = [
  { key: 'academic', cards: [
    { to: '/admin/reports/attendance', title: 'reports.attendance_title', desc: 'reports.attendance_desc', icon: ICONS.attendance },
    { to: '/admin/reports/students', title: 'reports.enrollment_title', desc: 'reports.enrollment_desc', icon: ICONS.people },
    { to: '/admin/reports/grades', title: 'reports.grades_title', desc: 'reports.grades_desc', icon: ICONS.chart },
    { to: '/admin/reports/class-results', title: 'reports.results_title', desc: 'reports.results_desc', icon: ICONS.trophy, isNew: true },
  ] },
  { key: 'finance', cards: [
    { to: '/admin/reports/fees', title: 'reports.fees_title', desc: 'reports.fees_desc', icon: ICONS.card },
    { to: '/admin/reports/debtors', title: 'reports.debtors_title', desc: 'reports.debtors_desc', icon: ICONS.alert, isNew: true },
    { to: '/admin/reports/daily-cash', title: 'reports.cash_title', desc: 'reports.cash_desc', icon: ICONS.cash, isNew: true },
    { to: '/admin/reports/wallet', title: 'reports.wallet_title', desc: 'reports.wallet_desc', icon: ICONS.wallet },
    { to: '/admin/reports/shop-sales', title: 'reports.shop_title', desc: 'reports.shop_desc', icon: ICONS.shop },
    { to: '/admin/reports/cashflow', title: 'reports.cashflow_title', desc: 'reports.cashflow_desc', icon: ICONS.cash, isNew: true },
  ] },
];

// Only the reports this role may open (same rule the route guard uses).
const visibleGroups = computed(() =>
  GROUPS.map((g) => ({
    ...g,
    cards: g.cards.filter((c) => {
      const needed = permissionForPath(c.to);
      return !needed || hasPermission(authStore.permissions, needed);
    }),
  })).filter((g) => g.cards.length),
);
</script>
