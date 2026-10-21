<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="$t('parents.search')" class="search-bar" @input="handleSearch">
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
                : 'bg-teal-500/20 border-teal-500/50 text-teal-400'
            ]"
            @click="statusDropdownOpen = !statusDropdownOpen">
            <span>{{ statusText(statusFilter) }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" :class="[statusDropdownOpen ? 'rotate-180' : '', statusFilter === '' ? 'text-slate-400' : 'text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>

          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="statusDropdownOpen" class="absolute left-0 top-full mt-2 w-full min-w-[160px] glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50">
              <button
                v-for="s in STATUS_OPTIONS"
                :key="s"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="statusFilter === s ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="statusFilter = s; handleFilter(); statusDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full" :class="statusFilter === s ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ statusText(s) }}
              </button>
            </div>
          </Transition>
        </div>
        <div v-if="statusDropdownOpen" class="fixed inset-0 z-40" @click="statusDropdownOpen = false"/>

        <button v-if="canExport" type="button" class="btn-secondary ml-auto" :disabled="exporting || !adminStore.parentsTotal" @click="exportList">
          {{ exporting ? $t('common.loading') : $t('common.export_excel') }}
        </button>
        <NuxtLink to="/admin/parents/create" class="h-9 px-3.5 bg-teal-500 hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('common.add') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-x-auto">
      <LoadingSpinner v-if="adminStore.parentsLoading" />

      <div v-else-if="adminStore.parents.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>{{ $t('parents.no_parents') }}</p>
      </div>

      <table v-else class="data-table w-full min-w-max">
        <thead>
          <tr>
            <th class="w-12 text-center">#</th>
            <th>{{ $t('common.name') }}</th>
            <th class="hidden md:table-cell">{{ $t('parents.children') }}</th>
            <th class="hidden sm:table-cell">{{ $t('users.phone') }}</th>
            <th class="hidden xl:table-cell">{{ $t('parents.occupation') }}</th>
            <th class="hidden xl:table-cell">{{ $t('common.address') }}</th>
            <th class="hidden min-[1800px]:table-cell">{{ $t('parents.emergency_contact') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th class="text-right">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr
            v-for="(parent, i) in adminStore.parents"
            :key="parent.parentId"
            class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="text-center tnum text-ink-subtle">{{ (adminStore.parentsPage - 1) * PARENTS_PER_PAGE + i + 1 }}</td>
            <td>
              <NuxtLink :to="`/admin/parents/${parent.parentId}`" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <PersonAvatar :name="parentName(parent)" :photo-url="parent.user?.avatarUrl" size="md" />
                <div class="flex flex-col leading-tight min-w-0">
                  <span class="text-sm font-medium text-white">{{ parentName(parent) }}</span>
                  <!-- Phone and children columns are hidden on small screens -->
                  <span class="text-[11px] text-slate-500 mt-0.5 md:hidden whitespace-nowrap">
                    <span v-if="parent.user?.phoneNumber" class="sm:hidden">{{ parent.user.phoneNumber }}</span>
                    <span v-if="parent.studentLinks?.length" class="hidden sm:inline">{{ $t('parents.children') }} {{ parent.studentLinks.length }}</span>
                  </span>
                </div>
              </NuxtLink>
            </td>
            <td class="text-xs hidden md:table-cell max-w-[220px]">
              <div v-if="parent.studentLinks?.length" class="flex items-center gap-1.5 min-w-0" :title="childrenTitle(parent)">
                <span class="truncate text-slate-300">{{ childName(parent.studentLinks[0]!) }}</span>
                <span class="shrink-0 text-slate-500">· {{ $t(`relationship.${parent.studentLinks[0]!.relationship}`) }}</span>
                <span v-if="parent.studentLinks.length > 1" class="shrink-0 px-1.5 rounded-full bg-slate-500/15 text-slate-400 text-[10px] font-medium tnum">+{{ parent.studentLinks.length - 1 }}</span>
              </div>
              <span v-else class="text-slate-500">—</span>
            </td>
            <td class="text-xs text-slate-300 hidden sm:table-cell whitespace-nowrap">{{ parent.user?.phoneNumber || '—' }}</td>
            <td class="text-xs text-slate-400 hidden xl:table-cell max-w-[150px] truncate" :title="parent.occupation || ''">{{ parent.occupation || '—' }}</td>
            <td class="text-xs text-slate-400 hidden xl:table-cell max-w-[200px] truncate" :title="parentAddress(parent)">{{ parentAddress(parent) }}</td>
            <td class="text-xs text-slate-300 hidden min-[1800px]:table-cell whitespace-nowrap">{{ parent.emergencyContact || '—' }}</td>
            <td>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap"
                :class="parent.user?.isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'">
                {{ parent.user?.isActive ? $t('common.active') : $t('common.inactive') }}
              </span>
            </td>
            <td>
              <div class="flex items-center justify-end gap-2">
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="navigateTo(`/admin/parents/${parent.parentId}`)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Deactivate / reactivate (accounts are never deleted) -->
                <button
                  :disabled="togglingId === parent.parentId"
                  class="p-1.5 rounded-lg text-slate-400 transition-all disabled:opacity-40"
                  :class="parent.user?.isActive ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-teal-400 hover:bg-teal-500/10'"
                  :title="parent.user?.isActive ? $t('common.deactivate') : $t('common.reactivate')"
                  @click="toggleActive(parent)"
                >
                  <svg v-if="parent.user?.isActive" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

    <PaginationBar
      :loading="adminStore.parentsLoading"
      :current-page="adminStore.parentsPage"
      :total-pages="totalPages"
      :total="adminStore.parentsTotal"
      :page-size="pageSize"
      @update:page="changePage"
      @update:page-size="changePageSize"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminStore, PARENTS_PER_PAGE } from '../../../application/stores/admin';
import type { Parent, ParentChild } from '../../../domain/models/Parent';
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { useServerExport } from '../../../composables/useServerExport';

definePageMeta({ layout: 'admin' });

const adminStore = useAdminStore();
const { locale, t } = useI18n();
useHead({ title: () => `${t('parents.page_title')} — Smart School Admin` });

const searchInput = ref(adminStore.parentsSearch);
const statusFilter = ref(adminStore.parentsStatus);
const statusDropdownOpen = ref(false);
const STATUS_OPTIONS = ['', 'active', 'inactive'];
let searchTimeout: ReturnType<typeof setTimeout>;

const statusText = (s: string) => (s === 'active' ? t('common.active') : s === 'inactive' ? t('common.inactive') : t('common.all'));
const filters = () => ({ search: searchInput.value, status: statusFilter.value });

// Names in the current UI language, falling back to the other one if empty.
const localName = (x?: { fullNameLo?: string | null; fullNameEn?: string | null } | null) =>
  (locale.value === 'lo' ? x?.fullNameLo || x?.fullNameEn : x?.fullNameEn || x?.fullNameLo) || '';
const parentName = (parent: Parent) => localName(parent.user);
const childName = (link: ParentChild) => localName(link.student);
const childrenTitle = (parent: Parent) =>
  (parent.studentLinks ?? []).map((l) => `${childName(l)} (${t(`relationship.${l.relationship}`)})`).join('\n');

const place = (x?: { nameLo: string; nameEn: string } | null) =>
  x ? (locale.value === 'lo' ? x.nameLo : x.nameEn) || x.nameLo : '';
// Older records keep the whole address as free text; show it when nothing structured is set.
const parentAddress = (parent: Parent) =>
  [parent.village, place(parent.district), place(parent.province)].filter(Boolean).join(', ') || parent.address || '—';

// Standard export: the server builds the file from the same filters (and audit-logs it).
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'parents.export'));
const { exporting, download } = useServerExport();
const exportList = () => download('/parents/export', filters(), 'parents');

const pageSize = ref(PARENTS_PER_PAGE);
const totalPages = computed(() => Math.ceil(adminStore.parentsTotal / pageSize.value));

onMounted(() => {
  adminStore.fetchParents({ limit: pageSize.value });
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchParents({ ...filters(), page: 1, limit: pageSize.value });
  }, 400);
};

const clearSearch = () => {
  searchInput.value = '';
  handleSearch();
};

const handleFilter = () => {
  adminStore.fetchParents({ ...filters(), page: 1, limit: pageSize.value });
};

const changePage = (page: number) => {
  adminStore.fetchParents({ ...filters(), page, limit: pageSize.value });
};

const changePageSize = (size: number) => {
  pageSize.value = size;
  adminStore.fetchParents({ ...filters(), page: 1, limit: size });
};

// ── Deactivate / reactivate ──
// Accounts are never deleted: their top-up, leave and audit history must stay.
const togglingId = ref<number | null>(null);
const dialog = useDialog();

const setActive = async (parent: Parent, isActive: boolean) => {
  togglingId.value = parent.parentId;
  try {
    await adminStore.updateParent(parent.parentId, { isActive });
  } finally {
    togglingId.value = null;
  }
};

const toggleActive = async (parent: Parent) => {
  if (parent.user?.isActive) {
    dialog.confirm({
      title: t('common.deactivate_title'),
      message: t('common.deactivate_confirm', { name: parentName(parent) }),
      confirmLabel: t('common.deactivate'),
      tone: 'danger',
      onConfirm: () => setActive(parent, false),
    });
    return;
  }
  try {
    await setActive(parent, true);
  } catch (err) {
    dialog.error(getErrorMessage(err, 'Failed to update status'));
  }
};
</script>
