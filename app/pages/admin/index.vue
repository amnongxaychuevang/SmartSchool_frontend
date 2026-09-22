<template>
  <div class="flex flex-col gap-8">
    <!-- Header/Welcome Area -->
    <div class="page-enter flex justify-between items-end" style="animation-delay: 0.05s;">
      <div>
        <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-md">
          {{ $t('admin.dashboard') }}
        </h1>
        <p class="text-slate-400 mt-2 text-sm">{{ $t('admin.welcome_message') }}</p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300" 
        style="animation-delay: 0.1s;"
        :title="$t('admin.total_students')"
        :value="adminStore.statsLoading ? '...' : (adminStore.stats?.totalStudents ?? '—')"
        color-class="bg-gradient-to-br from-blue-500 to-indigo-600"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
        style="animation-delay: 0.2s;"
        :title="$t('admin.present_today')"
        :value="adminStore.statsLoading ? '...' : (adminStore.stats?.presentToday ?? '—')"
        color-class="bg-gradient-to-br from-teal-400 to-emerald-600"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
        style="animation-delay: 0.3s;"
        :title="$t('admin.absent_today')"
        :value="adminStore.statsLoading ? '...' : (adminStore.stats?.absentToday ?? '—')"
        color-class="bg-gradient-to-br from-orange-400 to-red-500"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>

      <StatCard
        class="page-enter hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300"
        style="animation-delay: 0.4s;"
        :title="$t('admin.transactions_today')"
        :value="adminStore.statsLoading ? '...' : `₭ ${Number(adminStore.stats?.transactionsToday?.totalAmount ?? 0).toLocaleString()}`"
        color-class="bg-gradient-to-br from-purple-500 to-pink-600"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- Live Feed & Quick Links -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Live Feed -->
      <div class="lg:col-span-1 h-[560px] page-enter" style="animation-delay: 0.5s;">
        <LiveFeed class="h-full rounded-2xl shadow-lg border border-slate-700/30 overflow-hidden" />
      </div>

      <!-- Quick Links Panel -->
      <div class="lg:col-span-2 glass-panel-hover p-8 flex flex-col gap-6 page-enter relative overflow-hidden" style="animation-delay: 0.6s;">
        <!-- Decorative bg effect -->
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"/>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"/>

        <h3 class="text-xl font-bold text-white relative z-10 flex items-center gap-2">
          <span class="w-1.5 h-6 bg-teal-500 rounded-full"/>
          {{ $t('admin.quick_links') }}
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1 relative z-10">
          <!-- Link 1 -->
          <NuxtLink
to="/admin/students"
            class="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(59,130,246,0.15)]">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{{ $t('admin.manage_students') }}</span>
          </NuxtLink>

          <!-- Link 2 -->
          <NuxtLink
to="/admin/users"
            class="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-teal-500/50 hover:bg-teal-500/10 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(20,184,166,0.15)]">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-slate-200 group-hover:text-teal-400 transition-colors">{{ $t('admin.manage_users') }}</span>
          </NuxtLink>

          <!-- Link 3 -->
          <NuxtLink
to="/admin/classes"
            class="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 group cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(168,85,247,0.15)]">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">{{ $t('admin.manage_classes') }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAdminStore } from '../../application/stores/admin';
import StatCard from '../../components/StatCard.vue';
import LiveFeed from '../../components/LiveFeed.vue';

definePageMeta({ layout: 'admin' });

const adminStore = useAdminStore();

useHead({ title: 'Dashboard — Smart School Admin' });

onMounted(() => {
  adminStore.fetchStats();
});
</script>
