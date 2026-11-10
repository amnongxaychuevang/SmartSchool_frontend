<script setup lang="ts">
/**
 * The standard "Export Excel" button for lists and reports.
 *
 *   <ExportButton path="/students/export" permission="students.export"
 *                 :filters="{ search, status }" file-base="students" :disabled="!total" />
 *
 * Follows the export standard: the backend builds the .xlsx from the same filters as
 * the list (GET <path>, audit-logged), and the button only shows for users with the
 * `*.export` permission. It handles the spinner and the error popup itself.
 */
import { useServerExport } from '../composables/useServerExport';
import { hasPermission } from './layout/adminNav';
import { useAuthStore } from '../application/stores/auth';

const props = defineProps<{
  path: string;
  permission: string;
  filters?: Record<string, string | number | null | undefined>;
  fileBase: string;
  disabled?: boolean;
}>();

const authStore = useAuthStore();
const allowed = computed(() => hasPermission(authStore.permissions, props.permission));
const { exporting, download } = useServerExport();
const run = () => download(props.path, props.filters ?? {}, props.fileBase);
</script>

<template>
  <button
    v-if="allowed"
    type="button"
    class="btn-secondary inline-flex items-center gap-1.5"
    :disabled="exporting || disabled"
    :aria-busy="exporting"
    @click="run"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :class="{ 'animate-pulse': exporting }" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
    {{ exporting ? $t('common.loading') : $t('common.export_excel') }}
  </button>
</template>
