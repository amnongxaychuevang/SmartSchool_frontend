<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          :placeholder="$t('students.search')"
          class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch"
        >
      </div>
      <div class="flex items-center gap-4">
        <!-- Status Dropdown Menu -->
        <div class="relative z-50">
          <button
:class="[
              'relative px-4 py-2.5 border rounded-lg text-sm focus:outline-none flex items-center justify-between min-w-[160px] transition-colors',
              statusFilter === '' 
                ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600'
                : 'bg-teal-500/20 border-teal-500/50 text-teal-400'
            ]" 
            @click="statusDropdownOpen = !statusDropdownOpen">
            <span class="flex items-center gap-2">
              {{ statusFilter === '' ? $t('common.all') : (statusFilter === 'active' ? $t('common.active') : (statusFilter === 'graduated' ? $t('students.graduated') : $t('students.transferred'))) }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" :class="[statusDropdownOpen ? 'rotate-180' : '', statusFilter === '' ? 'text-slate-400' : 'text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="statusDropdownOpen" class="absolute left-0 top-full mt-2 w-full min-w-[160px] glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50">
              <button
class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="statusFilter === '' ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="statusFilter = ''; handleFilter(); statusDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full" :class="statusFilter === '' ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ $t('common.all') }}
              </button>
              <button
class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="statusFilter === 'active' ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="statusFilter = 'active'; handleFilter(); statusDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full" :class="statusFilter === 'active' ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ $t('common.active') }}
              </button>
              <button
class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="statusFilter === 'graduated' ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="statusFilter = 'graduated'; handleFilter(); statusDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full" :class="statusFilter === 'graduated' ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ $t('students.graduated') }}
              </button>
              <button
class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="statusFilter === 'transferred' ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="statusFilter = 'transferred'; handleFilter(); statusDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full" :class="statusFilter === 'transferred' ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ $t('students.transferred') }}
              </button>
            </div>
          </Transition>
        </div>
        <!-- Backdrop -->
        <div v-if="statusDropdownOpen" class="fixed inset-0 z-40" @click="statusDropdownOpen = false"/>

        <NuxtLink to="/admin/students/create" class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('students.add_student') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <!-- Loading -->
      <div v-if="adminStore.studentsLoading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"/>
      </div>

      <!-- Empty -->
      <div v-else-if="adminStore.students.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p>{{ $t('students.no_students') }}</p>
      </div>

      <!-- Data Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('nav.students') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.code') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">{{ $t('common.class') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">{{ $t('common.gender') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.status') }}</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr
v-for="student in adminStore.students" :key="student.studentId"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold shrink-0">
                  {{ student.fullNameEn[0] }}
                </div>
                <div>
                  <p class="text-sm font-medium text-white">{{ student.fullNameEn }}</p>
                  <p class="text-xs text-slate-500">{{ student.fullNameLo }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-300 font-mono">{{ student.studentCode }}</td>
            <td class="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">
              {{ student.classStudents?.[0]?.class?.classNameEn ?? '—' }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-400 capitalize hidden sm:table-cell">{{ student.gender ?? '—' }}</td>
            <td class="px-6 py-4">
              <span
class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-teal-500/20 text-teal-400': student.status === 'active',
                  'bg-blue-500/20 text-blue-400': student.status === 'graduated',
                  'bg-slate-500/20 text-slate-400': student.status === 'transferred',
                }">
                {{ student.status === 'active' ? $t('common.active') : (student.status === 'graduated' ? $t('students.graduated') : $t('students.transferred')) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <!-- Edit -->
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="openEditModal(student)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Delete -->
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  :title="$t('common.delete')"
                  @click="openDeleteModal(student)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
      <button
:disabled="adminStore.studentsPage <= 1"
        class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="changePage(adminStore.studentsPage - 1)">
        ← {{ $t('common.back') }}
      </button>
      <span class="text-sm text-slate-400">{{ adminStore.studentsPage }} / {{ totalPages }}</span>
      <button
:disabled="adminStore.studentsPage >= totalPages"
        class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="changePage(adminStore.studentsPage + 1)">
        → Next
      </button>
    </div>
  </div>

  <!-- ── EDIT MODAL ── -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="editModal.open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="editModal.open = false"/>
        <div class="relative glass-panel w-full max-w-lg flex flex-col p-0 overflow-hidden">
          <div class="p-6 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/20">
            <h2 class="text-xl font-bold text-white">{{ $t('students.edit_student') }}</h2>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" @click="editModal.open = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div v-if="editModal.error" class="m-6 mb-0 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ editModal.error }}</div>

          <form class="flex flex-col" @submit.prevent="handleEditSubmit">
            <div class="p-6 grid grid-cols-2 gap-5">
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('students.student_code') }} *</label>
                <input v-model="editModal.form.studentCode" required type="text" class="input-field" placeholder="Student Code..." >
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('common.status') }}</label>
                <select v-model="editModal.form.status" class="input-field cursor-pointer">
                  <option value="active">{{ $t('common.active') }}</option>
                  <option value="graduated">{{ $t('students.graduated') }}</option>
                  <option value="transferred">{{ $t('students.transferred') }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('students.full_name_en') }} *</label>
                <input v-model="editModal.form.fullNameEn" required type="text" class="input-field" placeholder="Full Name (EN)..." >
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('students.full_name_lo') }} *</label>
                <input v-model="editModal.form.fullNameLo" required type="text" class="input-field" placeholder="Full Name (LO)..." >
              </div>
              <div class="flex flex-col gap-2 col-span-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('common.gender') }}</label>
                <select v-model="editModal.form.gender" class="input-field cursor-pointer">
                  <option value="">—</option>
                  <option v-for="g in adminStore.genders" :key="g.code" :value="g.code">
                    {{ locale === 'lo' ? g.nameLo : g.nameEn }}
                  </option>
                </select>
              </div>
            </div>

            <div class="p-6 pt-4 border-t border-slate-800/50 flex items-center justify-end gap-3 bg-slate-900/20">
              <button type="button" class="btn-ghost" @click="editModal.open = false">{{ $t('common.cancel') }}</button>
              <button type="submit" :disabled="editModal.saving" class="btn-primary flex items-center gap-2">
                <svg v-if="editModal.saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {{ editModal.saving ? $t('common.saving') : $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── DELETE CONFIRM MODAL ── -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="deleteModal.open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="deleteModal.open = false"/>
        <div class="relative glass-panel w-full max-w-sm p-6 flex flex-col gap-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="flex flex-col gap-1 pt-1">
              <h2 class="text-lg font-bold text-white">{{ $t('students.delete_confirm_title') }}</h2>
              <p class="text-sm text-slate-400">{{ $t('students.delete_confirm_msg', { name: deleteModal.student?.fullNameEn }) }}</p>
            </div>
          </div>
          <div v-if="deleteModal.error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ deleteModal.error }}</div>
          <div class="flex items-center justify-end gap-3 pt-2">
            <button class="btn-ghost" @click="deleteModal.open = false">{{ $t('common.cancel') }}</button>
            <button
:disabled="deleteModal.deleting" class="px-5 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-all shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)] disabled:opacity-60 flex items-center gap-2"
              @click="handleDelete">
              <svg v-if="deleteModal.deleting" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ deleteModal.deleting ? $t('common.deleting') : $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAdminStore } from '../../../application/stores/admin';
import type { Student } from '../../../domain/models/Student';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Students — Smart School Admin' });

const adminStore = useAdminStore();
const { locale } = useI18n();
const searchInput = ref('');
const statusFilter = ref('');
const statusDropdownOpen = ref(false);
let searchTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(adminStore.studentsTotal / 15));

onMounted(() => {
  adminStore.fetchStudents();
  adminStore.fetchGenders();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchStudents({ search: searchInput.value, page: 1 });
  }, 400);
};

const handleFilter = () => {
  adminStore.fetchStudents({ search: searchInput.value, page: 1 });
};

const changePage = (page: number) => {
  adminStore.fetchStudents({ page });
};

// ── Edit Modal ──
const editModal = reactive({
  open: false,
  saving: false,
  error: '',
  studentId: null as number | null,
  form: {
    studentCode: '',
    fullNameEn: '',
    fullNameLo: '',
    gender: '',
    status: 'active'
  }
});

const openEditModal = (student: Student) => {
  editModal.studentId = student.studentId;
  editModal.form.studentCode = student.studentCode;
  editModal.form.fullNameEn = student.fullNameEn;
  editModal.form.fullNameLo = student.fullNameLo;
  editModal.form.gender = student.gender ?? '';
  editModal.form.status = student.status;
  editModal.error = '';
  editModal.open = true;
};

const handleEditSubmit = async () => {
  if (!editModal.studentId) return;
  editModal.saving = true;
  editModal.error = '';
  try {
    await adminStore.updateStudent(editModal.studentId, { ...editModal.form });
    editModal.open = false;
  } catch (err: any) {
    editModal.error = err.message || 'Failed to update student';
  } finally {
    editModal.saving = false;
  }
};

// ── Delete Modal ──
const deleteModal = reactive({
  open: false,
  deleting: false,
  error: '',
  student: null as Student | null
});

const openDeleteModal = (student: Student) => {
  deleteModal.student = student;
  deleteModal.error = '';
  deleteModal.open = true;
};

const handleDelete = async () => {
  if (!deleteModal.student) return;
  deleteModal.deleting = true;
  deleteModal.error = '';
  try {
    await adminStore.deleteStudent(deleteModal.student.studentId);
    deleteModal.open = false;
  } catch (err: any) {
    deleteModal.error = err.message || 'Failed to delete student';
  } finally {
    deleteModal.deleting = false;
  }
};
</script>

<style scoped lang="postcss">

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
