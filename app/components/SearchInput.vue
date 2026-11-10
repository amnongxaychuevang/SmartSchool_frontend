<script setup lang="ts">
/**
 * The search box used above lists: magnifier icon, the input, and a clear (x) button.
 *
 *   <SearchInput v-model="search" :placeholder="$t('...')" @input="onSearch" @clear="onSearch()" />
 *
 * Any other attribute (@keyup.enter, aria-label, maxlength...) goes to the <input>;
 * `class` goes to the wrapper so pages can size it (e.g. class="flex-1 max-w-md").
 * The model is updated before the page's own @input runs, so a handler that reads
 * the bound value always sees the new text. @clear fires after the box is emptied.
 */
defineOptions({ inheritAttrs: false });

defineProps<{ modelValue: string | null | undefined; placeholder?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string]; clear: [] }>();

const attrs = useAttrs();
const inputAttrs = computed(() => {
  const { class: _class, onInput: _onInput, ...rest } = attrs;
  return rest;
});

function call(handler: unknown, arg?: unknown) {
  if (Array.isArray(handler)) handler.forEach((h) => call(h, arg));
  else if (typeof handler === 'function') handler(arg);
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
  call(attrs.onInput, event);
}

const input = ref<HTMLInputElement | null>(null);
function clear() {
  emit('update:modelValue', '');
  emit('clear');
  input.value?.focus();
}
defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div class="relative" :class="attrs.class">
    <svg xmlns="http://www.w3.org/2000/svg" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      ref="input"
      type="text"
      class="search-bar"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :aria-label="(inputAttrs['aria-label'] as string | undefined) ?? placeholder"
      v-bind="inputAttrs"
      @input="onInput"
    >
    <button
      v-if="modelValue"
      type="button"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle transition-colors hover:text-ink"
      :aria-label="$t('common.clear_search')"
      @click="clear"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
