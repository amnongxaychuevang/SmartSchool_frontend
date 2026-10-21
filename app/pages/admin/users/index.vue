<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="$t('users.search')" class="search-bar" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <!-- Role Dropdown Menu -->
        <div class="relative z-50">
          <button
            :class="[
              'relative h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between min-w-[140px] transition-colors',
              roleFilter === '' 
                ? 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                : 'bg-teal-50 dark:bg-teal-500/20 border-teal-500/50 text-teal-700 dark:text-teal-400'
            ]" 
            @click="roleDropdownOpen = !roleDropdownOpen">
            <span class="flex items-center gap-2 truncate">
              {{ roleFilter === '' ? $t('common.all') : selectedRoleLabel }}
            </span>

            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform ml-2 shrink-0" :class="[roleDropdownOpen ? 'rotate-180' : '', roleFilter === '' ? 'text-slate-400' : 'text-teal-500 dark:text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="roleDropdownOpen" class="absolute left-0 top-full mt-2 w-full min-w-[160px] glass-panel !p-1 border border-slate-200 dark:border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50">
              <button
                v-for="r in roles" :key="r.value" class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg"
                :class="roleFilter === r.value ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
                @click="selectRole(r.value)">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="roleFilter === r.value ? 'bg-teal-500' : 'bg-transparent'"/>
                <span class="truncate">{{ r.value === '' ? $t('common.all') : r.label }}</span>
              </button>
            </div>
          </Transition>
        </div>
        <!-- Backdrop -->
        <div v-if="roleDropdownOpen" class="fixed inset-0 z-40" @click="roleDropdownOpen = false"/>

        <!-- Add User button -->
        <button
          type="button" class="ml-auto h-9 px-3.5 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:shadow-none"
          @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('users.add_user') }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-x-auto">
      <LoadingSpinner v-if="adminStore.usersLoading" class="my-12" />
      <div v-else-if="adminStore.users.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>{{ $t('users.no_users') }}</p>
      </div>
      <table v-else class="data-table w-full min-w-max">
        <thead>
          <tr>
            <th class="w-12 text-center">#</th>
            <th>{{ $t('common.name') }}</th>
            <th class="hidden md:table-cell">{{ $t('users.email') }}</th>
            <th class="hidden md:table-cell">{{ $t('users.phone') }}</th>
            <th>{{ $t('users.role') }}</th>
            <th class="hidden sm:table-cell">{{ $t('users.last_login') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th class="text-right">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
          <tr v-for="(user, index) in adminStore.users" :key="user.userId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              {{ (adminStore.usersPage - 1) * 10 + index + 1 }}
            </td>
            <td>
              <div class="flex items-center gap-3">
                <PersonAvatar :name="locale === 'lo' ? (user.fullNameLo || user.fullNameEn) : (user.fullNameEn || user.fullNameLo)" size="md" />
                <div>
                  <p class="text-sm font-medium text-slate-900 dark:text-white">
                    {{ locale === 'lo' ? (user.fullNameLo || user.fullNameEn) : (user.fullNameEn || user.fullNameLo) }}
                  </p>
                </div>
              </div>
            </td>
            <td class="hidden md:table-cell">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ user.email || '—' }}</p>
            </td>
            <td class="hidden md:table-cell">
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ user.phoneNumber || '—' }}</p>
            </td>
            <td>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                :class="roleBadgeClass(user)">
                {{ roleName(user) }}
              </span>
            </td>
            <td class="text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">
              {{ user.lastLogin ? fmt.dateTime(user.lastLogin) : $t('users.never') }}
            </td>
            <td>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="user.isActive ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'">
                {{ user.isActive ? $t('common.active') : $t('common.inactive') }}
              </span>
            </td>
            <td>
              <div class="flex items-center justify-end gap-1">
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="openEditModal(user)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  :disabled="togglingId === user.userId"
                  class="p-1.5 rounded-lg text-slate-400 transition-all disabled:opacity-40"
                  :class="user.isActive ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-teal-400 hover:bg-teal-500/10'"
                  :title="user.isActive ? $t('common.deactivate') : $t('common.reactivate')"
                  @click="toggleActive(user)">
                  <svg v-if="user.isActive" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      :loading="adminStore.usersLoading"
      :current-page="adminStore.usersPage"
      :total-pages="totalPages"
      :total="adminStore.usersTotal"
      :page-size="pageSize"
      @update:page="changePage"
      @update:page-size="changePageSize"
    />


    <!-- ── ADD / EDIT USER MODAL ── -->
    <UserFormModal
      :open="userModal.open"
      :form="userModal.form"
      :mode="userModal.mode"
      :saving="userModal.saving"
      :error="userModal.error"
      :account-type="userModal.accountType"
      :db-roles="dbRoles"
      :teacher-candidates="teacherCandidates"
      :edit-portal="userModal.editPortal"
      @update:open="userModal.open = $event"
      @update:form="userModal.form = $event"
      @update:account-type="userModal.accountType = $event"
      @submit="handleUserSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import UserFormModal from '../../../components/admin/UserFormModal.vue';
import { useAdminStore, USERS_PER_PAGE } from '../../../application/stores/admin';
import type { User } from '../../../domain/models/User';
import type { Role } from '../../../domain/models/School';
import type { TeacherAccountCandidate } from '../../../domain/models/Teacher';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import type { ApiResponse } from '../../../infrastructure/api/types';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

definePageMeta({ layout: 'admin' });

const adminStore = useAdminStore();
const { locale, t } = useI18n();
const fmt = useFormat();
const searchInput = ref('');
const roleFilter = ref('');
const roleDropdownOpen = ref(false);
let searchTimeout: ReturnType<typeof setTimeout>;

useHead({ title: () => t('page_titles.users') });

const apiClient = useApiClient();
const dbRoles = ref<Role[]>([]);

// The users list embeds the role object; the logged-in user carries just the code.
const roleCode = (u: User) => (typeof u.role === 'string' ? u.role : u.role.code);
const roleName = (u: User) =>
  typeof u.role === 'string' ? u.role : (locale.value === 'lo' ? u.role.nameLo : u.role.nameEn) || u.role.code;

const roles = computed(() => {
  const list = dbRoles.value.map(r => ({ value: r.code, label: locale.value === 'lo' ? r.nameLo : r.nameEn }));
  return [{ value: '', label: t('common.all') }, ...list];
});

const fetchRoles = async () => {
  try {
    const res = await apiClient<ApiResponse<Role[]>>(API_ENDPOINTS.roles.list);
    if (res?.success) {
      dbRoles.value = res.data;
    }
  } catch (error) {
    console.error('Failed to fetch roles:', error);
  }
};

const selectedRoleLabel = computed(() => roles.value.find(r => r.value === roleFilter.value)?.label ?? '');
const roleBadgeClass = (u: User) => roleColors[roleCode(u)]?.badge ?? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700';

const roleColors: Record<string, { bg: string; badge: string }> = {
  admin: { bg: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400', badge: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20' },
  teacher: { bg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400', badge: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' },
  parent: { bg: 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400', badge: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20' },
};

const pageSize = ref(USERS_PER_PAGE);
const totalPages = computed(() => Math.ceil(adminStore.usersTotal / pageSize.value));

onMounted(() => {
  adminStore.fetchUsers({ limit: pageSize.value });
  fetchRoles();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchUsers({ search: searchInput.value, page: 1, limit: pageSize.value });
  }, 400);
};

const clearSearch = () => {
  searchInput.value = '';
  clearTimeout(searchTimeout);
  adminStore.fetchUsers({ search: '', page: 1, limit: pageSize.value });
};

const setRoleFilter = (role: string) => {
  roleFilter.value = role;
  adminStore.fetchUsers({ role, search: searchInput.value, page: 1, limit: pageSize.value });
};

const selectRole = (role: string) => {
  roleDropdownOpen.value = false;
  setRoleFilter(role);
};

const changePage = (page: number) => {
  adminStore.fetchUsers({ page, limit: pageSize.value });
};

const changePageSize = (size: number) => {
  pageSize.value = size;
  adminStore.fetchUsers({ page: 1, limit: size });
};

// ── User Modal (Add + Edit) ──
const emptyUserForm = () => ({
  teacherId: 0,
  fullNameEn: '',
  fullNameLo: '',
  email: '',
  phoneNumber: '',
  roleId: '' as string | number,
  password: '',
  isActive: true
});

const userModal = reactive({
  open: false,
  mode: 'add' as 'add' | 'edit',
  saving: false,
  error: '',
  userId: null as number | null,
  accountType: 'teacher' as 'teacher' | 'staff',
  editPortal: '',
  form: emptyUserForm()
});

// Teachers without a login account, offered when opening a teacher's account.
const teacherCandidates = ref<TeacherAccountCandidate[]>([]);
const loadTeacherCandidates = async () => {
  try {
    teacherCandidates.value = await adminRepository.getTeacherAccountCandidates();
  } catch (err) {
    console.error('Failed to fetch teachers without an account:', err);
  }
};

const openAddModal = () => {
  userModal.mode = 'add';
  userModal.userId = null;
  userModal.accountType = 'teacher';
  userModal.editPortal = '';
  userModal.form = emptyUserForm();
  loadTeacherCandidates();
  userModal.error = '';
  userModal.open = true;
};

const openEditModal = (user: User) => {
  userModal.mode = 'edit';
  userModal.userId = user.userId;
  const roleId = typeof user.role === 'object' ? user.role.roleId : '';
  userModal.editPortal = dbRoles.value.find((r) => r.roleId === roleId)?.portal ?? '';
  userModal.form = {
    teacherId: 0,
    fullNameEn: user.fullNameEn ?? '',
    fullNameLo: user.fullNameLo ?? '',
    email: user.email ?? '',
    phoneNumber: user.phoneNumber ?? '',
    roleId: typeof user.role === 'object' ? user.role.roleId : '',
    password: '',
    isActive: user.isActive ?? true
  };
  userModal.error = '';
  userModal.open = true;
};

const handleUserSubmit = async () => {
  userModal.saving = true;
  userModal.error = '';
  try {
    const { teacherId, ...form } = userModal.form;
    const payload: Record<string, unknown> = { ...form };
    // Don't send empty password on edit
    if (userModal.mode === 'edit' && !payload.password) {
      delete payload.password;
    }
    if (userModal.mode === 'add' && userModal.accountType === 'teacher') {
      if (!teacherId) throw new Error(locale.value === 'lo' ? 'ກະລຸນາເລືອກຄູສອນ' : 'Please select a teacher');
      await adminRepository.openTeacherAccount({ teacherId, roleId: Number(form.roleId), password: form.password });
      await adminStore.fetchUsers({ page: 1 });
    } else if (userModal.mode === 'add') {
      delete payload.isActive;
      await adminStore.createUser(payload);
    } else if (userModal.userId) {
      await adminStore.updateUser(userModal.userId, payload);
    }
    userModal.open = false;
  } catch (err) {
    userModal.error = getErrorMessage(err, 'Failed to save user');
  } finally {
    userModal.saving = false;
  }
};

// ── Deactivate / reactivate ──
// Accounts are never deleted: their top-up, leave and audit history must stay.
const togglingId = ref<number | null>(null);
const dialog = useDialog();

const setActive = async (u: User, isActive: boolean) => {
  togglingId.value = u.userId;
  try {
    await adminStore.updateUser(u.userId, { isActive });
  } finally {
    togglingId.value = null;
  }
};

const toggleActive = async (u: User) => {
  if (u.isActive) {
    const name = (locale.value === 'lo' ? u.fullNameLo : u.fullNameEn) || u.fullNameEn;
    dialog.confirm({
      title: t('common.deactivate_title'),
      message: t('common.deactivate_confirm', { name }),
      confirmLabel: t('common.deactivate'),
      tone: 'danger',
      onConfirm: () => setActive(u, false),
    });
    return;
  }
  try {
    await setActive(u, true);
  } catch (err) {
    dialog.error(getErrorMessage(err, 'Failed to update status'));
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
