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

    <!-- Quick Actions Grid -->
    <div>
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        {{ $t('teacherPortal.quick_actions') }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Class Attendance -->
        <NuxtLink
          to="/teacher/attendance"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">
                {{ $t('teacherPortal.qa_attendance_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('teacherPortal.qa_attendance_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Assignments & Grading -->
        <NuxtLink
          to="/teacher/assignments"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
                {{ $t('teacherPortal.qa_assignments_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('teacherPortal.qa_assignments_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Chat with Parents -->
        <NuxtLink
          to="/teacher/chat"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                {{ $t('teacherPortal.qa_chat_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('teacherPortal.qa_chat_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Student Leave Requests -->
        <NuxtLink
          to="/teacher/leaves"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-amber-500 transition-colors">
                {{ $t('teacherPortal.qa_leaves_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('teacherPortal.qa_leaves_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Teacher Personal Leave -->
        <NuxtLink
          to="/teacher/my-leave"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-purple-500 transition-colors">
                {{ $t('teacherPortal.qa_my_leaves_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('teacherPortal.qa_my_leaves_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>

        <!-- Teaching Schedule -->
        <NuxtLink
          to="/teacher/schedule"
          class="panel p-4 flex items-center justify-between gap-3 group hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
        >
          <div class="flex items-center gap-3.5 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">
                {{ $t('teacherPortal.qa_schedule_title') }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ $t('teacherPortal.qa_schedule_desc') }}
              </p>
            </div>
          </div>
          <span class="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0">
            →
          </span>
        </NuxtLink>
      </div>
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
