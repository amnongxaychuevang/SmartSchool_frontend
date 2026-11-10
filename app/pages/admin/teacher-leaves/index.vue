<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search / Filters -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <SearchInput v-model="search" class="flex-1 max-w-md" :placeholder="$t('teacher_leave.search_ph')" :aria-label="$t('teacher_leave.search_ph')" @input="onSearch" @clear="load(1)" />
      <select v-model="status" class="input-field w-full sm:w-44" :aria-label="$t('leave_admin.col_status')" @change="load(1)">
        <option value="all">{{ $t('leave_admin.tab_all') }}</option>
        <option value="pending">{{ $t('status.pending') }}</option>
        <option value="approved">{{ $t('status.approved') }}</option>
        <option value="rejected">{{ $t('status.rejected') }}</option>
      </select>
    </div>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="loading && !rows.length" />
      <EmptyState v-else-if="!rows.length" :title="$t('teacher_leave.empty')" />
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-10 text-center whitespace-nowrap">#</th>
              <th class="whitespace-nowrap">{{ $t('teacher_leave.col_teacher') }}</th>
              <th class="whitespace-nowrap">{{ $t('teacher_leave.type') }}</th>
              <th class="whitespace-nowrap">{{ $t('leave_admin.col_dates') }}</th>
              <th class="whitespace-nowrap">{{ $t('leave_admin.col_reason') }}</th>
              <th class="whitespace-nowrap">{{ $t('leave_admin.col_requested') }}</th>
              <th class="whitespace-nowrap">{{ $t('leave_admin.col_status') }}</th>
              <th class="text-right whitespace-nowrap">{{ $t('leave_admin.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(l, i) in rows" :key="l.leaveId">
              <td class="text-center tnum text-ink-subtle text-xs">{{ (page - 1) * pageSize + i + 1 }}</td>
              <td class="whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <PersonAvatar :name="pick(l.teacher.user.fullNameLo, l.teacher.user.fullNameEn)" :photo-url="l.teacher.user.avatarUrl" size="xs" />
                  <div>
                    <p class="text-xs font-semibold leading-tight">{{ pick(l.teacher.user.fullNameLo, l.teacher.user.fullNameEn) }}</p>
                    <p class="text-[11px] text-ink-muted tnum leading-tight">{{ l.teacher.employeeCode }}</p>
                  </div>
                </div>
              </td>
              <td class="text-xs whitespace-nowrap">{{ $t(`teacher_leave.type_${l.leaveType}`) }}</td>
              <td class="whitespace-nowrap">
                <p class="text-xs tnum leading-tight">{{ f.date(l.startDate) }} – {{ f.date(l.endDate) }}</p>
                <p class="text-[11px] text-ink-muted leading-tight">{{ $t('leave_admin.days', { count: dayCount(l) }) }}</p>
              </td>
              <td class="max-w-xs"><p class="text-xs line-clamp-1 whitespace-normal leading-tight" :title="l.reason || ''">{{ l.reason || '—' }}</p></td>
              <td class="text-xs text-ink-muted whitespace-nowrap tnum">{{ f.dateTime(l.requestedAt) }}</td>
              <td class="whitespace-nowrap">
                <StatusBadge :status="l.status" />
                <p v-if="l.decider" class="text-[10px] text-ink-subtle mt-0.5">{{ pick(l.decider.fullNameLo, l.decider.fullNameEn) }}</p>
              </td>
              <td class="text-right whitespace-nowrap">
                <template v-if="l.status === 'pending'">
                  <div class="inline-flex items-center gap-1.5">
                    <button type="button" class="btn-secondary h-7 px-2.5 text-xs" @click="decide(l, 'rejected')">{{ $t('leave_admin.reject') }}</button>
                    <button type="button" class="btn-primary h-7 px-2.5 text-xs" @click="decide(l, 'approved')">{{ $t('leave_admin.approve') }}</button>
                  </div>
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
import type { ApiResponse } from '../../../infrastructure/api/types';

interface Named { fullNameEn: string; fullNameLo: string }
interface LeaveRow {
  leaveId: number; leaveType: string; startDate: string; endDate: string; reason: string | null;
  status: 'pending' | 'approved' | 'rejected'; requestedAt: string;
  teacher: { employeeCode: string; user: Named & { avatarUrl: string | null } };
  decider: Named | null;
}

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
const dialog = useDialog();
useHead({ title: () => t('teacher_leave.admin_title') });

const rows = ref<LeaveRow[]>([]);
const loading = ref(false);
const status = ref<'all' | 'pending' | 'approved' | 'rejected'>(queryFilter('status', ['pending', 'approved', 'rejected', 'all'] as const, 'all'));
const search = ref('');
const page = ref(1);
const pageSize = ref(15);
const total = ref(0);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const dayCount = (l: LeaveRow) => Math.round((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1;

const load = async (toPage = 1) => {
  loading.value = true;
  try {
    const query = new URLSearchParams({ page: String(toPage), limit: String(pageSize.value) });
    if (status.value !== 'all') query.set('status', status.value);
    if (search.value.trim()) query.set('search', search.value.trim());
    const res = await api<ApiResponse<LeaveRow[]>>(`/teacher-leaves?${query}`);
    rows.value = res.data;
    total.value = res.meta?.total ?? res.data.length;
    page.value = res.meta?.page ?? toPage;
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

const decide = (l: LeaveRow, decision: 'approved' | 'rejected') => {
  dialog.confirm({
    message: t(decision === 'approved' ? 'teacher_leave.confirm_approve' : 'teacher_leave.confirm_reject', { name: pick(l.teacher.user.fullNameLo, l.teacher.user.fullNameEn) }),
    confirmLabel: t(decision === 'approved' ? 'leave_admin.approve' : 'leave_admin.reject'),
    tone: decision === 'approved' ? 'primary' : 'danger',
    onConfirm: async () => {
      await api(`/teacher-leaves/${l.leaveId}/status`, { method: 'PUT', body: { status: decision } });
      await load(page.value);
    },
  });
};

onMounted(() => load(1));
</script>
