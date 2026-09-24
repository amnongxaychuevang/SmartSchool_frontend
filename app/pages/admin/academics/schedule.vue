<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">{{ L('Timetable', 'ຕາຕະລາງຮຽນ') }}</h1>
        <p class="text-sm text-slate-400 mt-1">
          {{ L('Weekly slots per class. Clashes for the same class, teacher or room are refused.', 'ຊົ່ວໂມງຮຽນປະຈຳອາທິດຂອງແຕ່ລະຫ້ອງ. ລະບົບບໍ່ຍອມໃຫ້ເວລາຊ້ອນກັນ ສຳລັບຫ້ອງ, ຄູ ຫຼື ຫ້ອງຮຽນດຽວກັນ.') }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <select v-model.number="termId" class="filter-select" @change="onTermChange">
          <option v-for="t in terms" :key="t.termId" :value="t.termId">
            {{ t.academicYear }} · {{ locale === 'lo' ? t.termNameLo : t.termNameEn }}{{ t.status === 'active' ? ' ●' : '' }}
          </option>
        </select>
        <select v-model.number="classId" class="filter-select" @change="load">
          <option :value="0" disabled>{{ L('Select a class', 'ເລືອກຫ້ອງ') }}</option>
          <option v-for="c in termClasses" :key="c.classId" :value="c.classId">{{ nameOf(c, 'className') }}</option>
        </select>
        <button :disabled="!classId || classSubjects.length === 0" class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50" @click="openModal()">
          + {{ L('Add slot', 'ເພີ່ມຊົ່ວໂມງ') }}
        </button>
      </div>
    </div>

    <div v-if="classId && !loading && classSubjects.length === 0" class="glass-panel p-6 text-sm text-slate-400">
      {{ L('This class has no subjects for the term yet.', 'ຫ້ອງນີ້ຍັງບໍ່ມີວິຊາໃນພາກຮຽນນີ້.') }}
      <NuxtLink to="/admin/academics/class-subjects" class="text-teal-400 hover:underline ml-1">{{ L('Assign subjects →', 'ເພີ່ມວິຊາ →') }}</NuxtLink>
    </div>

    <LoadingSpinner v-if="loading" />
    <div v-else-if="classId" class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <div v-for="day in WEEK_DAYS" :key="day" class="glass-panel p-4 flex flex-col gap-3 min-h-[10rem]">
        <h3 class="text-sm font-semibold text-slate-300 uppercase tracking-wider">{{ dayName(day) }}</h3>
        <button
          v-for="s in slotsByDay(day)"
          :key="s.scheduleId"
          type="button"
          class="text-left p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-teal-500/50 transition-colors"
          @click="openModal(s)"
        >
          <p class="text-xs font-mono text-teal-400">{{ hhmm(s.startTime) }}–{{ hhmm(s.endTime) }}</p>
          <p class="text-sm font-medium text-white">{{ nameOf(s.subject, 'subjectName') }}</p>
          <p class="text-xs text-slate-500">{{ s.teacher ? nameOf(s.teacher, 'fullName') : L('No teacher', 'ບໍ່ມີຄູ') }}<span v-if="s.roomNumber"> · {{ s.roomNumber }}</span></p>
        </button>
        <p v-if="slotsByDay(day).length === 0" class="text-xs text-slate-600 italic">—</p>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modal.open = false"/>
        <form class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4" @submit.prevent="save">
          <h2 class="text-xl font-bold text-white">{{ modal.scheduleId ? L('Edit slot', 'ແກ້ໄຂຊົ່ວໂມງ') : L('Add slot', 'ເພີ່ມຊົ່ວໂມງ') }}</h2>
          <div v-if="modal.error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ modal.error }}</div>
          <label class="field">
            <span>{{ L('Subject', 'ວິຊາ') }} *</span>
            <select v-model.number="modal.form.classSubjectId" required class="modal-input">
              <option :value="0" disabled>—</option>
              <option v-for="cs in classSubjects" :key="cs.id" :value="cs.id">
                {{ nameOf(cs.subject, 'subjectName') }}{{ cs.teacher ? ` — ${nameOf(cs.teacher, 'fullName')}` : '' }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>{{ L('Day', 'ວັນ') }} *</span>
            <select v-model.number="modal.form.dayOfWeek" class="modal-input">
              <option v-for="d in WEEK_DAYS" :key="d" :value="d">{{ dayName(d) }}</option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>{{ L('Start', 'ເລີ່ມ') }} *</span><input v-model="modal.form.startTime" required type="time" class="modal-input" ></label>
            <label class="field"><span>{{ L('End', 'ເລີກ') }} *</span><input v-model="modal.form.endTime" required type="time" class="modal-input" ></label>
          </div>
          <label class="field">
            <span>{{ L('Room', 'ຫ້ອງຮຽນ') }}</span>
            <input v-model="modal.form.roomNumber" maxlength="50" class="modal-input" placeholder="101" >
          </label>
          <div class="flex items-center gap-3 pt-2">
            <button v-if="modal.scheduleId" type="button" class="px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10" @click="remove">{{ $t('common.delete') }}</button>
            <span class="flex-1" />
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
import { academicsRepository, type AcademicTerm, type ClassSubject, type ScheduleSlot } from '../../../infrastructure/api/AcademicsRepository';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Timetable — Smart School Admin' });

const { locale } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);

// Monday–Saturday (dayOfWeek: 0 = Sunday).
const WEEK_DAYS = [1, 2, 3, 4, 5, 6];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_LO = ['ອາທິດ', 'ຈັນ', 'ອັງຄານ', 'ພຸດ', 'ພະຫັດ', 'ສຸກ', 'ເສົາ'];
const dayName = (d: number) => (locale.value === 'lo' ? DAYS_LO[d] : DAYS_EN[d]) ?? String(d);

// Bilingual name picker: nameOf(x, 'subjectName') → x.subjectNameLo / x.subjectNameEn.
const nameOf = (obj: object, base: string) => {
  const o = obj as Record<string, string | undefined>;
  return (locale.value === 'lo' ? o[`${base}Lo`] : o[`${base}En`]) || o[`${base}En`] || '';
};
// A TIME value arrives as "1970-01-01THH:MM:00.000Z".
const hhmm = (iso: string) => iso.slice(11, 16);
const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && err.message) || fallback;

type ClassOption = { classId: number; classNameEn: string; classNameLo: string; academicYear: string };
const terms = ref<AcademicTerm[]>([]);
const classes = ref<ClassOption[]>([]);
const termId = ref(0);
const classId = ref(0);
const classSubjects = ref<ClassSubject[]>([]);
const slots = ref<ScheduleSlot[]>([]);
const loading = ref(true);

const termClasses = computed(() => {
  const year = terms.value.find((t) => t.termId === termId.value)?.academicYear;
  return classes.value.filter((c) => !year || c.academicYear === year);
});
const slotsByDay = (day: number) => slots.value.filter((s) => s.dayOfWeek === day);

const load = async () => {
  if (!classId.value || !termId.value) return;
  loading.value = true;
  try {
    [classSubjects.value, slots.value] = await Promise.all([
      academicsRepository.getClassSubjects({ classId: classId.value, termId: termId.value }),
      academicsRepository.getSchedules({ classId: classId.value, termId: termId.value }),
    ]);
  } finally {
    loading.value = false;
  }
};

const onTermChange = () => {
  if (!termClasses.value.some((c) => c.classId === classId.value)) {
    classId.value = 0;
    slots.value = [];
    classSubjects.value = [];
  }
  load();
};

onMounted(async () => {
  try {
    const [t, c] = await Promise.all([academicsRepository.getTerms(), adminRepository.getClasses({ limit: 500 })]);
    terms.value = t;
    classes.value = c.classes;
    termId.value = (t.find((x) => x.status === 'active') ?? t[0])?.termId ?? 0;
  } finally {
    loading.value = false;
  }
});

const modal = reactive({
  open: false,
  saving: false,
  error: '',
  scheduleId: null as number | null,
  form: { classSubjectId: 0, dayOfWeek: 1, startTime: '08:00', endTime: '09:00', roomNumber: '' },
});

const openModal = (slot?: ScheduleSlot) => {
  modal.scheduleId = slot?.scheduleId ?? null;
  modal.form = slot
    ? { classSubjectId: slot.classSubjectId, dayOfWeek: slot.dayOfWeek, startTime: hhmm(slot.startTime), endTime: hhmm(slot.endTime), roomNumber: slot.roomNumber ?? '' }
    : { classSubjectId: 0, dayOfWeek: 1, startTime: '08:00', endTime: '09:00', roomNumber: '' };
  modal.error = '';
  modal.open = true;
};

const save = async () => {
  modal.saving = true;
  modal.error = '';
  try {
    await academicsRepository.saveSchedule(modal.scheduleId, { ...modal.form, roomNumber: modal.form.roomNumber || null });
    modal.open = false;
    await load();
  } catch (err) {
    // e.g. "Time clash for this teacher: Maths (10A) 08:00–09:00"
    modal.error = errorMessage(err, 'Failed to save');
  } finally {
    modal.saving = false;
  }
};

const remove = async () => {
  if (!modal.scheduleId || !confirm(L('Delete this slot?', 'ລຶບຊົ່ວໂມງນີ້?'))) return;
  try {
    await academicsRepository.deleteSchedule(modal.scheduleId);
    modal.open = false;
    await load();
  } catch (err) {
    modal.error = errorMessage(err, 'Failed to delete');
  }
};
</script>

<style scoped lang="postcss">
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
