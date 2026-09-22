<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.settings') }}</p>
      <h2 class="text-2xl font-bold text-white">{{ locale === 'lo' ? 'ການຕັ້ງຄ່າການແຈ້ງເຕືອນ' : 'Notification Settings' }}</h2>
      <p class="text-sm text-slate-400">{{ locale === 'lo' ? 'ຕັ້ງຄ່າຮູບແບບການແຈ້ງເຕືອນສຳລັບແອັບພລິເຄຊັນ' : 'Configure notification preferences for the application' }}</p>
    </div>

    <!-- Notification Settings Form -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <div class="flex flex-col gap-4 bg-slate-900/20 border border-slate-800/80 p-6 rounded-2xl">
        <div class="flex items-center gap-2 pb-2 border-b border-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider">{{ locale === 'lo' ? 'ປະເພດການແຈ້ງເຕືອນ' : 'Notification Channels' }}</h3>
        </div>

        <form class="flex flex-col gap-5 mt-2" @submit.prevent="handleSave">
          
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-white">{{ locale === 'lo' ? 'ແຈ້ງເຕືອນຜ່ານແອັບ (Push Notifications)' : 'Push Notifications' }}</span>
              <span class="text-xs text-slate-400">{{ locale === 'lo' ? 'ຮັບການແຈ້ງເຕືອນເທິງໜ້າຈໍໂທລະສັບ' : 'Receive notifications directly on devices' }}</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.pushEnabled" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-white">{{ locale === 'lo' ? 'ແຈ້ງເຕືອນຜ່ານອີເມວ (Email Notifications)' : 'Email Notifications' }}</span>
              <span class="text-xs text-slate-400">{{ locale === 'lo' ? 'ສົ່ງບົດລາຍງານ ແລະ ຂໍ້ມູນສຳຄັນຜ່ານອີເມວ' : 'Send important reports and updates via email' }}</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.emailEnabled" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-sm font-medium text-white">{{ locale === 'lo' ? 'ແຈ້ງເຕືອນຜ່ານ SMS (SMS Alerts)' : 'SMS Alerts' }}</span>
              <span class="text-xs text-slate-400">{{ locale === 'lo' ? 'ສຳລັບແຈ້ງການສຸກເສີນ ຫຼື ການຂາດຮຽນ' : 'For emergency alerts and absences' }}</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="settings.smsEnabled" type="checkbox" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"/>
            </label>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-2">
            <span v-if="success" class="text-xs text-teal-400 flex items-center gap-1.5 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ locale === 'lo' ? 'ບັນທຶກສຳເລັດ' : 'Settings saved successfully' }}
            </span>
            <span v-else/>
            <button type="submit" :disabled="saving" class="btn-primary flex items-center gap-2">
              <svg v-if="saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('settings.save_changes') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Notification Settings — Smart School Admin' });

const { locale } = useI18n();

const settings = reactive({
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false
});

const saving = ref(false);
const success = ref(false);

const handleSave = async () => {
  saving.value = true;
  success.value = false;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  saving.value = false;
  success.value = true;
  
  setTimeout(() => {
    success.value = false;
  }, 3000);
};
</script>
