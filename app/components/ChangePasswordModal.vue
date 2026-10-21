<template>
  <AppModal :open="open" :title="$t('password.change_title')" size="sm" @update:open="emit('update:open', $event)">
    <form id="change-password-form" class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div class="flex flex-col gap-1.5">
        <label for="cp-current" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('password.current') }}</label>
        <input id="cp-current" v-model="form.current" type="password" required autocomplete="current-password" class="input-field">
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="cp-new" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('password.new') }}</label>
        <input id="cp-new" v-model="form.next" type="password" required minlength="6" autocomplete="new-password" class="input-field">
        <p class="text-xs text-ink-subtle">{{ $t('password.min_length') }}</p>
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="cp-confirm" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('password.confirm') }}</label>
        <input id="cp-confirm" v-model="form.confirm" type="password" required autocomplete="new-password" class="input-field">
      </div>
      <p v-if="error" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ error }}</p>
    </form>
    <template #footer>
      <button type="button" class="btn-secondary" :disabled="saving" @click="emit('update:open', false)">{{ $t('common.cancel') }}</button>
      <button type="submit" form="change-password-form" class="btn-primary" :disabled="saving || !form.current || !form.next">
        {{ saving ? $t('common.saving') : $t('password.change_btn') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import AppModal from './AppModal.vue';
import { authRepository } from '../infrastructure/api/AuthRepository';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();

const { t } = useI18n();
const dialog = useDialog();
const form = reactive({ current: '', next: '', confirm: '' });
const saving = ref(false);
const error = ref('');

watch(() => props.open, (open) => {
  if (open) Object.assign(form, { current: '', next: '', confirm: '' });
  error.value = '';
});

const submit = async () => {
  if (form.next.length < 6) { error.value = t('password.min_length'); return; }
  if (form.next !== form.confirm) { error.value = t('password.mismatch'); return; }
  saving.value = true;
  error.value = '';
  try {
    await authRepository.changePassword(form.current, form.next);
    emit('update:open', false);
    dialog.success(t('password.changed'));
  } catch (err) {
    error.value = passwordErrorMessage(err, t);
  } finally {
    saving.value = false;
  }
};
</script>
