<template>
  <AppModal :open="isOpen" :title="gradeId ? $t('grades_admin.edit') : $t('grades_admin.add')" @update:open="isOpen = $event">
    <form id="grade-form" class="grid grid-cols-2 gap-4" @submit.prevent="handleSubmit">
      <template v-if="!gradeId">
        <div class="col-span-2 sm:col-span-1">
          <label for="g-class" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.class') }}</label>
          <select id="g-class" v-model.number="form.classId" required class="input-field" @change="loadClassStudents">
            <option value="" disabled>—</option>
            <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ className(c) }}</option>
          </select>
        </div>
        <div class="col-span-2 sm:col-span-1">
          <label for="g-subject" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.subject') }}</label>
          <select id="g-subject" v-model.number="form.subjectId" required class="input-field">
            <option value="" disabled>—</option>
            <option v-for="s in academicsStore.subjects" :key="s.subjectId" :value="s.subjectId">{{ subjectName(s) }}</option>
          </select>
        </div>
        <div class="col-span-2">
          <label for="g-student" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.student') }}</label>
          <select id="g-student" v-model.number="form.studentId" required class="input-field" :disabled="!classStudents.length">
            <option value="" disabled>{{ form.classId ? '—' : $t('grades_admin.choose_class_first') }}</option>
            <option v-for="s in classStudents" :key="s.studentId" :value="s.studentId">{{ personName(s) }} · {{ s.studentCode }}</option>
          </select>
        </div>
      </template>
      <div class="col-span-2 sm:col-span-1">
        <label for="g-type" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.type') }}</label>
        <select id="g-type" v-model.number="form.gradeTypeId" required class="input-field">
          <option value="" disabled>—</option>
          <option v-for="gt in academicsStore.gradeTypes" :key="gt.typeId" :value="gt.typeId">{{ locale === 'lo' ? gt.typeNameLo : gt.typeNameEn }}</option>
        </select>
      </div>
      <div class="col-span-2 sm:col-span-1">
        <label for="g-month" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.month') }}</label>
        <input id="g-month" v-model="form.gradeMonth" type="month" class="input-field">
      </div>
      <div>
        <label for="g-score" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.score') }}</label>
        <input id="g-score" v-model.number="form.score" required type="number" min="0" :max="form.maxScore" step="0.5" class="input-field tnum">
      </div>
      <div>
        <label for="g-max" class="block mb-1.5 text-sm font-semibold">{{ $t('grades_admin.max_score') }}</label>
        <input id="g-max" v-model.number="form.maxScore" required type="number" min="1" step="1" class="input-field tnum">
      </div>
      <label class="col-span-2 flex items-center gap-2 text-sm">
        <input v-model="form.isPublished" type="checkbox" class="h-4 w-4 rounded border-line-strong">
        {{ $t('grades_admin.published') }}
      </label>
      <p v-if="error" role="alert" class="col-span-2 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ error }}</p>
    </form>
    <template #footer>
      <button type="button" class="btn-secondary" :disabled="saving" @click="isOpen = false">{{ $t('common.cancel') }}</button>
      <button type="submit" form="grade-form" class="btn-primary" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppModal from '../AppModal.vue';
import { useAcademicsStore } from '../../application/stores/academics';
import { adminRepository } from '../../infrastructure/api/AdminRepository';
import { getErrorMessage } from '../../utils/errors';
import { schoolToday } from '../../utils/schoolDate';
import type { Grade } from '../../domain/models/Academics';
import type { SchoolClass } from '../../domain/models/SchoolClass';
import type { Student } from '../../domain/models/Student';

const props = defineProps<{
  open: boolean;
  grade: Grade | null;
  classes: SchoolClass[];
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'saved'): void;
}>();

const { t, locale } = useI18n();
const academicsStore = useAcademicsStore();

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
});

type Named = { fullNameEn: string; fullNameLo: string } | null | undefined;
const personName = (p: Named) => (p ? (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn : '—');
const className = (c: { classNameEn: string; classNameLo: string }) => (locale.value === 'lo' ? c.classNameLo : c.classNameEn) || c.classNameEn;
const subjectName = (s: { subjectNameEn: string; subjectNameLo: string }) => (locale.value === 'lo' ? s.subjectNameLo : s.subjectNameEn) || s.subjectNameEn;

const emptyForm = () => ({
  classId: '' as number | '', subjectId: '' as number | '', studentId: '' as number | '',
  gradeTypeId: '' as number | '', gradeMonth: schoolToday().slice(0, 7), score: 0, maxScore: 100, isPublished: false,
});

const form = reactive(emptyForm());
const saving = ref(false);
const error = ref('');
const classStudents = ref<Student[]>([]);

const gradeId = computed(() => props.grade?.gradeId || null);

watch(() => props.open, (newVal) => {
  if (newVal) {
    saving.value = false;
    error.value = '';
    classStudents.value = [];
    if (props.grade) {
      Object.assign(form, {
        ...emptyForm(),
        gradeTypeId: props.grade.gradeTypeId ?? '',
        gradeMonth: props.grade.gradeMonth ?? '',
        score: Number(props.grade.score ?? 0),
        maxScore: Number(props.grade.maxScore ?? 100),
        isPublished: props.grade.isPublished,
      });
    } else {
      Object.assign(form, emptyForm());
    }
  }
});

async function loadClassStudents() {
  form.studentId = '';
  classStudents.value = form.classId
    ? (await adminRepository.getStudents({ classId: form.classId, limit: 200, status: 'active' })).students
    : [];
}

async function handleSubmit() {
  saving.value = true;
  error.value = '';
  const { classId, subjectId, studentId, gradeMonth, ...rest } = form;
  const scores = { ...rest, ...(gradeMonth ? { gradeMonth } : {}) };
  try {
    if (gradeId.value) {
      await academicsStore.updateGrade(gradeId.value, scores);
    } else {
      await academicsStore.createGrade({ ...scores, classId, subjectId, studentId });
    }
    emit('saved');
    isOpen.value = false;
  } catch (err) {
    error.value = getErrorMessage(err, t('common.error'));
  } finally {
    saving.value = false;
  }
}
</script>
