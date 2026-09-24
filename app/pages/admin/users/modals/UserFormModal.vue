<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0" @click="emit('update:open', false)"/>
        <div class="relative glass-panel w-full max-w-lg flex flex-col p-0 rounded-2xl">
          <div class="px-6 py-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/20 rounded-t-2xl">
            <h2 class="text-xl font-bold text-white">
              {{ mode === 'add' ? $t('users.add_user') : $t('users.edit_user') }}
            </h2>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" @click="emit('update:open', false)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div v-if="error" class="m-6 mb-0 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ error }}</div>

          <form class="flex flex-col" @submit.prevent="emit('submit')">
            <div class="p-6 grid grid-cols-2 gap-5">
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('users.full_name_en') }} *</label>
                <input v-model="form.fullNameEn" required type="text" class="input-field" placeholder="Full Name..." >
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('users.full_name_lo') }} *</label>
                <input v-model="form.fullNameLo" required type="text" class="input-field" placeholder="ຊື່ເຕັມ..." >
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('users.email') }}</label>
                <input v-model="form.email" type="email" class="input-field" placeholder="Email..." >
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('users.phone') }}</label>
                <input v-model="form.phoneNumber" type="text" class="input-field" placeholder="Phone..." >
              </div>
              <div class="flex flex-col gap-1.5 relative">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('users.role') }} *</label>
                
                <div class="relative">
                  <button
type="button" class="input-field w-full flex items-center justify-center relative !pr-3" 
                    :class="form.roleId ? 'text-white' : 'text-slate-500'"
                    @click="roleDropdownOpen = !roleDropdownOpen"
                  >
                    <span class="text-center">
                      {{ form.roleId ? (locale === 'lo' ? dbRoles.find(r => r.roleId === form.roleId)?.nameLo : dbRoles.find(r => r.roleId === form.roleId)?.nameEn) : $t('users.select_role') }}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute right-3 transition-transform text-slate-400" :class="roleDropdownOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
                    <div v-if="roleDropdownOpen" class="absolute left-0 top-full mt-1 w-full glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-[70]">
                      <button
v-for="r in dbRoles" :key="r.roleId" type="button" 
                        class="w-full text-center px-4 py-2.5 text-sm transition-colors block rounded-lg"
                        :class="form.roleId === r.roleId ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'"
                        @click="form.roleId = r.roleId; roleDropdownOpen = false">
                        {{ locale === 'lo' ? r.nameLo : r.nameEn }}
                      </button>
                    </div>
                  </Transition>
                </div>

                <!-- Backdrop -->
                <div v-if="roleDropdownOpen" class="fixed inset-0 z-[65]" @click="roleDropdownOpen = false"/>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {{ $t('users.password') }}{{ mode === 'add' ? ' *' : '' }}
                </label>
                <input
v-model="form.password"
                  :required="mode === 'add'"
                  type="password"
                  :placeholder="mode === 'edit' ? $t('users.password_placeholder') : 'Password...'"
                  class="input-field" >
              </div>
              <div class="flex items-center gap-3 col-span-2 pt-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="form.isActive" type="checkbox" class="sr-only peer" >
                  <div class="w-10 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-teal-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"/>
                </label>
                <span class="text-sm text-slate-400">{{ $t('common.active') }}</span>
              </div>
            </div>

            <div class="px-6 py-4 border-t border-slate-800/50 flex items-start justify-end gap-3 bg-slate-900/20 rounded-b-2xl">
              <button type="button" class="btn-ghost" @click="emit('update:open', false)">{{ $t('common.cancel') }}</button>
              <button type="submit" :disabled="saving" class="btn-primary flex items-center gap-2">
                <svg v-if="saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
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
import type { Role } from '../../../../domain/models/School';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const roleDropdownOpen = ref(false);

const { locale } = useI18n();

export interface UserForm {
  fullNameEn: string;
  fullNameLo: string;
  email: string;
  phoneNumber: string;
  roleId: string | number;
  password: string;
  isActive: boolean;
}

defineProps<{
  open: boolean;
  mode: 'add' | 'edit';
  saving: boolean;
  error: string;
  dbRoles: Role[];
}>();

// Two-way bound with the parent (v-model:form), so editing fields here is allowed.
const form = defineModel<UserForm>('form', { required: true });

const emit = defineEmits(['update:open', 'submit']);
</script>
