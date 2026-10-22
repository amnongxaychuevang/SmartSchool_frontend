<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('parentPortal.dashboard')" />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard :title="$t('parentPortal.my_children')" :value="f.number(parentStore.children.length)" color-class="bg-primary">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </template>
      </StatCard>
      <StatCard :title="$t('parentPortal.total_balance')" :value="f.kip(totalBalance)" color-class="bg-emerald-600">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </template>
      </StatCard>
      <StatCard :title="$t('parentPortal.unpaid_invoices')" :value="f.number(unpaidCount)" color-class="bg-amber-600">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Quick Actions Grid -->
    <div>
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        {{ $t('parentPortal.quick_actions') }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Chat with Teacher -->
        <NuxtLink
          to="/parent/chat"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {{ $t('parentPortal.qa_chat_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('parentPortal.qa_chat_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Live Bus GPS -->
        <NuxtLink
          to="/parent/transport"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors">
                {{ $t('parentPortal.qa_bus_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('parentPortal.qa_bus_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Homework & Grading -->
        <NuxtLink
          to="/parent/assignments"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
                {{ $t('parentPortal.qa_assignments_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('parentPortal.qa_assignments_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Request Leave -->
        <NuxtLink
          to="/parent/leaves"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-purple-500 transition-colors">
                {{ $t('parentPortal.qa_leaves_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('parentPortal.qa_leaves_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Wallet & Fees -->
        <NuxtLink
          to="/parent/wallet"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">
                {{ $t('parentPortal.qa_wallet_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('parentPortal.qa_wallet_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- One row per child: rate over their most recent recorded school days. -->
    <section class="panel divide-y divide-line">
      <h3 class="px-5 py-4 font-bold">{{ $t('parentPortal.attendance_rate_recent') }}</h3>
      <div v-for="child in parentStore.children" :key="child.studentId" class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="min-w-0">
          <p class="font-semibold truncate">{{ locale === 'lo' ? child.fullNameLo : child.fullNameEn }}</p>
          <p class="text-xs text-ink-subtle font-mono">{{ child.studentCode }}</p>
        </div>
        <p v-if="rates[child.studentId] === undefined" class="text-sm text-ink-subtle">…</p>
        <p v-else-if="rates[child.studentId] === null" class="text-sm text-ink-subtle">{{ $t('parentPortal.no_attendance_yet') }}</p>
        <p v-else class="text-2xl font-bold tnum">{{ f.percent(rates[child.studentId]) }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useParentStore } from '../../application/stores/parent';
import { parentRepository } from '../../infrastructure/api/ParentRepository';
import PageHeader from '../../components/PageHeader.vue';
import StatCard from '../../components/StatCard.vue';
import { useFormat } from '../../composables/useFormat';
import { attendanceRate } from '../../utils/schoolDate';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => `${t('parentPortal.dashboard')} — ${t('parentPortal.title')}` });

const parentStore = useParentStore();
const rates = reactive<Record<number, number | null>>({});
const walletBalances = reactive<Record<number, number>>({});
const totalBalance = computed(() => Object.values(walletBalances).reduce((s, b) => s + b, 0));
const unpaidCount = ref(0);

onMounted(async () => {
  await parentStore.fetchChildren();
  await Promise.all(parentStore.children.map(async (child) => {
    try {
      const res = await parentRepository.getChildAttendance(child.studentId);
      rates[child.studentId] = attendanceRate(res.data ?? []);
    } catch {
      rates[child.studentId] = null;
    }
    try {
      const wRes = await parentRepository.getChildWallet(child.studentId);
      walletBalances[child.studentId] = Number(wRes.data?.balance ?? 0);
    } catch { /* wallet may not exist */ }
    try {
      const invoices = await parentRepository.getChildInvoices(child.studentId);
      unpaidCount.value += invoices.filter((inv) => inv.status === 'unpaid' || inv.status === 'partial').length;
    } catch { /* no invoices */ }
  }));
});
</script>
