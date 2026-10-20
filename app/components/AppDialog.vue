<template>
  <Teleport to="body">
    <Transition name="app-dialog">
      <div v-if="state.open" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink/40" @click="cancel" />
        <div
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="messageId"
          class="dialog-card relative w-full max-w-sm panel-float px-6 pt-6 pb-5 flex flex-col items-center text-center"
        >
          <div :class="['w-12 h-12 rounded-full flex items-center justify-center mb-4', look.iconBox]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="look.icon" />
            </svg>
          </div>

          <h2 :id="titleId" class="text-base font-bold text-ink leading-snug">{{ state.title || $t(`dialog.${state.type}`) }}</h2>
          <p :id="messageId" class="mt-1.5 text-sm text-ink-muted leading-relaxed whitespace-pre-line">{{ state.message }}</p>

          <p v-if="state.error" role="alert" class="mt-3 w-full rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger text-left">
            {{ state.error }}
          </p>

          <div :class="['mt-5 w-full grid gap-2', isConfirm ? 'grid-cols-2' : 'grid-cols-1']">
            <button v-if="isConfirm" type="button" class="btn-secondary w-full" :disabled="state.busy" @click="cancel">
              {{ state.cancelLabel || $t('common.cancel') }}
            </button>
            <button ref="primaryBtn" type="button" :class="[look.button, 'w-full']" :disabled="state.busy" @click="accept">
              <svg v-if="state.busy" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ state.busy ? $t('common.saving') : (state.confirmLabel || (isConfirm ? $t('common.confirm') : $t('dialog.ok'))) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useDialogState } from '../composables/useDialog';

const { state, accept, cancel } = useDialogState();
const titleId = useId();
const messageId = useId();
const primaryBtn = ref<HTMLButtonElement | null>(null);

const isConfirm = computed(() => state.type === 'confirm');

const ICONS = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  warning: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  question: 'M8.23 9a4 4 0 017.54 1c0 2-3 3-3 3m.04 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const look = computed(() => {
  const danger = { iconBox: 'bg-danger-soft text-danger', button: 'btn-danger' };
  switch (state.type) {
    case 'success': return { icon: ICONS.success, iconBox: 'bg-success-soft text-success', button: 'btn-primary' };
    case 'error': return { icon: ICONS.error, ...danger, button: 'btn-primary' };
    case 'warning': return { icon: ICONS.warning, iconBox: 'bg-warning-soft text-warning', button: 'btn-primary' };
    case 'confirm':
      return state.tone === 'danger'
        ? { icon: ICONS.warning, ...danger }
        : { icon: ICONS.question, iconBox: 'bg-primary-soft text-primary-ink', button: 'btn-primary' };
    default: return { icon: ICONS.info, iconBox: 'bg-primary-soft text-primary-ink', button: 'btn-primary' };
  }
});

// Focus the main button so Enter confirms and screen readers land inside the dialog.
watch(() => state.open, async (open) => {
  if (!open) return;
  await nextTick();
  primaryBtn.value?.focus();
});

const onKeydown = (e: KeyboardEvent) => {
  if (state.open && e.key === 'Escape') cancel();
};
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.app-dialog-enter-active, .app-dialog-leave-active { transition: opacity 0.15s ease; }
.app-dialog-enter-active .dialog-card, .app-dialog-leave-active .dialog-card { transition: transform 0.15s ease; }
.app-dialog-enter-from, .app-dialog-leave-to { opacity: 0; }
.app-dialog-enter-from .dialog-card, .app-dialog-leave-to .dialog-card { transform: scale(0.96); }
</style>
