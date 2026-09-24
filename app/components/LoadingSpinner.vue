<template>
  <div class="flex items-center justify-center" :class="padding" role="status" aria-live="polite">
    <div
      class="animate-spin rounded-full border-t-2 border-b-2"
      :class="[sizeClasses[size], colorClasses[color]]"
    />
    <span class="sr-only">{{ $t('common.loading') }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: 'teal' | 'amber' | 'pink' | 'indigo';
    size?: 'sm' | 'md';
    /** Tailwind spacing classes for the wrapper, e.g. "py-12" or "p-12". */
    padding?: string;
  }>(),
  {
    color: 'teal',
    size: 'md',
    padding: 'py-20',
  }
);

// Full class names so Tailwind can detect them.
const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
};

const colorClasses = {
  teal: 'border-teal-500',
  amber: 'border-amber-500',
  pink: 'border-pink-500',
  indigo: 'border-indigo-500',
};
</script>
