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
          class="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch"
        >
        <button
          v-if="searchInput"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
          @click="searchInput = ''; handleSearch()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
              {{ statusFilter === '' ? $t('common.all') : statusLabel(statusFilter) }}
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
                v-for="status in adminStore.studentStatuses"
                :key="status.code"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="statusFilter === status.code ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="statusFilter = status.code; handleFilter(); statusDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full" :class="statusFilter === status.code ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ $t(status.labelKey) }}
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
    <div class="glass-panel overflow-x-auto">
      <!-- Loading -->
      <LoadingSpinner v-if="adminStore.studentsLoading" />

      <!-- Empty -->
      <div v-else-if="adminStore.students.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p>{{ $t('students.no_students') }}</p>
      </div>

      <!-- Data Table -->
      <table v-else class="w-full min-w-max">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5">{{ $t('common.code') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5">{{ $t('common.name') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5 hidden md:table-cell">{{ $t('common.class') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5 hidden sm:table-cell">{{ $t('common.date_of_birth') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5 hidden sm:table-cell">{{ $t('common.gender') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5 hidden 2xl:table-cell">{{ $t('common.address') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5">{{ $t('common.status') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5 hidden lg:table-cell">{{ $t('common.parent') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5 hidden xl:table-cell">{{ $t('common.parent_phone') }}</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-1.5">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr
v-for="student in adminStore.students" :key="student.studentId"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="px-4 py-1.5 text-sm text-slate-300 font-mono">{{ student.studentCode }}</td>
            <td class="px-4 py-1.5">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-sm font-bold shrink-0">
                  {{ studentName(student)[0] }}
                </div>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-white">{{ studentName(student) }}</span>
                  <!-- Show class under name on mobile since class column is hidden -->
                  <span class="text-xs text-slate-500 md:hidden mt-0.5">{{ currentClassName(student) }}</span>
                </div>
              </div>
            </td>
            <td class="px-4 py-1.5 text-sm text-slate-400 hidden md:table-cell">
              {{ currentClassName(student) }}
            </td>
            <td class="px-4 py-1.5 hidden sm:table-cell">
              <div v-if="student.dateOfBirth" class="flex flex-col">
                <span class="text-sm text-slate-300 font-mono">{{ formatDate(student.dateOfBirth) }}</span>
                <span class="text-xs text-slate-500 mt-0.5">{{ studentAge(student.dateOfBirth) }} {{ $t('common.years_old') }}</span>
              </div>
              <span v-else class="text-slate-500">—</span>
            </td>
            <td class="px-4 py-1.5 text-sm text-slate-400 capitalize hidden sm:table-cell">{{ student.gender ? $t(`gender.${student.gender}`) : '—' }}</td>
            <td class="px-4 py-1.5 text-sm text-slate-400 hidden 2xl:table-cell max-w-[250px] truncate" :title="studentAddress(student)">
              {{ studentAddress(student) }}
            </td>
            <td class="px-4 py-1.5">
              <div class="flex flex-col items-start gap-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium"
                  :class="{
                    'bg-teal-500/20 text-teal-400': student.status === 'active',
                    'bg-blue-500/20 text-blue-400': student.status === 'graduated',
                    'bg-slate-500/20 text-slate-400': student.status === 'transferred',
                    'bg-red-500/20 text-red-400': student.status === 'inactive',
                  }">
                  {{ statusLabel(student.status) }}
                </span>
                <!-- Show gender under status on mobile -->
                <span class="text-[10px] text-slate-500 sm:hidden capitalize">{{ student.gender ? $t(`gender.${student.gender}`) : '' }}</span>
              </div>
            </td>
            <td class="px-4 py-1.5 text-sm text-slate-300 hidden lg:table-cell">
              <span v-if="student.parentStudents?.[0]?.parent">{{ parentName(student.parentStudents[0].parent) }}</span>
              <span v-else class="text-slate-500">—</span>
            </td>
            <td class="px-4 py-1.5 text-xs text-slate-400 hidden xl:table-cell whitespace-nowrap">
              {{ student.parentStudents?.[0]?.parent?.phoneNumber || '—' }}
            </td>
            <td class="px-4 py-1.5">
              <div class="flex items-center justify-end gap-2">
                <!-- Edit -->
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="navigateTo(`/admin/students/create?id=${student.studentId}`)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Deactivate / reactivate (students are never deleted) -->
                <button
                  :disabled="togglingId === student.studentId"
                  class="p-1.5 rounded-lg text-slate-400 transition-all disabled:opacity-40"
                  :class="student.status === 'inactive' ? 'hover:text-teal-400 hover:bg-teal-500/10' : 'hover:text-red-400 hover:bg-red-500/10'"
                  :title="student.status === 'inactive' ? $t('students.reactivate') : $t('students.deactivate')"
                  @click="toggleActive(student)"
                >
                  <svg v-if="student.status === 'inactive'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
      :current-page="adminStore.studentsPage"
      :total-pages="totalPages"
      @update:page="changePage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '../../../application/stores/admin';
import type { Student } from '../../../domain/models/Student';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Students — Smart School Admin' });

const adminStore = useAdminStore();
const { locale, t } = useI18n();
const searchInput = ref('');
const statusFilter = ref('');
const statusDropdownOpen = ref(false);
let searchTimeout: ReturnType<typeof setTimeout>;

// Name in the current UI language, falling back to the other one if empty.
const studentName = (student: Student) =>
  locale.value === 'lo'
    ? student.fullNameLo || student.fullNameEn
    : student.fullNameEn || student.fullNameLo;

const parentName = (parent: { fullNameLo?: string; fullNameEn?: string }) =>
  locale.value === 'lo'
    ? parent.fullNameLo || parent.fullNameEn
    : parent.fullNameEn || parent.fullNameLo;

const statusLabel = (statusCode: string) => {
  const st = adminStore.studentStatuses.find(s => s.code === statusCode);
  return st ? t(st.labelKey) : statusCode;
};

// The API returns only the current academic year's class (at most one).
const currentClassName = (student: Student) => {
  const cls = student.classStudents?.[0]?.class;
  if (!cls) return '—';
  return (locale.value === 'lo' ? cls.classNameLo : cls.classNameEn) || cls.classNameEn || '—';
};

const studentAge = (dob?: string) => {
  if (!dob) return '—';
  const birthDate = new Date(dob);
  const diff = Date.now() - birthDate.getTime();
  const age = new Date(diff);
  return Math.abs(age.getUTCFullYear() - 1970);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
};

const studentAddress = (student: Student) => {
  const parts = [student.village, student.district, student.province].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
};

const totalPages = computed(() => Math.ceil(adminStore.studentsTotal / 15));

onMounted(() => {
  adminStore.fetchStudentStatuses();
  adminStore.fetchStudents();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchStudents({ search: searchInput.value, page: 1, status: statusFilter.value });
  }, 400);
};

const handleFilter = () => {
  adminStore.fetchStudents({ search: searchInput.value, page: 1, status: statusFilter.value });
};

const changePage = (page: number) => {
  adminStore.fetchStudents({ page, status: statusFilter.value, search: searchInput.value });
};

// ── Deactivate / reactivate ──
// Students are never deleted (their wallet, grades and attendance history must stay);
// admins switch them to "inactive" instead.
const togglingId = ref<number | null>(null);

const toggleActive = async (student: Student) => {
  const next = student.status === 'inactive' ? 'active' : 'inactive';
  if (next === 'inactive' && !confirm(t('students.deactivate_confirm', { name: studentName(student) }))) return;
  togglingId.value = student.studentId;
  try {
    await adminStore.updateStudent(student.studentId, { status: next });
  } catch (err) {
    alert((err instanceof Error && err.message) || 'Failed to update student status');
  } finally {
    togglingId.value = null;
  }
};
</script>
