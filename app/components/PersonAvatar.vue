<template>
  <span
    :class="['relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-primary-soft text-primary-ink font-bold select-none', SIZES[size]]"
  >
    <img
      v-if="src && !failed"
      :src="src"
      :alt="name"
      loading="lazy"
      decoding="async"
      class="w-full h-full object-cover"
      @error="failed = true"
    >
    <span v-else aria-hidden="true">{{ initial }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  name: string;
  /** Server path like /uploads/students/x.webp, an absolute URL, or a blob: preview. */
  photoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}>(), { photoUrl: null, size: 'sm' });

const SIZES = {
  xs: 'w-6 h-6 text-[11px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
};

const mediaUrl = useMediaUrl();
const src = computed(() => mediaUrl(props.photoUrl));

const failed = ref(false);
watch(src, () => (failed.value = false));

const initial = computed(() => (props.name?.trim()?.[0] ?? '?').toUpperCase());
</script>
