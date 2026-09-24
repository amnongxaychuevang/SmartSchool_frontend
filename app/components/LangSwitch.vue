<template>
  <div class="inline-flex h-9 p-0.5 rounded border border-line bg-surface-2" role="group" :aria-label="$t('layout.language')">
    <button
      v-for="option in options"
      :key="option.code"
      type="button"
      :lang="option.code"
      :title="option.name"
      :aria-pressed="locale === option.code"
      :class="[
        'px-2.5 rounded-sm text-xs font-bold transition-colors',
        locale === option.code ? 'bg-surface text-primary-ink shadow-float' : 'text-ink-subtle hover:text-ink',
      ]"
      @click="setLocale(option.code)"
    >
      {{ option.short }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { locale, setLocale } = useI18n();

// Language names are shown in their own language, as is standard for language pickers.
const options = [
  { code: "lo", short: "LO", name: "ພາສາລາວ" },
  { code: "en", short: "EN", name: "English" },
] as const;
</script>
