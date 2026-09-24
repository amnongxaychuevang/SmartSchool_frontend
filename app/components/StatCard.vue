<template>
  <div class="panel p-4 flex items-start justify-between gap-3">
    <div class="min-w-0">
      <p class="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{{ title }}</p>
      <h3 class="mt-2 text-3xl font-bold tracking-tight text-ink tnum">{{ value }}</h3>
    </div>
    <div data-stat-icon class="w-9 h-9 rounded flex items-center justify-center shrink-0 text-white" :class="colorClass">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  colorClass: {
    type: String,
    default: 'bg-primary'
  }
});
</script>
