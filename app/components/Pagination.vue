<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
    <button
:disabled="currentPage <= 1"
      class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="changePage(currentPage - 1)">← {{ $t('common.back') }}</button>
    <span class="text-sm text-slate-400">{{ currentPage }} / {{ totalPages }}</span>
    <button
:disabled="currentPage >= totalPages"
      class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      @click="changePage(currentPage + 1)">Next →</button>
  </div>
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
