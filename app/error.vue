<template>
  <main class="min-h-screen bg-surface-2 text-ink flex items-center justify-center px-4 py-12">
    <section class="panel w-full max-w-md p-8 flex flex-col items-center text-center gap-4">
      <span class="w-14 h-14 rounded-2xl flex items-center justify-center" :class="isNotFound ? 'bg-primary-soft text-primary-ink' : 'bg-danger-soft text-danger'">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path v-if="isNotFound" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </span>
      <p class="text-sm font-semibold text-ink-muted tnum">{{ statusCode }}</p>
      <h1 class="text-xl font-bold">{{ isNotFound ? $t('error_page.not_found_title') : $t('error_page.error_title') }}</h1>
      <p class="text-sm text-ink-muted">{{ isNotFound ? $t('error_page.not_found_body') : $t('error_page.error_body') }}</p>
      <div class="flex flex-wrap justify-center gap-2 pt-2">
        <button v-if="!isNotFound" type="button" class="btn-secondary" @click="retry">{{ $t('error_page.retry') }}</button>
        <button type="button" class="btn-primary" @click="goHome">{{ $t('error_page.go_home') }}</button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NuxtError } from '#app';
import { useAuthStore } from './application/stores/auth';

const props = defineProps<{ error: NuxtError }>();
const { t } = useI18n();

const statusCode = computed(() => props.error?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);
useHead({ title: () => (isNotFound.value ? t('error_page.not_found_title') : t('error_page.error_title')) });

// Back to the signed-in person's own portal, or the login page.
const home = computed(() => {
  const portal = useAuthStore().portal;
  return portal === 'admin' ? '/admin' : portal === 'teacher' ? '/teacher' : portal === 'parent' ? '/parent' : '/';
});
const goHome = () => clearError({ redirect: home.value });
const retry = () => clearError({ redirect: useRoute().fullPath });
</script>
