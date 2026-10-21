<template>
  <nav
    v-if="(totalPages > 1 || (total !== undefined && total > 0)) && !loading"
    class="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
    :class="total !== undefined ? 'justify-between' : 'justify-center'"
    :aria-label="$t('common.pagination')"
  >
    <!-- Left: Showing X-Y of Z & Per page selector -->
    <div v-if="total !== undefined" class="text-xs text-ink-muted flex flex-wrap items-center gap-2">
      <span>
        {{ $t('common.showing_range', { start, end, total }) }}
      </span>
      <template v-if="pageSize !== undefined">
        <span class="text-line">|</span>
        <div class="flex items-center gap-1.5">
          <span>{{ $t('common.per_page') }}:</span>
          <select
            :value="pageSize"
            class="input-field py-1 px-2.5 text-xs h-8 w-auto rounded-lg border border-line bg-surface cursor-pointer"
            @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
      </template>
    </div>

    <!-- Right: Page buttons -->
    <div class="flex items-center gap-1.5 self-center sm:self-auto">
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm"
        :class="currentPage <= 1
          ? 'bg-primary/20 text-primary-300 dark:bg-slate-800 dark:text-slate-600 shadow-none cursor-not-allowed'
          : 'bg-primary !text-white hover:bg-primary-hover cursor-pointer'"
        :style="currentPage > 1 ? 'color: #ffffff !important; background-color: rgb(var(--primary)) !important;' : ''"
        :disabled="currentPage <= 1"
        :aria-label="$t('common.first_page')"
        @click="changePage(1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" :style="currentPage > 1 ? 'stroke: #ffffff !important;' : ''"><path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
      </button>
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm"
        :class="currentPage <= 1
          ? 'bg-primary/20 text-primary-300 dark:bg-slate-800 dark:text-slate-600 shadow-none cursor-not-allowed'
          : 'bg-primary !text-white hover:bg-primary-hover cursor-pointer'"
        :style="currentPage > 1 ? 'color: #ffffff !important; background-color: rgb(var(--primary)) !important;' : ''"
        :disabled="currentPage <= 1"
        :aria-label="$t('common.prev')"
        @click="changePage(currentPage - 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" :style="currentPage > 1 ? 'stroke: #ffffff !important;' : ''"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        type="button"
        class="min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-sm tnum transition-colors"
        :class="page === currentPage
          ? 'bg-primary !text-white font-bold shadow-sm'
          : 'text-slate-600 dark:text-slate-300 hover:bg-surface-2 hover:text-ink font-medium'"
        :style="page === currentPage ? 'color: #ffffff !important; background-color: rgb(var(--primary)) !important;' : ''"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="changePage(page)"
      >
        <span :style="page === currentPage ? 'color: #ffffff !important;' : ''">{{ page }}</span>
      </button>

      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm"
        :class="currentPage >= totalPages
          ? 'bg-primary/20 text-primary-300 dark:bg-slate-800 dark:text-slate-600 shadow-none cursor-not-allowed'
          : 'bg-primary !text-white hover:bg-primary-hover cursor-pointer'"
        :style="currentPage < totalPages ? 'color: #ffffff !important; background-color: rgb(var(--primary)) !important;' : ''"
        :disabled="currentPage >= totalPages"
        :aria-label="$t('common.next')"
        @click="changePage(currentPage + 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" :style="currentPage < totalPages ? 'stroke: #ffffff !important;' : ''"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center rounded-lg transition-all shadow-sm"
        :class="currentPage >= totalPages
          ? 'bg-primary/20 text-primary-300 dark:bg-slate-800 dark:text-slate-600 shadow-none cursor-not-allowed'
          : 'bg-primary !text-white hover:bg-primary-hover cursor-pointer'"
        :style="currentPage < totalPages ? 'color: #ffffff !important; background-color: rgb(var(--primary)) !important;' : ''"
        :disabled="currentPage >= totalPages"
        :aria-label="$t('common.last_page')"
        @click="changePage(totalPages)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" :style="currentPage < totalPages ? 'stroke: #ffffff !important;' : ''"><path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  currentPage: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
}>(), {
  total: undefined,
  pageSize: undefined,
  pageSizeOptions: () => [15, 25, 50, 100],
  loading: false,
});

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
  (e: 'update:pageSize', size: number): void;
}>();

const MAX_VISIBLE = 5;

const start = computed(() => {
  if (!props.total || props.total === 0) return 0;
  const size = props.pageSize || 15;
  return (props.currentPage - 1) * size + 1;
});

const end = computed(() => {
  if (!props.total) return 0;
  const size = props.pageSize || 15;
  return Math.min(props.currentPage * size, props.total);
});

const visiblePages = computed(() => {
  const count = Math.min(MAX_VISIBLE, props.totalPages);
  const startPage = Math.max(1, Math.min(props.currentPage - Math.floor(count / 2), props.totalPages - count + 1));
  return Array.from({ length: count }, (_, i) => startPage + i);
});

const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:page', page);
  }
};

const changePageSize = (size: number) => {
  if (size !== props.pageSize) {
    emit('update:pageSize', size);
    emit('update:page', 1);
  }
};
</script>

<style scoped lang="postcss">
.pg-arrow {
  @apply w-8 h-8 flex items-center justify-center rounded-lg bg-primary !text-white transition-all hover:bg-primary-hover shadow-sm disabled:bg-primary/20 disabled:!text-primary-300 dark:disabled:bg-slate-800 dark:disabled:!text-slate-600 disabled:shadow-none disabled:cursor-not-allowed;
  color: #ffffff;
}
.pg-arrow:not(:disabled) svg {
  stroke: #ffffff;
}
.pg-num {
  @apply min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-sm text-slate-600 dark:text-slate-300 transition-colors hover:bg-surface-2 hover:text-ink font-medium;
}
.pg-num-active {
  @apply bg-primary !text-white font-bold hover:bg-primary shadow-sm dark:!text-white dark:hover:bg-primary;
  color: #ffffff !important;
}
</style>
