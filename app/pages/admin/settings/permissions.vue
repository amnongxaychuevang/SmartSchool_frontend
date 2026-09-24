<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.settings') }}</p>
      <h2 class="text-2xl font-bold text-white">{{ $t('settings.permissions_title') }}</h2>
      <p class="text-sm text-slate-400">{{ $t('settings.permissions_subtitle') }}</p>
    </div>

    <!-- Main Container -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      <!-- Left sidebar: Roles List -->
      <div class="lg:col-span-1 flex flex-col gap-3 bg-slate-900/20 border border-slate-800/80 p-4 rounded-2xl h-fit">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">{{ $t('settings.system_roles') }}</p>
        
        <button
v-for="role in roles" :key="role.id"
          :class="['w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all', 
            activeRole === role.id ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
          ]"
          @click="activeRole = role.id"
        >
          <span>{{ $t('settings.roles.' + role.id) }}</span>
          <span class="text-[10px] badge-slate px-1.5 py-0.5 rounded-md font-normal">{{ $t('settings.users_count', { count: role.usersCount }) }}</span>
        </button>

        <button class="mt-4 w-full py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-300 rounded-xl text-xs font-semibold border border-slate-700/30 hover:border-slate-700 transition-all" @click="resetToDefaults">
          {{ $t('settings_ui.reset_defaults') }}
        </button>
      </div>

      <!-- Right content: Permissions Matrix -->
      <div class="lg:col-span-3 flex flex-col gap-5 bg-slate-900/20 border border-slate-800/80 p-6 rounded-2xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-white">{{ $t('settings.permissions_of_role', { role: $t('settings.roles.' + activeRole) }) }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ $t('settings.toggle_actions_desc') }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span v-if="successSave" class="text-xs text-teal-400 flex items-center gap-1.5 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('settings_ui.permissions_saved') }}
            </span>
            <button :disabled="saving" class="btn-primary flex items-center gap-2" @click="savePermissions">
              <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>{{ $t('settings.save_rules') }}</span>
            </button>
          </div>
        </div>

        <!-- Permissions categories -->
        <div class="flex flex-col gap-6">
          <div v-for="category in activePermissions" :key="category.name" class="flex flex-col gap-3">
            <h4 class="text-xs font-bold text-teal-400 uppercase tracking-wider">{{ category.name }}</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
v-for="perm in category.items" :key="perm.key"
                class="flex items-center justify-between p-3.5 bg-[#080e1a]/85 border border-slate-800/80 hover:border-slate-700/50 transition-all rounded-xl"
              >
                <div class="flex flex-col gap-0.5">
                  <span class="text-xs font-semibold text-slate-200">{{ perm.label }}</span>
                  <span class="text-[10px] text-slate-500">{{ perm.desc }}</span>
                </div>
                
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="perm.enabled" type="checkbox" class="sr-only peer" >
                  <div class="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-teal-500 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all"/>
                </label>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSettingsStore } from '../../../application/stores/settings';

definePageMeta({ layout: 'admin' });
useHead({ title: () => useNuxtApp().$i18n.t('page_titles.permissions') });

const settingsStore = useSettingsStore();

const roles = ref([
  { id: 'admin', name: 'Administrator', usersCount: 3 },
  { id: 'teacher', name: 'Teacher', usersCount: 14 },
  { id: 'parent', name: 'Parent', usersCount: 42 },
  { id: 'student', name: 'Student', usersCount: 120 },
]);

const activeRole = ref('admin');

onMounted(() => {
  settingsStore.loadSettings();
});

const activePermissions = computed(() => {
  return settingsStore.permissionsMap[activeRole.value] || [];
});

const saving = ref(false);
const successSave = ref(false);

const savePermissions = async () => {
  saving.value = true;
  successSave.value = false;
  
  // Simulate network save latency
  await new Promise(resolve => setTimeout(resolve, 800));
  
  settingsStore.savePermissions(settingsStore.permissionsMap);
  
  saving.value = false;
  successSave.value = true;
  
  setTimeout(() => {
    successSave.value = false;
  }, 3000);
};

const resetToDefaults = () => {
  settingsStore.resetPermissions();
  successSave.value = true;
  setTimeout(() => {
    successSave.value = false;
  }, 3000);
};
</script>
