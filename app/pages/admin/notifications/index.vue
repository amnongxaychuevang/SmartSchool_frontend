<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('nav.communication')" :title="$t('notifications_admin.title')" :subtitle="$t('notifications_admin.subtitle')">
      <select v-model="statusFilter" class="input-field w-auto" :aria-label="$t('common.status')" @change="load(1)">
        <option value="">{{ $t('notifications_admin.all_status') }}</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ $t(`status.${s}`) }}</option>
      </select>
      <button type="button" class="btn-primary" @click="openCreate">{{ $t('notifications_admin.send') }}</button>
    </PageHeader>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="academicsStore.notificationsLoading" />
      <p v-else-if="!academicsStore.notifications.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('notifications_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('notifications_admin.col_sent') }}</th>
              <th>{{ $t('notifications_admin.col_type') }}</th>
              <th>{{ $t('notifications_admin.col_message') }}</th>
              <th>{{ $t('notifications_admin.col_recipient') }}</th>
              <th>{{ $t('common.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="n in academicsStore.notifications" :key="n.notificationId">
              <td class="tnum whitespace-nowrap">{{ f.dateTime(n.sentAt) }}</td>
              <td>
                <p class="font-semibold">{{ $t(`notifications_admin.types.${n.type}`) }}</p>
                <p class="text-xs text-ink-subtle">{{ $t(`notifications_admin.channels.${n.channel}`) }}</p>
              </td>
              <td class="max-w-md whitespace-normal text-ink-muted">{{ locale === 'lo' ? n.messageLo : n.messageEn }}</td>
              <td>{{ n.recipient ? (locale === 'lo' ? n.recipient.fullNameLo : n.recipient.fullNameEn) : '—' }}</td>
              <td><span :class="statusBadge[n.status]">{{ $t(`status.${n.status}`) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :current-page="academicsStore.notificationsPage" :total-pages="totalPages" @update:page="load" />
    </section>

    <AppModal v-model:open="modal.open" :title="$t('notifications_admin.send')" :subtitle="$t('notifications_admin.queued_note')">
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
import { useAcademicsStore } from '../../../application/stores/academics';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import AppModal from '../../../components/AppModal.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import UserPicker from '../../../components/UserPicker.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('notifications_admin.title') });

const academicsStore = useAcademicsStore();
const statuses = ['pending', 'sent', 'failed'] as const;
const statusBadge: Record<AppNotification['status'], string> = { pending: 'badge-warning', sent: 'badge-success', failed: 'badge-danger' };
const statusFilter = ref('');
const totalPages = computed(() => Math.ceil(academicsStore.notificationsTotal / 15));

// The status filter is passed on every call, so paging keeps it.
const load = (page: number) => academicsStore.fetchNotifications({ status: statusFilter.value || undefined, page });
onMounted(() => load(1));

// Must match the API's enums.
const types: AppNotification['type'][] = ['general', 'absence', 'grade', 'transaction', 'check_in', 'check_out'];
const channels: AppNotification['channel'][] = ['app_push', 'sms', 'telegram', 'line', 'email'];
const emptyForm = () => ({
  recipientUserId: null as number | null,
  type: 'general' as AppNotification['type'],
  channel: 'app_push' as AppNotification['channel'],
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
