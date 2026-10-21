<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="$t('teachers.search')" class="search-bar" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear')" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <!-- Status Dropdown Menu -->
        <div class="relative z-50">
          <button
            :class="[
              'relative h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between min-w-[140px] transition-colors',
              statusFilter === ''
                ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600'
                : 'bg-teal-500/20 border-teal-500/50 text-teal-400',
            ]"
            @click="statusDropdownOpen = !statusDropdownOpen"
          >
            <span>{{ statusText(statusFilter) }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform"
              :class="[
                statusDropdownOpen ? 'rotate-180' : '',
                statusFilter === '' ? 'text-slate-400' : 'text-teal-400',
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
              v-if="statusDropdownOpen"
              class="absolute left-0 top-full mt-2 w-full min-w-[160px] glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50"
            >
              <button
                v-for="s in STATUS_OPTIONS"
                :key="s"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="
                  statusFilter === s
                    ? 'bg-teal-500/10 text-teal-400 font-medium'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                "
                @click="
                  statusFilter = s;
                  handleFilter();
                  statusDropdownOpen = false;
                "
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="statusFilter === s ? 'bg-teal-500' : 'bg-transparent'"
                />
                {{ statusText(s) }}
              </button>
            </div>
          </Transition>
        </div>
        <div
          v-if="statusDropdownOpen"
          class="fixed inset-0 z-40"
          @click="statusDropdownOpen = false"
        />

        <!-- Gender Dropdown Menu -->
        <div class="relative z-50">
          <button
            :class="[
              'relative h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between min-w-[120px] transition-colors',
              genderFilter === ''
                ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600'
                : 'bg-teal-500/20 border-teal-500/50 text-teal-400',
            ]"
            @click="genderDropdownOpen = !genderDropdownOpen"
          >
            <span>{{ genderText(genderFilter) }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition-transform"
              :class="[
                genderDropdownOpen ? 'rotate-180' : '',
                genderFilter === '' ? 'text-slate-400' : 'text-teal-400',
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
              v-if="genderDropdownOpen"
              class="absolute left-0 top-full mt-2 w-max min-w-full glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50"
            >
              <button
                v-for="g in GENDER_OPTIONS"
                :key="g"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="
                  genderFilter === g
                    ? 'bg-teal-500/10 text-teal-400 font-medium'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                "
                @click="
                  genderFilter = g;
                  handleFilter();
                  genderDropdownOpen = false;
                "
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="genderFilter === g ? 'bg-teal-500' : 'bg-transparent'"
                />
                {{ genderText(g) }}
              </button>
            </div>
          </Transition>
        </div>
        <div
          v-if="genderDropdownOpen"
          class="fixed inset-0 z-40"
          @click="genderDropdownOpen = false"
        />

        <button v-if="canExport" type="button" class="btn-secondary ml-auto" :disabled="exporting || !adminStore.teachersTotal" @click="exportList">
          {{ exporting ? $t("common.loading") : $t("common.export_excel") }}
        </button>
        <NuxtLink
          to="/admin/teachers/create"
          class="h-9 px-3.5 bg-teal-500 hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
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
          {{ $t("common.add") }}
        </NuxtLink>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-x-auto">
      <LoadingSpinner v-if="adminStore.teachersLoading" />

      <div
        v-else-if="adminStore.teachers.length === 0"
        class="flex flex-col items-center justify-center py-20 text-slate-500"
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
            d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
        </svg>
        <p>{{ $t("teachers.no_teachers") }}</p>
      </div>

      <table v-else class="data-table w-full min-w-max">
        <thead>
          <tr>
            <th class="w-12 text-center">#</th>
            <th>{{ $t("common.name") }}</th>
            <th class="hidden md:table-cell">{{ $t("teachers.specialization") }}</th>
            <th class="hidden min-[1360px]:table-cell">{{ $t("teachers.qualification") }}</th>
            <th class="hidden sm:table-cell">{{ $t("users.phone") }}</th>
            <th class="hidden sm:table-cell">{{ $t("common.gender") }}</th>
            <th class="hidden xl:table-cell">{{ $t("common.address") }}</th>
            <th class="hidden min-[1800px]:table-cell">{{ $t("users.email") }}</th>
            <th class="hidden min-[1800px]:table-cell">{{ $t("teachers.hire_date") }}</th>
            <th>{{ $t("common.status") }}</th>
            <th class="text-right">{{ $t("common.actions") }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr
            v-for="(teacher, i) in adminStore.teachers"
            :key="teacher.teacherId"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <td class="text-center tnum text-ink-subtle">
              {{ (adminStore.teachersPage - 1) * TEACHERS_PER_PAGE + i + 1 }}
            </td>
            <td>
              <div class="flex items-center gap-3">
                <PersonAvatar
                  :name="teacherName(teacher)"
                  :photo-url="teacher.user.avatarUrl"
                  size="md"
                />
                <div class="flex flex-col leading-tight">
                  <span class="text-sm font-medium text-white">{{
                    teacherName(teacher)
                  }}</span>
                  <span class="text-[11px] text-slate-500 mt-0.5">
                    <span class="font-mono">{{ teacher.employeeCode }}</span>
                    <!-- Specialization column is hidden on mobile -->
                    <span v-if="teacher.specialization" class="md:hidden">
                      · {{ teacher.specialization }}</span
                    >
                  </span>
                </div>
              </div>
            </td>
            <td
              class="text-xs text-slate-400 hidden md:table-cell max-w-[130px] truncate"
              :title="teacher.specialization || ''"
            >
              {{ teacher.specialization || "—" }}
            </td>
            <td
              class="text-xs text-slate-400 hidden min-[1360px]:table-cell max-w-[160px] truncate"
              :title="teacher.qualification || ''"
            >
              {{ teacher.qualification || "—" }}
            </td>
            <td
              class="text-xs text-slate-300 hidden sm:table-cell whitespace-nowrap"
            >
              {{ teacher.user.phoneNumber || "—" }}
            </td>
            <td
              class="text-xs text-slate-400 hidden sm:table-cell whitespace-nowrap"
            >
              {{ teacher.gender ? $t(`gender.${teacher.gender}`) : "—" }}
            </td>
            <td
              class="text-xs text-slate-400 hidden xl:table-cell max-w-[180px] truncate"
              :title="teacherAddress(teacher)"
            >
              {{ teacherAddress(teacher) }}
            </td>
            <td
              class="text-xs text-slate-400 hidden min-[1800px]:table-cell max-w-[190px] truncate"
              :title="teacher.user.email || ''"
            >
              {{ teacher.user.email || "—" }}
            </td>
            <td
              class="text-xs text-slate-300 font-mono hidden min-[1800px]:table-cell"
            >
              {{ formatDate(teacher.hireDate) }}
            </td>
            <td>
              <div class="flex flex-col items-start gap-1">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap"
                  :class="
                    teacher.user.isActive
                      ? 'bg-teal-500/20 text-teal-400'
                      : 'bg-red-500/20 text-red-400'
                  "
                >
                  {{
                    teacher.user.isActive
                      ? $t("common.active")
                      : $t("common.inactive")
                  }}
                </span>
                <!-- Show gender under status on mobile -->
                <span
                  v-if="teacher.gender"
                  class="text-[10px] text-slate-500 sm:hidden"
                  >{{ $t(`gender.${teacher.gender}`) }}</span
                >
              </div>
            </td>
            <td>
              <div class="flex items-center justify-end gap-2">
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="navigateTo(`/admin/teachers/${teacher.teacherId}`)"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <!-- Deactivate / reactivate (accounts are never deleted) -->
                <button
                  :disabled="togglingId === teacher.teacherId"
                  class="p-1.5 rounded-lg text-slate-400 transition-all disabled:opacity-40"
                  :class="
                    teacher.user.isActive
                      ? 'hover:text-red-400 hover:bg-red-500/10'
                      : 'hover:text-teal-400 hover:bg-teal-500/10'
                  "
                  :title="
                    teacher.user.isActive
                      ? $t('common.deactivate')
                      : $t('common.reactivate')
                  "
                  @click="toggleActive(teacher)"
                >
                  <svg
                    v-if="teacher.user.isActive"
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
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                  <svg
                    v-else
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationBar
      :loading="adminStore.teachersLoading"
      :current-page="adminStore.teachersPage"
      :total-pages="totalPages"
      :total="adminStore.teachersTotal"
      :page-size="pageSize"
      @update:page="changePage"
      @update:page-size="changePageSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  useAdminStore,
  TEACHERS_PER_PAGE,
} from "../../../application/stores/admin";
import type { Teacher } from "../../../domain/models/Teacher";
import { useAuthStore } from "../../../application/stores/auth";
import { hasPermission } from "../../../components/layout/adminNav";
import { useServerExport } from "../../../composables/useServerExport";
import { GENDERS } from "../../../domain/models/Gender";

definePageMeta({ layout: "admin" });

const adminStore = useAdminStore();
const { locale, t } = useI18n();
useHead({ title: () => `${t("teachers.title")} — Smart School Admin` });

const searchInput = ref(adminStore.teachersSearch);
const statusFilter = ref(adminStore.teachersStatus);
const statusDropdownOpen = ref(false);
const STATUS_OPTIONS = ["", "active", "inactive"];
const genderFilter = ref(adminStore.teachersGender);
const genderDropdownOpen = ref(false);
const GENDER_OPTIONS = ["", ...GENDERS];
let searchTimeout: ReturnType<typeof setTimeout>;

const statusText = (s: string) =>
  s === "active"
    ? t("common.active")
    : s === "inactive"
      ? t("common.inactive")
      : t("common.all");
const genderText = (g: string) => (g ? t(`gender.${g}`) : t("gender.all"));
const filters = () => ({
  search: searchInput.value,
  status: statusFilter.value,
  gender: genderFilter.value,
});

const teacherName = (teacher: Teacher) =>
  (locale.value === "lo"
    ? teacher.user.fullNameLo
    : teacher.user.fullNameEn) ||
  teacher.user.fullNameEn ||
  "";

const place = (x?: { nameLo: string; nameEn: string } | null) =>
  x ? (locale.value === "lo" ? x.nameLo : x.nameEn) || x.nameLo : "";
const teacherAddress = (teacher: Teacher) =>
  [teacher.village, place(teacher.district), place(teacher.province)]
    .filter(Boolean)
    .join(", ") || "—";

const formatDate = (dateStr?: string | null) =>
  dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "—";

// Standard export: the server builds the file from the same filters (and audit-logs it).
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, "teachers.export"));
const { exporting, download } = useServerExport();
const exportList = () => download("/teachers/export", filters(), "teachers");

const pageSize = ref(TEACHERS_PER_PAGE);
const totalPages = computed(() =>
  Math.ceil(adminStore.teachersTotal / pageSize.value),
);

onMounted(() => {
  adminStore.fetchTeachers({ limit: pageSize.value });
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchTeachers({ ...filters(), page: 1, limit: pageSize.value });
  }, 400);
};

const clearSearch = () => {
  searchInput.value = "";
  handleSearch();
};

const handleFilter = () => {
  adminStore.fetchTeachers({ ...filters(), page: 1, limit: pageSize.value });
};

const changePage = (page: number) => {
  adminStore.fetchTeachers({ ...filters(), page, limit: pageSize.value });
};

const changePageSize = (size: number) => {
  pageSize.value = size;
  adminStore.fetchTeachers({ ...filters(), page: 1, limit: size });
};

// ── Deactivate / reactivate ──
// Accounts are never deleted: their top-up, leave and audit history must stay.
const togglingId = ref<number | null>(null);
const dialog = useDialog();

const setActive = async (teacher: Teacher, isActive: boolean) => {
  togglingId.value = teacher.teacherId;
  try {
    await adminStore.updateTeacher(teacher.teacherId, { isActive });
  } finally {
    togglingId.value = null;
  }
};

const toggleActive = async (teacher: Teacher) => {
  if (teacher.user.isActive) {
    dialog.confirm({
      title: t("common.deactivate_title"),
      message: t("common.deactivate_confirm", { name: teacherName(teacher) }),
      confirmLabel: t("common.deactivate"),
      tone: "danger",
      onConfirm: () => setActive(teacher, false),
    });
    return;
  }
  try {
    await setActive(teacher, true);
  } catch (err) {
    dialog.error(getErrorMessage(err, "Failed to update status"));
  }
};
</script>
