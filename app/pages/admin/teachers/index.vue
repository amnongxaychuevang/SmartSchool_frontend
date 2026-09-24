<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
v-model="searchInput" type="text" :placeholder="$t('teachers.search')"
          class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch" >
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Add Teacher button -->
        <button
class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
          @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('teachers.add_teacher') }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <LoadingSpinner v-if="adminStore.teachersLoading" />
      <div v-else-if="adminStore.teachers.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7" />
        </svg>
        <p>{{ $t('teachers.no_teachers') }}</p>
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.user') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('teachers.employee_code') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">{{ $t('teachers.specialization') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">{{ $t('users.contact') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.status') }}</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="teacher in adminStore.teachers" :key="teacher.teacherId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {{ teacher.user?.fullNameEn?.[0] ?? '?' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-white">{{ teacher.user?.fullNameEn }}</p>
                  <p class="text-xs text-slate-500">{{ teacher.user?.fullNameLo }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-300 font-mono">{{ teacher.employeeCode }}</td>
            <td class="px-6 py-4 text-sm text-slate-400 hidden md:table-cell">{{ teacher.specialization ?? '—' }}</td>
            <td class="px-6 py-4 hidden sm:table-cell">
              <p class="text-sm text-slate-300">{{ teacher.user?.email ?? '—' }}</p>
              <p class="text-xs text-slate-500">{{ teacher.user?.phoneNumber ?? '—' }}</p>
            </td>
            <td class="px-6 py-4">
              <span
class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="teacher.user?.isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'">
                {{ teacher.user?.isActive ? $t('common.active') : $t('common.inactive') }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="openEditModal(teacher)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Deactivate / reactivate (accounts are never deleted) -->
                <button
                  :disabled="togglingId === teacher.teacherId"
                  class="p-1.5 rounded-lg text-slate-400 transition-all disabled:opacity-40"
                  :class="teacher.user?.isActive ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-teal-400 hover:bg-teal-500/10'"
                  :title="teacher.user?.isActive ? $t('common.deactivate') : $t('common.reactivate')"
                  @click="toggleActive(teacher)">
                  <svg v-if="teacher.user?.isActive" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <PaginationBar
      :current-page="adminStore.teachersPage"
      :total-pages="totalPages"
      @update:page="changePage"
    />




    <!-- ── ADD / EDIT TEACHER MODAL ── -->
    <TeacherFormModal
      v-model:open="teacherModal.open"
      v-model:form="teacherModal.form"
      :mode="teacherModal.mode"
      :saving="teacherModal.saving"
      :error="teacherModal.error"
      @submit="handleTeacherSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import TeacherFormModal from '../../../components/admin/TeacherFormModal.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import { useAdminStore } from '../../../application/stores/admin';
import type { Teacher } from '../../../domain/models/Teacher';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Teachers — Smart School Admin' });

const adminStore = useAdminStore();
const { locale, t } = useI18n();
const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(adminStore.teachersTotal / 15));

onMounted(() => {
  adminStore.fetchTeachers();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchTeachers({ search: searchInput.value, page: 1 });
  }, 400);
};

const changePage = (page: number) => {
  adminStore.fetchTeachers({ page });
};

// ── Teacher Modal (Add + Edit) ──
const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  return dateStr.split('T')[0] ?? '';
};

const emptyTeacherForm = () => ({
  fullNameEn: '',
  fullNameLo: '',
  email: '',
  phoneNumber: '',
  password: '',
  isActive: true,
  employeeCode: '',
  specialization: '',
  qualification: '',
  hireDate: '',
  salary: null as number | null,
  address: '',
  notes: ''
});

const teacherModal = reactive({
  open: false,
  mode: 'add' as 'add' | 'edit',
  saving: false,
  error: '',
  teacherId: null as number | null,
  form: emptyTeacherForm()
});

const openAddModal = () => {
  teacherModal.mode = 'add';
  teacherModal.teacherId = null;
  teacherModal.form = emptyTeacherForm();
  teacherModal.error = '';
  teacherModal.open = true;
};

const openEditModal = (teacher: Teacher) => {
  teacherModal.mode = 'edit';
  teacherModal.teacherId = teacher.teacherId;
  teacherModal.form = {
    fullNameEn: teacher.user?.fullNameEn ?? '',
    fullNameLo: teacher.user?.fullNameLo ?? '',
    email: teacher.user?.email ?? '',
    phoneNumber: teacher.user?.phoneNumber ?? '',
    password: '',
    isActive: teacher.user?.isActive ?? true,
    employeeCode: teacher.employeeCode,
    specialization: teacher.specialization ?? '',
    qualification: teacher.qualification ?? '',
    hireDate: formatDate(teacher.hireDate),
    salary: teacher.salary ? Number(teacher.salary) : null,
    address: teacher.address ?? '',
    notes: teacher.notes ?? ''
  };
  teacherModal.error = '';
  teacherModal.open = true;
};

const handleTeacherSubmit = async () => {
  teacherModal.saving = true;
  teacherModal.error = '';
  try {
    const payload: Record<string, unknown> = { ...teacherModal.form };
    // Don't send empty fields or empty password on edit
    if (teacherModal.mode === 'edit' && !payload.password) {
      delete payload.password;
    }
    if (teacherModal.mode === 'add') {
      delete payload.password;
      if (!payload.employeeCode) delete payload.employeeCode;
    }
    if (!payload.hireDate) delete payload.hireDate;

    if (teacherModal.mode === 'add') {
      await adminStore.createTeacher(payload);
    } else if (teacherModal.teacherId) {
      await adminStore.updateTeacher(teacherModal.teacherId, payload);
    }
    teacherModal.open = false;
  } catch (err) {
    teacherModal.error = getErrorMessage(err, 'Failed to save teacher');
  } finally {
    teacherModal.saving = false;
  }
};

// ── Deactivate / reactivate ──
// Accounts are never deleted: their top-up, leave and audit history must stay.
const togglingId = ref<number | null>(null);

const toggleActive = async (u: Teacher) => {
  const makeActive = !u.user?.isActive;
  const name = (locale.value === 'lo' ? u.user?.fullNameLo : u.user?.fullNameEn) || u.user?.fullNameEn || '';
  if (!makeActive && !confirm(t('common.deactivate_confirm', { name }))) return;
  togglingId.value = u.teacherId;
  try {
    await adminStore.updateTeacher(u.teacherId, { isActive: makeActive });
  } catch (err) {
    alert((err instanceof Error && err.message) || 'Failed to update status');
  } finally {
    togglingId.value = null;
  }
};
</script>

<style scoped lang="postcss">

/* Fix Autofill styling in modern browsers to match dark mode */
.modal-input:-webkit-autofill,
.modal-input:-webkit-autofill:hover, 
.modal-input:-webkit-autofill:focus,
.modal-input:-webkit-autofill:active {
  -webkit-text-fill-color: #ffffff !important;
  -webkit-box-shadow: 0 0 0 1000px #080e1a inset !important;
  box-shadow: 0 0 0 1000px #080e1a inset !important;
  border-color: rgba(45, 212, 191, 0.4) !important;
  transition: background-color 5000s ease-in-out 0s;
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
