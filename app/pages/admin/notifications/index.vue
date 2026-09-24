<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search notifications..."
          class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch"
        >
      </div>
      <div class="flex items-center gap-2">
        <button class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Send Notification
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <!-- Loading -->
      <LoadingSpinner v-if="academicsStore.notificationsLoading" />

      <!-- Empty -->
      <div v-else-if="academicsStore.notifications.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <p>No notifications found.</p>
      </div>

      <!-- Data Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Type</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Message</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Recipient</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="notif in academicsStore.notifications" :key="notif.notificationId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-white">
              {{ notif.type.replace('_', ' ') }} · {{ notif.channel }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-300">
              {{ $i18n.locale === 'lo' ? notif.messageLo : notif.messageEn }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-400">
              {{ notif.recipient?.fullNameEn ?? `#${notif.recipientUserId}` }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-400">
              {{ new Date(notif.sentAt).toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Placeholder -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <span class="text-sm text-slate-500">Page {{ academicsStore.notificationsPage }} of {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button :disabled="academicsStore.notificationsPage === 1" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(academicsStore.notificationsPage - 1)">Prev</button>
          <button :disabled="academicsStore.notificationsPage === totalPages" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(academicsStore.notificationsPage + 1)">Next</button>
        </div>
      </div>
    </div>


    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modal.open = false"/>
          <div class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white">Send Notification</h2>
              <button class="text-slate-400 hover:text-white transition-colors" @click="modal.open = false">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="modal.error" class="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ modal.error }}</div>

            <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recipient user ID *</label>
                <input v-model.number="modal.form.recipientUserId" required type="number" min="1" class="modal-input" placeholder="User ID to receive this" >
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label>
                  <select v-model="modal.form.type" class="modal-input">
                    <option v-for="t in NOTIFICATION_TYPES" :key="t" :value="t">{{ t.replace('_', ' ') }}</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Channel</label>
                  <select v-model="modal.form.channel" class="modal-input">
                    <option v-for="c in CHANNELS" :key="c" :value="c">{{ c.replace('_', ' ') }}</option>
                  </select>
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message (LO) *</label>
                <textarea v-model="modal.form.messageLo" required rows="3" class="modal-input"/>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Message (EN) *</label>
                <textarea v-model="modal.form.messageEn" required rows="3" class="modal-input"/>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
                <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" @click="modal.open = false">Cancel</button>
                <button
  type="submit" :disabled="modal.saving"
                  class="px-5 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-colors disabled:opacity-60 flex items-center gap-2">
                  <svg v-if="modal.saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { AppNotification } from '../../../domain/models/Academics';
import { ref, reactive, computed, onMounted } from 'vue';
import { useAcademicsStore } from '../../../application/stores/academics';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Notifications — Smart School Admin' });

const academicsStore = useAcademicsStore();
const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(academicsStore.notificationsTotal / 15));

onMounted(() => {
  academicsStore.fetchNotifications();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    academicsStore.fetchNotifications({ search: searchInput.value, page: 1 });
  }, 400);
};

const changePage = (page: number) => {
  academicsStore.fetchNotifications({ search: searchInput.value, page });
};

// Must match the API's enums (the old form sent title/message/'system', which it rejects).
const NOTIFICATION_TYPES: AppNotification['type'][] = ['general', 'absence', 'grade', 'transaction', 'check_in', 'check_out'];
const CHANNELS: AppNotification['channel'][] = ['app_push', 'sms', 'telegram', 'line', 'email'];
const emptyForm = () => ({
  recipientUserId: '' as number | '',
  type: 'general' as AppNotification['type'],
  channel: 'app_push' as AppNotification['channel'],
  messageLo: '',
  messageEn: '',
});

const modal = reactive({
  open: false,
  saving: false,
  error: '',
  form: emptyForm()
});

const openCreateModal = () => {
  modal.form = emptyForm();
  modal.error = '';
  modal.open = true;
};

const handleSubmit = async () => {
  modal.saving = true;
  modal.error = '';
  try {
    await academicsStore.createNotification(modal.form);
    modal.open = false;
  } catch (err) {
    modal.error = getErrorMessage(err, 'Failed to send notification');
  } finally {
    modal.saving = false;
  }
};
</script>

<style scoped lang="postcss">
.modal-input {
  @apply w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all;
}

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
