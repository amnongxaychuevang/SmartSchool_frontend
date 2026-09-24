<template>
  <div class="relative w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12">
    <!-- Ambient Background Glow -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

    <!-- Header -->
    <div class="flex items-center gap-5">
      <NuxtLink
        to="/admin/students"
        class="group flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-teal-500/50 transition-all duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </NuxtLink>
      <h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
        {{ isEdit ? $t('students.edit_student') : $t('students.add_student') }}
      </h1>
    </div>

    <transition name="fade">
      <div v-if="errorMsg" class="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">{{ errorMsg }}</div>
    </transition>

    <LoadingSpinner v-if="loading" />

    <form v-else class="relative group" @submit.prevent="handleSubmit">
      <div class="gradient-border absolute -inset-[1px] bg-gradient-to-b from-slate-700/80 to-slate-800/20 rounded-[2rem] z-0 opacity-50 group-hover:from-teal-500/30 transition-all duration-500" />
      <div class="relative glass-panel create-panel p-8 sm:p-10 rounded-[2rem] z-10 shadow-2xl flex flex-col gap-10">

        <!-- Basic -->
        <section class="form-section">
          <h3 class="section-title"><span class="dot bg-teal-400" />{{ L('Enrolment', 'ການລົງທະບຽນ') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label class="input-group">
              <span>{{ $t('students.student_code') }} <b class="text-teal-400">*</b></span>
              <input v-model="form.studentCode" required maxlength="20" class="input-field font-mono" :placeholder="$t('forms.ph_student_code')" >
            </label>
            <label class="input-group">
              <span>{{ $t('common.status') }}</span>
              <select v-model="form.status" class="input-field">
                <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ statusLabel(s) }}</option>
              </select>
            </label>
            <label class="input-group">
              <span>{{ $t('common.class') }} ({{ currentYear }})</span>
              <select v-model.number="form.classId" class="input-field">
                <option :value="0">— {{ L('No class', 'ບໍ່ມີຫ້ອງ') }} —</option>
                <option v-for="c in currentClasses" :key="c.classId" :value="c.classId">{{ locale === 'lo' ? c.classNameLo : c.classNameEn }}</option>
              </select>
            </label>
          </div>
        </section>

        <!-- Personal -->
        <section class="form-section">
          <h3 class="section-title"><span class="dot bg-purple-400" />{{ L('Personal details', 'ຂໍ້ມູນສ່ວນຕົວ') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="input-group">
              <span>{{ $t('students.full_name_lo') }} <b class="text-teal-400">*</b></span>
              <input v-model="form.fullNameLo" required maxlength="150" class="input-field" :placeholder="$t('forms.ph_full_name_lo')" >
            </label>
            <label class="input-group">
              <span>{{ $t('students.full_name_en') }} <b class="text-teal-400">*</b></span>
              <input v-model="form.fullNameEn" required maxlength="150" class="input-field" :placeholder="$t('forms.ph_full_name_en')" >
            </label>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <label class="input-group">
              <span>{{ $t('common.gender') }}</span>
              <select v-model="form.gender" class="input-field">
                <option value="">—</option>
                <option v-for="g in GENDERS" :key="g" :value="g">{{ $t(`gender.${g}`) }}</option>
              </select>
            </label>
            <label class="input-group">
              <span>{{ L('Date of birth', 'ວັນເດືອນປີເກີດ') }}</span>
              <input v-model="form.dateOfBirth" type="date" class="input-field" >
            </label>
            <label class="input-group">
              <span>{{ L('Ethnicity', 'ຊົນເຜົ່າ') }}</span>
              <input v-model="form.ethnicity" maxlength="50" class="input-field" :placeholder="$t('forms.ph_ethnicity')" >
            </label>
            <label class="input-group">
              <span>{{ L('Blood type', 'ກຸ່ມເລືອດ') }}</span>
              <select v-model="form.bloodType" class="input-field">
                <option value="">—</option>
                <option v-for="b in BLOOD_TYPES" :key="b" :value="b">{{ b }}</option>
              </select>
            </label>
          </div>
          <label class="input-group">
            <span>{{ L('Place of birth', 'ບ່ອນເກີດ') }}</span>
            <input v-model="form.birthPlace" maxlength="150" class="input-field" >
          </label>
        </section>

        <!-- Address -->
        <section class="form-section">
          <h3 class="section-title"><span class="dot bg-blue-400" />{{ $t('common.address') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label class="input-group"><span>{{ L('Village', 'ບ້ານ') }}</span><input v-model="form.village" maxlength="100" class="input-field" ></label>
            <label class="input-group"><span>{{ L('District', 'ເມືອງ') }}</span><input v-model="form.district" maxlength="100" class="input-field" ></label>
            <label class="input-group"><span>{{ L('Province', 'ແຂວງ') }}</span><input v-model="form.province" maxlength="100" class="input-field" ></label>
          </div>
          <label class="input-group">
            <span>{{ L('House no. / details', 'ເລກເຮືອນ / ລາຍລະອຽດ') }}</span>
            <input v-model="form.address" class="input-field" >
          </label>
        </section>

        <!-- Background & health -->
        <section class="form-section">
          <h3 class="section-title"><span class="dot bg-amber-400" />{{ L('Background & health', 'ປະຫວັດ ແລະ ສຸຂະພາບ') }}</h3>
          <label class="input-group">
            <span>{{ L('Previous school', 'ໂຮງຮຽນເກົ່າ') }}</span>
            <input v-model="form.previousSchool" maxlength="150" class="input-field" >
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="input-group">
              <span>{{ L('Allergies / medical conditions', 'ການແພ້ / ພະຍາດປະຈຳຕົວ') }}</span>
              <textarea v-model="form.medicalNotes" rows="3" class="input-field resize-none" />
            </label>
            <label class="input-group">
              <span>{{ $t('common.notes') }}</span>
              <textarea v-model="form.notes" rows="3" class="input-field resize-none" />
            </label>
          </div>
        </section>

        <!-- Parents -->
        <section class="form-section">
          <h3 class="section-title"><span class="dot bg-pink-400" />{{ $t('nav.parents') }}</h3>

          <div class="relative">
            <input
              v-model="parentSearch"
              class="input-field"
              :placeholder="L('Search parent by name or phone…', 'ຄົ້ນຫາຜູ້ປົກຄອງດ້ວຍຊື່ ຫຼື ເບີໂທ…')"
              @input="searchParents"
            >
            <div v-if="parentResults.length > 0" class="absolute z-20 mt-2 w-full glass-panel !p-1 border border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              <button
                v-for="p in parentResults"
                :key="p.userId"
                type="button"
                class="w-full text-left px-4 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-700/50 flex justify-between gap-3"
                @click="addParent(p)"
              >
                <span>{{ personName(p.user) }}</span>
                <span class="text-slate-500">{{ p.user.phoneNumber || p.user.email || '' }}</span>
              </button>
            </div>
          </div>

          <p v-if="form.parents.length === 0" class="text-sm text-slate-500">{{ L('No parents linked yet.', 'ຍັງບໍ່ໄດ້ເຊື່ອມຜູ້ປົກຄອງ.') }}</p>
          <div v-for="(p, i) in form.parents" :key="p.parentUserId" class="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <span class="flex-1 min-w-[10rem] text-sm font-medium text-white">{{ p.name }}</span>
            <select v-model="p.relationship" class="input-field !w-auto !py-2">
              <option v-for="r in RELATIONSHIPS" :key="r" :value="r">{{ relationshipLabel(r) }}</option>
            </select>
            <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="radio" name="primaryContact" :checked="p.isPrimaryContact" class="accent-teal-500" @change="setPrimary(i)" >
              {{ L('Primary contact', 'ຜູ້ຕິດຕໍ່ຫຼັກ') }}
            </label>
            <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10" :title="$t('common.delete')" @click="removeParent(i)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </section>

        <!-- Actions -->
        <div class="pt-8 border-t border-slate-800/60 flex items-center justify-end gap-5">
          <NuxtLink to="/admin/students" class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cancel-btn">
            {{ $t('common.cancel') }}
          </NuxtLink>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-8 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_8px_30px_rgba(20,184,166,0.5)] transition-all disabled:opacity-70"
          >
            {{ isSubmitting ? $t('common.saving') : $t('common.save') }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { GENDERS } from '../../../domain/models/Gender';
import type { Student } from '../../../domain/models/Student';
import { useAdminStore } from '../../../application/stores/admin';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import { academicsRepository } from '../../../infrastructure/api/AcademicsRepository';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const { locale, t } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);

const editId = computed(() => (route.query.id ? Number(route.query.id) : null));
const isEdit = computed(() => editId.value !== null);
useHead({ title: computed(() => `${isEdit.value ? t('students.edit_student') : t('students.add_student')} — Smart School Admin`) });

const STATUS_OPTIONS: Student['status'][] = ['active', 'inactive', 'graduated', 'transferred'];
const statusLabel = (s: string) =>
  ({ active: t('common.active'), inactive: t('common.inactive'), graduated: t('students.graduated'), transferred: t('students.transferred') })[s] ?? s;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONSHIPS = ['father', 'mother', 'guardian', 'grandparent', 'sibling', 'uncle_aunt', 'other'] as const;
type Relationship = (typeof RELATIONSHIPS)[number];
const relationshipLabel = (r: Relationship) => t(`relationship.${r}`);

type Named = { fullNameEn: string; fullNameLo: string; phoneNumber?: string | null; email?: string | null };
const personName = (p: Named) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;

type ParentLink = { parentUserId: number; name: string; relationship: Relationship; isPrimaryContact: boolean };

const form = reactive({
  studentCode: '',
  status: 'active' as Student['status'],
  classId: 0,
  fullNameEn: '',
  fullNameLo: '',
  gender: '',
  dateOfBirth: '',
  ethnicity: '',
  bloodType: '',
  birthPlace: '',
  village: '',
  district: '',
  province: '',
  address: '',
  previousSchool: '',
  medicalNotes: '',
  notes: '',
  parents: [] as ParentLink[],
});

const loading = ref(true);
const isSubmitting = ref(false);
const errorMsg = ref('');

// ── Classes of the current academic year ──
type ClassOption = { classId: number; classNameEn: string; classNameLo: string; academicYear: string };
const classes = ref<ClassOption[]>([]);
const currentYear = ref('');
const currentClasses = computed(() => classes.value.filter((c) => c.academicYear === currentYear.value));

// Same rule as the backend: the active term's year, else September-based.
const calendarAcademicYear = () => {
  const d = new Date();
  const start = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}-${start + 1}`;
};

onMounted(async () => {
  try {
    const [c, terms] = await Promise.all([adminRepository.getClasses({ limit: 500 }), academicsRepository.getTerms()]);
    classes.value = c.classes;
    currentYear.value = terms.find((x) => x.status === 'active')?.academicYear ?? calendarAcademicYear();
    if (editId.value) await loadStudent(editId.value);
  } catch (err) {
    errorMsg.value = errorMessage(err, 'Failed to load');
  } finally {
    loading.value = false;
  }
});

const loadStudent = async (id: number) => {
  const s = await adminRepository.getStudent(id);
  Object.assign(form, {
    studentCode: s.studentCode,
    status: s.status,
    classId: s.classStudents?.[0]?.class?.classId ?? 0,
    fullNameEn: s.fullNameEn,
    fullNameLo: s.fullNameLo,
    gender: s.gender ?? '',
    dateOfBirth: s.dateOfBirth ? s.dateOfBirth.slice(0, 10) : '',
    ethnicity: s.ethnicity ?? '',
    bloodType: s.bloodType ?? '',
    birthPlace: s.birthPlace ?? '',
    village: s.village ?? '',
    district: s.district ?? '',
    province: s.province ?? '',
    address: s.address ?? '',
    previousSchool: s.previousSchool ?? '',
    medicalNotes: s.medicalNotes ?? '',
    notes: s.notes ?? '',
    parents: (s.parentStudents ?? []).map((ps) => ({
      parentUserId: ps.parentUserId,
      name: personName(ps.parent),
      relationship: ps.relationship as Relationship,
      isPrimaryContact: ps.isPrimaryContact,
    })),
  });
};

// ── Parent search ──
type ParentResult = { userId: number; user: Named };
const parentSearch = ref('');
const parentResults = ref<ParentResult[]>([]);
let searchTimer: ReturnType<typeof setTimeout>;

const searchParents = () => {
  clearTimeout(searchTimer);
  const q = parentSearch.value.trim();
  if (q.length < 2) {
    parentResults.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    const res = await adminRepository.getParents({ search: q, limit: 10 });
    const linked = new Set(form.parents.map((p) => p.parentUserId));
    parentResults.value = res.parents.filter((p: ParentResult) => !linked.has(p.userId));
  }, 300);
};

const addParent = (p: ParentResult) => {
  form.parents.push({
    parentUserId: p.userId,
    name: personName(p.user),
    relationship: 'guardian',
    isPrimaryContact: form.parents.length === 0, // the first parent is primary by default
  });
  parentSearch.value = '';
  parentResults.value = [];
};

const setPrimary = (index: number) => form.parents.forEach((p, i) => (p.isPrimaryContact = i === index));

const removeParent = (index: number) => {
  const [removed] = form.parents.splice(index, 1);
  const first = form.parents[0];
  if (removed?.isPrimaryContact && first) first.isPrimaryContact = true;
};

// ── Save ──
const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && err.message) || fallback;

const OPTIONAL_TEXT = ['gender', 'dateOfBirth', 'ethnicity', 'bloodType', 'birthPlace', 'village', 'district',
  'province', 'address', 'previousSchool', 'medicalNotes', 'notes'] as const;

const handleSubmit = async () => {
  errorMsg.value = '';
  isSubmitting.value = true;
  try {
    const { parents, classId, ...fields } = form;
    // Empty inputs mean "not set" (an empty date or blood type would fail validation).
    const optional = new Set<string>(OPTIONAL_TEXT);
    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries({ ...fields, classId: classId || null }).filter(([k, v]) => !(optional.has(k) && v === '')),
    );
    payload.parents = parents.map(({ parentUserId, relationship, isPrimaryContact }) => ({ parentUserId, relationship, isPrimaryContact }));

    if (editId.value) await adminStore.updateStudent(editId.value, payload);
    else await adminStore.createStudent(payload);
    router.push('/admin/students');
  } catch (err) {
    errorMsg.value = errorMessage(err, L('Failed to save student. Please try again.', 'ບັນທຶກບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.'));
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="postcss">

:global(html.light) .gradient-border {
  display: none !important;
}
:global(html.light) 

:global(html.light) h1.text-transparent {
  background-image: linear-gradient(to right, #0f172a, #475569) !important;
  -webkit-background-clip: text !important;
  color: transparent !important;
}
:global(html.light) .section-title,
:global(html.light) .text-white {
  color: #0f172a !important;
}
:global(html.light) .cancel-btn {
  color: #475569 !important;
}

.form-section {
  @apply flex flex-col gap-6;
}
.section-title {
  @apply flex items-center gap-3 pb-4 border-b border-slate-800/60 text-lg font-semibold text-white tracking-wide;
}
.dot {
  @apply w-2.5 h-2.5 rounded-full;
}
.input-group {
  @apply flex flex-col gap-2.5;
}
.input-group > span {
  @apply text-sm font-semibold text-slate-300 ml-1 tracking-wide;
}

</style>
