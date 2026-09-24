<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
v-model="searchInput" type="text" :placeholder="$t('users.search')"
          class="w-full pl-9 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch" >
        
        <!-- Clear Search Button -->
        <button
v-if="searchInput" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-0.5 rounded-full hover:bg-slate-700"
          @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex items-center gap-4 flex-wrap ">
        <!-- Role Dropdown Menu -->
        <div class="relative z-50">
          <button
:class="[
              'px-4 py-2.5 border rounded-lg text-sm focus:outline-none flex items-center justify-between gap-3 min-w-[150px] transition-colors',
              roleFilter === '' 
                ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600'
                : 'bg-teal-500/20 border-teal-500/50 text-teal-400'
            ]" 
            @click="roleDropdownOpen = !roleDropdownOpen">
            <span class="flex items-center gap-2">
              {{ roleFilter === '' ? $t('common.all') : roles.find(r => r.value === roleFilter)?.label }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform" :class="[roleDropdownOpen ? 'rotate-180' : '', roleFilter === '' ? 'text-slate-400' : 'text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="roleDropdownOpen" class="absolute left-0 top-full mt-2 w-full min-w-[160px] glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50">
              <button
v-for="r in roles" :key="r.value" class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3"
                :class="roleFilter === r.value ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="selectRole(r.value)">
                <div class="w-1.5 h-1.5 rounded-full" :class="roleFilter === r.value ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ r.value === '' ? $t('common.all') : r.label }}
              </button>
            </div>
          </Transition>
        </div>
        <!-- Backdrop -->
        <div v-if="roleDropdownOpen" class="fixed inset-0 z-40" @click="roleDropdownOpen = false"/>

        <!-- Add User button -->
        <button
class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]"
          @click="openAddModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('users.add_user') }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <LoadingSpinner v-if="adminStore.usersLoading" />
      <div v-else-if="adminStore.users.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>{{ $t('users.no_users') }}</p>
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.name') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">{{ $t('users.email') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">{{ $t('users.phone') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('users.role') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">{{ $t('users.last_login') }}</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.status') }}</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="user in adminStore.users" :key="user.userId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  :class="roleColors[roleCode(user)]?.bg ?? 'bg-slate-500/20 text-slate-400'">
                  {{ (locale === 'lo' ? (user.fullNameLo || user.fullNameEn) : (user.fullNameEn || user.fullNameLo))?.[0] ?? '?' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-white">
                    {{ locale === 'lo' ? (user.fullNameLo || user.fullNameEn) : (user.fullNameEn || user.fullNameLo) }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 hidden md:table-cell">
              <p class="text-sm text-slate-300">{{ user.email ?? '—' }}</p>
            </td>
            <td class="px-6 py-4 hidden md:table-cell">
              <p class="text-xs text-slate-500">{{ user.phoneNumber ?? '—' }}</p>
            </td>
            <td class="px-6 py-4">
              <span
class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                :class="roleColors[roleCode(user)]?.badge ?? 'bg-slate-500/20 text-slate-400'">
                {{ roleName(user) }}
              </span>
            </td>
            <td class="px-6 py-4 text-xs text-slate-500 hidden sm:table-cell">
              {{ user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : $t('users.never') }}
            </td>
            <td class="px-6 py-4">
              <span
class="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                :class="user.isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'">
                {{ user.isActive ? $t('common.active') : $t('common.inactive') }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="openEditModal(user)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <!-- Deactivate / reactivate (accounts are never deleted) -->
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
      :current-page="adminStore.usersPage"
      :total-pages="totalPages"
      @update:page="changePage"
    />


    <!-- ── ADD / EDIT USER MODAL ── -->
    <UserFormModal
      v-model:open="userModal.open"
      v-model:form="userModal.form"
      :mode="userModal.mode"
      :saving="userModal.saving"
      :error="userModal.error"
      :db-roles="dbRoles"
      @submit="handleUserSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import UserFormModal from './modals/UserFormModal.vue';
import { useAdminStore } from '../../../application/stores/admin';
import type { User } from '../../../domain/models/User';
import type { Role } from '../../../domain/models/School';
import type { ApiResponse } from '../../../infrastructure/api/types';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Users — Smart School Admin' });

const adminStore = useAdminStore();
const { locale, t } = useI18n();
const searchInput = ref('');
const roleFilter = ref('');
const roleDropdownOpen = ref(false);
let searchTimeout: ReturnType<typeof setTimeout>;

const apiClient = useApiClient();
const dbRoles = ref<Role[]>([]);

// The users list embeds the role object; the logged-in user carries just the code.
const roleCode = (u: User) => (typeof u.role === 'string' ? u.role : u.role.code);
const roleName = (u: User) =>
  typeof u.role === 'string' ? u.role : (locale.value === 'lo' ? u.role.nameLo : u.role.nameEn) || u.role.code;

const roles = computed(() => {
  const list = dbRoles.value.map(r => ({ value: r.code, label: locale.value === 'lo' ? r.nameLo : r.nameEn }));
  return [{ value: '', label: 'All' }, ...list];
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

const roleColors: Record<string, { bg: string; badge: string }> = {
  admin: { bg: 'bg-purple-500/20 text-purple-400', badge: 'bg-purple-500/20 text-purple-400' },
  teacher: { bg: 'bg-blue-500/20 text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
  parent: { bg: 'bg-teal-500/20 text-teal-400', badge: 'bg-teal-500/20 text-teal-400' },
};

const totalPages = computed(() => Math.ceil(adminStore.usersTotal / 15));

onMounted(() => {
  adminStore.fetchUsers();
  fetchRoles();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchUsers({ search: searchInput.value, page: 1 });
  }, 400);
};

const clearSearch = () => {
  searchInput.value = '';
  clearTimeout(searchTimeout);
  adminStore.fetchUsers({ search: '', page: 1 });
};

const setRoleFilter = (role: string) => {
  roleFilter.value = role;
  adminStore.fetchUsers({ role, search: searchInput.value, page: 1 });
};

const selectRole = (role: string) => {
  roleDropdownOpen.value = false;
  setRoleFilter(role);
};

const changePage = (page: number) => {
  adminStore.fetchUsers({ page });
};

// ── User Modal (Add + Edit) ──
const emptyUserForm = () => ({
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
  form: emptyUserForm()
});

const openAddModal = () => {
  userModal.mode = 'add';
  userModal.userId = null;
  userModal.form = emptyUserForm();
  userModal.error = '';
  userModal.open = true;
};

const openEditModal = (user: User) => {
  userModal.mode = 'edit';
  userModal.userId = user.userId;
  userModal.form = {
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
    const payload: Record<string, unknown> = { ...userModal.form };
    // Don't send empty password on edit
    if (userModal.mode === 'edit' && !payload.password) {
      delete payload.password;
    }
    if (userModal.mode === 'add') {
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

const toggleActive = async (u: User) => {
  const makeActive = !u?.isActive;
  const name = (locale.value === 'lo' ? u.fullNameLo : u.fullNameEn) || u.fullNameEn;
  if (!makeActive && !confirm(t('common.deactivate_confirm', { name }))) return;
  togglingId.value = u.userId;
  try {
    await adminStore.updateUser(u.userId, { isActive: makeActive });
  } catch (err) {
    alert((err instanceof Error && err.message) || 'Failed to update status');
  } finally {
    togglingId.value = null;
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
