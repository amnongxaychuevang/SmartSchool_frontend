<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('nav.academic')" :title="$t('grades_admin.title')" :subtitle="$t('grades_admin.subtitle')">
      <select v-model="classFilter" class="input-field w-auto" :aria-label="$t('grades_admin.class')" @change="handleFilter">
        <option value="">{{ $t('grades_admin.all_classes') }}</option>
        <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ className(c) }}</option>
      </select>
      <select v-model="subjectFilter" class="input-field w-auto" :aria-label="$t('grades_admin.subject')" @change="handleFilter">
        <option value="">{{ $t('grades_admin.all_subjects') }}</option>
        <option v-for="s in academicsStore.subjects" :key="s.subjectId" :value="s.subjectId">{{ subjectName(s) }}</option>
      </select>
      <button type="button" class="btn-primary" @click="openCreate">{{ $t('grades_admin.add') }}</button>
    </PageHeader>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="academicsStore.gradesLoading" />
      <p v-else-if="!academicsStore.grades.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('grades_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('grades_admin.col_student') }}</th>
              <th>{{ $t('grades_admin.col_class') }}</th>
              <th>{{ $t('grades_admin.col_subject') }}</th>
              <th>{{ $t('grades_admin.col_type') }}</th>
              <th>{{ $t('grades_admin.col_month') }}</th>
              <th class="text-right">{{ $t('grades_admin.col_score') }}</th>
              <th>{{ $t('grades_admin.col_published') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grade in academicsStore.grades" :key="grade.gradeId">
              <td>
                <p class="font-semibold">{{ personName(grade.student) }}</p>
                <p class="text-xs text-ink-subtle font-mono">{{ grade.student?.studentCode }}</p>
              </td>
              <td>{{ grade.class ? className(grade.class) : '—' }}</td>
              <td>{{ grade.subject ? subjectName(grade.subject) : '—' }}</td>
              <td class="text-ink-muted">{{ grade.gradeType ? (locale === 'lo' ? grade.gradeType.typeNameLo : grade.gradeType.typeNameEn) : '—' }}</td>
              <td class="tnum text-ink-muted">{{ grade.gradeMonth ?? '—' }}</td>
              <td class="text-right tnum"><span class="font-semibold">{{ f.number(grade.score, 2) }}</span><span class="text-ink-subtle"> / {{ f.number(grade.maxScore, 2) }}</span></td>
              <td>
                <span :class="grade.isPublished ? 'badge-success' : 'badge-neutral'">
                  {{ grade.isPublished ? $t('grades_admin.col_published') : $t('grades_admin.draft') }}
                </span>
              </td>
              <td class="text-right">
                <div class="inline-flex gap-2">
                  <button type="button" class="btn-secondary min-h-8 px-3" @click="openEdit(grade)">{{ $t('common.edit') }}</button>
                  <button type="button" class="btn-danger min-h-8 px-3" @click="openDelete(grade)">{{ $t('common.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :current-page="academicsStore.gradesPage" :total-pages="totalPages" @update:page="changePage" />
    </section>

    <AppModal v-model:open="modal.open" :title="modal.gradeId ? $t('grades_admin.edit') : $t('grades_admin.add')">
      <form id="grade-form" class="grid grid-cols-2 gap-4" @submit.prevent="handleSubmit">
        <template v-if="!modal.gradeId">
          <div class="col-span-2 sm:col-span-1">
            <label for="g-class" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.class') }}</label>
            <select id="g-class" v-model.number="modal.form.classId" required class="input-field" @change="loadClassStudents">
              <option value="" disabled>—</option>
              <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ className(c) }}</option>
            </select>
          </div>
          <div class="col-span-2 sm:col-span-1">
            <label for="g-subject" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.subject') }}</label>
            <select id="g-subject" v-model.number="modal.form.subjectId" required class="input-field">
              <option value="" disabled>—</option>
              <option v-for="s in academicsStore.subjects" :key="s.subjectId" :value="s.subjectId">{{ subjectName(s) }}</option>
            </select>
          </div>
          <div class="col-span-2">
            <label for="g-student" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.student') }}</label>
            <select id="g-student" v-model.number="modal.form.studentId" required class="input-field" :disabled="!classStudents.length">
              <option value="" disabled>{{ modal.form.classId ? '—' : $t('grades_admin.choose_class_first') }}</option>
              <option v-for="s in classStudents" :key="s.studentId" :value="s.studentId">{{ personName(s) }} · {{ s.studentCode }}</option>
            </select>
          </div>
        </template>
        <div class="col-span-2 sm:col-span-1">
          <label for="g-type" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.type') }}</label>
          <select id="g-type" v-model.number="modal.form.gradeTypeId" required class="input-field">
            <option value="" disabled>—</option>
            <option v-for="gt in academicsStore.gradeTypes" :key="gt.typeId" :value="gt.typeId">{{ locale === 'lo' ? gt.typeNameLo : gt.typeNameEn }}</option>
          </select>
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label for="g-month" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.month') }}</label>
          <input id="g-month" v-model="modal.form.gradeMonth" type="month" class="input-field">
        </div>
        <div>
          <label for="g-score" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.score') }}</label>
          <input id="g-score" v-model.number="modal.form.score" required type="number" min="0" :max="modal.form.maxScore" step="0.5" class="input-field tnum">
        </div>
        <div>
          <label for="g-max" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.max_score') }}</label>
          <input id="g-max" v-model.number="modal.form.maxScore" required type="number" min="1" step="1" class="input-field tnum">
        </div>
        <label class="col-span-2 flex items-center gap-2 text-sm">
          <input v-model="modal.form.isPublished" type="checkbox" class="h-4 w-4 rounded border-line-strong">
          {{ $t('grades_admin.published') }}
        </label>
        <p v-if="modal.error" role="alert" class="col-span-2 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ modal.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="modal.saving" @click="modal.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="grade-form" class="btn-primary" :disabled="modal.saving">{{ modal.saving ? $t('common.saving') : $t('common.save') }}</button>
      </template>
    </AppModal>

    <ConfirmDialog
      v-model:open="del.open"
      tone="danger"
      :title="$t('grades_admin.delete_title')"
      :message="del.grade ? $t('grades_admin.delete_msg', { subject: del.grade.subject ? subjectName(del.grade.subject) : '', name: personName(del.grade.student) }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Grade } from '../../../domain/models/Academics';
import type { SchoolClass } from '../../../domain/models/SchoolClass';
import type { Student } from '../../../domain/models/Student';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAcademicsStore } from '../../../application/stores/academics';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';
import { schoolToday } from '../../../utils/schoolDate';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('grades_admin.title') });

const academicsStore = useAcademicsStore();
const classes = ref<SchoolClass[]>([]);
const classFilter = ref<number | ''>('');
const subjectFilter = ref<number | ''>('');
const totalPages = computed(() => Math.ceil(academicsStore.gradesTotal / 50));

type Named = { fullNameEn: string; fullNameLo: string } | null | undefined;
const personName = (p: Named) => (p ? (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn : '—');
const className = (c: { classNameEn: string; classNameLo: string }) => (locale.value === 'lo' ? c.classNameLo : c.classNameEn) || c.classNameEn;
const subjectName = (s: { subjectNameEn: string; subjectNameLo: string }) => (locale.value === 'lo' ? s.subjectNameLo : s.subjectNameEn) || s.subjectNameEn;

onMounted(async () => {
  academicsStore.fetchSubjects({ limit: 200 });
  academicsStore.fetchGrades();
  academicsStore.fetchGradeTypes();
  classes.value = (await adminRepository.getClasses({ limit: 200 })).classes;
});

const filters = () => ({
  classId: classFilter.value || undefined,
  subjectId: subjectFilter.value || undefined,
});
const handleFilter = () => academicsStore.fetchGrades({ ...filters(), page: 1 });
const changePage = (page: number) => academicsStore.fetchGrades({ ...filters(), page });

// ── Add / edit ──
const emptyForm = () => ({
  classId: '' as number | '', subjectId: '' as number | '', studentId: '' as number | '',
  gradeTypeId: '' as number | '', gradeMonth: schoolToday().slice(0, 7), score: 0, maxScore: 100, isPublished: false,
});
const modal = reactive({ open: false, saving: false, error: '', gradeId: null as number | null, form: emptyForm() });
const classStudents = ref<Student[]>([]);

async function loadClassStudents() {
  modal.form.studentId = '';
  classStudents.value = modal.form.classId
    ? (await adminRepository.getStudents({ classId: modal.form.classId, limit: 200, status: 'active' })).students
    : [];
}

const openCreate = () => Object.assign(modal, { open: true, saving: false, error: '', gradeId: null, form: emptyForm() });
const openEdit = (g: Grade) => Object.assign(modal, {
  open: true, saving: false, error: '', gradeId: g.gradeId,
  form: {
    ...emptyForm(), gradeTypeId: g.gradeTypeId ?? '', gradeMonth: g.gradeMonth ?? '',
    score: Number(g.score ?? 0), maxScore: Number(g.maxScore ?? 100), isPublished: g.isPublished,
  },
});

async function handleSubmit() {
  modal.saving = true;
  modal.error = '';
  const { classId, subjectId, studentId, gradeMonth, ...rest } = modal.form;
  const scores = { ...rest, ...(gradeMonth ? { gradeMonth } : {}) };
  try {
    if (modal.gradeId) await academicsStore.updateGrade(modal.gradeId, scores);
    else await academicsStore.createGrade({ ...scores, classId, subjectId, studentId });
    modal.open = false;
  } catch (err) {
    modal.error = getErrorMessage(err, t('common.error'));
  } finally {
    modal.saving = false;
  }
}

// ── Delete ──
const del = reactive({ open: false, busy: false, error: '', grade: null as Grade | null });
const openDelete = (g: Grade) => Object.assign(del, { open: true, busy: false, error: '', grade: g });
async function handleDelete() {
  if (!del.grade) return;
  del.busy = true;
  del.error = '';
  try {
    await academicsStore.deleteGrade(del.grade.gradeId);
    del.open = false;
  } catch (err) {
    del.error = getErrorMessage(err, t('common.error'));
  } finally {
    del.busy = false;
  }
}
</script>
