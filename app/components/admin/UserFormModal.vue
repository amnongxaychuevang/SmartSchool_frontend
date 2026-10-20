<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink/40" @click="emit('update:open', false)"/>
        <div class="relative panel-float w-full max-w-lg flex flex-col">
          <div class="px-5 py-3.5 flex items-center justify-between border-b border-line">
            <h2 class="text-base font-bold text-ink">
              {{ mode === 'add' ? $t('users.add_user') : $t('users.edit_user') }}
            </h2>
            <button type="button" class="w-8 h-8 flex items-center justify-center rounded text-ink-subtle hover:bg-surface-2 hover:text-ink" :aria-label="$t('common.close')" @click="emit('update:open', false)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <p v-if="error" role="alert" class="mx-5 mt-4 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ error }}</p>

          <form class="flex flex-col" @submit.prevent="emit('submit')">
            <div class="p-5 flex flex-col gap-4">
              <!-- Account type (new accounts only) -->
              <div v-if="mode === 'add'" class="grid grid-cols-2 gap-1 p-1 rounded bg-surface-2" role="radiogroup" :aria-label="L('Account type', 'ປະເພດບັນຊີ')">
                <button
                  v-for="opt in ACCOUNT_TYPES"
                  :key="opt.value"
                  type="button"
                  role="radio"
                  :aria-checked="accountType === opt.value"
                  :class="['h-8 rounded text-sm font-medium transition-colors', accountType === opt.value ? 'bg-surface text-primary-ink shadow-sm' : 'text-ink-muted hover:text-ink']"
                  @click="setAccountType(opt.value)"
                >
                  {{ L(opt.en, opt.lo) }}
                </button>
              </div>

              <!-- Teacher: pick an existing teacher record -->
              <template v-if="mode === 'add' && accountType === 'teacher'">
                <label v-if="teacherCandidates.length" class="field">
                  <span class="field-label">{{ L('Teacher', 'ຄູສອນ') }} <b class="text-danger">*</b></span>
                  <select v-model.number="form.teacherId" required class="input-field">
                    <option :value="0" disabled>{{ L('Please select a teacher', 'ກະລຸນາເລືອກຄູສອນ') }}</option>
                    <option v-for="c in teacherCandidates" :key="c.teacherId" :value="c.teacherId">
                      {{ personName(c.user) }} · {{ c.employeeCode }}
                    </option>
                  </select>
                </label>
                <div v-else class="rounded border border-dashed border-line px-3 py-4 text-center text-sm text-ink-subtle">
                  {{ L('Every teacher already has an account.', 'ຄູທຸກຄົນມີບັນຊີເຂົ້າລະບົບແລ້ວ.') }}
                  <NuxtLink to="/admin/teachers/create" class="block mt-1 text-primary-ink hover:underline">
                    {{ L('Add a teacher first →', 'ເພີ່ມຄູສອນກ່ອນ →') }}
                  </NuxtLink>
                </div>

                <div v-if="selectedTeacher" class="flex items-center gap-3 rounded border border-line bg-surface-2 px-3 py-2.5">
                  <PersonAvatar :name="personName(selectedTeacher.user)" :photo-url="selectedTeacher.user.avatarUrl" size="md" />
                  <div class="min-w-0 text-sm">
                    <p class="font-medium text-ink truncate">{{ personName(selectedTeacher.user) }}</p>
                    <p class="text-xs text-ink-subtle">
                      {{ L('Login name', 'ຊື່ເຂົ້າລະບົບ') }}:
                      <span class="font-mono text-ink-muted">{{ selectedTeacher.user.phoneNumber || selectedTeacher.user.email }}</span>
                    </p>
                  </div>
                </div>
              </template>

              <!-- Staff (and every edit): the person's details live on the account -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="field">
                  <span class="field-label">{{ $t('users.full_name_lo') }} <b class="text-danger">*</b></span>
                  <input v-model="form.fullNameLo" required type="text" class="input-field" :placeholder="$t('forms.ph_full_name_lo')">
                </label>
                <label class="field">
                  <span class="field-label">{{ $t('users.full_name_en') }} <b class="text-danger">*</b></span>
                  <input v-model="form.fullNameEn" required type="text" class="input-field" :placeholder="$t('forms.ph_full_name_en')">
                </label>
                <label class="field">
                  <span class="field-label">{{ $t('users.phone') }}</span>
                  <PhoneInput v-model="form.phoneNumber" />
                </label>
                <label class="field">
                  <span class="field-label">{{ $t('users.email') }}</span>
                  <input v-model="form.email" type="email" class="input-field" :placeholder="$t('forms.ph_email')">
                </label>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label class="field">
                  <span class="field-label">{{ $t('users.role') }} <b class="text-danger">*</b></span>
                  <select v-model.number="form.roleId" required class="input-field">
                    <option value="" disabled>{{ $t('users.select_role') }}</option>
                    <option v-for="r in roles" :key="r.roleId" :value="r.roleId">{{ locale === 'lo' ? r.nameLo : r.nameEn }}</option>
                  </select>
                </label>
                <label class="field">
                  <span class="field-label">
                    {{ mode === 'add' ? $t('users.password') : L('New password', 'ລະຫັດຜ່ານໃໝ່') }}
                    <b v-if="mode === 'add'" class="text-danger">*</b>
                  </span>
                  <input
                    v-model="form.password"
                    :required="mode === 'add'"
                    type="password"
                    minlength="6"
                    maxlength="100"
                    autocomplete="new-password"
                    :placeholder="mode === 'edit' ? $t('users.password_placeholder') : L('At least 6 characters', 'ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ')"
                    class="input-field"
                  >
                </label>
              </div>

              <label v-if="mode === 'edit'" class="flex items-center gap-2.5 cursor-pointer">
                <input v-model="form.isActive" type="checkbox" class="w-4 h-4 accent-[rgb(var(--primary))]">
                <span class="text-sm text-ink-muted">{{ $t('common.active') }}</span>
              </label>
            </div>

            <div class="px-5 py-3.5 border-t border-line flex justify-end gap-2">
              <button type="button" class="btn-secondary" @click="emit('update:open', false)">{{ $t('common.cancel') }}</button>
              <button type="submit" :disabled="saving || (mode === 'add' && accountType === 'teacher' && !teacherCandidates.length)" class="btn-primary min-w-24">
                {{ saving ? $t('common.saving') : $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Role } from '../../domain/models/School';
import type { TeacherAccountCandidate } from '../../domain/models/Teacher';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export interface UserForm {
  /** 0 = a staff account; otherwise the teacher the account is opened for. */
  teacherId: number;
  fullNameEn: string;
  fullNameLo: string;
  email: string;
  phoneNumber: string;
  roleId: string | number;
  password: string;
  isActive: boolean;
}

type AccountType = 'teacher' | 'staff';
const ACCOUNT_TYPES: { value: AccountType; en: string; lo: string }[] = [
  { value: 'teacher', en: 'Teacher', lo: 'ຄູສອນ' },
  { value: 'staff', en: 'Other staff', lo: 'ພະນັກງານອື່ນ' },
];

const props = withDefaults(defineProps<{
  open: boolean;
  mode: 'add' | 'edit';
  saving: boolean;
  error: string;
  dbRoles: Role[];
  teacherCandidates?: TeacherAccountCandidate[];
  /** Portal of the account being edited: its role can only change within that portal. */
  editPortal?: string;
}>(), { teacherCandidates: () => [], editPortal: '' });

// Two-way bound with the parent (v-model:form), so editing fields here is allowed.
const form = defineModel<UserForm>('form', { required: true });
const accountType = defineModel<AccountType>('accountType', { default: 'teacher' });
const emit = defineEmits(['update:open', 'submit']);

const { locale } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);
const personName = (p: { fullNameLo: string; fullNameEn: string }) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;

const selectedTeacher = computed(() => props.teacherCandidates.find((c) => c.teacherId === form.value.teacherId));

// A teacher account needs a teacher-portal role (or the teacher pages disappear);
// staff accounts use the admin portal; parents are managed on the Parents page.
const roles = computed(() => {
  const portal = props.mode === 'edit' ? props.editPortal : accountType.value === 'teacher' ? 'teacher' : 'admin';
  return portal ? props.dbRoles.filter((r) => (r.portal ?? 'admin') === portal) : props.dbRoles;
});

const setAccountType = (type: AccountType) => {
  accountType.value = type;
  form.value.teacherId = 0;
  form.value.roleId = '';
};

// Only one fitting role (e.g. the built-in teacher role): pick it.
watch([roles, () => props.open], () => {
  if (props.open && !form.value.roleId && roles.value.length === 1) form.value.roleId = roles.value[0]!.roleId;
}, { immediate: true });
</script>

<style scoped>
.field { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
.field-label { font-size: 0.75rem; font-weight: 500; color: rgb(var(--ink-muted)); }
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
