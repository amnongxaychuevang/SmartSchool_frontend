<template>
  <AppModal :open="open" :title="title" size="sm" @update:open="emit('update:open', $event)">
    <p class="text-sm text-ink-muted">{{ message }}</p>
    <p v-if="error" role="alert" class="mt-3 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ error }}</p>
    <template #footer>
      <button type="button" class="btn-secondary" :disabled="busy" @click="emit('update:open', false)">{{ $t('common.cancel') }}</button>
      <button type="button" :class="tone === 'danger' ? 'btn-danger' : 'btn-primary'" :disabled="busy" @click="emit('confirm')">
        {{ busy ? $t('common.saving') : (confirmLabel || $t('common.confirm')) }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from './AppModal.vue';

// Replaces window.confirm(): translated, styled, and able to show the server's error.
withDefaults(defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  busy?: boolean;
  error?: string;
}>(), { confirmLabel: '', tone: 'primary', busy: false, error: '' });
const emit = defineEmits<{ (e: 'update:open', value: boolean): void; (e: 'confirm'): void }>();
</script>
