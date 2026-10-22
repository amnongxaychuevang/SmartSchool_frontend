<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('topups.title')" :subtitle="$t('topups.subtitle')">
      <div class="relative w-72">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" class="search-bar" :placeholder="$t('topups.search')" @input="handleSearch">
        <button v-if="searchInput" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear')" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
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
              <th class="w-12 text-center">#</th>
              <th>{{ $t('topups.col_requested') }}</th>
              <th>{{ $t('topups.col_student') }}</th>
              <th>{{ $t('topups.col_parent') }}</th>
              <th>{{ $t('topups.col_phone') }}</th>
              <th>{{ $t('topups.col_method') }}</th>
              <th>{{ $t('topups.col_slip') }}</th>
              <th class="text-right">{{ $t('topups.col_amount') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('topups.col_reason') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(req, i) in financeStore.topUpRequests" :key="req.requestId">
              <td class="text-center tnum text-ink-subtle">{{ (financeStore.topUpRequestsPage - 1) * TOPUPS_PER_PAGE + i + 1 }}</td>
              <td class="tnum whitespace-nowrap">{{ f.dateTime(req.requestedAt) }}</td>
              <td class="font-semibold">{{ name(req.student) }}</td>
              <td>{{ name(req.parentRequester) }}</td>
              <td class="tnum whitespace-nowrap text-ink-muted">{{ req.parentRequester?.phoneNumber || '—' }}</td>
              <td class="text-ink-muted">{{ $t(`topups.method.${req.method}`) }}</td>
              <td>
                <button
                  v-if="mediaUrl(req.slipUrl)"
                  type="button"
                  class="group relative inline-block rounded-lg overflow-hidden border border-line focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  :title="$t('topups.slip_preview')"
                  @click="openSlipModal(req)"
                >
                  <img :src="mediaUrl(req.slipUrl)!" :alt="$t('topups.slip_image')" class="h-11 w-11 object-cover group-hover:scale-110 transition-transform">
                  <span class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </span>
                </button>
                <span v-else class="text-ink-subtle">—</span>
              </td>
              <td class="text-right font-semibold tnum text-primary-ink">{{ f.kip(req.amount) }}</td>
              <td>
                <span :class="statusBadge[req.status]">{{ $t(`status.${req.status}`) }}</span>
              </td>
              <td class="max-w-xs">
                <p v-if="req.rejectReason" class="truncate text-ink-muted" :title="req.rejectReason">{{ req.rejectReason }}</p>
                <span v-else class="text-ink-subtle">—</span>
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
      <PaginationBar
        :loading="financeStore.topUpRequestsLoading && !financeStore.topUpRequests.length"
        :current-page="financeStore.topUpRequestsPage"
        :total-pages="totalPages"
        :total="financeStore.topUpRequestsTotal"
        :page-size="TOPUPS_PER_PAGE"
        @update:page="changePage"
      />
    </section>

    <ConfirmDialog
      :open="approve.open"
      :title="$t('topups.approve_title')"
      :message="approve.request ? $t('topups.approve_msg', { amount: f.kip(approve.request.amount), name: name(approve.request.student) }) : ''"
      :confirm-label="$t('common.approve')"
      :busy="approve.busy"
      :error="approve.error"
      @update:open="approve.open = $event"
      @confirm="handleApprove"
    />

    <AppModal :open="reject.open" :title="$t('topups.reject_title')" size="sm" @update:open="reject.open = $event">
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

    <!-- Slip Lightbox Preview Modal -->
    <AppModal
      :open="slipModal.open"
      :title="$t('topups.slip_preview')"
      :subtitle="slipModal.request ? `${name(slipModal.request.student)} · ${f.kip(slipModal.request.amount)}` : ''"
      size="md"
      @update:open="slipModal.open = $event"
    >
      <div v-if="slipModal.request" class="flex flex-col gap-4">
        <!-- Request Summary Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-surface-sunken border border-line text-xs">
          <div>
            <span class="text-ink-subtle block">{{ $t('topups.col_amount') }}</span>
            <span class="font-bold text-base text-primary font-mono">{{ f.kip(slipModal.request.amount) }}</span>
          </div>
          <div>
            <span class="text-ink-subtle block">{{ $t('topups.col_method') }}</span>
            <span class="font-medium text-ink">{{ $t(`topups.method.${slipModal.request.method}`) }}</span>
          </div>
          <div>
            <span class="text-ink-subtle block">{{ $t('topups.col_parent') }}</span>
            <span class="font-medium text-ink truncate block">{{ name(slipModal.request.parentRequester) }}</span>
          </div>
          <div>
            <span class="text-ink-subtle block">{{ $t('topups.col_phone') }}</span>
            <span class="font-mono text-ink">{{ slipModal.request.parentRequester?.phoneNumber || '—' }}</span>
          </div>
        </div>

        <!-- High-res Slip Image with zoom link -->
        <div class="relative rounded-xl overflow-hidden border border-line bg-surface-sunken flex items-center justify-center p-2 min-h-[300px]">
          <a
            v-if="mediaUrl(slipModal.request.slipUrl)"
            :href="mediaUrl(slipModal.request.slipUrl)!"
            target="_blank"
            rel="noopener noreferrer"
            class="group block relative max-w-full"
            :title="$t('topups.zoom_hint')"
          >
            <img
              :src="mediaUrl(slipModal.request.slipUrl)!"
              :alt="$t('topups.slip_image')"
              class="max-h-[460px] w-auto max-w-full rounded-lg object-contain shadow-md group-hover:opacity-95 transition-opacity"
            >
            <span class="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs flex items-center gap-1 shadow">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {{ $t('topups.zoom_hint') }}
            </span>
          </a>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <button type="button" class="btn-secondary" @click="slipModal.open = false">
            {{ $t('common.close') }}
          </button>

          <div v-if="slipModal.request && slipModal.request.status === 'pending'" class="flex items-center gap-2">
            <button
              type="button"
              class="btn-danger"
              @click="openRejectFromSlip"
            >
              {{ $t('common.reject') }}
            </button>
            <button
              type="button"
              class="btn-primary"
              @click="openApproveFromSlip"
            >
              {{ $t('common.approve') }}
            </button>
          </div>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { TopUpRequest } from '../../../domain/models/Finance';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFinanceStore, TOPUPS_PER_PAGE } from '../../../application/stores/finance';
import PageHeader from '../../../components/PageHeader.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';
import { getErrorMessage } from '../../../utils/errors';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
const mediaUrl = useMediaUrl();
useHead({ title: () => t('topups.title') });

const financeStore = useFinanceStore();
const statuses = ['pending', 'approved', 'rejected'] as const;
const statusFilter = ref('');
const totalPages = computed(() => Math.ceil(financeStore.topUpRequestsTotal / TOPUPS_PER_PAGE));

onMounted(() => financeStore.fetchTopUpRequests({ search: '', page: 1 }));
const handleFilter = () => financeStore.fetchTopUpRequests({ status: statusFilter.value, page: 1 });
const changePage = (page: number) => financeStore.fetchTopUpRequests({ status: statusFilter.value, page });

const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => financeStore.fetchTopUpRequests({ search: searchInput.value.trim(), page: 1 }), 400);
};
const clearSearch = () => {
  searchInput.value = '';
  clearTimeout(searchTimeout);
  financeStore.fetchTopUpRequests({ search: '', page: 1 });
};

const name = (p?: { fullNameEn: string; fullNameLo: string } | null) =>
  p ? ((locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn) : t('common.unknown');
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

const slipModal = reactive({
  open: false,
  request: null as TopUpRequest | null,
});

const openSlipModal = (req: TopUpRequest) => {
  slipModal.open = true;
  slipModal.request = req;
};

const openApproveFromSlip = () => {
  const req = slipModal.request;
  if (!req) return;
  slipModal.open = false;
  openApprove(req);
};

const openRejectFromSlip = () => {
  const req = slipModal.request;
  if (!req) return;
  slipModal.open = false;
  openReject(req);
};
</script>
