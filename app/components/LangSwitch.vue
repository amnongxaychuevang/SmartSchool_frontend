<template>
  <div class="relative flex items-center group">
    <div class="absolute left-2.5 pointer-events-none text-slate-400 group-hover:text-pink-400 transition-colors z-10">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <select v-model="current" class="lang-select appearance-none bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl py-2 pl-9 pr-8 text-xs font-semibold focus:outline-none focus:border-pink-500 transition-all cursor-pointer relative z-0" @change="onChange">
      <option value="lo">ພາສາລາວ</option>
      <option value="en">English</option>
    </select>
    <div class="absolute right-2.5 pointer-events-none text-slate-400 z-10">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { locale, setLocale } = useI18n();

const current = computed<"lo" | "en">({
  get: () => locale.value as "lo" | "en",
  set: (v) => setLocale(v),
});

const onChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value as "lo" | "en";
  setLocale(val);
};
</script>

<style scoped>
.lang-select {
  font-family: "Phetsarath", "Phetsarath OT", "Inter", sans-serif;
}
</style>
