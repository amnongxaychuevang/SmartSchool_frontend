<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.class_attendance') }}</h1>
      <div class="flex items-center gap-2">
        <div class="relative">
          <select
            v-model="selectedClass"
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-amber-500 appearance-none w-full"
            @change="loadStudents"
          >
            <option value="">{{ $t('teacherPortal.select_a_class') }}</option>
            <option v-for="c in teacherStore.myClasses" :key="c.classId" :value="c.classId">
              {{ locale === 'lo' ? c.classNameLo : c.classNameEn }}
            </option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
        <input
          v-model="attendanceDate"
          type="date"
          class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-500"
        >
      </div>
    </div>

    <!-- Students List for Attendance -->
    <div v-if="selectedClass" class="glass-panel overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ $t('teacherPortal.mark_attendance') }}</h2>
        <button :disabled="saving" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50" @click="saveAttendance">
          <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ $t('teacherPortal.save_attendance') }}
        </button>
      </div>

      <LoadingSpinner v-if="teacherStore.loadingStudents" color="amber" />
      
      <div v-else-if="students.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <p>{{ $t('teacherPortal.no_students_in_class') }}</p>
      </div>

      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-800">
            <th class="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('teacherPortal.student_name') }}</th>
            <th class="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('teacherPortal.student_code') }}</th>
            <th class="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('teacherPortal.status') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
          <tr v-for="student in students" :key="student.studentId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <p class="text-sm font-medium text-slate-900 dark:text-white">{{ locale === 'lo' ? student.fullNameLo : student.fullNameEn }}</p>
            </td>
            <td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
              {{ student.studentCode }}
            </td>
            <td class="px-6 py-4">
              <div class="relative w-full max-w-[140px]">
                <select v-model="attendanceMap[student.studentId]" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 text-sm rounded-lg pl-3 pr-9 py-1.5 focus:outline-none focus:border-amber-500 appearance-none w-full">
                  <option value="present">{{ $t('teacherPortal.present') }}</option>
                  <option value="absent">{{ $t('teacherPortal.absent') }}</option>
                  <option value="late">{{ $t('teacherPortal.late') }}</option>
                  <option value="excused">{{ $t('teacherPortal.excused') }}</option>
                </select>
                <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-32 text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <p class="text-lg">{{ $t('teacherPortal.select_class_to_mark') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTeacherStore } from '../../application/stores/teacher';
import type { AttendanceStatus } from '../../infrastructure/api/TeacherRepository';

definePageMeta({ layout: 'teacher' });

const { t, locale } = useI18n();
useHead({ title: computed(() => `${t('teacherPortal.class_attendance')} — Teacher Portal`) });

const route = useRoute();
const teacherStore = useTeacherStore();
const selectedClass = ref('');
// Local calendar date (toISOString() would give yesterday's date before 07:00 in Laos).
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const attendanceDate = ref(today());
const saving = ref(false);

const attendanceMap = ref<Record<number, AttendanceStatus>>({});

const students = computed(() => teacherStore.myStudents);

onMounted(async () => {
  await teacherStore.fetchMyClasses();
  if (route.query.classId) {
    selectedClass.value = route.query.classId as string;
    loadStudents();
  }
});

const loadStudents = async () => {
  if (!selectedClass.value) return;
  await teacherStore.fetchMyStudents(Number(selectedClass.value));
  await loadAttendance();
};

// Pre-fill with what's already recorded for the day (card taps, approved leave,
// earlier saves); students with no record default to present.
const loadAttendance = async () => {
  if (!selectedClass.value) return;
  const records = await teacherStore.getDailyAttendance(Number(selectedClass.value), attendanceDate.value);
  const byStudent = new Map(records.map(r => [r.studentId, r.status]));
  attendanceMap.value = {};
  teacherStore.myStudents.forEach(s => {
    attendanceMap.value[s.studentId] = byStudent.get(s.studentId) ?? 'present';
  });
};

watch(attendanceDate, loadAttendance);

const saveAttendance = async () => {
  if (!selectedClass.value) return;
  saving.value = true;
  try {
    const records = Object.entries(attendanceMap.value).map(([studentId, status]) => ({
      studentId: Number(studentId),
      status,
    }));

    await teacherStore.saveAttendance(Number(selectedClass.value), attendanceDate.value, records);
    alert('Attendance saved successfully!');
  } catch (err: any) {
    alert(err.message || 'Failed to save attendance');
  } finally {
    saving.value = false;
  }
};
</script>
