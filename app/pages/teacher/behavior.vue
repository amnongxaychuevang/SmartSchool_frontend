<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('teacher_behavior.title')" :subtitle="$t('teacher_behavior.subtitle')" />

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative w-full sm:w-80">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="search" type="text" class="search-bar" :placeholder="$t('behavior.search_placeholder')" :aria-label="$t('behavior.search_placeholder')" @input="onSearch">
        <button v-if="search" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear_search')" @click="search = ''; load(1)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <select v-model="classFilter" class="input-field w-full sm:w-48" :aria-label="$t('common.class')" @change="load(1)">
        <option :value="null">{{ $t('assignments.all_classes') }}</option>
        <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ pick(c.classNameLo, c.classNameEn) }}</option>
      </select>
      <select v-model="typeFilter" class="input-field w-full sm:w-48" :aria-label="$t('behavior.col_type')" @change="load(1)">
        <option value="">{{ $t('behavior.all_types') }}</option>
        <option value="merit">{{ $t('behavior.type_merit') }}</option>
        <option value="demerit">{{ $t('behavior.type_demerit') }}</option>
      </select>
      <button type="button" class="btn-primary w-full sm:w-auto sm:ml-auto" @click="openForm()">+ {{ $t('behavior.log_incident') }}</button>
    </div>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="loading && !records.length" />
      <p v-else-if="!records.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('behavior.empty_records') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('behavior.col_date') }}</th>
              <th>{{ $t('behavior.col_student') }}</th>
              <th>{{ $t('behavior.col_type') }}</th>
              <th>{{ $t('behavior.col_title') }}</th>
              <th class="text-right">{{ $t('behavior.col_points') }}</th>
              <th>{{ $t('behavior.col_recorded_by') }}</th>
              <th class="text-right">{{ $t('behavior.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rec, i) in records" :key="rec.recordId">
              <td class="text-center tnum text-ink-subtle">{{ (page - 1) * pageSize + i + 1 }}</td>
              <td class="tnum whitespace-nowrap text-ink-muted">{{ f.date(rec.incidentDate) }}</td>
              <td>
                <div class="flex items-center gap-3">
                  <PersonAvatar :name="pick(rec.student.fullNameLo, rec.student.fullNameEn)" :photo-url="rec.student.photoUrl" size="md" />
                  <span class="font-semibold">{{ pick(rec.student.fullNameLo, rec.student.fullNameEn) }}</span>
                </div>
              </td>
              <td><span :class="rec.type === 'merit' ? 'badge-success' : 'badge-danger'">{{ rec.type === 'merit' ? $t('behavior.type_merit') : $t('behavior.type_demerit') }}</span></td>
              <td class="max-w-xs whitespace-normal">
                <p class="font-medium">{{ pick(rec.titleLo, rec.titleEn) }}</p>
                <p v-if="rec.actionTaken" class="text-xs text-ink-muted">{{ $t('behavior.action_taken_label') }}: {{ rec.actionTaken }}</p>
              </td>
              <td class="text-right font-bold tnum" :class="rec.type === 'merit' ? 'text-success' : 'text-danger'">{{ rec.type === 'merit' ? '+' : '-' }}{{ rec.points }}</td>
              <td class="text-ink-muted">{{ rec.recorder ? pick(rec.recorder.fullNameLo, rec.recorder.fullNameEn) : '—' }}</td>
              <td class="text-right whitespace-nowrap">
                <template v-if="rec.recorder?.userId === myUserId">
                  <button type="button" class="btn-secondary text-xs px-2.5 py-1 mr-2" @click="openForm(rec)">{{ $t('common.edit') }}</button>
                  <button type="button" class="btn-danger text-xs px-2.5 py-1" @click="remove(rec)">{{ $t('common.delete') }}</button>
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

    <!-- Log / edit -->
    <AppModal :open="formOpen" :title="editing ? $t('behavior.modal_edit_title') : $t('behavior.modal_log_title')" @update:open="formOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <div v-if="editing">
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_student') }}</label>
          <p class="input-field bg-surface-2 text-ink-muted">{{ pick(editing.student.fullNameLo, editing.student.fullNameEn) }}</p>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tb-class" class="block mb-1.5 text-sm font-semibold">{{ $t('common.class') }} *</label>
            <select id="tb-class" v-model="formClassId" class="input-field" required @change="loadStudents">
              <option :value="null" disabled>{{ $t('assignments.select_class') }}</option>
              <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ pick(c.classNameLo, c.classNameEn) }}</option>
            </select>
          </div>
          <div>
            <label for="tb-student" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_student') }} *</label>
            <select id="tb-student" v-model="form.studentId" class="input-field" required :disabled="!formClassId">
              <option :value="null" disabled>{{ $t('teacher_behavior.select_student') }}</option>
              <option v-for="s in classStudents" :key="s.studentId" :value="s.studentId">{{ pick(s.fullNameLo, s.fullNameEn) }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="tb-type" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_type') }} *</label>
            <select id="tb-type" v-model="form.type" class="input-field" required @change="form.categoryId = null">
              <option value="merit">{{ $t('behavior.type_merit') }}</option>
              <option value="demerit">{{ $t('behavior.type_demerit') }}</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label for="tb-cat" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.tab_categories') }}</label>
            <select id="tb-cat" v-model="form.categoryId" class="input-field" @change="applyCategory">
              <option :value="null">—</option>
              <option v-for="c in typeCategories" :key="c.categoryId" :value="c.categoryId">{{ pick(c.nameLo, c.nameEn) }} ({{ c.defaultPoints }} {{ $t('behavior.points_unit') }})</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tb-title-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.title_lo') }} *</label>
            <input id="tb-title-lo" v-model.trim="form.titleLo" type="text" class="input-field" required maxlength="150">
          </div>
          <div>
            <label for="tb-title-en" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.title_en') }} *</label>
            <input id="tb-title-en" v-model.trim="form.titleEn" type="text" class="input-field" required maxlength="150">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label for="tb-points" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_points') }} *</label>
            <input id="tb-points" v-model.number="form.points" type="number" min="1" max="50" class="input-field" required>
          </div>
          <div>
            <label for="tb-date" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_date') }} *</label>
            <input id="tb-date" v-model="form.incidentDate" type="date" class="input-field" required :max="todayStr">
          </div>
          <div>
            <label for="tb-action" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_action') }}</label>
            <input id="tb-action" v-model.trim="form.actionTaken" type="text" class="input-field" maxlength="255">
          </div>
        </div>

        <div>
          <label for="tb-desc" class="block mb-1.5 text-sm font-semibold">{{ $t('common.description') }}</label>
          <textarea id="tb-desc" v-model.trim="form.description" class="input-field" rows="2" />
        </div>

        <label v-if="!editing" class="flex items-center gap-2 text-sm">
          <input v-model="form.notifyParent" type="checkbox" class="h-4 w-4 accent-primary">
          {{ $t('behavior.notify_parent_checkbox') }}
        </label>

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
import { useApiClient } from '../../infrastructure/api/apiClient';
import type { ApiResponse } from '../../infrastructure/api/types';
import { useAuthStore } from '../../application/stores/auth';

interface Named { fullNameEn: string; fullNameLo: string }
interface ClassOption { classId: number; classNameEn: string; classNameLo: string }
interface Category { categoryId: number; nameEn: string; nameLo: string; type: 'merit' | 'demerit'; defaultPoints: number }
interface BehaviorRow {
  recordId: number; type: 'merit' | 'demerit'; titleEn: string; titleLo: string; description: string | null;
  points: number; incidentDate: string; actionTaken: string | null; categoryId: number | null;
  student: Named & { studentId: number; photoUrl: string | null };
  recorder: (Named & { userId: number }) | null;
}

definePageMeta({ layout: 'teacher' });
const { t, locale } = useI18n();
const f = useFormat();
const api = useApiClient();
const dialog = useDialog();
useHead({ title: () => `${t('teacher_behavior.title')} — Teacher Portal` });

const myUserId = computed(() => useAuthStore().user?.userId ?? null);
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const localDate = (d: Date) => d.toLocaleDateString('en-CA');
const todayStr = localDate(new Date());

const classes = ref<ClassOption[]>([]);
const categories = ref<Category[]>([]);
const records = ref<BehaviorRow[]>([]);
const loading = ref(false);
const search = ref('');
const classFilter = ref<number | null>(null);
const typeFilter = ref('');
const page = ref(1);
const pageSize = ref(15);
const total = ref(0);
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)));

const load = async (toPage = 1) => {
  loading.value = true;
  try {
    const query = new URLSearchParams({ page: String(toPage), limit: String(pageSize.value) });
    if (search.value.trim()) query.set('search', search.value.trim());
    if (classFilter.value) query.set('classId', String(classFilter.value));
    if (typeFilter.value) query.set('type', typeFilter.value);
    const res = await api<ApiResponse<{ records: BehaviorRow[]; pagination: { total: number; page: number } }>>(`/behavior/records?${query}`);
    records.value = res.data.records;
    total.value = res.data.pagination.total;
    page.value = res.data.pagination.page;
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

// ── Form ──
const formOpen = ref(false);
const saving = ref(false);
const editing = ref<BehaviorRow | null>(null);
const formClassId = ref<number | null>(null);
const classStudents = ref<(Named & { studentId: number })[]>([]);
const form = reactive({
  studentId: null as number | null,
  categoryId: null as number | null,
  type: 'merit' as 'merit' | 'demerit',
  titleLo: '',
  titleEn: '',
  points: 5,
  incidentDate: todayStr,
  actionTaken: '',
  description: '',
  notifyParent: true,
});
const typeCategories = computed(() => categories.value.filter((c) => c.type === form.type));

const loadStudents = async () => {
  form.studentId = null;
  classStudents.value = [];
  if (!formClassId.value) return;
  const res = await api<ApiResponse<{ students: (Named & { studentId: number })[] }>>(`/students?classId=${formClassId.value}&status=active&limit=200`);
  classStudents.value = res.data.students;
};

const applyCategory = () => {
  const c = categories.value.find((x) => x.categoryId === form.categoryId);
  if (!c) return;
  form.titleLo = c.nameLo;
  form.titleEn = c.nameEn;
  form.points = c.defaultPoints;
};

const openForm = (rec?: BehaviorRow) => {
  editing.value = rec ?? null;
  formClassId.value = rec ? null : classFilter.value;
  form.studentId = rec?.student.studentId ?? null;
  form.categoryId = rec?.categoryId ?? null;
  form.type = rec?.type ?? 'merit';
  form.titleLo = rec?.titleLo ?? '';
  form.titleEn = rec?.titleEn ?? '';
  form.points = rec?.points ?? 5;
  form.incidentDate = rec ? localDate(new Date(rec.incidentDate)) : todayStr;
  form.actionTaken = rec?.actionTaken ?? '';
  form.description = rec?.description ?? '';
  form.notifyParent = true;
  formOpen.value = true;
  if (!rec && formClassId.value) loadStudents();
};

const save = async () => {
  saving.value = true;
  try {
    const body = {
      categoryId: form.categoryId ?? undefined,
      type: form.type,
      titleLo: form.titleLo,
      titleEn: form.titleEn,
      points: form.points,
      incidentDate: form.incidentDate,
      actionTaken: form.actionTaken || undefined,
      description: form.description || undefined,
    };
    if (editing.value) {
      await api(`/behavior/records/${editing.value.recordId}`, { method: 'PUT', body: { ...body, categoryId: form.categoryId } });
    } else {
      await api('/behavior/records', { method: 'POST', body: { ...body, studentId: form.studentId, notifyParent: form.notifyParent } });
    }
    formOpen.value = false;
    await load(editing.value ? page.value : 1);
  } catch (err) {
    dialog.error(getErrorMessage(err));
  } finally {
    saving.value = false;
  }
};

const remove = (rec: BehaviorRow) => {
  dialog.confirm({
    message: t('behavior.confirm_delete'),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await api(`/behavior/records/${rec.recordId}`, { method: 'DELETE' });
      await load(page.value);
    },
  });
};

onMounted(async () => {
  const [cls, cats] = await Promise.all([
    api<ApiResponse<ClassOption[]>>('/classes/all').catch(() => ({ data: [] as ClassOption[] })),
    api<ApiResponse<{ categories: Category[] }>>('/behavior/categories').catch(() => ({ data: { categories: [] as Category[] } })),
  ]);
  classes.value = cls.data;
  categories.value = cats.data.categories;
  await load(1);
});
</script>
