<template>
  <AssignmentsBoard />
</template>

<script setup lang="ts">
import AssignmentsBoard from '../../components/AssignmentsBoard.vue';

definePageMeta({ layout: 'teacher' });
const { t } = useI18n();
useHead({ title: () => `${t('assignments.title')} — Teacher Portal` });
</script>
