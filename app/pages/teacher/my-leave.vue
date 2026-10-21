<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('teacher_leave.my_title')" :subtitle="$t('teacher_leave.my_subtitle')">
      <button type="button" class="btn-primary" @click="openForm">+ {{ $t('teacher_leave.request') }}</button>
    </PageHeader>

    <LoadingSpinner v-if="loading && !leaves.length" />
    <p v-else-if="!leaves.length" class="panel p-12 text-center text-sm text-ink-subtle">{{ $t('teacher_leave.empty_mine') }}</p>
    <section v-else class="panel overflow-hidden">
      <ul class="divide-y divide-line">
        <li v-for="l in leaves" :key="l.leaveId" class="px-5 py-4 flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-semibold">{{ $t(`teacher_leave.type_${l.leaveType}`) }}</span>
              <span :class="statusBadge(l.status)">{{ $t(`status.${l.status}`) }}</span>
            </div>
            <p class="text-sm tnum mt-1">{{ f.date(l.startDate) }} – {{ f.date(l.endDate) }} · {{ $t('leave_admin.days', { count: dayCount(l) }) }}</p>
            <p v-if="l.reason" class="text-sm text-ink-muted mt-1 whitespace-pre-line">{{ l.reason }}</p>
            <p v-if="l.status !== 'pending'" class="text-xs text-ink-subtle mt-1">
              {{ $t('teacher_leave.decided_by', { name: l.decider ? pick(l.decider.fullNameLo, l.decider.fullNameEn) : '—' }) }}
              <template v-if="l.decisionNote"> · {{ l.decisionNote }}</template>
            </p>
          </div>
          <button v-if="l.status === 'pending'" type="button" class="btn-secondary text-xs px-2.5 py-1" @click="cancel(l)">{{ $t('teacher_leave.cancel') }}</button>
        </li>
      </ul>
    </section>

    <AppModal :open="formOpen" :title="$t('teacher_leave.request')" @update:open="formOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <div>
          <label for="tl-type" class="block mb-1.5 text-sm font-semibold">{{ $t('teacher_leave.type') }} *</label>
          <select id="tl-type" v-model="form.leaveType" class="input-field" required>
            <option v-for="type in TYPES" :key="type" :value="type">{{ $t(`teacher_leave.type_${type}`) }}</option>
          </select>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tl-start" class="block mb-1.5 text-sm font-semibold">{{ $t('teacher_leave.start') }} *</label>
            <input id="tl-start" v-model="form.startDate" type="date" class="input-field" required>
          </div>
          <div>
            <label for="tl-end" class="block mb-1.5 text-sm font-semibold">{{ $t('teacher_leave.end') }} *</label>
            <input id="tl-end" v-model="form.endDate" type="date" class="input-field" required :min="form.startDate">
          </div>
        </div>
        <div>
          <label for="tl-reason" class="block mb-1.5 text-sm font-semibold">{{ $t('leave_admin.col_reason') }}</label>
          <textarea id="tl-reason" v-model.trim="form.reason" class="input-field" rows="3" maxlength="2000" />
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-line">
          <button type="button" class="btn-secondary" @click="formOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? $t('common.loading') : $t('teacher_leave.submit') }}</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useApiClient } from '../../infrastructure/api/apiClient';
import type { ApiResponse } from '../../infrastructure/api/types';

const TYPES = ['sick', 'personal', 'annual', 'maternity', 'other'] as const;
type LeaveType = (typeof TYPES)[number];
interface TeacherLeave {
  leaveId: number; leaveType: LeaveType; startDate: string; endDate: string; reason: string | null;
  status: 'pending' | 'approved' | 'rejected'; decisionNote: string | null;
  decider: { fullNameEn: string; fullNameLo: string } | null;
}

definePageMeta({ layout: 'teacher' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
const dialog = useDialog();
useHead({ title: () => `${t('teacher_leave.my_title')} — Teacher Portal` });

const leaves = ref<TeacherLeave[]>([]);
const loading = ref(true);
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const dayCount = (l: TeacherLeave) => Math.round((new Date(l.endDate).getTime() - new Date(l.startDate).getTime()) / 86400000) + 1;
const statusBadge = (s: TeacherLeave['status']) => (s === 'approved' ? 'badge-success' : s === 'rejected' ? 'badge-danger' : 'badge-warning');

const load = async () => {
  loading.value = true;
  try {
    const res = await api<ApiResponse<{ leaves: TeacherLeave[] }>>('/teacher-leaves/me');
    leaves.value = res.data.leaves;
  } catch (err) {
    dialog.error(getErrorMessage(err));
  } finally {
    loading.value = false;
  }
};

const formOpen = ref(false);
const saving = ref(false);
const today = () => new Date().toLocaleDateString('en-CA');
const form = reactive({ leaveType: 'personal' as LeaveType, startDate: today(), endDate: today(), reason: '' });
const openForm = () => {
  Object.assign(form, { leaveType: 'personal', startDate: today(), endDate: today(), reason: '' });
  formOpen.value = true;
};

const submit = async () => {
  saving.value = true;
  try {
    await api('/teacher-leaves/me', { method: 'POST', body: { ...form, reason: form.reason || null } });
    formOpen.value = false;
    dialog.success(t('teacher_leave.submitted'));
    await load();
  } catch (err) {
    dialog.error(getErrorMessage(err));
  } finally {
    saving.value = false;
  }
};

const cancel = (l: TeacherLeave) => {
  dialog.confirm({
    message: t('teacher_leave.confirm_cancel'),
    tone: 'danger',
    confirmLabel: t('teacher_leave.cancel'),
    onConfirm: async () => {
      await api(`/teacher-leaves/me/${l.leaveId}`, { method: 'DELETE' });
      await load();
    },
  });
};

onMounted(load);
</script>
