<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
      <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 flex-1">
        <div class="relative flex-1 sm:max-w-xs min-w-[200px]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchInput" type="text" :placeholder="$t('common.search')" class="search-bar" @input="handleSearch">
          <button v-if="searchInput" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="searchInput = ''; handleSearch()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <!-- Month Filter -->
        <div class="relative z-50">
          <input
            v-model="monthFilter"
            type="month"
            class="h-9 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 transition-all cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
            @change="handleFilter"
          />
        </div>

        <!-- Class Filter -->
        <div class="relative z-50">
          <button
            :class="[
              'relative h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between min-w-[140px] transition-colors',
              classFilter === '' 
                ? 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                : 'bg-teal-50 dark:bg-teal-500/20 border-teal-500/50 text-teal-700 dark:text-teal-400'
            ]" 
            @click="classDropdownOpen = !classDropdownOpen; subjectDropdownOpen = false">
            <span class="flex items-center gap-2 truncate">
              {{ classFilter === '' ? $t('grades_admin.all_classes') : className(classes.find(c => c.classId === classFilter) || { classNameEn: 'Unknown', classNameLo: 'Unknown' }) }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform ml-2 shrink-0" :class="[classDropdownOpen ? 'rotate-180' : '', classFilter === '' ? 'text-slate-400' : 'text-teal-500 dark:text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="classDropdownOpen" class="absolute left-0 top-full mt-2 w-full min-w-[160px] glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50">
              <button
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="classFilter === '' ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
                @click="classFilter = ''; handleFilter(); classDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="classFilter === '' ? 'bg-teal-500' : 'bg-transparent'"/>
                <span class="truncate">{{ $t('grades_admin.all_classes') }}</span>
              </button>
              <button
                v-for="c in classes" :key="c.classId"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="classFilter === c.classId ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
                @click="classFilter = c.classId; handleFilter(); classDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="classFilter === c.classId ? 'bg-teal-500' : 'bg-transparent'"/>
                <span class="truncate">{{ className(c) }}</span>
              </button>
            </div>
          </Transition>
        </div>

        <!-- Subject Filter -->
        <div class="relative z-50">
          <button
            :class="[
              'relative h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between min-w-[140px] transition-colors',
              subjectFilter === '' 
                ? 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                : 'bg-teal-50 dark:bg-teal-500/20 border-teal-500/50 text-teal-700 dark:text-teal-400'
            ]" 
            @click="subjectDropdownOpen = !subjectDropdownOpen; classDropdownOpen = false">
            <span class="flex items-center gap-2 truncate">
              {{ subjectFilter === '' ? $t('grades_admin.all_subjects') : subjectName(academicsStore.subjects.find(s => s.subjectId === subjectFilter) || { subjectNameEn: 'Unknown', subjectNameLo: 'Unknown' }) }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform ml-2 shrink-0" :class="[subjectDropdownOpen ? 'rotate-180' : '', subjectFilter === '' ? 'text-slate-400' : 'text-teal-500 dark:text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="subjectDropdownOpen" class="absolute left-0 top-full mt-2 w-full min-w-[160px] glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50">
              <button
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="subjectFilter === '' ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
                @click="subjectFilter = ''; handleFilter(); subjectDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="subjectFilter === '' ? 'bg-teal-500' : 'bg-transparent'"/>
                <span class="truncate">{{ $t('grades_admin.all_subjects') }}</span>
              </button>
              <button
                v-for="s in academicsStore.subjects" :key="s.subjectId"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="subjectFilter === s.subjectId ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
                @click="subjectFilter = s.subjectId; handleFilter(); subjectDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="subjectFilter === s.subjectId ? 'bg-teal-500' : 'bg-transparent'"/>
                <span class="truncate">{{ subjectName(s) }}</span>
              </button>
            </div>
          </Transition>
        </div>

      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button type="button" class="w-full sm:w-auto justify-center h-9 px-3.5 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:shadow-none" @click="openCreate">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          {{ $t('grades_admin.add') }}
        </button>
      </div>
    </div>

    <div v-if="academicsStore.gradesLoading" class="glass-panel p-12 flex justify-center">
      <LoadingSpinner />
    </div>
    <div v-else-if="!academicsStore.grades.length" class="glass-panel flex flex-col items-center justify-center py-20 text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>{{ $t('grades_admin.empty') }}</p>
    </div>
    <div v-else class="glass-panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('grades_admin.col_student') }}</th>
              <th>{{ $t('grades_admin.col_class') }}</th>
              <th>{{ $t('grades_admin.col_subject') }}</th>
              <th>{{ $t('grades_admin.col_type') }}</th>
              <th>{{ $t('grades_admin.col_month') }}</th>
              <th class="text-right">{{ $t('grades_admin.col_score') }}</th>
              <th>{{ $t('grades_admin.col_published') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
            <tr v-for="(grade, index) in academicsStore.grades" :key="grade.gradeId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="text-sm text-slate-500 dark:text-slate-400 text-center">{{ (academicsStore.gradesPage - 1) * 10 + index + 1 }}</td>
              <td>
                <div class="flex items-center gap-3">
                  <PersonAvatar :name="personName(grade.student)" :photo-url="grade.student && grade.student.photoUrl" size="sm" />
                  <div class="flex flex-col leading-tight">
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ personName(grade.student) }}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{{ grade.student && grade.student.studentCode }}</span>
                  </div>
                </div>
              </td>
              <td class="text-sm text-slate-700 dark:text-slate-300">{{ grade.class ? className(grade.class) : '—' }}</td>
              <td class="text-sm text-slate-700 dark:text-slate-300">{{ grade.subject ? subjectName(grade.subject) : '—' }}</td>
              <td class="text-sm text-slate-500 dark:text-slate-400">{{ grade.gradeType ? (locale === 'lo' ? grade.gradeType.typeNameLo : grade.gradeType.typeNameEn) : '—' }}</td>
              <td class="text-sm text-slate-500 dark:text-slate-400 tnum">{{ grade.gradeMonth || '—' }}</td>
              <td class="text-right tnum"><span class="text-sm font-semibold text-slate-900 dark:text-white">{{ f.number(grade.score, 2) }}</span><span class="text-xs text-slate-500 dark:text-slate-400"> / {{ f.number(grade.maxScore, 2) }}</span></td>
              <td class="align-middle">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="grade.isPublished ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 ring-1 ring-inset ring-teal-600/20 dark:ring-teal-500/20' : 'bg-slate-50 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 ring-1 ring-inset ring-slate-600/20 dark:ring-slate-500/20'">
                  <div class="w-1.5 h-1.5 rounded-full mr-1.5" :class="grade.isPublished ? 'bg-teal-500' : 'bg-slate-400'"></div>
                  {{ grade.isPublished ? $t('grades_admin.col_published') : $t('grades_admin.draft') }}
                </span>
              </td>
              <td class="align-middle text-right">
                <div class="inline-flex items-center justify-end gap-1">
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" :title="$t('common.edit')" @click="openEdit(grade)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" :title="$t('common.delete')" @click="openDelete(grade)">
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
    </div>
    
    <!-- Pagination -->
    <PaginationBar :loading="academicsStore.gradesLoading" :current-page="academicsStore.gradesPage" :total-pages="totalPages" @update:page="changePage" />

    <GradeFormModal
      :open="modal.open"
      :grade="modal.grade"
      :classes="classes"
      @update:open="modal.open = $event"
    />

    <ConfirmDialog
      :open="del.open"
      tone="danger"
      :title="$t('grades_admin.delete_title')"
      :message="del.grade ? $t('grades_admin.delete_msg', { subject: del.grade.subject ? subjectName(del.grade.subject) : '', name: personName(del.grade.student) }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @update:open="del.open = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Grade } from '../../../domain/models/Academics';
import type { SchoolClass } from '../../../domain/models/SchoolClass';
import type { Student } from '../../../domain/models/Student';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAcademicsStore } from '../../../application/stores/academics';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';

import PaginationBar from '../../../components/PaginationBar.vue';
import PersonAvatar from '../../../components/PersonAvatar.vue';
import GradeFormModal from '../../../components/admin/GradeFormModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';
import { schoolToday } from '../../../utils/schoolDate';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('grades_admin.title') });

const academicsStore = useAcademicsStore();
const classes = ref<SchoolClass[]>([]);
const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;
const classFilter = ref<number | ''>('');
const classDropdownOpen = ref(false);
const subjectFilter = ref<number | ''>('');
const subjectDropdownOpen = ref(false);

const getDefaultMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};
const monthFilter = ref(getDefaultMonth());

const totalPages = computed(() => Math.ceil(academicsStore.gradesTotal / 10));

type Named = { fullNameEn: string; fullNameLo: string } | null | undefined;
const personName = (p: Named) => (p ? (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn : '—');
const className = (c: { classNameEn: string; classNameLo: string }) => (locale.value === 'lo' ? c.classNameLo : c.classNameEn) || c.classNameEn;
const subjectName = (s: { subjectNameEn: string; subjectNameLo: string }) => (locale.value === 'lo' ? s.subjectNameLo : s.subjectNameEn) || s.subjectNameEn;

onMounted(async () => {
  academicsStore.fetchSubjects({ limit: 200 });
  academicsStore.fetchGrades({ gradeMonth: monthFilter.value });
  academicsStore.fetchGradeTypes();
  classes.value = (await adminRepository.getClasses({ limit: 200 })).classes;
});

const filters = () => ({
  classId: classFilter.value || undefined,
  subjectId: subjectFilter.value || undefined,
  gradeMonth: monthFilter.value || undefined,
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    academicsStore.gradesSearch = searchInput.value;
    academicsStore.fetchGrades({ ...filters(), page: 1 });
  }, 400);
};

const handleFilter = () => academicsStore.fetchGrades({ ...filters(), page: 1 });
const changePage = (page: number) => academicsStore.fetchGrades({ ...filters(), page });

// ── Add / edit ──
const modal = reactive({ open: false, grade: null as Grade | null });

const openCreate = () => Object.assign(modal, { open: true, grade: null });
const openEdit = (g: Grade) => Object.assign(modal, { open: true, grade: g });

// ── Delete ──
const del = reactive({ open: false, busy: false, error: '', grade: null as Grade | null });
const openDelete = (g: Grade) => Object.assign(del, { open: true, busy: false, error: '', grade: g });
async function handleDelete() {
  if (!del.grade) return;
  del.busy = true;
  del.error = '';
  try {
    await academicsStore.deleteGrade(del.grade.gradeId);
    del.open = false;
  } catch (err) {
    del.error = getErrorMessage(err, t('common.error'));
  } finally {
    del.busy = false;
  }
}
</script>
