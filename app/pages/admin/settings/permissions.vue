<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader
      :eyebrow="$t('nav.settings')"
      :title="$t('settings.permissions_title')"
      :subtitle="$t('settings.permissions_subtitle')"
    >
      <span v-if="successSave" class="text-xs text-success">{{ $t('settings_ui.permissions_saved') }}</span>
      <span v-else-if="dirtyRoles.length" class="text-xs text-warning">{{ $t('permissions_ui.unsaved') }}</span>
      <button type="button" class="btn-secondary" @click="openCreate">{{ $t('permissions_ui.new_role') }}</button>
      <button type="button" class="btn-primary" :disabled="saving || !dirtyRoles.length" @click="savePermissions">
        {{ saving ? $t('common.saving') : $t('settings.save_rules') }}
      </button>
    </PageHeader>

    <div v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm flex items-center justify-between gap-4">
      <span>{{ $t('settings_ui.load_error') }}: {{ loadError }}</span>
      <button type="button" class="btn-secondary" @click="load()">{{ $t('common.refresh') }}</button>
    </div>
    <p v-if="saveError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ saveError }}</p>

    <LoadingSpinner v-if="loading" />

    <template v-else-if="matrixRoles.length">
      <div class="panel overflow-auto max-h-[70vh]">
        <table class="data-table w-full">
          <thead class="sticky top-0 z-10 bg-surface">
            <tr>
              <th class="sticky left-0 z-20 bg-surface min-w-[240px]">{{ $t('permissions_ui.permission') }}</th>
              <th v-for="role in matrixRoles" :key="role.roleId" class="text-center min-w-[120px] normal-case tracking-normal">
                <div class="flex flex-col items-center gap-0.5">
                  <span class="flex items-center gap-1 text-xs font-bold text-ink">
                    <svg v-if="role.isSystem" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-ink-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" :aria-label="$t('permissions_ui.built_in')">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {{ roleName(role) }}
                    <button
                      v-if="!role.isSystem"
                      type="button"
                      class="p-0.5 rounded text-ink-subtle hover:text-red-400 disabled:opacity-40 disabled:hover:text-ink-subtle"
                      :disabled="role.userCount > 0"
                      :title="role.userCount > 0 ? $t('permissions_ui.delete_in_use') : $t('common.delete')"
                      :aria-label="$t('common.delete')"
                      @click="confirmDelete(role)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </span>
                  <span class="text-[11px] font-normal text-ink-subtle tnum">{{ $t('settings.users_count', { count: role.userCount }) }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(keys, group) in groups" :key="group">
              <tr class="bg-surface-2">
                <td :colspan="matrixRoles.length + 1" class="sticky left-0 text-[11px] font-bold uppercase tracking-wide text-primary">
                  {{ $t(`permissions_ui.groups.${group}`) }}
                </td>
              </tr>
              <tr v-for="key in keys" :key="key" class="hover:bg-surface-2/60">
                <td class="sticky left-0 bg-surface">{{ $t(`permissions_ui.perm.${permKey(key)}`) }}</td>
                <td v-for="role in matrixRoles" :key="role.roleId" class="text-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4 accent-primary cursor-pointer disabled:cursor-not-allowed"
                    :checked="isGranted(role, key)"
                    :disabled="role.isSystem"
                    :aria-label="`${roleName(role)}: ${$t(`permissions_ui.perm.${permKey(key)}`)}`"
                    @change="toggle(role, key)"
                  >
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <p class="text-xs text-ink-muted">
        {{ $t('permissions_ui.admin_all') }}
        <template v-if="portalRoles.length">{{ $t('permissions_ui.portal_roles_note', { roles: portalRoles.map(roleName).join(', ') }) }}</template>
      </p>
    </template>

    <!-- New staff role -->
    <AppModal v-model:open="createOpen" :title="$t('permissions_ui.new_role')" :subtitle="$t('permissions_ui.new_role_hint')" size="sm">
      <form id="role-create-form" class="flex flex-col gap-4" @submit.prevent="createRole">
        <div class="flex flex-col gap-1.5">
          <label for="role-name-lo" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('permissions_ui.name_lo') }}</label>
          <input id="role-name-lo" v-model="createForm.nameLo" type="text" required maxlength="100" class="input-field">
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="role-name-en" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('permissions_ui.name_en') }}</label>
          <input id="role-name-en" v-model="createForm.nameEn" type="text" required maxlength="100" class="input-field">
        </div>
        <p v-if="createError" role="alert" class="text-sm text-danger">{{ createError }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" @click="createOpen = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="role-create-form" class="btn-primary" :disabled="creating">
          {{ creating ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { Role } from '../../../domain/models/School';
import type { ApiResponse } from '../../../infrastructure/api/types';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

interface RoleAccess extends Role {
  isSystem: boolean;
  userCount: number;
  permissions: string[];
}

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
useHead({ title: () => t('page_titles.permissions') });

const api = useApiClient();
const dialog = useDialog();

const roles = ref<RoleAccess[]>([]);
const groups = ref<Record<string, string[]>>({});
// Unsaved edits per role id; a role without an entry is unchanged.
const drafts = ref<Record<number, Set<string>>>({});
const loading = ref(true);
const loadError = ref('');
const saving = ref(false);
const saveError = ref('');
const successSave = ref(false);

// Teacher and parent portals are scoped by role, not by permission, so only
// admin-portal roles belong in the matrix.
const matrixRoles = computed(() => roles.value.filter((r) => (r.portal ?? 'admin') === 'admin'));
const portalRoles = computed(() => roles.value.filter((r) => r.portal && r.portal !== 'admin'));

const roleName = (role: Role) => (locale.value === 'lo' ? role.nameLo : role.nameEn) || role.code;
// i18n keys cannot contain dots, so "students.view" is stored as "students_view".
const permKey = (key: string) => key.replace(/\./g, '_');

const isGranted = (role: RoleAccess, key: string) => (drafts.value[role.roleId] ?? new Set(role.permissions)).has(key);

const toggle = (role: RoleAccess, key: string) => {
  const next = new Set(drafts.value[role.roleId] ?? role.permissions);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  drafts.value = { ...drafts.value, [role.roleId]: next };
  successSave.value = false;
};

const dirtyRoles = computed(() =>
  matrixRoles.value.filter((role) => {
    const draft = drafts.value[role.roleId];
    return draft && (draft.size !== role.permissions.length || role.permissions.some((p) => !draft.has(p)));
  }),
);

const load = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const [rolesRes, catalogRes] = await Promise.all([
      api<ApiResponse<RoleAccess[]>>(API_ENDPOINTS.roles.list),
      api<ApiResponse<{ groups: Record<string, string[]> }>>(API_ENDPOINTS.roles.permissions),
    ]);
    roles.value = rolesRes.data;
    groups.value = catalogRes.data.groups;
    drafts.value = {};
  } catch (err) {
    loadError.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const savePermissions = async () => {
  saving.value = true;
  saveError.value = '';
  try {
    for (const role of dirtyRoles.value) {
      const permissions = [...drafts.value[role.roleId]!];
      await api(`${API_ENDPOINTS.roles.list}/${role.roleId}`, { method: 'PUT', body: { permissions } });
      role.permissions = permissions;
    }
    drafts.value = {};
    successSave.value = true;
    setTimeout(() => { successSave.value = false; }, 3000);
  } catch (err) {
    saveError.value = getErrorMessage(err, t('settings_ui.save_error'));
  } finally {
    saving.value = false;
  }
};

// ── Create / delete staff roles ──
const createOpen = ref(false);
const creating = ref(false);
const createError = ref('');
const createForm = reactive({ nameEn: '', nameLo: '' });

const openCreate = () => {
  Object.assign(createForm, { nameEn: '', nameLo: '' });
  createError.value = '';
  createOpen.value = true;
};

const createRole = async () => {
  creating.value = true;
  createError.value = '';
  try {
    const res = await api<ApiResponse<{ role: RoleAccess }>>(API_ENDPOINTS.roles.list, {
      method: 'POST',
      body: { ...createForm, permissions: [] },
    });
    roles.value = [...roles.value, { ...res.data.role, userCount: 0, permissions: [] }];
    createOpen.value = false;
  } catch (err) {
    createError.value = getErrorMessage(err, t('settings_ui.save_error'));
  } finally {
    creating.value = false;
  }
};

const confirmDelete = (role: RoleAccess) => {
  dialog.confirm({
    title: t('permissions_ui.delete_title'),
    message: t('permissions_ui.delete_confirm', { name: roleName(role) }),
    confirmLabel: t('common.delete'),
    tone: 'danger',
    onConfirm: async () => {
      await api(`${API_ENDPOINTS.roles.list}/${role.roleId}`, { method: 'DELETE' });
      roles.value = roles.value.filter((r) => r.roleId !== role.roleId);
      const { [role.roleId]: _removed, ...rest } = drafts.value;
      drafts.value = rest;
    },
  });
};
</script>
