<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-start gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="text" :placeholder="$t('classes.search_subjects')" class="search-bar">
        <button v-if="searchQuery" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="searchQuery = ''">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div
        class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 flex-1"
      >
        <!-- Term Filter -->
        <div class="relative z-50 w-full sm:w-auto">
          <button
            :class="[
              'relative w-full sm:w-auto h-9 px-6 border rounded-lg text-sm focus:outline-none flex items-center justify-between gap-2 min-w-[140px] transition-colors',
              !termId
                ? 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                : 'bg-teal-50 dark:bg-teal-500/20 border-teal-200 dark:border-teal-500/50 text-teal-600 dark:text-teal-400 font-medium',
            ]"
            @click="termDropdownOpen = !termDropdownOpen"
          >
            <span class="flex items-center gap-2">
              {{
                selectedTerm
                  ? selectedTerm.academicYear +
                    " · " +
                    (locale === "lo"
                      ? selectedTerm.termNameLo
                      : selectedTerm.termNameEn)
                  : "—"
              }}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform"
              :class="[
                termDropdownOpen ? 'rotate-180' : '',
                !termId ? 'text-slate-400' : 'text-teal-500 dark:text-teal-400',
              ]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-out"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="termDropdownOpen"
              class="absolute left-0 top-full mt-2 w-max min-w-full glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50"
            >
              <button
                v-for="t in terms"
                :key="t.termId"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="
                  termId === t.termId
                    ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                "
                @click="
                  termId = t.termId;
                  fetchRows();
                  termDropdownOpen = false;
                "
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    termId === t.termId ? 'bg-teal-500' : 'bg-transparent'
                  "
                />
                {{ t.academicYear }} ·
                {{ locale === "lo" ? t.termNameLo : t.termNameEn
                }}{{ t.status === "active" ? " ●" : "" }}
              </button>
            </div>
          </Transition>
        </div>
        <div
          v-if="termDropdownOpen"
          class="fixed inset-0 z-40"
          @click="termDropdownOpen = false"
        />

        <!-- Class Filter -->
        <div class="relative z-50 w-full sm:w-auto">
          <button
            :class="[
              'relative w-full sm:w-auto h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between gap-2 min-w-[120px] transition-colors',
              classFilter === 0
                ? 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                : 'bg-teal-50 dark:bg-teal-500/20 border-teal-200 dark:border-teal-500/50 text-teal-600 dark:text-teal-400 font-medium',
            ]"
            @click="classDropdownOpen = !classDropdownOpen"
          >
            <span>{{
              classFilter === 0
                ? $t("classes.all_classes")
                : className(
                    classes.find((c) => c.classId === classFilter) || {
                      classNameEn: "",
                      classNameLo: "",
                    },
                  )
            }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform"
              :class="[
                classDropdownOpen ? 'rotate-180' : '',
                classFilter === 0
                  ? 'text-slate-400'
                  : 'text-teal-500 dark:text-teal-400',
              ]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-out"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="classDropdownOpen"
              class="absolute left-0 top-full mt-2 w-max min-w-full glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50 max-h-64 overflow-y-auto"
            >
              <button
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="
                  classFilter === 0
                    ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                "
                @click="
                  classFilter = 0;
                  fetchRows();
                  classDropdownOpen = false;
                "
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="classFilter === 0 ? 'bg-teal-500' : 'bg-transparent'"
                />
                {{ $t("classes.all_classes") }}
              </button>
              <button
                v-for="c in classes"
                :key="c.classId"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="
                  classFilter === c.classId
                    ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                "
                @click="
                  classFilter = c.classId;
                  fetchRows();
                  classDropdownOpen = false;
                "
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    classFilter === c.classId ? 'bg-teal-500' : 'bg-transparent'
                  "
                />
                {{ className(c) }}
              </button>
            </div>
          </Transition>
        </div>
        <div
          v-if="classDropdownOpen"
          class="fixed inset-0 z-40"
          @click="classDropdownOpen = false"
        />

        <button
          :disabled="!termId"
          class="sm:ml-auto w-full sm:w-auto justify-center h-9 px-3.5 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:shadow-none"
          @click="modalOpen = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ $t("classes.assign_subject") }}
        </button>
      </div>
    </div>

    <div
      v-if="!loading && terms.length === 0"
      class="glass-panel p-8 text-center text-slate-500 dark:text-slate-400 dark:text-slate-400 text-sm"
    >
      {{ $t("classes.create_term_first") }}
      <NuxtLink
        to="/admin/settings/academic-terms"
        class="text-teal-500 font-medium hover:underline ml-1"
        >{{ $t("classes.academic_terms_link") }}</NuxtLink
      >
    </div>

    <div v-else class="glass-panel overflow-x-auto">
      <LoadingSpinner v-if="loading" />
      <div
        v-else-if="filteredRows.length === 0"
        class="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 mb-3 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <p class="text-sm">{{ $t("classes.no_subjects_assigned") }}</p>
      </div>
      <table v-else class="data-table w-full min-w-max">
        <thead>
          <tr>
            <th class="w-12 text-center">#</th>
            <th>{{ $t("common.class") }}</th>
            <th>{{ locale === "lo" ? "ພາກຮຽນ" : "Term" }}</th>
            <th>{{ locale === "lo" ? "ສົກຮຽນ" : "Academic Year" }}</th>
            <th>{{ $t("classes.subject") }}</th>
            <th>{{ $t("classes.teacher") }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr
            v-for="(row, index) in paginatedRows"
            :key="row.id"
            class="hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <td
              class="text-sm text-slate-500 dark:text-slate-400 !text-center align-middle"
            >
              {{ (currentPage - 1) * itemsPerPage + index + 1 }}
            </td>
            <td class="align-middle">
              <span
                class="text-sm text-slate-900 dark:text-white font-semibold"
                >{{ className(row.class) }}</span
              >
            </td>
            <td
              class="align-middle text-sm text-slate-700 dark:text-slate-300"
            >
              <span v-if="row.term">{{
                locale === "lo" ? row.term.termNameLo : row.term.termNameEn
              }}</span>
            </td>
            <td
              class="align-middle text-sm text-slate-700 dark:text-slate-300"
            >
              <span v-if="row.term">{{ row.term.academicYear }}</span>
            </td>
            <td
              class="text-sm text-slate-700 dark:text-slate-300 font-medium align-middle"
            >
              {{
                locale === "lo"
                  ? row.subject.subjectNameLo
                  : row.subject.subjectNameEn
              }}
            </td>
            <td class="align-middle">
              <!-- Changing the teacher saves immediately. -->
              <div
                class="relative max-w-[200px]"
                :class="activeTeacherDropdown === row.id ? 'z-50' : 'z-10'"
              >
                <button
                  type="button"
                  class="w-full h-8 pl-3 pr-8 bg-slate-50 dark:bg-slate-800/50 border rounded-md text-xs text-left flex items-center justify-between transition-all cursor-pointer"
                  :class="
                    activeTeacherDropdown === row.id
                      ? 'border-teal-500 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/20 ring-1 ring-teal-500/20 font-medium'
                      : 'border-transparent text-slate-700 dark:text-slate-300 font-medium hover:border-slate-700'
                  "
                  @click="
                    activeTeacherDropdown =
                      activeTeacherDropdown === row.id ? null : row.id
                  "
                >
                  <span class="truncate">{{
                    row.teacherId
                      ? personName(row.teacher)
                      : $t("classes.no_teacher")
                  }}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 transition-transform"
                    :class="
                      activeTeacherDropdown === row.id
                        ? 'rotate-180 text-teal-500'
                        : 'text-slate-500 dark:text-slate-400'
                    "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <Transition
                  enter-active-class="transition duration-100 ease-out"
                  enter-from-class="transform scale-95 opacity-0"
                  enter-to-class="transform scale-100 opacity-100"
                  leave-active-class="transition duration-75 ease-out"
                  leave-from-class="transform scale-100 opacity-100"
                  leave-to-class="transform scale-95 opacity-0"
                >
                  <div
                    v-if="activeTeacherDropdown === row.id"
                    class="absolute left-0 top-full mt-1 w-max min-w-full max-h-48 overflow-y-auto glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50"
                  >
                    <button
                      type="button"
                      class="w-full text-left text-xs transition-colors flex items-center gap-2 rounded-md"
                      :class="
                        !row.teacherId
                          ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                      "
                      @click="
                        changeTeacher(row, 0);
                        activeTeacherDropdown = null;
                      "
                    >
                      <div
                        class="w-1.5 h-1.5 rounded-full shrink-0"
                        :class="
                          !row.teacherId ? 'bg-teal-500' : 'bg-transparent'
                        "
                      />
                      <span class="truncate">{{
                        $t("classes.no_teacher")
                      }}</span>
                    </button>
                    <button
                      type="button"
                      v-for="t in teachers"
                      :key="t.userId"
                      class="w-full text-left text-xs transition-colors flex items-center gap-2 rounded-md"
                      :class="
                        row.teacherId === t.userId
                          ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                      "
                      @click="
                        changeTeacher(row, t.userId);
                        activeTeacherDropdown = null;
                      "
                    >
                      <div
                        class="w-1.5 h-1.5 rounded-full shrink-0"
                        :class="
                          row.teacherId === t.userId
                            ? 'bg-teal-500'
                            : 'bg-transparent'
                        "
                      />
                      <span class="truncate">{{ personName(t) }}</span>
                    </button>
                  </div>
                </Transition>
              </div>
              <div
                v-if="activeTeacherDropdown === row.id"
                class="fixed inset-0 z-40"
                @click="activeTeacherDropdown = null"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationBar
      v-if="!loading && terms.length > 0 && filteredRows.length > 0"
      :loading="loading"
      :current-page="currentPage"
      :total-pages="totalPages"
      @update:page="(p) => (currentPage = p)"
    />

    <AdminAssignSubjectModal
      v-model="modalOpen"
      :term-id="termId"
      :initial-class-id="classFilter"
      :term-classes="termClasses"
      :subjects="subjects"
      :teachers="teachers"
      @saved="fetchRows"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  academicsRepository,
  type AcademicTerm,
  type ClassSubject,
} from "../../../infrastructure/api/AcademicsRepository";
import { adminRepository } from "../../../infrastructure/api/AdminRepository";
import type { TeacherOption } from "../../../domain/models/SchoolClass";

definePageMeta({ layout: "admin" });
useHead({ title: "Class Subjects — Smart School Admin" });

const { locale } = useI18n();
const dialog = useDialog();

type Named = { fullNameEn: string; fullNameLo: string };
type ClassOption = {
  classId: number;
  classNameEn: string;
  classNameLo: string;
  academicYear: string;
};
type SubjectOption = {
  subjectId: number;
  subjectCode: string | null;
  subjectNameEn: string;
  subjectNameLo: string;
};

const personName = (p?: Named | null) =>
  p
    ? (locale.value === "lo" ? p.fullNameLo : p.fullNameEn) || p.fullNameEn
    : "—";
const className = (c: Pick<ClassOption, "classNameEn" | "classNameLo">) =>
  (locale.value === "lo" ? c.classNameLo : c.classNameEn) || c.classNameEn;
const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message ||
  (err instanceof Error && err.message) ||
  fallback;

const terms = ref<AcademicTerm[]>([]);
const classes = ref<ClassOption[]>([]);
const subjects = ref<SubjectOption[]>([]);
const teachers = ref<TeacherOption[]>([]);
const rows = ref<ClassSubject[]>([]);
const termId = ref(0);
const classFilter = ref(0);
const loading = ref(true);

const selectedTerm = computed(() =>
  terms.value.find((t) => t.termId === termId.value),
);

const termDropdownOpen = ref(false);
const classDropdownOpen = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredRows = computed(() => {
  if (!searchQuery.value) return rows.value;
  const lowerQuery = searchQuery.value.toLowerCase();
  return rows.value.filter((row) => {
    const code = row.subject.subjectCode?.toLowerCase() || "";
    const nameEn = row.subject.subjectNameEn.toLowerCase();
    const nameLo = row.subject.subjectNameLo.toLowerCase();
    const teacherEn = row.teacher?.fullNameEn.toLowerCase() || "";
    const teacherLo = row.teacher?.fullNameLo.toLowerCase() || "";
    return (
      code.includes(lowerQuery) ||
      nameEn.includes(lowerQuery) ||
      nameLo.includes(lowerQuery) ||
      teacherEn.includes(lowerQuery) ||
      teacherLo.includes(lowerQuery)
    );
  });
});

const totalPages = computed(
  () => Math.ceil(filteredRows.value.length / itemsPerPage) || 1,
);

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRows.value.slice(start, end);
});

// Reset page when search or filters change
watch([searchQuery, classFilter, termId], () => {
  currentPage.value = 1;
});

// Only classes of the selected term's academic year can take its subjects.
const termClasses = computed(() => {
  const year = terms.value.find((t) => t.termId === termId.value)?.academicYear;
  return classes.value.filter((c) => !year || c.academicYear === year);
});

const fetchRows = async () => {
  if (!termId.value) return;
  loading.value = true;
  try {
    rows.value = await academicsRepository.getClassSubjects({
      termId: termId.value,
      classId: classFilter.value || undefined,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const [t, c, s, te] = await Promise.all([
      academicsRepository.getTerms(),
      adminRepository.getAllClasses(),
      academicsRepository.getAllSubjects(),
      adminRepository.getTeacherOptions(),
    ]);
    terms.value = t;
    classes.value = c;
    subjects.value = s.filter(
      (x: SubjectOption & { isActive?: boolean }) => x.isActive !== false,
    );
    teachers.value = te;
    termId.value = (t.find((x) => x.status === "active") ?? t[0])?.termId ?? 0;
  } finally {
    loading.value = false;
  }
  await fetchRows();
});

const modalOpen = ref(false);
const activeTeacherDropdown = ref<number | null>(null);

const changeTeacher = async (row: ClassSubject, teacherId: number) => {
  try {
    const updated = await academicsRepository.setClassSubjectTeacher(
      row.id,
      teacherId || null,
    );
    Object.assign(row, updated);
  } catch (err) {
    dialog.error(errorMessage(err, "Failed to change teacher"));
    await fetchRows();
  }
};
</script>

