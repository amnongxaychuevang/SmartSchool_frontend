<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('update:open', false)"/>
        <div class="relative delete-modal-card w-full max-w-md p-6 flex flex-col gap-6 rounded-2xl">
          <div class="flex items-start gap-4">
            <div class="delete-icon-box w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="flex flex-col gap-1.5 pt-0.5">
              <h2 class="delete-modal-title text-lg font-bold leading-tight">
                {{ title || $t('users.delete_confirm_title') }}
              </h2>
              <p class="delete-modal-msg text-sm leading-relaxed">
                {{ message || $t('users.delete_confirm_msg', { name: user?.fullNameEn }) }}
              </p>
            </div>
          </div>
          <div v-if="error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{{ error }}</div>
          <div class="flex items-center justify-end gap-3 pt-2">
            <button class="delete-btn-cancel px-5 py-2.5 rounded-xl text-sm font-medium transition-all" @click="emit('update:open', false)">
              {{ $t('common.cancel') }}
            </button>
            <button
:disabled="deleting" class="delete-btn-danger px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              @click="emit('delete')">
              <svg v-if="deleting" class="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{{ deleting ? $t('common.deleting') : $t('common.delete') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean;
    deleting: boolean;
    error?: string;
    title?: string;
    message?: string;
    user?: any;
  }>(),
  {
    error: '',
    title: '',
    message: '',
    user: null,
  }
);

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'delete'): void;
}>();
</script>

<style scoped>
/* Card */
.delete-modal-card {
  background: #0f172a;
  border: 1px solid rgba(51, 65, 85, 0.6);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
}
:global(html.light) .delete-modal-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 20px 30px -10px rgba(15, 23, 42, 0.12), 0 10px 15px -5px rgba(15, 23, 42, 0.06) !important;
}

/* Icon Box */
.delete-icon-box {
  background-color: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
}
:global(html.light) .delete-icon-box {
  background-color: #fef2f2 !important;
  border: 1px solid #fee2e2 !important;
  color: #dc2626 !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.08) !important;
}

/* Title & Msg */
.delete-modal-title {
  color: #ffffff;
}
:global(html.light) .delete-modal-title {
  color: #0f172a !important;
}

.delete-modal-msg {
  color: #94a3b8;
}
:global(html.light) .delete-modal-msg {
  color: #475569 !important;
}

/* Cancel Button */
.delete-btn-cancel {
  background-color: #1e293b;
  color: #cbd5e1;
  border: 1px solid #334155;
}
.delete-btn-cancel:hover {
  background-color: #334155;
  color: #ffffff;
}
:global(html.light) .delete-btn-cancel {
  background-color: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid #cbd5e1 !important;
}
:global(html.light) .delete-btn-cancel:hover {
  background-color: #e2e8f0 !important;
  color: #0f172a !important;
}

/* Danger / Delete Button */
.delete-btn-danger {
  background-color: #dc2626 !important;
  color: #ffffff !important;
  border: 1px solid #b91c1c !important;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35) !important;
}
.delete-btn-danger:hover:not(:disabled) {
  background-color: #b91c1c !important;
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.45) !important;
  transform: translateY(-1px);
}
.delete-btn-danger:active:not(:disabled) {
  transform: translateY(0);
}
:global(html.light) .delete-btn-danger {
  background-color: #dc2626 !important;
  color: #ffffff !important;
  border: 1px solid #b91c1c !important;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35) !important;
}
:global(html.light) .delete-btn-danger:hover:not(:disabled) {
  background-color: #b91c1c !important;
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.45) !important;
  transform: translateY(-1px);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
