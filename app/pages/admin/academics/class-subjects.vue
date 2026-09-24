<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">{{ L('Class Subjects', 'ວິຊາຂອງແຕ່ລະຫ້ອງ') }}</h1>
        <p class="text-sm text-slate-400 mt-1">
          {{ L('Which subject is taught to which class, by which teacher, in each term. Grades and the timetable use these.', 'ວິຊາໃດສອນຫ້ອງໃດ ໂດຍຄູຄົນໃດ ໃນແຕ່ລະພາກຮຽນ. ຄະແນນ ແລະ ຕາຕະລາງຮຽນໃຊ້ຂໍ້ມູນນີ້.') }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <select v-model.number="termId" class="filter-select" @change="fetchRows">
          <option v-for="t in terms" :key="t.termId" :value="t.termId">
            {{ t.academicYear }} · {{ locale === 'lo' ? t.termNameLo : t.termNameEn }}{{ t.status === 'active' ? ' ●' : '' }}
          </option>
        </select>
        <select v-model.number="classFilter" class="filter-select" @change="fetchRows">
          <option :value="0">{{ L('All classes', 'ທຸກຫ້ອງ') }}</option>
          <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ className(c) }}</option>
        </select>
        <button :disabled="!termId" class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50" @click="openModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          {{ L('Assign Subject', 'ເພີ່ມວິຊາໃຫ້ຫ້ອງ') }}
        </button>
      </div>
    </div>

    <div v-if="!loading && terms.length === 0" class="glass-panel p-8 text-center text-slate-400 text-sm">
      {{ L('Create an academic term first.', 'ກະລຸນາສ້າງພາກຮຽນກ່ອນ.') }}
      <NuxtLink to="/admin/settings/academic-terms" class="text-teal-400 hover:underline ml-1">{{ L('Academic terms →', 'ພາກຮຽນ →') }}</NuxtLink>
    </div>

    <div v-else class="glass-panel overflow-hidden">
      <LoadingSpinner v-if="loading" />
      <div v-else-if="rows.length === 0" class="py-16 text-center text-slate-500 text-sm">
        {{ L('No subjects assigned for this term yet.', 'ຍັງບໍ່ມີວິຊາໃນພາກຮຽນນີ້.') }}
      </div>
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="th">{{ $t('common.class') }}</th>
            <th class="th">{{ L('Subject', 'ວິຊາ') }}</th>
            <th class="th">{{ L('Teacher', 'ຄູສອນ') }}</th>
            <th class="th text-right">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-3 text-sm text-white font-medium">{{ className(row.class) }}</td>
            <td class="px-6 py-3 text-sm text-slate-300">
              <span v-if="row.subject.subjectCode" class="font-mono text-slate-500 mr-2">{{ row.subject.subjectCode }}</span>
              {{ locale === 'lo' ? row.subject.subjectNameLo : row.subject.subjectNameEn }}
            </td>
            <td class="px-6 py-3">
              <!-- Changing the teacher saves immediately. -->
              <select :value="row.teacherId ?? 0" class="filter-select !py-1.5" @change="changeTeacher(row, Number(($event.target as HTMLSelectElement).value))">
                <option :value="0">— {{ L('No teacher', 'ບໍ່ມີຄູ') }} —</option>
                <option v-for="t in teachers" :key="t.userId" :value="t.userId">{{ personName(t.user) }}</option>
              </select>
            </td>
            <td class="px-6 py-3">
              <div class="flex justify-end">
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" :title="$t('common.delete')" @click="remove(row)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modal.open = false"/>
        <form class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4" @submit.prevent="create">
          <h2 class="text-xl font-bold text-white">{{ L('Assign Subject', 'ເພີ່ມວິຊາໃຫ້ຫ້ອງ') }}</h2>
          <div v-if="modal.error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ modal.error }}</div>
          <label class="field">
            <span>{{ $t('common.class') }} *</span>
            <select v-model.number="modal.form.classId" required class="modal-input">
              <option :value="0" disabled>—</option>
              <option v-for="c in termClasses" :key="c.classId" :value="c.classId">{{ className(c) }}</option>
            </select>
          </label>
          <label class="field">
            <span>{{ L('Subject', 'ວິຊາ') }} *</span>
            <select v-model.number="modal.form.subjectId" required class="modal-input">
              <option :value="0" disabled>—</option>
              <option v-for="s in subjects" :key="s.subjectId" :value="s.subjectId">
                {{ s.subjectCode ? `${s.subjectCode} · ` : '' }}{{ locale === 'lo' ? s.subjectNameLo : s.subjectNameEn }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>{{ L('Teacher', 'ຄູສອນ') }}</span>
            <select v-model.number="modal.form.teacherId" class="modal-input">
              <option :value="0">— {{ L('Assign later', 'ກຳນົດພາຍຫຼັງ') }} —</option>
              <option v-for="t in teachers" :key="t.userId" :value="t.userId">{{ personName(t.user) }}</option>
            </select>
          </label>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800" @click="modal.open = false">{{ $t('common.cancel') }}</button>
            <button type="submit" :disabled="modal.saving" class="px-5 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white disabled:opacity-60">
              {{ modal.saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { academicsRepository, type AcademicTerm, type ClassSubject } from '../../../infrastructure/api/AcademicsRepository';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Class Subjects — Smart School Admin' });

const { locale } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);

type Named = { fullNameEn: string; fullNameLo: string };
type ClassOption = { classId: number; classNameEn: string; classNameLo: string; academicYear: string };
type SubjectOption = { subjectId: number; subjectCode: string | null; subjectNameEn: string; subjectNameLo: string };
type TeacherOption = { userId: number; user: Named };

const personName = (p?: Named | null) => (p ? (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn : '—');
const className = (c: Pick<ClassOption, 'classNameEn' | 'classNameLo'>) => (locale.value === 'lo' ? c.classNameLo : c.classNameEn) || c.classNameEn;
const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && err.message) || fallback;

const terms = ref<AcademicTerm[]>([]);
const classes = ref<ClassOption[]>([]);
const subjects = ref<SubjectOption[]>([]);
const teachers = ref<TeacherOption[]>([]);
const rows = ref<ClassSubject[]>([]);
const termId = ref(0);
const classFilter = ref(0);
const loading = ref(true);

// Only classes of the selected term's academic year can take its subjects.
const termClasses = computed(() => {
  const year = terms.value.find((t) => t.termId === termId.value)?.academicYear;
  return classes.value.filter((c) => !year || c.academicYear === year);
});

const fetchRows = async () => {
  if (!termId.value) return;
  loading.value = true;
  try {
    rows.value = await academicsRepository.getClassSubjects({ termId: termId.value, classId: classFilter.value || undefined });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const [t, c, s, te] = await Promise.all([
      academicsRepository.getTerms(),
      adminRepository.getClasses({ limit: 500 }),
      academicsRepository.getSubjects({ limit: 500 }),
      adminRepository.getTeachers({ limit: 500 }),
    ]);
    terms.value = t;
    classes.value = c.classes;
    subjects.value = s.subjects.filter((x: SubjectOption & { isActive?: boolean }) => x.isActive !== false);
    teachers.value = te.teachers.filter((x: TeacherOption & { user: { isActive?: boolean } }) => x.user?.isActive !== false);
    termId.value = (t.find((x) => x.status === 'active') ?? t[0])?.termId ?? 0;
  } finally {
    loading.value = false;
  }
  await fetchRows();
});

const modal = reactive({ open: false, saving: false, error: '', form: { classId: 0, subjectId: 0, teacherId: 0 } });

const openModal = () => {
  modal.form = { classId: classFilter.value, subjectId: 0, teacherId: 0 };
  modal.error = '';
  modal.open = true;
};

const create = async () => {
  modal.saving = true;
  modal.error = '';
  try {
    await academicsRepository.createClassSubject({
      classId: modal.form.classId,
      subjectId: modal.form.subjectId,
      termId: termId.value,
      teacherId: modal.form.teacherId || null,
    });
    modal.open = false;
    await fetchRows();
  } catch (err) {
    modal.error = errorMessage(err, 'Failed to assign subject');
  } finally {
    modal.saving = false;
  }
};

const changeTeacher = async (row: ClassSubject, teacherId: number) => {
  try {
    const updated = await academicsRepository.setClassSubjectTeacher(row.id, teacherId || null);
    Object.assign(row, updated);
  } catch (err) {
    alert(errorMessage(err, 'Failed to change teacher'));
    await fetchRows();
  }
};

const remove = async (row: ClassSubject) => {
  const name = locale.value === 'lo' ? row.subject.subjectNameLo : row.subject.subjectNameEn;
  if (!confirm(L(`Remove ${name} from ${className(row.class)}?`, `ເອົາ ${name} ອອກຈາກ ${className(row.class)}?`))) return;
  try {
    await academicsRepository.deleteClassSubject(row.id);
    rows.value = rows.value.filter((r) => r.id !== row.id);
  } catch (err) {
    alert(errorMessage(err, 'Failed to remove'));
  }
};
</script>

<style scoped lang="postcss">
.th {
  @apply text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3;
}
.field {
  @apply flex flex-col gap-1.5;
}
.field > span {
  @apply text-xs font-semibold text-slate-400 uppercase tracking-wider;
}
.filter-select {
  @apply px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-teal-500;
}
.modal-input {
  @apply w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-teal-500 transition-all;
}
</style>
