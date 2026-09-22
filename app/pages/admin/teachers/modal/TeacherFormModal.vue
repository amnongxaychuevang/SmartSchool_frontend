<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="emit('update:open', false)" />

        <!-- Modal Panel -->
        <div class="modal-panel relative w-full sm:max-w-3xl flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl">

          <!-- â”€â”€ Gradient Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <div class="modal-header relative overflow-hidden px-6 pt-6 pb-5">
            <div class="header-blob-1" />
            <div class="header-blob-2" />

            <div class="relative flex items-center gap-4">
              <!-- Avatar Circle -->
              <div class="avatar-ring flex-shrink-0">
                <div class="avatar-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <!-- Title -->
              <div class="flex-1 min-w-0">
                <h2 class="text-lg font-bold text-white leading-tight">
                  {{ mode === 'add' ? $t('teachers.add_teacher') : $t('teachers.edit_teacher') }}
                </h2>
                <p class="text-xs text-teal-300/70 mt-0.5">
                  {{ mode === 'add' ? 'Fill in the details below to register a new teacher.' : 'Update the teacher information below.' }}
                </p>
              </div>

              <!-- Close Button -->
              <button class="close-btn flex-shrink-0" @click="emit('update:open', false)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Tab Navigation -->
            <div class="tab-nav mt-5 flex gap-1 p-1">
              <button
v-for="tab in tabs" :key="tab.id" type="button" :class="['tab-btn', activeTab === tab.id ? 'tab-btn--active' : '']"
                @click="activeTab = tab.id">
                <!-- eslint-disable-next-line vue/no-v-html -- tab.icon is a hardcoded SVG string in this file's own `tabs` array (line ~266), never user/API-supplied, so there's no injection vector here. -->
                <span class="tab-icon" v-html="tab.icon" />
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- â”€â”€ Error Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <div v-if="error" class="mx-6 mt-4 flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </div>

          <!-- â”€â”€ Form Body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
          <form class="flex flex-col" @submit.prevent="emit('submit')">
            <div class="form-body px-6 py-5 max-h-[52vh] overflow-y-auto scrollbar-thin">

              <!-- Tab: Account -->
              <Transition name="tab-fade" mode="out-in">
                <div v-if="activeTab === 'account'" key="account" class="flex flex-col gap-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="field-group">
                      <label class="field-label">{{ $t('users.full_name_en') }} <span class="required-dot">*</span></label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </span>
                        <input v-model="form.fullNameEn" required type="text" class="field-input" placeholder="e.g. John Doe" >
                      </div>
                    </div>
                    <div class="field-group">
                      <label class="field-label">{{ $t('users.full_name_lo') }} <span class="required-dot">*</span></label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </span>
                        <input v-model="form.fullNameLo" required type="text" class="field-input" placeholder="àº•àº»àº§àº¢à»ˆàº²àº‡: àº—à»‰àº²àº§ àºªàº»àº¡àº”àºµ" >
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="field-group">
                      <label class="field-label">{{ $t('users.email') }}</label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </span>
                        <input v-model="form.email" type="email" autocomplete="email" class="field-input" placeholder="john@example.com" >
                      </div>
                    </div>
                    <div class="field-group">
                      <label class="field-label">{{ $t('users.phone') }}</label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </span>
                        <input v-model="form.phoneNumber" type="text" autocomplete="tel" class="field-input" placeholder="+856 20 ..." >
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- Tab: Profile -->
              <Transition name="tab-fade" mode="out-in">
                <div v-if="activeTab === 'profile'" key="profile" class="flex flex-col gap-4">
                  <div :class="mode === 'edit' ? 'grid grid-cols-2 gap-4' : ''">
                    <div v-if="mode === 'edit'" class="field-group">
                      <label class="field-label">{{ $t('teachers.employee_code') }} <span class="badge-readonly">readonly</span></label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1" /></svg>
                        </span>
                        <input :value="form.employeeCode" disabled readonly type="text" class="field-input field-input--readonly font-mono" >
                      </div>
                    </div>
                    <div class="field-group">
                      <label class="field-label">{{ $t('teachers.specialization') }}</label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </span>
                        <input v-model="form.specialization" type="text" class="field-input" placeholder="e.g. Mathematics" >
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="field-group">
                      <label class="field-label">{{ $t('teachers.qualification') }} <span class="lang-badge">EN</span></label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055" /></svg>
                        </span>
                        <input v-model="form.qualificationEn" type="text" class="field-input" placeholder="Bachelor of Education" >
                      </div>
                    </div>
                    <div class="field-group">
                      <label class="field-label">{{ $t('teachers.qualification') }} <span class="lang-badge lang-badge--lo">LO</span></label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055" /></svg>
                        </span>
                        <input v-model="form.qualificationLo" type="text" class="field-input" placeholder="àº›àº°àº¥àº´àº™àºàº²àº•àºµ àºªàº¶àºàºªàº²àºªàº²àº”" >
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="field-group">
                      <label class="field-label">{{ $t('teachers.hire_date') }}</label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </span>
                        <input v-model="form.hireDate" type="date" class="field-input" >
                      </div>
                    </div>
                    <div class="field-group">
                      <label class="field-label">{{ $t('teachers.salary') }}</label>
                      <div class="input-wrap">
                        <span class="input-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
                        </span>
                        <input v-model.number="form.salary" type="number" step="0.01" class="field-input" placeholder="0.00" >
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>

              <!-- Tab: Location -->
              <Transition name="tab-fade" mode="out-in">
                <div v-if="activeTab === 'location'" key="location" class="flex flex-col gap-4">
                  <div class="field-group">
                    <label class="field-label">Address <span class="lang-badge">EN</span></label>
                    <div class="input-wrap">
                      <span class="input-icon input-icon--top">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </span>
                      <textarea v-model="form.addressEn" rows="3" class="field-input field-input--textarea" placeholder="e.g. Vientiane, Laos"/>
                    </div>
                  </div>
                  <div class="field-group">
                    <label class="field-label">Address <span class="lang-badge lang-badge--lo">LO</span></label>
                    <div class="input-wrap">
                      <span class="input-icon input-icon--top">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </span>
                      <textarea v-model="form.addressLo" rows="3" class="field-input field-input--textarea" placeholder="àº•àº»àº§àº¢à»ˆàº²àº‡: àº™àº°àº„àº­àº™àº«àº¼àº§àº‡àº§àº½àº‡àºˆàº±àº™, àºªàº›àº› àº¥àº²àº§"/>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="field-group">
                      <label class="field-label">Notes <span class="lang-badge">EN</span></label>
                      <textarea v-model="form.notesEn" rows="2" class="field-input field-input--textarea field-input--no-icon" placeholder="Additional notes..."/>
                    </div>
                    <div class="field-group">
                      <label class="field-label">Notes <span class="lang-badge lang-badge--lo">LO</span></label>
                      <textarea v-model="form.notesLo" rows="2" class="field-input field-input--textarea field-input--no-icon" placeholder="à»àº²àºà»€àº«àº”à»€àºžàºµà»ˆàº¡à»€àº•àºµàº¡..."/>
                    </div>
                  </div>
                </div>
              </Transition>

            </div>

            <!-- â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
            <div class="modal-footer px-6 py-4 flex items-center justify-between gap-3">
              <div class="flex items-center gap-1.5">
                <button
v-for="tab in tabs" :key="tab.id" type="button" :class="['dot-indicator', activeTab === tab.id ? 'dot-indicator--active' : '']"
                  @click="activeTab = tab.id" />
              </div>
              <div class="flex items-center gap-3">
                <button type="button" class="btn-cancel" @click="emit('update:open', false)">{{ $t('common.cancel') }}</button>
                <button type="submit" :disabled="saving" class="btn-save">
                  <template v-if="saving">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ $t('common.saving') }}
                  </template>
                  <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ $t('common.save') }}
                  </template>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  open: boolean;
  mode: 'add' | 'edit';
  saving: boolean;
  error: string;
  form: any;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'submit'): void;
}>();

const activeTab = ref<'account' | 'profile' | 'location'>('account');

const tabs = [
  {
    id: 'account' as const,
    label: 'Account',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>`,
  },
  {
    id: 'profile' as const,
    label: 'Profile',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`,
  },
  {
    id: 'location' as const,
    label: 'Location',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
  },
];
</script>

<style scoped>
.modal-panel {
  background: rgba(10, 15, 30, 0.94);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(45,212,191,0.05), inset 0 1px 0 rgba(255,255,255,0.04);
}

.modal-header {
  background: linear-gradient(135deg, rgba(13,148,136,0.18) 0%, rgba(8,145,178,0.1) 50%, transparent 100%);
  border-bottom: 1px solid rgba(45,212,191,0.12);
}

.header-blob-1 {
  position: absolute; top: -40px; left: -40px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(45,212,191,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.header-blob-2 {
  position: absolute; bottom: -60px; right: -20px;
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.avatar-ring {
  width: 52px; height: 52px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(45,212,191,0.3), rgba(56,189,248,0.2));
  border: 1px solid rgba(45,212,191,0.3);
  padding: 2px;
  box-shadow: 0 0 20px rgba(45,212,191,0.2);
}
.avatar-inner {
  width: 100%; height: 100%; border-radius: 14px;
  background: linear-gradient(135deg, rgba(13,148,136,0.4), rgba(8,145,178,0.3));
  display: flex; align-items: center; justify-content: center;
}

.close-btn {
  width: 32px; height: 32px; border-radius: 10px;
  background: rgba(148,163,184,0.08); border: 1px solid rgba(148,163,184,0.12);
  color: #94a3b8; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.close-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.3); color: #fca5a5; }

.tab-nav {
  background: rgba(15,23,42,0.5); border-radius: 12px;
  border: 1px solid rgba(148,163,184,0.08);
}
.tab-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 7px 12px; border-radius: 9px; font-size: 12px; font-weight: 600;
  color: #64748b; letter-spacing: 0.01em; transition: all 0.2s;
}
.tab-btn:hover:not(.tab-btn--active) { color: #94a3b8; background: rgba(148,163,184,0.06); }
.tab-btn--active {
  background: linear-gradient(135deg, rgba(45,212,191,0.2), rgba(56,189,248,0.15));
  color: #2dd4bf; border: 1px solid rgba(45,212,191,0.25);
  box-shadow: 0 2px 8px rgba(45,212,191,0.15);
}
.tab-icon { display: flex; align-items: center; }

.form-body { scrollbar-width: thin; scrollbar-color: rgba(71,85,105,0.5) transparent; }

.field-group { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-size: 11px; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.08em;
  display: flex; align-items: center; gap: 5px;
}

.required-dot { color: #2dd4bf; font-size: 14px; line-height: 1; }

.input-wrap { position: relative; }

.input-icon {
  position: absolute; inset-y: 0; left: 0; padding-left: 12px;
  display: flex; align-items: center; pointer-events: none;
  color: #475569; transition: color 0.15s;
}
.input-icon--top { inset-y: unset; top: 12px; align-items: flex-start; }

.field-input {
  width: 100%; padding: 10px 12px 10px 38px;
  background: rgba(15,23,42,0.6); border: 1px solid rgba(148,163,184,0.1);
  border-radius: 10px; color: #e2e8f0; font-size: 13.5px;
  transition: all 0.2s; outline: none;
}
.field-input--textarea { resize: none; padding-top: 10px; }
.field-input--no-icon { padding-left: 12px; }
.field-input::placeholder { color: #334155; }
.field-input:focus {
  border-color: rgba(45,212,191,0.4); background: rgba(15,23,42,0.85);
  box-shadow: 0 0 0 3px rgba(45,212,191,0.08), 0 1px 4px rgba(0,0,0,0.2);
}
.input-wrap:focus-within .input-icon { color: #2dd4bf; }
.field-input--readonly { opacity: 0.5; cursor: not-allowed; background: rgba(15,23,42,0.4); }
.field-input[type="number"]::-webkit-inner-spin-button,
.field-input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
.field-input[type="number"] { -moz-appearance: textfield; }

.lang-badge {
  font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px;
  background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); letter-spacing: 0.05em;
}
.lang-badge--lo { background: rgba(167,139,250,0.15); color: #a78bfa; border-color: rgba(167,139,250,0.2); }
.badge-readonly {
  font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 4px;
  background: rgba(100,116,139,0.2); color: #64748b; border: 1px solid rgba(100,116,139,0.2); letter-spacing: 0.04em;
}

.modal-footer { border-top: 1px solid rgba(148,163,184,0.08); background: rgba(10,15,30,0.4); }

.dot-indicator { width: 6px; height: 6px; border-radius: 50%; background: rgba(100,116,139,0.4); transition: all 0.2s; }
.dot-indicator--active { width: 20px; border-radius: 3px; background: #2dd4bf; }

.btn-cancel {
  padding: 9px 18px; border-radius: 10px;
  background: rgba(100,116,139,0.12); border: 1px solid rgba(100,116,139,0.2);
  color: #94a3b8; font-size: 13px; font-weight: 600; transition: all 0.15s;
}
.btn-cancel:hover { background: rgba(100,116,139,0.2); color: #e2e8f0; }

.btn-save {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 22px; border-radius: 10px;
  background: linear-gradient(135deg, #2dd4bf, #0d9488);
  color: white; font-size: 13px; font-weight: 700; letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(45,212,191,0.35); transition: all 0.2s;
}
.btn-save:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(45,212,191,0.45); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.tab-fade-enter-from { opacity: 0; transform: translateY(6px); }
.tab-fade-leave-to   { opacity: 0; transform: translateY(-6px); }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }

:global(html.light) .modal-panel { background: rgba(248,250,252,0.97) !important; border-color: #e2e8f0 !important; }
:global(html.light) .modal-header { background: linear-gradient(135deg, rgba(13,148,136,0.08), rgba(8,145,178,0.04), transparent) !important; border-bottom-color: #e2e8f0 !important; }
:global(html.light) .modal-header h2 { color: #0f172a !important; }
:global(html.light) .field-input { background: #ffffff !important; border-color: #e2e8f0 !important; color: #1e293b !important; }
:global(html.light) .field-input:focus { border-color: rgba(13,148,136,0.5) !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.1) !important; }
:global(html.light) .field-label { color: #475569 !important; }
:global(html.light) .modal-footer { border-top-color: #e2e8f0 !important; background: #f8fafc !important; }
:global(html.light) .tab-nav { background: rgba(241,245,249,0.8) !important; border-color: #e2e8f0 !important; }
:global(html.light) .field-input::placeholder { color: #94a3b8 !important; }
</style>
