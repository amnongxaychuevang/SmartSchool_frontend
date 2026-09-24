<template>
  <Teleport to="body">
    <Transition name="app-modal">
      <div v-if="open" class="fixed inset-0 z-[110] flex items-center justify-center p-4" @keydown.esc="close">
        <div class="absolute inset-0 bg-ink/40" @click="close" />
        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :class="['relative w-full panel-float flex flex-col max-h-[90vh]', sizes[size]]"
        >
          <header class="flex items-start justify-between gap-4 px-5 py-4 border-b border-line">
            <div class="min-w-0">
              <h2 :id="titleId" class="text-lg font-bold leading-tight">{{ title }}</h2>
              <p v-if="subtitle" class="mt-0.5 text-sm text-ink-muted">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="w-8 h-8 -mr-1 rounded flex items-center justify-center text-ink-subtle hover:bg-surface-2 hover:text-ink"
              :aria-label="$t('common.close')"
              @click="close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div class="px-5 py-4 overflow-y-auto">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="flex items-center justify-end gap-2 px-5 py-4 border-t border-line bg-surface-2/50">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useId } from 'vue';

withDefaults(defineProps<{ open: boolean; title: string; subtitle?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }>(), { size: 'md', subtitle: undefined });
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();

const titleId = useId();
const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
const close = () => emit('update:open', false);
</script>

<style scoped>
.app-modal-enter-active, .app-modal-leave-active { transition: opacity 0.15s ease; }
.app-modal-enter-from, .app-modal-leave-to { opacity: 0; }
</style>
