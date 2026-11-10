<script setup lang="ts">
/**
 * The behaviour every dialog needs, without any look of its own: backdrop, Esc and
 * backdrop click to close, focus moved in on open (first form field, else the
 * dialog), Tab kept inside, focus returned on close, role="dialog" + aria-modal,
 * labelled by its first heading.
 *
 *   <ModalShell :open="showForm" @close="showForm = false">
 *     <div class="panel max-w-lg w-full p-6">...</div>
 *   </ModalShell>
 *
 * AppModal builds its header/footer layout on top of this; pages with a custom
 * layout (receipts, payslips) use it directly.
 */
import { ref, watch, nextTick, onBeforeUnmount, useId } from 'vue';

const props = withDefaults(defineProps<{ open: boolean; backdrop?: 'light' | 'dark'; labelledby?: string }>(), {
  backdrop: 'light',
  labelledby: undefined,
});
const emit = defineEmits<{ close: [] }>();

const root = ref<HTMLElement | null>(null);
const autoLabel = useId();
const labelId = ref<string | undefined>(props.labelledby);
let returnFocus: HTMLElement | null = null;

const FOCUSABLE = 'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
const focusables = () => [...(root.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((el) => el.offsetParent !== null);

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.stopPropagation(); emit('close'); }
}
function trapTab(e: KeyboardEvent) {
  const els = focusables();
  if (!els.length) return;
  const first = els[0]!, last = els[els.length - 1]!;
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

watch(() => props.open, async (open) => {
  if (!import.meta.client) return;
  if (open) {
    returnFocus = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKeydown);
    await nextTick();
    if (!props.labelledby) {
      const heading = root.value?.querySelector<HTMLElement>('h1, h2, h3');
      if (heading) { heading.id ||= autoLabel; labelId.value = heading.id; }
    }
    const field = root.value?.querySelector<HTMLElement>('input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])');
    (field ?? root.value)?.focus();
  } else {
    document.removeEventListener('keydown', onKeydown);
    returnFocus?.focus?.();
    returnFocus = null;
  }
}, { immediate: true });
// Also covers <ModalShell v-if="item" :open="true">: closing unmounts it instead of
// flipping `open`, so restore focus here too.
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  returnFocus?.focus?.();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-shell">
      <div v-if="open" class="fixed inset-0 z-[110] flex items-center justify-center overflow-y-auto p-4" @keydown.tab="trapTab">
        <div class="fixed inset-0" :class="backdrop === 'dark' ? 'bg-black/70' : 'bg-ink/40'" aria-hidden="true" @click="emit('close')" />
        <div
          ref="root"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="labelId"
          tabindex="-1"
          class="relative flex w-full justify-center outline-none pointer-events-none [&>*]:pointer-events-auto"
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-shell-enter-active, .modal-shell-leave-active { transition: opacity 0.15s ease; }
.modal-shell-enter-from, .modal-shell-leave-to { opacity: 0; }
@media print {
  /* Payslip/receipt dialogs print their content only. */
  .fixed { position: static; background: none; }
}
</style>
