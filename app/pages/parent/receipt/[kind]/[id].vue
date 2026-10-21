<template>
  <ReceiptDocument v-if="kind" :id="id" :kind="kind" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ReceiptDocument from '../../../../components/ReceiptDocument.vue';
import type { ReceiptKind } from '../../../../infrastructure/api/ReceiptRepository';

definePageMeta({ layout: 'parent' });

const { t } = useI18n();
useHead({ title: () => t('receipt.title') });

const route = useRoute();
const kind = computed<ReceiptKind | null>(() => (route.params.kind === 'fee' || route.params.kind === 'topup' ? route.params.kind : null));
const id = computed(() => Number(route.params.id));
</script>
