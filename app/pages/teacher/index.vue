<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('nav.dashboard')" :subtitle="f.date(today)" />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard :title="$t('teacherPortal.my_classes')" :value="f.number(teacherStore.myClasses.length)" color-class="bg-primary">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </template>
      </StatCard>
      <StatCard :title="$t('admin.total_students')" :value="f.number(totalStudents)" color-class="bg-primary">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </template>
      </StatCard>
      <StatCard :title="$t('teacherPortal.attendance_today')" :value="loadingAttendance ? '…' : f.percent(todayRate)" color-class="bg-emerald-600">
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </template>
      </StatCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTeacherStore } from '../../application/stores/teacher';
import { teacherRepository } from '../../infrastructure/api/TeacherRepository';
import PageHeader from '../../components/PageHeader.vue';
import StatCard from '../../components/StatCard.vue';
import { useFormat } from '../../composables/useFormat';
import { schoolToday } from '../../utils/schoolDate';

definePageMeta({ layout: 'teacher' });

const { t } = useI18n();
const f = useFormat();
useHead({ title: () => `${t('nav.dashboard')} — ${t('layout.portal_teacher')}` });

const teacherStore = useTeacherStore();
const today = schoolToday();

const totalStudents = computed(() =>
  teacherStore.myClasses.reduce((sum, c) => sum + (c._count?.classStudents ?? 0), 0));

// Today's rate across my classes: students checked in (present or late) out of
// everyone enrolled. Null (shown as "—") until anything can be measured.
const attendedToday = ref(0);
const loadingAttendance = ref(true);
const todayRate = computed(() =>
  totalStudents.value ? Math.round((attendedToday.value / totalStudents.value) * 1000) / 10 : null);

onMounted(async () => {
  await teacherStore.fetchMyClasses();
  try {
    const perClass = await Promise.all(
      teacherStore.myClasses.map((c) => teacherRepository.getDailyAttendance(c.classId, today)),
    );
    attendedToday.value = perClass
      .flatMap((res) => res.data.records)
      .filter((r) => r.status === 'present' || r.status === 'late').length;
  } finally {
    loadingAttendance.value = false;
  }
});
</script>
