<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="$t('classes.search_placeholder')" class="search-bar" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear')" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <!-- Academic year Dropdown Menu -->
        <div class="relative z-50">
          <button
            :class="[
              'relative h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between gap-2 min-w-[140px] transition-colors',
              yearFilter === ''
                ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600'
                : 'bg-teal-500/20 border-teal-500/50 text-teal-400'
            ]"
            @click="yearDropdownOpen = !yearDropdownOpen">
            <span class="tnum">{{ yearFilter || $t('classes.all_years') }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" :class="[yearDropdownOpen ? 'rotate-180' : '', yearFilter === '' ? 'text-slate-400' : 'text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>

          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="yearDropdownOpen" class="absolute left-0 top-full mt-2 w-max min-w-full glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50">
              <button
                v-for="y in ['', ...academicYears]"
                :key="y"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg tnum"
                :class="yearFilter === y ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="yearFilter = y; handleFilter(); yearDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full" :class="yearFilter === y ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ y || $t('classes.all_years') }}
              </button>
            </div>
          </Transition>
        </div>
        <div v-if="yearDropdownOpen" class="fixed inset-0 z-40" @click="yearDropdownOpen = false"/>

        <NuxtLink to="/admin/classes/create" class="ml-auto h-9 px-3.5 bg-teal-500 hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('common.add') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-x-auto">
      <LoadingSpinner v-if="adminStore.classesLoading" />

      <div v-else-if="adminStore.classes.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p>{{ $t('classes.no_classes') }}</p>
      </div>

      <table v-else class="data-table w-full min-w-max">
        <thead>
          <tr>
            <th class="w-12 text-center">#</th>
            <th>{{ $t('nav.classes') }}</th>
            <th class="hidden md:table-cell">{{ $t('classes.grade_level') }}</th>
            <th class="hidden sm:table-cell">{{ $t('classes.academic_year') }}</th>
            <th class="hidden lg:table-cell">{{ $t('classes.homeroom_teacher') }}</th>
            <th class="text-right hidden sm:table-cell">{{ $t('classes.students') }}</th>
            <th class="text-right hidden xl:table-cell">{{ $t('classes.subjects') }}</th>
            <th class="text-right">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr
            v-for="(cls, i) in adminStore.classes"
            :key="cls.classId"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="text-center tnum text-ink-subtle">{{ (adminStore.classesPage - 1) * CLASSES_PER_PAGE + i + 1 }}</td>
            <td>
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 shrink-0 rounded-lg bg-teal-500/15 text-teal-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </span>
                <div class="flex flex-col leading-tight min-w-0">
                  <span class="text-sm font-medium text-white">{{ className(cls) }}</span>
                  <span class="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
                    <span class="hidden sm:inline">{{ otherName(cls) }}</span>
                    <!-- Year and student columns are hidden on mobile -->
                    <span class="sm:hidden tnum">{{ cls.academicYear }} · {{ $t('classes.students_count', { count: studentCount(cls) }) }}</span>
                  </span>
                </div>
              </div>
            </td>
            <td class="text-xs text-slate-400 hidden md:table-cell whitespace-nowrap">{{ gradeLevel(cls) || '—' }}</td>
            <td class="text-xs text-slate-300 hidden sm:table-cell whitespace-nowrap tnum">{{ cls.academicYear }}</td>
            <td class="hidden lg:table-cell max-w-[180px]">
              <div v-if="cls.homeroomTeacher" class="flex items-center gap-2 min-w-0" :title="personName(cls.homeroomTeacher)">
                <PersonAvatar :name="personName(cls.homeroomTeacher)" :photo-url="cls.homeroomTeacher.avatarUrl" size="sm" />
                <span class="text-xs text-slate-300 truncate">{{ personName(cls.homeroomTeacher) }}</span>
              </div>
              <span v-else class="text-xs text-slate-500">{{ $t('classes.no_homeroom_teacher') }}</span>
            </td>
            <td class="text-xs text-slate-300 text-right hidden sm:table-cell tnum">{{ studentCount(cls) }}</td>
            <td class="text-xs text-slate-300 text-right hidden xl:table-cell tnum">{{ cls._count?.classSubjects ?? 0 }}</td>
            <td>
              <div class="flex items-center justify-end gap-2">
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="navigateTo(`/admin/classes/create?id=${cls.classId}`)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Only an empty class can be deleted (the server re-checks) -->
                <button
                  v-if="!studentCount(cls) && !cls._count?.classSubjects"
                  :disabled="busyId === cls.classId"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                  :title="$t('common.delete')"
                  @click="confirmDelete(cls)"
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

    <PaginationBar
      :loading="adminStore.classesLoading"
      :current-page="adminStore.classesPage"
      :total-pages="totalPages"
      :total="adminStore.classesTotal"
      :page-size="pageSize"
      @update:page="changePage"
      @update:page-size="changePageSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminStore, CLASSES_PER_PAGE } from '../../../application/stores/admin';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import type { SchoolClass } from '../../../domain/models/SchoolClass';

definePageMeta({ layout: 'admin' });

const adminStore = useAdminStore();
const { locale, t } = useI18n();
useHead({ title: () => `${t('classes.page_title')} — Smart School Admin` });

const searchInput = ref(adminStore.classesSearch);
const yearFilter = ref(adminStore.classesYear);
const yearDropdownOpen = ref(false);
const academicYears = ref<string[]>([]);
const pageSize = ref(CLASSES_PER_PAGE);
let searchTimeout: ReturnType<typeof setTimeout>;

const filters = () => ({ search: searchInput.value, academicYear: yearFilter.value });

// Names in the current UI language, the other language underneath.
const className = (c: SchoolClass) => (locale.value === 'lo' ? c.classNameLo || c.classNameEn : c.classNameEn || c.classNameLo);
const otherName = (c: SchoolClass) => (locale.value === 'lo' ? c.classNameEn : c.classNameLo);
const gradeLevel = (c: SchoolClass) => (locale.value === 'lo' ? c.gradeLevelLo || c.gradeLevelEn : c.gradeLevelEn || c.gradeLevelLo);
const personName = (p: { fullNameLo?: string; fullNameEn?: string }) =>
  (locale.value === 'lo' ? p.fullNameLo || p.fullNameEn : p.fullNameEn || p.fullNameLo) || '';
const studentCount = (c: SchoolClass) => c._count?.classStudents ?? 0;

const totalPages = computed(() => Math.ceil(adminStore.classesTotal / pageSize.value));

const changePage = (page: number) => {
  adminStore.fetchClasses({ ...filters(), page, limit: pageSize.value });
};

const changePageSize = (size: number) => {
  pageSize.value = size;
  adminStore.fetchClasses({ ...filters(), page: 1, limit: size });
};

onMounted(async () => {
  adminStore.fetchClasses();
  try {
    academicYears.value = await adminRepository.getClassAcademicYears();
  } catch {
    // The filter just shows "All years" without the list.
  }
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchClasses({ ...filters(), page: 1 });
  }, 400);
};

const clearSearch = () => {
  searchInput.value = '';
  handleSearch();
};

const handleFilter = () => {
  adminStore.fetchClasses({ ...filters(), page: 1, limit: pageSize.value });
};

// ── Delete ──
const busyId = ref<number | null>(null);
const dialog = useDialog();

const confirmDelete = (cls: SchoolClass) => {
  dialog.confirm({
    title: t('classes.delete_confirm_title'),
    message: t('classes.delete_confirm_msg', { name: className(cls) }),
    confirmLabel: t('common.delete'),
    tone: 'danger',
    onConfirm: async () => {
      busyId.value = cls.classId;
      try {
        await adminStore.deleteClass(cls.classId);
      } finally {
        busyId.value = null;
      }
    },
  });
};
</script>
