<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('assignments.title')" :subtitle="$t('assignments.subtitle')">
      <button type="button" class="btn-primary inline-flex items-center gap-1.5" @click="openForm()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        {{ $t('assignments.add') }}
      </button>
    </PageHeader>

    <div class="flex flex-wrap items-end justify-between gap-3">
      <div role="tablist" class="flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="when === tab.id"
          class="pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2"
          :class="when === tab.id ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
          @click="when = tab.id; load(1)"
        >
          {{ tab.label }}
        </button>
      </div>
      <select v-model="classFilter" class="input-field w-auto mb-2" :aria-label="$t('assignments.col_class')" @change="load(1)">
        <option :value="null">{{ $t('assignments.all_classes') }}</option>
        <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ className(c) }} · {{ c.academicYear }}</option>
      </select>
    </div>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="loading && !rows.length" />
      <p v-else-if="!rows.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('assignments.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('assignments.col_due') }}</th>
              <th>{{ $t('assignments.col_title') }}</th>
              <th>{{ $t('assignments.col_class') }}</th>
              <th>{{ $t('assignments.col_subject') }}</th>
              <th>{{ $t('assignments.col_by') }}</th>
              <th class="text-right">{{ $t('assignments.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in rows" :key="a.assignmentId">
              <td class="whitespace-nowrap">
                <p class="tnum font-semibold">{{ f.date(a.dueDate) }}</p>
                <p class="text-xs" :class="dueTone(a.dueDate)">{{ dueLabel(a.dueDate) }}</p>
              </td>
              <td class="max-w-sm">
                <p class="font-semibold whitespace-normal">{{ a.title }}</p>
                <p v-if="a.description" class="text-xs text-ink-muted line-clamp-2 whitespace-normal">{{ a.description }}</p>
              </td>
              <td>{{ className(a.class) }}</td>
              <td>{{ a.subject ? pick(a.subject.subjectNameLo, a.subject.subjectNameEn) : '—' }}</td>
              <td class="text-ink-muted">{{ a.creator ? pick(a.creator.fullNameLo, a.creator.fullNameEn) : '—' }}</td>
              <td class="text-right whitespace-nowrap">
                <button type="button" class="btn-secondary text-xs px-2.5 py-1 mr-2" @click="openForm(a)">{{ $t('common.edit') }}</button>
                <button type="button" class="btn-danger text-xs px-2.5 py-1" @click="remove(a)">{{ $t('common.delete') }}</button>
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

    <AppModal :open="formOpen" :title="editingId ? $t('assignments.edit') : $t('assignments.add')" @update:open="formOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="as-class" class="block mb-1.5 text-sm font-semibold">{{ $t('assignments.col_class') }} *</label>
            <select id="as-class" v-model="form.classId" class="input-field" required @change="loadSubjects">
              <option :value="null" disabled>{{ $t('assignments.select_class') }}</option>
              <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ className(c) }} · {{ c.academicYear }}</option>
            </select>
          </div>
          <div>
            <label for="as-subject" class="block mb-1.5 text-sm font-semibold">{{ $t('assignments.col_subject') }}</label>
            <select id="as-subject" v-model="form.subjectId" class="input-field" :disabled="!form.classId">
              <option :value="null">—</option>
              <option v-for="s in subjects" :key="s.subjectId" :value="s.subjectId">{{ pick(s.subjectNameLo, s.subjectNameEn) }}</option>
            </select>
          </div>
        </div>
        <div>
          <label for="as-title" class="block mb-1.5 text-sm font-semibold">{{ $t('assignments.col_title') }} *</label>
          <input id="as-title" v-model.trim="form.title" type="text" class="input-field" required maxlength="200">
        </div>
        <div>
          <label for="as-desc" class="block mb-1.5 text-sm font-semibold">{{ $t('assignments.description') }}</label>
          <textarea id="as-desc" v-model.trim="form.description" class="input-field" rows="4" maxlength="5000" />
        </div>
        <div class="sm:max-w-xs">
          <label for="as-due" class="block mb-1.5 text-sm font-semibold">{{ $t('assignments.col_due') }} *</label>
          <input id="as-due" v-model="form.dueDate" type="date" class="input-field" required>
        </div>
        <p v-if="!editingId" class="text-xs text-ink-muted">{{ $t('assignments.notify_hint') }}</p>
        <div class="flex justify-end gap-3 pt-4 border-t border-line">
          <button type="button" class="btn-secondary" @click="formOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary" :disabled="saving">{{ saving ? $t('common.loading') : $t('common.save') }}</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import PageHeader from './PageHeader.vue';
import AppModal from './AppModal.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import { useApiClient } from '../infrastructure/api/apiClient';
import type { ApiResponse } from '../infrastructure/api/types';

interface ClassOption { classId: number; classNameEn: string; classNameLo: string; academicYear?: string }
interface SubjectOption { subjectId: number; subjectNameEn: string; subjectNameLo: string }
interface AssignmentRow {
  assignmentId: number; title: string; description: string | null; dueDate: string; classId: number; subjectId: number | null;
  class: ClassOption; subject: SubjectOption | null; creator: { fullNameEn: string; fullNameLo: string } | null;
}

const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
const dialog = useDialog();

const rows = ref<AssignmentRow[]>([]);
const classes = ref<ClassOption[]>([]);
const subjects = ref<SubjectOption[]>([]);
const loading = ref(false);
const when = ref<'upcoming' | 'past'>('upcoming');
const classFilter = ref<number | null>(null);
const page = ref(1);
const pageSize = ref(15);
const total = ref(0);
const totalPages = ref(1);

const tabs = computed(() => [
  { id: 'upcoming' as const, label: t('assignments.tab_upcoming') },
  { id: 'past' as const, label: t('assignments.tab_past') },
]);

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const className = (c: ClassOption) => pick(c.classNameLo, c.classNameEn);

// Whole days from today to the due date, on this device's calendar.
const daysLeft = (due: string) => {
  const d = new Date(due.slice(0, 10) + 'T00:00:00');
  const today = new Date(new Date().toDateString());
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};
const dueLabel = (due: string) => {
  const n = daysLeft(due);
  if (n < 0) return t('assignments.overdue_by', { count: -n });
  if (n === 0) return t('assignments.due_today');
  return t('assignments.due_in', { count: n });
};
const dueTone = (due: string) => {
  const n = daysLeft(due);
  return n < 0 ? 'text-ink-subtle' : n <= 1 ? 'text-danger font-semibold' : 'text-ink-muted';
};

const load = async (toPage = 1) => {
  loading.value = true;
  try {
    const query = new URLSearchParams({ when: when.value, page: String(toPage), limit: String(pageSize.value) });
    if (classFilter.value) query.set('classId', String(classFilter.value));
    const res = await api<ApiResponse<AssignmentRow[]>>(`/assignments?${query}`);
    rows.value = res.data;
    page.value = res.meta?.page ?? toPage;
    total.value = res.meta?.total ?? res.data.length;
    totalPages.value = res.meta?.totalPages ?? 1;
  } catch (err) {
    dialog.error(getErrorMessage(err));
  } finally {
    loading.value = false;
  }
};

// ── Form ──
const formOpen = ref(false);
const saving = ref(false);
const editingId = ref<number | null>(null);
const form = reactive({ classId: null as number | null, subjectId: null as number | null, title: '', description: '', dueDate: '' });

const loadSubjects = async () => {
  subjects.value = [];
  if (!form.classId) return;
  try {
    const res = await api<ApiResponse<{ classSubjects: { subject: SubjectOption }[] }>>(`/class-subjects?classId=${form.classId}`);
    const seen = new Map<number, SubjectOption>();
    for (const cs of res.data.classSubjects) seen.set(cs.subject.subjectId, cs.subject);
    subjects.value = [...seen.values()];
    if (form.subjectId && !seen.has(form.subjectId)) form.subjectId = null;
  } catch {
    subjects.value = [];
  }
};

const openForm = (a?: AssignmentRow) => {
  editingId.value = a?.assignmentId ?? null;
  form.classId = a?.classId ?? classFilter.value ?? classes.value[0]?.classId ?? null;
  form.subjectId = a?.subjectId ?? null;
  form.title = a?.title ?? '';
  form.description = a?.description ?? '';
  form.dueDate = a ? a.dueDate.slice(0, 10) : new Date(Date.now() + 86400000).toLocaleDateString('en-CA');
  formOpen.value = true;
  loadSubjects();
};

const save = async () => {
  saving.value = true;
  try {
    const body = { ...form, description: form.description || null };
    if (editingId.value) {
      await api(`/assignments/${editingId.value}`, { method: 'PUT', body });
    } else {
      await api('/assignments', { method: 'POST', body });
    }
    formOpen.value = false;
    await load(editingId.value ? page.value : 1);
  } catch (err) {
    dialog.error(getErrorMessage(err));
  } finally {
    saving.value = false;
  }
};

const remove = (a: AssignmentRow) => {
  dialog.confirm({
    message: t('assignments.confirm_delete', { title: a.title }),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await api(`/assignments/${a.assignmentId}`, { method: 'DELETE' });
      await load(page.value);
    },
  });
};

onMounted(async () => {
  try {
    const res = await api<ApiResponse<ClassOption[]>>('/classes/all');
    classes.value = res.data;
  } catch {
    classes.value = [];
  }
  await load(1);
});
</script>
