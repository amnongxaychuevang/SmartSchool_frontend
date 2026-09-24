<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('nav.finance')" :title="$t('topups.title')" :subtitle="$t('topups.subtitle')">
      <select v-model="statusFilter" class="input-field w-auto" :aria-label="$t('common.status')" @change="handleFilter">
        <option value="">{{ $t('topups.all_status') }}</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ $t(`status.${s}`) }}</option>
      </select>
    </PageHeader>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="financeStore.topUpRequestsLoading && !financeStore.topUpRequests.length" />
      <p v-else-if="!financeStore.topUpRequests.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('topups.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('topups.col_requested') }}</th>
              <th>{{ $t('topups.col_student') }}</th>
              <th>{{ $t('topups.col_method') }}</th>
              <th class="text-right">{{ $t('topups.col_amount') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="req in financeStore.topUpRequests" :key="req.requestId">
              <td class="tnum whitespace-nowrap">{{ f.dateTime(req.requestedAt) }}</td>
              <td>
                <p class="font-semibold">{{ name(req.student) }}</p>
                <p class="text-xs text-ink-subtle">{{ $t('topups.parent', { name: name(req.parentRequester) }) }}</p>
              </td>
              <td class="text-ink-muted">{{ methodLabel(req) }}</td>
              <td class="text-right font-semibold tnum text-primary-ink">{{ f.kip(req.amount) }}</td>
              <td>
                <span :class="statusBadge[req.status]">{{ $t(`status.${req.status}`) }}</span>
                <p v-if="req.status === 'rejected' && req.rejectReason" class="mt-1 max-w-xs truncate text-xs text-ink-subtle" :title="req.rejectReason">
                  {{ $t('topups.reason_label', { reason: req.rejectReason }) }}
                </p>
              </td>
              <td class="text-right">
                <div v-if="req.status === 'pending'" class="inline-flex gap-2">
                  <button type="button" class="btn-danger min-h-8 px-3" @click="openReject(req)">{{ $t('common.reject') }}</button>
                  <button type="button" class="btn-primary min-h-8 px-3" @click="openApprove(req)">{{ $t('common.approve') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :current-page="financeStore.topUpRequestsPage" :total-pages="totalPages" @update:page="changePage" />
    </section>

    <ConfirmDialog
      v-model:open="approve.open"
      :title="$t('topups.approve_title')"
      :message="approve.request ? $t('topups.approve_msg', { amount: f.kip(approve.request.amount), name: name(approve.request.student) }) : ''"
      :confirm-label="$t('common.approve')"
      :busy="approve.busy"
      :error="approve.error"
      @confirm="handleApprove"
    />

    <AppModal v-model:open="reject.open" :title="$t('topups.reject_title')" size="sm">
      <form id="reject-form" @submit.prevent="handleReject">
        <label for="reject-reason" class="block mb-1.5 text-sm font-semibold">{{ $t('topups.reject_reason') }}</label>
        <textarea id="reject-reason" v-model.trim="reject.reason" rows="3" required class="input-field" :placeholder="$t('topups.reject_placeholder')" />
        <p v-if="reject.error" role="alert" class="mt-3 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ reject.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="reject.busy" @click="reject.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="reject-form" class="btn-danger" :disabled="reject.busy || !reject.reason">
          {{ reject.busy ? $t('common.saving') : $t('topups.reject_confirm') }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { TopUpRequest } from '../../../domain/models/Finance';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFinanceStore } from '../../../application/stores/finance';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('topups.title') });

const financeStore = useFinanceStore();
const statuses = ['pending', 'approved', 'rejected'] as const;
const statusFilter = ref('');
const PAGE_SIZE = 15; // the store requests 15 per page
const totalPages = computed(() => Math.ceil(financeStore.topUpRequestsTotal / PAGE_SIZE));

onMounted(() => financeStore.fetchTopUpRequests());
const handleFilter = () => financeStore.fetchTopUpRequests({ status: statusFilter.value, page: 1 });
const changePage = (page: number) => financeStore.fetchTopUpRequests({ status: statusFilter.value, page });

const name = (p?: { fullNameEn: string; fullNameLo: string } | null) =>
  p ? ((locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn) : t('common.unknown');
// The school's own label for the channel (e.g. "BCEL One"), else the generic method name.
const methodLabel = (r: TopUpRequest) =>
  (locale.value === 'lo' ? r.methodLabelLo : r.methodLabelEn) || t(`topups.method.${r.method}`);
const statusBadge: Record<TopUpRequest['status'], string> = {
  pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger',
};

const approve = reactive({ open: false, busy: false, error: '', request: null as TopUpRequest | null });
const openApprove = (req: TopUpRequest) => Object.assign(approve, { open: true, busy: false, error: '', request: req });
async function handleApprove() {
  if (!approve.request) return;
  approve.busy = true;
  approve.error = '';
  try {
    await financeStore.approveTopUpRequest(approve.request.requestId);
    approve.open = false;
  } catch (err) {
    approve.error = getErrorMessage(err);
  } finally {
    approve.busy = false;
  }
}

const reject = reactive({ open: false, busy: false, error: '', reason: '', requestId: null as number | null });
const openReject = (req: TopUpRequest) => Object.assign(reject, { open: true, busy: false, error: '', reason: '', requestId: req.requestId });
async function handleReject() {
  if (!reject.requestId || !reject.reason) return;
  reject.busy = true;
  reject.error = '';
  try {
    await financeStore.rejectTopUpRequest(reject.requestId, reject.reason);
    reject.open = false;
  } catch (err) {
    reject.error = getErrorMessage(err);
  } finally {
    reject.busy = false;
  }
}
</script>
