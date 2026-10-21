<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('calendar.title')" :subtitle="$t('calendar.subtitle')" />
    <SchoolCalendar />
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../../components/PageHeader.vue';
import SchoolCalendar from '../../components/SchoolCalendar.vue';

definePageMeta({ layout: 'teacher' });

const { t } = useI18n();
useHead({ title: () => t('calendar.title') });
</script>
