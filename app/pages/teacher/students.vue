<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.students_directory') }}</h1>
    </div>

    <!-- We can reuse loadingStudents and fetchMyStudents by passing no classId (or null) to get all students, but wait, fetchMyStudents requires a classId in signature. Let's just fetch all students. -->
    <LoadingSpinner v-if="loading" color="amber" padding="py-12" />
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="student in students" :key="student.studentId" class="glass-panel p-6 rounded-2xl flex items-start gap-4">
        <PersonAvatar :name="locale === 'lo' ? student.fullNameLo : student.fullNameEn" :photo-url="student.photoUrl" size="lg" />
        <div class="flex flex-col gap-1 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ locale === 'lo' ? student.fullNameLo : student.fullNameEn }}</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('teacherPortal.code') }} {{ student.studentCode }}</p>
            </div>
            <NuxtLink
              :to="`/teacher/students/${student.studentId}/report-card`"
              class="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors"
              :title="$t('report_card.document_title')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </NuxtLink>
          </div>
          <div v-if="(student.parentStudents?.length ?? 0) > 0" class="mt-2">
            <p class="text-xs text-slate-600 dark:text-slate-300 font-medium">{{ $t('teacherPortal.parents') }}</p>
            <div v-for="ps in student.parentStudents" :key="ps.parentUserId" class="text-xs text-slate-500 dark:text-slate-400">
              {{ locale === 'lo' ? ps.parent.fullNameLo : ps.parent.fullNameEn }} ({{ ps.parent.phoneNumber }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse, Paged } from '../../infrastructure/api/types';
import type { Student } from '../../domain/models/Student';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApiClient } from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../infrastructure/api/endpoints';

definePageMeta({ layout: 'teacher' });

const { t, locale } = useI18n();
useHead({ title: computed(() => `${t('teacherPortal.students_directory')} — Teacher Portal`) });

const students = ref<Student[]>([]);
const loading = ref(false);

const fetchStudents = async () => {
  loading.value = true;
  try {
    const res = await useApiClient()<ApiResponse<Paged<'students', Student>>>(API_ENDPOINTS.students.list, { method: 'GET' });
    students.value = res.data?.students || [];
  } catch (error) {
    console.error('Failed to fetch students', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStudents();
});
</script>
