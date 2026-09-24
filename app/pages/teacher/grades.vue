<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('teacherPortal.student_grades') }}</h1>
      <div class="flex items-center gap-2">
        <div class="relative">
          <select
            v-model="selectedClass"
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-amber-500 appearance-none w-full"
            @change="loadStudents"
          >
            <option value="">{{ $t('teacherPortal.select_a_class') }}</option>
            <option v-for="c in myClasses" :key="c.classId" :value="c.classId">
              {{ locale === 'lo' ? c.classNameLo : c.classNameEn }}
            </option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
        <div class="relative">
          <select
            v-model="selectedSubject"
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-amber-500 appearance-none w-full"
          >
            <option value="">{{ $t('teacherPortal.select_a_subject') }}</option>
            <option v-for="cs in subjectsForClass" :key="cs.id" :value="cs.id">
              {{ locale === 'lo' ? cs.subject.subjectNameLo : cs.subject.subjectNameEn }}
            </option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </div>
    </div>

    <!-- Students List for Grades -->
    <div v-if="selectedClass && selectedSubject" class="glass-panel overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{{ $t('teacherPortal.enter_grades_final') }}</h2>
        <button :disabled="saving" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50" @click="saveGrades">
          <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ $t('teacherPortal.save_grades') }}
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
            <th class="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3 w-48">{{ $t('teacherPortal.score') }}</th>
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
              <input v-model.number="gradesMap[student.studentId]" type="number" step="0.01" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500" placeholder="0 - 100" >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-32 text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-lg">{{ $t('teacherPortal.select_class_subject_to_enter') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTeacherStore } from '../../application/stores/teacher';
import { academicsRepository, type ClassSubject } from '../../infrastructure/api/AcademicsRepository';

definePageMeta({ layout: 'teacher' });

const { t, locale } = useI18n();
useHead({ title: computed(() => `${t('teacherPortal.student_grades')} — Teacher Portal`) });

const teacherStore = useTeacherStore();
const selectedClass = ref('');
// Holds the ClassSubject id (class + subject + term), not a bare subject id.
const selectedSubject = ref('');

// What this teacher teaches in the active term (the API only returns their own).
const myClassSubjects = ref<ClassSubject[]>([]);
const myClasses = computed(() => {
  const byId = new Map(myClassSubjects.value.map(cs => [cs.classId, cs.class]));
  return [...byId.values()];
});
const subjectsForClass = computed(() =>
  myClassSubjects.value.filter(cs => cs.classId === Number(selectedClass.value)));
const saving = ref(false);

const gradesMap = ref<Record<number, number>>({});

const students = computed(() => teacherStore.myStudents);

onMounted(async () => {
  const all = await academicsRepository.getClassSubjects();
  myClassSubjects.value = all.filter(cs => cs.term.status === 'active');
});

const loadStudents = async () => {
  selectedSubject.value = '';
  if (!selectedClass.value) return;
  await teacherStore.fetchMyStudents(Number(selectedClass.value));
  
  // Initialize grades map
  gradesMap.value = {};
  teacherStore.myStudents.forEach(s => {
    gradesMap.value[s.studentId] = 0;
  });
};

const saveGrades = async () => {
  if (!selectedClass.value || !selectedSubject.value) return;
  saving.value = true;
  try {
    const records = Object.keys(gradesMap.value).map(studentId => ({
      studentId: Number(studentId),
      classSubjectId: Number(selectedSubject.value),
      score: gradesMap.value[Number(studentId)]
    }));

    await teacherStore.saveGrades(records);
    
    alert('Grades saved successfully!');
  } catch (err) {
    alert(getErrorMessage(err, 'Failed to save grades'));
  } finally {
    saving.value = false;
  }
};
</script>
