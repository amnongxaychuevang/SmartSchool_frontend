<template>
  <div class="flex flex-col gap-6 w-full">
    <PageHeader :title="$t('calendar.title')" :subtitle="$t('calendar.subtitle_admin')" />
    <SchoolCalendar :editable="canEdit" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import SchoolCalendar from '../../components/SchoolCalendar.vue';
import { useAuthStore } from '../../application/stores/auth';
import { hasPermission } from '../../components/layout/adminNav';

definePageMeta({ layout: 'admin' });

const { t } = useI18n();
useHead({ title: () => t('calendar.title') });

// Everyone with the page may look; adding and changing events needs academics.manage.
const authStore = useAuthStore();
const canEdit = computed(() => hasPermission(authStore.permissions, 'academics.manage'));
</script>
