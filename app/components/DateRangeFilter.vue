<script setup lang="ts">
/**
 * From–to date filter for lists and reports.
 *
 *   <DateRangeFilter v-model:from="dateFrom" v-model:to="dateTo" @change="load" />
 *
 * The "to" picker cannot go before "from" (and the other way round), and if one is
 * moved past the other the other follows, so the range sent to the API is never
 * backwards. Dates are "YYYY-MM-DD" strings, empty for "no limit".
 */
const from = defineModel<string>('from', { default: '' });
const to = defineModel<string>('to', { default: '' });
const emit = defineEmits<{ change: [] }>();
defineProps<{ max?: string }>();

function setFrom(value: string) {
  from.value = value;
  if (value && to.value && to.value < value) to.value = value;
  emit('change');
}
function setTo(value: string) {
  to.value = value;
  if (value && from.value && from.value > value) from.value = value;
  emit('change');
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <input
      type="date"
      class="input-field w-auto tnum"
      :value="from"
      :max="to || max"
      :aria-label="$t('common.date_from')"
      @change="setFrom(($event.target as HTMLInputElement).value)"
    >
    <span class="text-ink-subtle" aria-hidden="true">–</span>
    <input
      type="date"
      class="input-field w-auto tnum"
      :value="to"
      :min="from || undefined"
      :max="max"
      :aria-label="$t('common.date_to')"
      @change="setTo(($event.target as HTMLInputElement).value)"
    >
  </div>
</template>
