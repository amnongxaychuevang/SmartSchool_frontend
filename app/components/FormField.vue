<script setup lang="ts">
/**
 * Label + control + hint/error, the same on every form.
 *
 *   <FormField :label="$t('students.name')" required :error="errors.name" v-slot="{ id }">
 *     <input :id="id" v-model="form.name" class="input-field" required>
 *   </FormField>
 *
 * The slot gets an `id` to put on the control, so the label is tied to it (clicking
 * the label focuses the field; screen readers read the label). `required` adds the
 * red asterisk; `error` shows below the field and marks the control invalid.
 */
const props = defineProps<{
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  /** Use an existing id instead of a generated one. */
  for?: string;
}>();

const generated = useId();
const id = computed(() => props.for || generated);
const describedBy = computed(() => (props.error ? `${id.value}-error` : props.hint ? `${id.value}-hint` : undefined));
</script>

<template>
  <div>
    <label :for="id" class="mb-1.5 block text-sm font-semibold text-ink">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger" aria-hidden="true">*</span>
    </label>
    <slot :id="id" :described-by="describedBy" :invalid="!!error" />
    <p v-if="error" :id="`${id}-error`" role="alert" class="mt-1 text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1 text-xs text-ink-muted">{{ hint }}</p>
  </div>
</template>
