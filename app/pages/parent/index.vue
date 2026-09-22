<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-white">{{ $t('parentPortal.dashboard') }}</h1>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-500/10 text-pink-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">{{ $t('parentPortal.my_children') }}</p>
          <p class="text-2xl font-bold text-white">{{ parentStore.children.length }}</p>
        </div>
      </div>
      <div class="glass-panel p-6 rounded-2xl flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">{{ $t('parentPortal.attendance_rate') }}</p>
          <p class="text-2xl font-bold text-white">98%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed  } from 'vue';
import { useParentStore } from '../../application/stores/parent';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

definePageMeta({ layout: 'parent' });
useHead({ title: computed(() => `${t('parentPortal.dashboard')} — ${t('parentPortal.title')}`) });

const parentStore = useParentStore();

onMounted(() => {
  parentStore.fetchChildren();
});
</script>
