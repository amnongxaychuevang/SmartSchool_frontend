<template>
  <ReportCardDocument :student-id="studentId" back-route="/teacher/grades" portal="teacher" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ReportCardDocument from '../../../../components/ReportCardDocument.vue';

definePageMeta({ layout: 'teacher' });

const route = useRoute();
const { t } = useI18n();
const studentId = computed(() => Number(route.params.id));

useHead({ title: () => `${t('report_card.document_title')} — Teacher Portal` });
</script>
