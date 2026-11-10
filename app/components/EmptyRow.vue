<script setup lang="ts">
/**
 * Empty state for a table body: <EmptyRow :colspan="4" :title="$t('...')" />.
 * Any other prop (title, description, icon, size) is passed to EmptyState.
 */
defineOptions({ inheritAttrs: false });
withDefaults(defineProps<{ colspan: number }>(), {});
</script>

<template>
  <tr>
    <td :colspan="colspan">
      <EmptyState size="sm" v-bind="$attrs" />
    </td>
  </tr>
</template>
