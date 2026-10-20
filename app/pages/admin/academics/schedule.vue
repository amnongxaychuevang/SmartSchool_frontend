<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="$t('schedule_admin.search_placeholder')" class="search-bar">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="searchInput = ''">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <!-- Term Dropdown Menu -->
        <div class="relative z-50">
          <button
            :class="[
              'relative h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between min-w-[200px] transition-colors',
              !termId
                ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600'
                : 'bg-teal-500/20 border-teal-500/50 text-teal-400'
            ]"
            @click="termDropdownOpen = !termDropdownOpen">
            <span>{{ termId && selectedTerm ? (selectedTerm.academicYear + ' · ' + (locale === 'lo' ? selectedTerm.termNameLo : selectedTerm.termNameEn) + (selectedTerm.status === 'active' ? ' ●' : '')) : $t('schedule_admin.select_term') }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform ml-2 shrink-0" :class="[termDropdownOpen ? 'rotate-180' : '', !termId ? 'text-slate-400' : 'text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="termDropdownOpen" class="absolute left-0 top-full mt-2 w-max min-w-full glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50">
              <button
                v-for="t in terms"
                :key="t.termId"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg whitespace-nowrap"
                :class="termId === t.termId ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="termId = t.termId; onTermChange(); termDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="termId === t.termId ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ t.academicYear }} · {{ locale === 'lo' ? t.termNameLo : t.termNameEn }}{{ t.status === 'active' ? ' ●' : '' }}
              </button>
            </div>
          </Transition>
        </div>
        <div v-if="termDropdownOpen" class="fixed inset-0 z-40" @click="termDropdownOpen = false"/>

        <!-- Class Dropdown Menu -->
        <div class="relative z-50">
          <button
            :class="[
              'relative h-9 px-3 border rounded-lg text-sm focus:outline-none flex items-center justify-between min-w-[140px] transition-colors',
              !classId
                ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600'
                : 'bg-teal-500/20 border-teal-500/50 text-teal-400'
            ]"
            @click="classDropdownOpen = !classDropdownOpen">
            <span>{{ classId ? nameOf(termClasses.find(c => c.classId === classId) || {}, 'className') : $t('schedule_admin.select_class') }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform ml-2 shrink-0" :class="[classDropdownOpen ? 'rotate-180' : '', !classId ? 'text-slate-400' : 'text-teal-400']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <Transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-out" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
            <div v-if="classDropdownOpen" class="absolute left-0 top-full mt-2 w-max min-w-full glass-panel !p-1 border border-slate-700 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden z-50 max-h-[300px] overflow-y-auto custom-scrollbar">
              <button
                v-for="c in termClasses"
                :key="c.classId"
                class="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 rounded-lg whitespace-nowrap"
                :class="classId === c.classId ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'"
                @click="classId = c.classId; load(); classDropdownOpen = false">
                <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="classId === c.classId ? 'bg-teal-500' : 'bg-transparent'"/>
                {{ nameOf(c, 'className') }}
              </button>
              <div v-if="termClasses.length === 0" class="px-4 py-3 text-sm text-slate-500 text-center whitespace-nowrap">
                {{ $t('schedule_admin.no_classes') }}
              </div>
            </div>
          </Transition>
        </div>
        <div v-if="classDropdownOpen" class="fixed inset-0 z-40" @click="classDropdownOpen = false"/>
        <button :disabled="!classId || classSubjects.length === 0" class="ml-auto h-9 px-3.5 bg-teal-500 hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:shadow-none" @click="openModal()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('schedule_admin.add_slot') }}
        </button>
      </div>
    </div>

    <div v-if="classId && !loading && classSubjects.length === 0" class="glass-panel p-6 text-sm text-slate-400">
      {{ $t('schedule_admin.no_subjects_yet') }}
      <NuxtLink to="/admin/academics/class-subjects" class="text-teal-400 hover:underline ml-1">{{ $t('schedule_admin.assign_subjects') }}</NuxtLink>
    </div>

    <LoadingSpinner v-if="loading" />
    <div v-else-if="classId" class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
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
          <p class="text-xs text-slate-500">{{ s.teacher ? nameOf(s.teacher, 'fullName') : $t('schedule_admin.no_teacher') }}<span v-if="s.roomNumber"> · {{ s.roomNumber }}</span></p>
        </button>
        <p v-if="slotsByDay(day).length === 0" class="text-xs text-slate-600 italic">—</p>
      </div>
    </div>

    <ScheduleSlotModal :open="modal.open" :slot-data="modal.slotData" :class-subjects="classSubjects" @update:open="modal.open = $event" @saved="load" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import ScheduleSlotModal from '../../../components/admin/ScheduleSlotModal.vue';
import { academicsRepository, type AcademicTerm, type ClassSubject, type ScheduleSlot } from '../../../infrastructure/api/AcademicsRepository';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Timetable — Smart School Admin' });

const { locale, t } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);

// Monday–Friday (dayOfWeek: 0 = Sunday).
const WEEK_DAYS = [1, 2, 3, 4, 5];
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
const termDropdownOpen = ref(false);
const classDropdownOpen = ref(false);

const searchInput = ref('');
const searchLower = computed(() => searchInput.value.trim().toLowerCase());

const selectedTerm = computed(() => terms.value.find(t => t.termId === termId.value));
const termClasses = computed(() => {
  const year = terms.value.find((t) => t.termId === termId.value)?.academicYear;
  return classes.value.filter((c) => !year || c.academicYear === year);
});
const slotsByDay = (day: number) => slots.value.filter((s) => {
  if (s.dayOfWeek !== day) return false;
  if (!searchLower.value) return true;
  const q = searchLower.value;
  return nameOf(s.subject, 'subjectName').toLowerCase().includes(q) ||
         (s.teacher && nameOf(s.teacher, 'fullName').toLowerCase().includes(q)) ||
         (s.roomNumber && s.roomNumber.toLowerCase().includes(q));
});

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
    const [t, c] = await Promise.all([academicsRepository.getTerms(), adminRepository.getAllClasses()]);
    terms.value = t;
    classes.value = c;
    termId.value = (t.find((x) => x.status === 'active') ?? t[0])?.termId ?? 0;
  } finally {
    loading.value = false;
  }
});

const modal = reactive({
  open: false,
  slotData: null as ScheduleSlot | null,
});

const openModal = (slot?: ScheduleSlot) => {
  modal.slotData = slot ?? null;
  modal.open = true;
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
</style>
