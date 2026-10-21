<template>
  <ReceiptDocument :id="Number($route.params.id)" kind="fee" />
</template>

<script setup lang="ts">
import ReceiptDocument from '../../../../components/ReceiptDocument.vue';

definePageMeta({ layout: 'admin' });

const { t } = useI18n();
useHead({ title: () => t('receipt.title') });
</script>
