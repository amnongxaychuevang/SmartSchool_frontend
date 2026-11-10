<script setup lang="ts" generic="T extends string">
/**
 * Underlined tabs for switching views inside a page.
 *
 *   <TabBar v-model="activeTab" :tabs="[{ value: 'list', label: $t('...') }, ...]" />
 *
 * Keyboard: Left/Right (and Home/End) move between tabs, as the WAI-ARIA tabs
 * pattern expects; only the selected tab is in the Tab order.
 */
const props = defineProps<{ tabs: { value: T; label: string }[] }>();
const model = defineModel<T>({ required: true });

const buttons = ref<HTMLButtonElement[]>([]);
function onKey(e: KeyboardEvent, index: number) {
  const last = props.tabs.length - 1;
  const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  model.value = props.tabs[next]!.value;
  buttons.value[next]?.focus();
}
</script>

<template>
  <div role="tablist" class="flex max-w-full gap-6 overflow-x-auto">
    <button
      v-for="(tab, i) in tabs"
      :key="tab.value"
      ref="buttons"
      type="button"
      role="tab"
      :aria-selected="model === tab.value"
      :tabindex="model === tab.value ? 0 : -1"
      class="whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors"
      :class="model === tab.value ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'"
      @click="model = tab.value"
      @keydown="onKey($event, i)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
