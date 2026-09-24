<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0">
      <p v-if="eyebrow" class="text-[11px] font-bold uppercase tracking-wide text-primary-ink">{{ eyebrow }}</p>
      <h2 class="text-2xl font-bold tracking-tight text-ink">{{ title }}</h2>
      <p v-if="subtitle" class="mt-1 text-sm text-ink-muted">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; eyebrow?: string }>();
</script>
