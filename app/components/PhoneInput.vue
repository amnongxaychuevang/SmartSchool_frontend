<template>
  <div class="flex items-stretch rounded border border-line-strong bg-surface focus-within:border-primary focus-within:shadow-[var(--focus-ring)] transition-shadow">
    <span class="flex items-center px-2.5 text-sm text-ink-muted bg-surface-2 border-r border-line select-none tnum rounded-l" aria-hidden="true">+856 20</span>
    <input
      :id="id"
      :value="display"
      type="tel"
      inputmode="numeric"
      autocomplete="off"
      maxlength="9"
      pattern="[0-9]{4} [0-9]{4}"
      :required="required"
      :title="L('8 digits after +856 20', 'ຕົວເລກ 8 ຕົວ ຕໍ່ຈາກ +856 20')"
      placeholder="XXXX XXXX"
      :aria-label="ariaLabel"
      class="flex-1 min-w-0 min-h-9 px-3 py-1.5 text-sm bg-transparent text-ink outline-none placeholder:text-ink-subtle tnum rounded-r"
      @input="onInput"
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/**
 * Lao mobile number: "+856 20" is fixed, the user types the 8 digits.
 * v-model is "+856 20 XXXX XXXX" (the stored form), or "" when empty.
 */
const props = withDefaults(defineProps<{
  modelValue?: string | null;
  required?: boolean;
  id?: string;
  ariaLabel?: string;
}>(), { modelValue: '', required: false, id: undefined, ariaLabel: undefined });

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();
const { locale } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);

// Accepts anything already stored or typed: "+856 20 5550 0105", "02055500105", "55500105"…
const localDigits = (value: string | null | undefined) => {
  const v = (value ?? '').trim();
  // Our own / stored form, also while partly typed ("+856 20 5").
  const own = v.match(/^\+856\s*20\s*(.*)$/);
  if (own) return own[1]!.replace(/\D/g, '').slice(0, 8);
  let d = v.replace(/\D/g, '');
  if (d.startsWith('856')) d = d.slice(3);
  else if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10 && d.startsWith('20')) d = d.slice(2);
  return d.slice(0, 8);
};

const format = (d: string) => (d.length > 4 ? `${d.slice(0, 4)} ${d.slice(4)}` : d);
const display = computed(() => format(localDigits(props.modelValue)));

const onInput = (e: Event) => {
  const el = e.target as HTMLInputElement;
  const d = el.value.replace(/\D/g, '').slice(0, 8);
  el.value = format(d); // keep the caret-side text tidy while typing
  emit('update:modelValue', d ? `+856 20 ${format(d)}` : '');
};
</script>
