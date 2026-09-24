<template>
  <button
    class="w-9 h-9 rounded flex items-center justify-center border border-line text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
    :title="isLight ? $t('theme.switch_to_dark') : $t('theme.switch_to_light')"
    :aria-label="isLight ? $t('theme.switch_to_dark') : $t('theme.switch_to_light')"
    @click="toggleTheme"
  >
    <svg v-if="isLight" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Light is the default theme. The inline script in nuxt.config.ts applies the
// saved theme before first paint; this component only keeps it in sync.
const isLight = ref(true);

const applyTheme = () => {
  const root = document.documentElement;
  root.classList.toggle('light', isLight.value);
  root.classList.toggle('dark', !isLight.value);
};

const toggleTheme = () => {
  isLight.value = !isLight.value;
  try {
    localStorage.setItem('theme', isLight.value ? 'light' : 'dark');
  } catch {
    // Storage can be unavailable (private mode); the theme still switches.
  }
  applyTheme();
};

onMounted(() => {
  isLight.value = !document.documentElement.classList.contains('dark');
  applyTheme();
});
</script>
