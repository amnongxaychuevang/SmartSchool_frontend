<template>
  <button 
    class="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all" 
    style="border: 1px solid rgba(148,163,184,0.08);"
    :title="isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'"
    @click="toggleTheme"
  >
    <svg v-if="isLight" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isLight = ref(false);

const applyTheme = () => {
  if (isLight.value) {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
};

const toggleTheme = () => {
  isLight.value = !isLight.value;
  localStorage.setItem('theme', isLight.value ? 'light' : 'dark');
  applyTheme();
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    isLight.value = true;
  }
  applyTheme();
});
</script>
