<template>
  <img
    :src="src"
    :alt="alt"
    :class="[
      'object-contain shrink-0',
      sizeClass,
      rounded ? 'rounded-xl' : '',
      border ? 'border border-slate-200 dark:border-slate-800' : '',
    ]"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
    rounded?: boolean;
    border?: boolean;
  }>(),
  {
    alt: 'Smart School Logo',
    size: 'custom',
    rounded: true,
    border: false,
  }
);

const src = '/logo.png';

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    custom: '',
  };
  return map[props.size] || '';
});
</script>
