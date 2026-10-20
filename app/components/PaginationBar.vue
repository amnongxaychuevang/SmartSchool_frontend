<template>
  <nav v-if="totalPages > 1 && !loading" class="flex items-center justify-center gap-1.5 px-5 py-3" :aria-label="$t('common.pagination')">
    <button type="button" class="pg-arrow" :disabled="currentPage <= 1" :aria-label="$t('common.first_page')" @click="changePage(1)">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
    </button>
    <button type="button" class="pg-arrow" :disabled="currentPage <= 1" :aria-label="$t('common.prev')" @click="changePage(currentPage - 1)">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      type="button"
      class="pg-num tnum"
      :class="page === currentPage ? 'pg-num-active' : ''"
      :aria-current="page === currentPage ? 'page' : undefined"
      @click="changePage(page)"
    >
      {{ page }}
    </button>

    <button type="button" class="pg-arrow" :disabled="currentPage >= totalPages" :aria-label="$t('common.next')" @click="changePage(currentPage + 1)">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
    </button>
    <button type="button" class="pg-arrow" :disabled="currentPage >= totalPages" :aria-label="$t('common.last_page')" @click="changePage(totalPages)">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  currentPage: number;
  totalPages: number;
  loading?: boolean;
}>(), { loading: false });

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
}>();

const MAX_VISIBLE = 5;

const visiblePages = computed(() => {
  const count = Math.min(MAX_VISIBLE, props.totalPages);
  const start = Math.max(1, Math.min(props.currentPage - Math.floor(count / 2), props.totalPages - count + 1));
  return Array.from({ length: count }, (_, i) => start + i);
});

const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:page', page);
  }
};
</script>

<style scoped lang="postcss">
.pg-arrow {
  @apply w-8 h-8 flex items-center justify-center rounded-md bg-teal-500 text-white transition-colors hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-teal-500;
}
.pg-num {
  @apply min-w-8 h-8 px-2 flex items-center justify-center rounded-md text-sm text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800;
}
.pg-num-active {
  @apply bg-teal-500 text-white font-semibold hover:bg-teal-500 dark:text-white dark:hover:bg-teal-500;
}
</style>
