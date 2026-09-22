<template>
  <div class="glass-panel p-6 flex items-center gap-4">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white" :class="colorClass">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </slot>
    </div>
    <div>
      <p class="text-sm text-slate-400">{{ title }}</p>
      <h3 class="text-2xl font-bold text-white">{{ value }}</h3>
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
    default: 'bg-teal-500'
  }
});
</script>
