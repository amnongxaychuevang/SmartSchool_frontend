<script setup lang="ts">
/**
 * Small icon-only action button for table rows and cards.
 *
 *   <IconButton icon="edit" :label="$t('common.edit')" @click="openEdit(row)" />
 *   <IconButton icon="delete" :label="$t('common.delete')" @click="askDelete(row)" />
 *
 * `label` is required: it is the tooltip and what a screen reader announces, since
 * the button has no visible text. `delete` gets the danger hover colour by default.
 */
type Icon = 'edit' | 'delete' | 'view' | 'print' | 'download';

const props = withDefaults(defineProps<{
  icon: Icon;
  label: string;
  tone?: 'default' | 'danger';
  size?: 'sm' | 'md';
  type?: 'button' | 'submit';
}>(), { tone: undefined, size: 'md', type: 'button' });

const PATHS: Record<Icon, string> = {
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  delete: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  view: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  print: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
};

const danger = computed(() => (props.tone ?? (props.icon === 'delete' ? 'danger' : 'default')) === 'danger');
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center rounded text-ink-subtle transition-colors disabled:pointer-events-none disabled:opacity-40"
    :class="[
      size === 'sm' ? 'p-1' : 'p-1.5',
      danger ? 'hover:bg-danger-soft hover:text-danger' : 'hover:bg-primary-soft hover:text-primary',
    ]"
    :title="label"
    :aria-label="label"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="PATHS[icon]" />
    </svg>
  </button>
</template>
