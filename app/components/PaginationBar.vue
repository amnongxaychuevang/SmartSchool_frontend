<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-between gap-2 px-5 py-3 border-t border-line" :aria-label="$t('common.pagination')">
    <span class="text-sm text-ink-subtle tnum">{{ $t('common.page_of', { page: currentPage, total: totalPages }) }}</span>
    <div class="flex items-center gap-2">
      <button type="button" class="btn-secondary min-h-8 px-3" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
        {{ $t('common.prev') }}
      </button>
      <button type="button" class="btn-secondary min-h-8 px-3" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
        {{ $t('common.next') }}
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: 'update:page', page: number): void;
}>();

const changePage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:page', page);
  }
};
</script>
