<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('leave_admin.title')" :subtitle="$t('leave_admin.subtitle')" />

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative w-full sm:w-80">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="search" type="text" class="search-bar" :placeholder="$t('leave_admin.search_ph')" :aria-label="$t('leave_admin.search_ph')" @input="onSearch">
        <button v-if="search" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear_search')" @click="search = ''; load(1)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <select v-model="status" class="input-field w-full sm:w-48" :aria-label="$t('leave_admin.col_status')" @change="load(1)">
        <option v-for="opt in statusOptions" :key="opt.id" :value="opt.id">{{ opt.label }}</option>
      </select>
    </div>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="loading && !requests.length" />
      <p v-else-if="!requests.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('leave_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('leave_admin.col_student') }}</th>
              <th>{{ $t('leave_admin.col_parent') }}</th>
              <th>{{ $t('leave_admin.col_dates') }}</th>
              <th>{{ $t('leave_admin.col_reason') }}</th>
              <th>{{ $t('leave_admin.col_requested') }}</th>
              <th>{{ $t('leave_admin.col_status') }}</th>
              <th class="text-right">{{ $t('leave_admin.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(req, i) in requests" :key="req.leaveId">
              <td class="text-center tnum text-ink-subtle">{{ (page - 1) * pageSize + i + 1 }}</td>
              <td>
                <div class="flex items-center gap-3">
                  <PersonAvatar :name="pick(req.student.fullNameLo, req.student.fullNameEn)" :photo-url="req.student.photoUrl" size="md" />
                  <div>
                    <p class="font-semibold">{{ pick(req.student.fullNameLo, req.student.fullNameEn) }}</p>
                    <p class="text-xs text-ink-muted">
                      <span class="tnum">{{ req.student.studentCode }}</span>
                      <template v-if="classOf(req)"> · {{ classOf(req) }}</template>
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <p>{{ pick(req.parent?.fullNameLo, req.parent?.fullNameEn) || '—' }}</p>
                <p class="text-xs text-ink-muted tnum">{{ req.parent?.phoneNumber || '' }}</p>
              </td>
              <td class="whitespace-nowrap">
                <p class="tnum">{{ f.date(req.startDate) }} – {{ f.date(req.endDate) }}</p>
                <p class="text-xs text-ink-muted">{{ $t('leave_admin.days', { count: dayCount(req) }) }}</p>
              </td>
              <td class="max-w-xs">
                <p class="line-clamp-2 whitespace-normal" :title="req.reason || ''">{{ req.reason || '—' }}</p>
                <a v-if="req.documentUrl" :href="req.documentUrl" target="_blank" rel="noopener" class="text-xs text-primary-ink hover:underline">{{ $t('common.view_document') }}</a>
              </td>
              <td class="text-xs text-ink-muted whitespace-nowrap tnum">{{ f.dateTime(req.requestedAt) }}</td>
              <td>
                <span :class="statusBadge(req.status)">{{ $t(`status.${req.status}`) }}</span>
                <p v-if="req.approver" class="text-[11px] text-ink-subtle mt-1">{{ pick(req.approver.fullNameLo, req.approver.fullNameEn) }}</p>
              </td>
              <td class="text-right whitespace-nowrap">
                <template v-if="req.status === 'pending'">
                  <button type="button" class="btn-secondary text-xs px-2.5 py-1 mr-2" @click="decide(req, 'rejected')">{{ $t('leave_admin.reject') }}</button>
                  <button type="button" class="btn-primary text-xs px-2.5 py-1" @click="decide(req, 'approved')">{{ $t('leave_admin.approve') }}</button>
                </template>
                <span v-else class="text-xs text-ink-subtle">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        :loading="loading"
        :current-page="page"
        :total-pages="totalPages"
        :total="total"
        :page-size="pageSize"
        @update:page="load"
        @update:page-size="(size) => { pageSize = size; }"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';
import type { ApiResponse } from '../../../infrastructure/api/types';

interface LeaveRow {
  leaveId: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  documentUrl: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  student: {
    studentCode: string; fullNameEn: string; fullNameLo: string; photoUrl: string | null;
    classStudents?: { class: { classNameEn: string; classNameLo: string } }[];
  };
  parent: { fullNameEn: string; fullNameLo: string; phoneNumber: string | null } | null;
  approver: { fullNameEn: string; fullNameLo: string } | null;
}
type StatusTab = 'pending' | 'approved' | 'rejected' | 'all';

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
const dialog = useDialog();
useHead({ title: () => t('leave_admin.title') });

const requests = ref<LeaveRow[]>([]);
const loading = ref(false);
const status = ref<StatusTab>('all');
const search = ref('');
const page = ref(1);
const pageSize = ref(15);
const total = ref(0);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const statusOptions = computed<{ id: StatusTab; label: string }[]>(() => [
  { id: 'all', label: t('leave_admin.tab_all') },
  { id: 'pending', label: t('status.pending') },
  { id: 'approved', label: t('status.approved') },
  { id: 'rejected', label: t('status.rejected') },
]);

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const classOf = (req: LeaveRow) => {
  const cls = req.student.classStudents?.[0]?.class;
  return cls ? pick(cls.classNameLo, cls.classNameEn) : '';
};
// Calendar days, both ends included.
const dayCount = (req: LeaveRow) => Math.round((new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) / 86400000) + 1;
const statusBadge = (s: LeaveRow['status']) => (s === 'approved' ? 'badge-success' : s === 'rejected' ? 'badge-danger' : 'badge-warning');

const load = async (toPage = 1) => {
  loading.value = true;
  try {
    const query = new URLSearchParams({ page: String(toPage), limit: String(pageSize.value) });
    if (status.value !== 'all') query.set('status', status.value);
    if (search.value.trim()) query.set('search', search.value.trim());
    const res = await api<ApiResponse<{ requests: LeaveRow[]; total: number; page: number }>>(`${API_ENDPOINTS.leaveRequests.list}?${query}`);
    requests.value = res.data.requests;
    total.value = res.data.total;
    page.value = res.data.page;
  } catch (err) {
    dialog.error(getErrorMessage(err));
  } finally {
    loading.value = false;
  }
};

let searchTimer: ReturnType<typeof setTimeout> | undefined;
const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(1), 350);
};

const decide = (req: LeaveRow, decision: 'approved' | 'rejected') => {
  dialog.confirm({
    message: t(decision === 'approved' ? 'leave_ui.confirm_approve' : 'leave_ui.confirm_reject'),
    confirmLabel: t(decision === 'approved' ? 'leave_admin.approve' : 'leave_admin.reject'),
    tone: decision === 'approved' ? 'primary' : 'danger',
    onConfirm: async () => {
      await api(`${API_ENDPOINTS.leaveRequests.list}/${req.leaveId}/status`, { method: 'PUT', body: { status: decision } });
      await load(page.value);
    },
  });
};

onMounted(() => load(1));
</script>
