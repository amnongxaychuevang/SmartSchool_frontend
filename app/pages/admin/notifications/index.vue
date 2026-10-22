<template>
  <div class="flex flex-col gap-6">
    <!-- Search & Filter Row with Action Button on the Right -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
        <div class="relative flex-1 max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            class="search-bar"
            :placeholder="$t('notifications_admin.search_placeholder')"
            @input="onSearchInput"
          >
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
            @click="clearSearch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <select
          v-model="statusFilter"
          class="input-field w-full sm:w-44"
          :aria-label="$t('common.status')"
          @change="onStatusChange"
        >
          <option value="">{{ $t('notifications_admin.all_status') }}</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ $t(`status.${s}`) }}</option>
        </select>
      </div>

      <div class="flex items-center gap-2 sm:ml-auto">
        <button
          type="button"
          class="btn-primary inline-flex items-center gap-1.5"
          @click="openCreate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('notifications_admin.send') }}
        </button>
      </div>
    </div>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="academicsStore.notificationsLoading" />
      <p v-else-if="!academicsStore.notifications.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('notifications_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center whitespace-nowrap">#</th>
              <th class="whitespace-nowrap">{{ $t('notifications_admin.col_sent') }}</th>
              <th class="whitespace-nowrap">{{ $t('notifications_admin.col_type') }}</th>
              <th class="whitespace-nowrap">{{ $t('notifications_admin.channel') }}</th>
              <th class="whitespace-nowrap">{{ $t('notifications_admin.col_message') }}</th>
              <th class="whitespace-nowrap">{{ $t('notifications_admin.col_recipient') }}</th>
              <th class="whitespace-nowrap">{{ $t('common.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(n, i) in academicsStore.notifications" :key="n.notificationId">
              <td class="text-center tnum text-ink-subtle text-xs">{{ (academicsStore.notificationsPage - 1) * NOTIFICATIONS_PER_PAGE + i + 1 }}</td>
              <td class="tnum whitespace-nowrap text-xs text-ink-muted">{{ f.dateTime(n.sentAt) }}</td>
              <td class="font-semibold text-xs whitespace-nowrap">{{ $t(`notifications_admin.types.${n.type}`) }}</td>
              <td class="text-ink-muted text-xs whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
                  {{ $t(`notifications_admin.channels.${n.channel}`) }}
                </span>
              </td>
              <td class="max-w-md whitespace-normal text-ink-muted text-xs line-clamp-2">{{ locale === 'lo' ? n.messageLo : n.messageEn }}</td>
              <td class="text-xs whitespace-nowrap font-medium">{{ n.recipient ? (locale === 'lo' ? n.recipient.fullNameLo : n.recipient.fullNameEn) : '—' }}</td>
              <td class="whitespace-nowrap"><span :class="statusBadge[n.status]">{{ $t(`status.${n.status}`) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        :loading="academicsStore.notificationsLoading"
        :current-page="academicsStore.notificationsPage"
        :total-pages="totalPages"
        :total="academicsStore.notificationsTotal"
        :page-size="NOTIFICATIONS_PER_PAGE"
        @update:page="load"
      />
    </section>

    <AppModal :open="modal.open" :title="$t('notifications_admin.send')" :subtitle="$t('notifications_admin.queued_note')" @update:open="modal.open = $event">
      <form id="notify-form" class="grid grid-cols-2 gap-4" @submit.prevent="handleSubmit">
        <div class="col-span-2">
          <label for="n-recipient" class="block mb-1.5 text-sm font-semibold">{{ $t('notifications_admin.recipient') }}</label>
          <UserPicker v-model="modal.form.recipientUserId" input-id="n-recipient" />
        </div>
        <div>
          <label for="n-type" class="block mb-1.5 text-sm font-semibold">{{ $t('notifications_admin.type') }}</label>
          <select id="n-type" v-model="modal.form.type" class="input-field">
            <option v-for="ty in types" :key="ty" :value="ty">{{ $t(`notifications_admin.types.${ty}`) }}</option>
          </select>
        </div>
        <div>
          <label for="n-channel" class="block mb-1.5 text-sm font-semibold">{{ $t('notifications_admin.channel') }}</label>
          <select id="n-channel" v-model="modal.form.channel" class="input-field">
            <option v-for="c in channels" :key="c" :value="c">{{ $t(`notifications_admin.channels.${c}`) }}</option>
          </select>
        </div>
        <div class="col-span-2">
          <label for="n-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('notifications_admin.message_lo') }}</label>
          <textarea id="n-lo" v-model.trim="modal.form.messageLo" required rows="3" lang="lo" class="input-field" />
        </div>
        <div class="col-span-2">
          <label for="n-en" class="block mb-1.5 text-sm font-semibold">{{ $t('notifications_admin.message_en') }}</label>
          <textarea id="n-en" v-model.trim="modal.form.messageEn" required rows="3" lang="en" class="input-field" />
        </div>
        <p v-if="modal.error" role="alert" class="col-span-2 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ modal.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="modal.saving" @click="modal.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="notify-form" class="btn-primary" :disabled="modal.saving || !modal.form.recipientUserId">
          {{ modal.saving ? $t('common.saving') : $t('notifications_admin.send') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { AppNotification } from '../../../domain/models/Academics';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAcademicsStore, NOTIFICATIONS_PER_PAGE } from '../../../application/stores/academics';

import AppModal from '../../../components/AppModal.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import UserPicker from '../../../components/UserPicker.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('notifications_admin.title') });

const academicsStore = useAcademicsStore();
const statuses = ['pending', 'sent', 'failed'] as const;
const statusBadge: Record<AppNotification['status'], string> = { pending: 'badge-warning', sent: 'badge-success', failed: 'badge-danger' };

const searchQuery = ref('');
const statusFilter = ref('');
const totalPages = computed(() => Math.ceil(academicsStore.notificationsTotal / NOTIFICATIONS_PER_PAGE));

let searchTimer: ReturnType<typeof setTimeout>;
const onSearchInput = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    load(1);
  }, 300);
};

const clearSearch = () => {
  searchQuery.value = '';
  load(1);
};

const onStatusChange = () => {
  load(1);
};

const load = (page: number) => {
  academicsStore.fetchNotifications({
    search: searchQuery.value,
    status: statusFilter.value || undefined,
    page,
  });
};

onMounted(() => load(1));

// Must match the API's enums.
const types: AppNotification['type'][] = ['general', 'absence', 'grade', 'transaction', 'check_in', 'check_out'];
// App push is not implemented by the server yet; sending on it always fails.
const channels: AppNotification['channel'][] = ['whatsapp', 'email'];
const emptyForm = () => ({
  recipientUserId: null as number | null,
  type: 'general' as AppNotification['type'],
  channel: 'whatsapp' as AppNotification['channel'],
  messageLo: '',
  messageEn: '',
});
const modal = reactive({ open: false, saving: false, error: '', form: emptyForm() });
const openCreate = () => Object.assign(modal, { open: true, saving: false, error: '', form: emptyForm() });

async function handleSubmit() {
  modal.saving = true;
  modal.error = '';
  try {
    await academicsStore.createNotification(modal.form);
    modal.open = false;
  } catch (err) {
    modal.error = getErrorMessage(err, t('common.error'));
  } finally {
    modal.saving = false;
  }
}
</script>
