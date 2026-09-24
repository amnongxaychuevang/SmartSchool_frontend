<template>
  <div
    v-if="term"
    class="hidden md:flex items-center gap-2 h-9 px-3 rounded border border-line bg-surface text-sm"
    :title="$t('layout.active_term')"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary-ink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <span class="font-semibold text-ink tnum whitespace-nowrap">{{ term.academicYear }}</span>
    <span class="text-ink-subtle">·</span>
    <span class="text-ink-muted whitespace-nowrap">{{ locale === 'lo' ? term.termNameLo : term.termNameEn }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { academicsRepository, type AcademicTerm } from '../../infrastructure/api/AcademicsRepository';

const { locale } = useI18n();
const terms = ref<AcademicTerm[]>([]);

// Only a term the school has marked active is shown; nothing is guessed.
const term = computed(() => terms.value.find((t) => t.status === 'active') ?? null);

onMounted(async () => {
  try {
    terms.value = await academicsRepository.getTerms();
  } catch {
    // The chip is informational; without terms it simply stays hidden.
  }
});
</script>
