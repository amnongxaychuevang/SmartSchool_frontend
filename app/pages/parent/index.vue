<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('parentPortal.dashboard')" />

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <StatCard :title="$t('parentPortal.my_children')" :value="f.number(parentStore.children.length)" color-class="bg-primary">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </template>
      </StatCard>
    </div>

    <!-- One row per child: rate over their most recent recorded school days. -->
    <section class="panel divide-y divide-line">
      <h3 class="px-5 py-4 font-bold">{{ $t('parentPortal.attendance_rate_recent') }}</h3>
      <div v-for="child in parentStore.children" :key="child.studentId" class="flex items-center justify-between gap-4 px-5 py-4">
        <div class="min-w-0">
          <p class="font-semibold truncate">{{ locale === 'lo' ? child.fullNameLo : child.fullNameEn }}</p>
          <p class="text-xs text-ink-subtle font-mono">{{ child.studentCode }}</p>
        </div>
        <p v-if="rates[child.studentId] === undefined" class="text-sm text-ink-subtle">…</p>
        <p v-else-if="rates[child.studentId] === null" class="text-sm text-ink-subtle">{{ $t('parentPortal.no_attendance_yet') }}</p>
        <p v-else class="text-2xl font-bold tnum">{{ f.percent(rates[child.studentId]) }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useParentStore } from '../../application/stores/parent';
import { parentRepository } from '../../infrastructure/api/ParentRepository';
import PageHeader from '../../components/PageHeader.vue';
import StatCard from '../../components/StatCard.vue';
import { useFormat } from '../../composables/useFormat';
import { attendanceRate } from '../../utils/schoolDate';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => `${t('parentPortal.dashboard')} — ${t('parentPortal.title')}` });

const parentStore = useParentStore();
const rates = reactive<Record<number, number | null>>({});

onMounted(async () => {
  await parentStore.fetchChildren();
  await Promise.all(parentStore.children.map(async (child) => {
    try {
      const res = await parentRepository.getChildAttendance(child.studentId);
      rates[child.studentId] = attendanceRate(res.data ?? []);
    } catch {
      rates[child.studentId] = null;
    }
  }));
});
</script>
