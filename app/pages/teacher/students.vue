<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.students_directory') }}</h1>
    </div>

    <!-- We can reuse loadingStudents and fetchMyStudents by passing no classId (or null) to get all students, but wait, fetchMyStudents requires a classId in signature. Let's just fetch all students. -->
    <LoadingSpinner v-if="loading" color="amber" padding="py-12" />
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="student in students" :key="student.studentId" class="glass-panel p-6 rounded-2xl flex items-start gap-4">
        <img :src="student.photoUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(locale === 'lo' ? student.fullNameLo : student.fullNameEn) + '&background=f59e0b&color=fff'" alt="" class="w-16 h-16 rounded-xl object-cover shrink-0" >
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ locale === 'lo' ? student.fullNameLo : student.fullNameEn }}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ $t('teacherPortal.code') }} {{ student.studentCode }}</p>
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
