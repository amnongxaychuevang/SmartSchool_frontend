<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.settings') }}</p>
      <h2 class="text-2xl font-bold text-white">{{ $t('settings.title') }}</h2>
      <p class="text-sm text-slate-400">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Settings Forms -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- General School Config -->
      <div class="lg:col-span-2 flex flex-col gap-4 bg-slate-900/20 border border-slate-800/80 p-6 rounded-2xl">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">{{ $t('settings.school_info') }}</h3>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="handleSchoolSave">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('settings.school_name_en') }}</label>
              <input v-model="schoolForm.schoolNameEn" type="text" required class="settings-input" >
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('settings.school_name_lo') }}</label>
              <input v-model="schoolForm.schoolNameLo" type="text" required class="settings-input" >
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('settings.contact_email') }}</label>
              <input v-model="schoolForm.contactEmail" type="email" required class="settings-input" >
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('settings.contact_phone') }}</label>
              <input v-model="schoolForm.contactPhone" type="text" required class="settings-input" >
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-2">
            <span v-if="successSchool" class="text-xs text-teal-400 flex items-center gap-1.5 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('settings_ui.school_saved') }}
            </span>
            <span v-else/>
            <button type="submit" :disabled="savingSchool" class="btn-primary flex items-center gap-2">
              <svg v-if="savingSchool" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ savingSchool ? $t('common.saving') : $t('settings.save') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Academic Defaults -->
      <div class="flex flex-col gap-4 bg-slate-900/20 border border-slate-800/80 p-6 rounded-2xl h-fit">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">{{ $t('settings.academic_settings') }}</h3>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="handleAcademicSave">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('settings.current_year') }}</label>
              <select v-model="academicForm.currentYear" class="settings-input text-slate-300">
                <option value="2025 - 2026">2025 - 2026</option>
                <option value="2026 - 2027">2026 - 2027</option>
                <option value="2027 - 2028">2027 - 2028</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('settings.active_term') }}</label>
              <select v-model="academicForm.activeTerm" class="settings-input text-slate-300">
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-2 pt-4 border-t border-slate-800/80 mt-2">
            <button type="submit" :disabled="savingAcademic" class="w-full btn-primary flex items-center justify-center gap-2">
              <svg v-if="savingAcademic" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ savingAcademic ? $t('common.saving') : $t('settings.update_term') }}
            </button>
            <span v-if="successAcademic" class="text-xs text-teal-400 flex items-center justify-center gap-1.5 animate-pulse text-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('settings_ui.academic_saved') }}
            </span>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useSettingsStore } from '../../../application/stores/settings';

definePageMeta({ layout: 'admin' });
useHead({ title: () => useNuxtApp().$i18n.t('page_titles.settings') });

const settingsStore = useSettingsStore();

const schoolForm = reactive({
  schoolNameEn: '',
  schoolNameLo: '',
  contactEmail: '',
  contactPhone: ''
});

const academicForm = reactive({
  currentYear: '',
  activeTerm: ''
});

const savingSchool = ref(false);
const successSchool = ref(false);
const savingAcademic = ref(false);
const successAcademic = ref(false);

onMounted(() => {
  settingsStore.loadSettings();
  
  // Bind form properties
  schoolForm.schoolNameEn = settingsStore.schoolInfo.schoolNameEn;
  schoolForm.schoolNameLo = settingsStore.schoolInfo.schoolNameLo;
  schoolForm.contactEmail = settingsStore.schoolInfo.contactEmail;
  schoolForm.contactPhone = settingsStore.schoolInfo.contactPhone;

  academicForm.currentYear = settingsStore.academicSettings.currentYear;
  academicForm.activeTerm = settingsStore.academicSettings.activeTerm;
});

const handleSchoolSave = async () => {
  savingSchool.value = true;
  successSchool.value = false;
  
  // Simulate network save latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  settingsStore.saveSchoolInfo({
    schoolNameEn: schoolForm.schoolNameEn,
    schoolNameLo: schoolForm.schoolNameLo,
    contactEmail: schoolForm.contactEmail,
    contactPhone: schoolForm.contactPhone
  });
  
  savingSchool.value = false;
  successSchool.value = true;
  
  setTimeout(() => {
    successSchool.value = false;
  }, 3000);
};

const handleAcademicSave = async () => {
  savingAcademic.value = true;
  successAcademic.value = false;
  
  // Simulate network save latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  settingsStore.saveAcademicSettings({
    currentYear: academicForm.currentYear,
    activeTerm: academicForm.activeTerm
  });
  
  savingAcademic.value = false;
  successAcademic.value = true;
  
  setTimeout(() => {
    successAcademic.value = false;
  }, 3000);
};
</script>

<style scoped lang="postcss">
.settings-input {
  @apply w-full px-3.5 py-2.5 bg-[#080e1a]/85 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all;
}
</style>
