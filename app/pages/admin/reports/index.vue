<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.reports') }}</p>
      <h2 class="text-2xl font-bold text-white">{{ $t('reports.title') }}</h2>
      <p class="text-sm text-slate-400">{{ $t('reports.subtitle') }}</p>
    </div>

    <!-- Reports Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- Card 1: Attendance -->
      <div class="glass-panel p-5 flex flex-col gap-4 border border-slate-800/80 hover:border-teal-500/30 transition-all group">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-teal-400 transition-colors">{{ $t('reports.attendance_title') }}</h3>
            <p class="text-xs text-slate-500">{{ $t('reports.attendance_desc') }}</p>
          </div>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">{{ $t('reports.attendance_detail') }}</p>
        <NuxtLink to="/admin/reports/attendance" class="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5">
          <span>{{ $t('reports.view_report') }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
        </NuxtLink>
      </div>

      <!-- Card 2: Student Enrollment -->
      <div class="glass-panel p-5 flex flex-col gap-4 border border-slate-800/80 hover:border-blue-500/30 transition-all group">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{{ $t('reports.enrollment_title') }}</h3>
            <p class="text-xs text-slate-500">{{ $t('reports.enrollment_desc') }}</p>
          </div>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">{{ $t('reports.enrollment_detail') }}</p>
        <button class="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5">
          <span>{{ $t('reports.view_report') }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <!-- Card 3: Financials & Fees -->
      <div class="glass-panel p-5 flex flex-col gap-4 border border-slate-800/80 hover:border-purple-500/30 transition-all group">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-purple-400 transition-colors">{{ $t('reports.fees_title') }}</h3>
            <p class="text-xs text-slate-500">{{ $t('reports.fees_desc') }}</p>
          </div>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">{{ $t('reports.fees_detail') }}</p>
        <NuxtLink to="/admin/reports/fees" class="mt-auto w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5">
          <span>{{ $t('reports.view_report') }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' });
useHead({ title: 'Reports — Smart School Admin' });
</script>
