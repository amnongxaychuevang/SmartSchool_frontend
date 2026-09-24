<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <select
          v-model="classFilter"
          class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500"
          @change="handleFilter"
        >
          <option value="">Select Class</option>
          <option v-for="c in adminStore.classes" :key="c.classId" :value="c.classId">
            {{ c.classNameEn }}
          </option>
        </select>
        <select
          v-model="subjectFilter"
          class="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500"
          @change="handleFilter"
        >
          <option value="">Select Subject</option>
          <option v-for="s in academicsStore.subjects" :key="s.subjectId" :value="s.subjectId">
            {{ s.subjectNameEn }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Grade
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <!-- Loading -->
      <LoadingSpinner v-if="academicsStore.gradesLoading" />

      <!-- Empty -->
      <div v-else-if="academicsStore.grades.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>No grades found.</p>
      </div>

      <!-- Data Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Student</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Class</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Subject</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Type</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Score</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="grade in academicsStore.grades" :key="grade.gradeId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <p class="text-sm font-medium text-white">{{ grade.student?.fullNameEn }}</p>
              <p class="text-xs text-slate-500">{{ grade.student?.studentCode }}</p>
            </td>
            <td class="px-6 py-4 text-sm text-slate-300">
              {{ grade.class?.classNameEn }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-300">
              {{ grade.subject?.subjectNameEn }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-300 capitalize">
              {{ grade.gradeType }}
            </td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                {{ grade.score }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" title="Edit" @click="openEditModal(grade)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete" @click="handleDelete(grade.gradeId)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Placeholder -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <span class="text-sm text-slate-500">Page {{ academicsStore.gradesPage }} of {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button :disabled="academicsStore.gradesPage === 1" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(academicsStore.gradesPage - 1)">Prev</button>
          <button :disabled="academicsStore.gradesPage === totalPages" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(academicsStore.gradesPage + 1)">Next</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modal.open = false"/>
        <div class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">{{ modal.isEdit ? 'Edit Grade' : 'Add Grade' }}</h2>
            <button class="text-slate-400 hover:text-white transition-colors" @click="modal.open = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="modal.error" class="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ modal.error }}</div>

          <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5 col-span-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student ID *</label>
                <input v-model.number="modal.form.studentId" required type="number" class="modal-input" >
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject *</label>
                <select v-model.number="modal.form.subjectId" required class="modal-input">
                  <option v-for="s in academicsStore.subjects" :key="s.subjectId" :value="s.subjectId">{{ s.subjectNameEn }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class *</label>
                <select v-model.number="modal.form.classId" required class="modal-input">
                  <option v-for="c in adminStore.classes" :key="c.classId" :value="c.classId">{{ c.classNameEn }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Grade Type *</label>
                <input v-model="modal.form.gradeType" required type="text" class="modal-input" placeholder="midterm, final..." >
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score *</label>
                <input v-model.number="modal.form.score" required type="number" class="modal-input" step="0.01" >
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
              <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" @click="modal.open = false">Cancel</button>
              <button
type="submit" :disabled="modal.saving"
                class="px-5 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-colors disabled:opacity-60 flex items-center gap-2">
                <svg v-if="modal.saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {{ modal.isEdit ? 'Update Grade' : 'Save Grade' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAcademicsStore } from '../../../application/stores/academics';
import { useAdminStore } from '../../../application/stores/admin';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Grades — Smart School Admin' });

const academicsStore = useAcademicsStore();
const adminStore = useAdminStore();

const classFilter = ref('');
const subjectFilter = ref('');

const totalPages = computed(() => Math.ceil(academicsStore.gradesTotal / 50));

onMounted(() => {
  academicsStore.fetchSubjects({ limit: 100 });
  adminStore.fetchClasses({ limit: 100 });
  academicsStore.fetchGrades();
});

const handleFilter = () => {
  academicsStore.fetchGrades({
    classId: classFilter.value ? Number(classFilter.value) : undefined,
    subjectId: subjectFilter.value ? Number(subjectFilter.value) : undefined,
    page: 1
  });
};

const changePage = (page: number) => {
  academicsStore.fetchGrades({
    classId: classFilter.value ? Number(classFilter.value) : undefined,
    subjectId: subjectFilter.value ? Number(subjectFilter.value) : undefined,
    page
  });
};

const modal = reactive({
  open: false,
  saving: false,
  error: '',
  isEdit: false,
  gradeId: null as number | null,
  form: {
    studentId: '',
    subjectId: '',
    classId: '',
    gradeType: 'final',
    score: 0,
    academicYear: '2023-2024'
  }
});

const openCreateModal = () => {
  modal.isEdit = false;
  modal.gradeId = null;
  modal.form.studentId = '';
  modal.form.subjectId = '';
  modal.form.classId = '';
  modal.form.gradeType = 'final';
  modal.form.score = 0;
  modal.error = '';
  modal.open = true;
};

const openEditModal = (grade: any) => {
  modal.isEdit = true;
  modal.gradeId = grade.gradeId;
  modal.form.studentId = grade.studentId;
  modal.form.subjectId = grade.subjectId;
  modal.form.classId = grade.classId;
  modal.form.gradeType = grade.gradeType;
  modal.form.score = grade.score;
  modal.form.academicYear = grade.academicYear;
  modal.error = '';
  modal.open = true;
};

const handleSubmit = async () => {
  modal.saving = true;
  modal.error = '';
  try {
    if (modal.isEdit && modal.gradeId) {
      await academicsStore.updateGrade(modal.gradeId, modal.form);
    } else {
      await academicsStore.createGrade(modal.form);
    }
    modal.open = false;
  } catch (err: any) {
    modal.error = err.message || 'Failed to save grade';
  } finally {
    modal.saving = false;
  }
};

const handleDelete = async (gradeId: number) => {
  if (confirm('Are you sure you want to delete this grade?')) {
    try {
      await academicsStore.deleteGrade(gradeId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete grade');
    }
  }
};
</script>

<style scoped lang="postcss">
.modal-input {
  @apply w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
