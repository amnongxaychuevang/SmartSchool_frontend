<template>
  <div class="w-full flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin/teachers" class="btn-secondary !px-0 w-9" :aria-label="$t('common.back')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </NuxtLink>
      <h1 class="text-xl font-bold text-ink leading-tight">{{ isEdit ? $t('teachers.edit_teacher') : $t('teachers.add_teacher') }}</h1>
    </div>

    <p v-if="errorMsg" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ errorMsg }}</p>

    <LoadingSpinner v-if="loading" />

    <form v-else class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start" @submit.prevent="handleSubmit">
      <!-- ── Main column ── -->
      <div class="flex flex-col gap-4">
        <!-- Personal -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </span>{{ L('Personal details', 'ຂໍ້ມູນສ່ວນຕົວ') }}</h2>
          <div class="card-body grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('users.full_name_lo') }} <b class="text-danger">*</b></span>
              <input v-model="form.fullNameLo" required maxlength="150" class="input-field" :placeholder="$t('forms.ph_full_name_lo')">
            </label>
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('users.full_name_en') }} <b class="text-danger">*</b></span>
              <input v-model="form.fullNameEn" required maxlength="150" class="input-field" :placeholder="$t('forms.ph_full_name_en')">
            </label>
            <label class="field xl:col-span-2">
              <span class="field-label">{{ $t('common.gender') }}</span>
              <select v-model="form.gender" class="input-field">
                <option value="">{{ L('Please select a gender', 'ກະລຸນາເລືອກເພດ') }}</option>
                <option v-for="g in GENDERS" :key="g" :value="g">{{ $t(`gender.${g}`) }}</option>
              </select>
            </label>
            <label class="field xl:col-span-3">
              <span class="field-label">{{ $t('users.phone') }}</span>
              <PhoneInput v-model="form.phoneNumber" />
            </label>
            <label class="field xl:col-span-3">
              <span class="field-label">{{ $t('users.email') }}</span>
              <input v-model="form.email" type="email" maxlength="150" autocomplete="off" class="input-field" :placeholder="$t('forms.ph_email')">
            </label>
          </div>
        </section>

        <!-- Address (same fields as the student form) -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </span>{{ $t('common.address') }}</h2>
          <div class="card-body grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <label class="field">
              <span class="field-label">{{ L('Province', 'ແຂວງ') }}</span>
              <select v-model.number="form.provinceId" class="input-field" @change="form.districtId = 0">
                <option :value="0">{{ L('Please select a province', 'ກະລຸນາເລືອກແຂວງ') }}</option>
                <option v-for="p in provinces" :key="p.provinceId" :value="p.provinceId">{{ placeName(p) }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">{{ L('District', 'ເມືອງ') }}</span>
              <select v-model.number="form.districtId" class="input-field" :disabled="!form.provinceId">
                <option :value="0">{{ form.provinceId ? L('Please select a district', 'ກະລຸນາເລືອກເມືອງ') : L('Please select a province first', 'ກະລຸນາເລືອກແຂວງກ່ອນ') }}</option>
                <option v-for="d in districtsOf(form.provinceId)" :key="d.districtId" :value="d.districtId">{{ placeName(d) }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">{{ L('Village', 'ບ້ານ') }}</span>
              <input v-model="form.village" maxlength="100" class="input-field">
            </label>
            <label class="field">
              <span class="field-label">{{ L('House no. / details', 'ເລກເຮືອນ / ລາຍລະອຽດ') }}</span>
              <input v-model="form.address" maxlength="100" class="input-field">
            </label>
          </div>
        </section>

        <!-- Employment -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </span>{{ L('Employment', 'ຂໍ້ມູນການເຮັດວຽກ') }}</h2>
          <div class="card-body grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <label class="field">
              <span class="field-label">{{ $t('teachers.specialization') }}</span>
              <input v-model="form.specialization" maxlength="100" class="input-field" :placeholder="$t('forms.ph_specialization')">
            </label>
            <label class="field">
              <span class="field-label">{{ $t('teachers.qualification') }}</span>
              <input v-model="form.qualification" maxlength="150" class="input-field" :placeholder="$t('forms.ph_qualification')">
            </label>
            <label class="field">
              <span class="field-label">{{ $t('teachers.hire_date') }}</span>
              <input v-model="form.hireDate" type="date" class="input-field">
            </label>
            <label class="field">
              <span class="field-label">{{ $t('teachers.salary') }} <span class="text-ink-subtle font-normal">(₭)</span></span>
              <input v-model="form.salary" type="number" min="0" step="1000" inputmode="numeric" class="input-field tnum" placeholder="0">
            </label>
            <label class="field sm:col-span-2 xl:col-span-4">
              <span class="field-label">{{ $t('common.notes') }}</span>
              <textarea v-model="form.notes" rows="1" class="input-field resize-y" />
            </label>
          </div>
        </section>

        <!-- Bank account (salary transfer) -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </span>{{ L('Bank account', 'ບັນຊີທະນາຄານ') }}
          <span class="font-normal text-xs text-ink-subtle">· {{ L('for salary transfer', 'ສຳລັບໂອນເງິນເດືອນ') }}</span></h2>
          <div class="card-body grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label class="field">
              <span class="field-label">{{ L('Bank', 'ທະນາຄານ') }}</span>
              <input v-model="form.bankName" maxlength="100" class="input-field" :placeholder="L('e.g. BCEL', 'ເຊັ່ນ: BCEL')">
            </label>
            <label class="field">
              <span class="field-label">{{ L('Account name', 'ຊື່ບັນຊີ') }}</span>
              <input v-model="form.bankAccountName" maxlength="150" autocomplete="off" class="input-field" :placeholder="L('As printed on the bank book', 'ຕາມຊື່ໃນປຶ້ມບັນຊີ')">
            </label>
            <label class="field">
              <span class="field-label">{{ L('Account number', 'ເລກບັນຊີ') }}</span>
              <input
                v-model="form.bankAccountNumber"
                inputmode="numeric"
                maxlength="40"
                pattern="[0-9\s\-]{6,40}"
                autocomplete="off"
                class="input-field font-mono tnum"
                placeholder="0101 2000 1234 5678"
                :title="L('6–30 digits; spaces and dashes are fine', 'ຕົວເລກ 6–30 ຕົວ, ມີຍະຫວ່າງ ຫຼື ຂີດ ໄດ້')"
              >
            </label>
          </div>
        </section>

      </div>

      <!-- ── Side column: live summary + actions ── -->
      <div class="flex flex-col gap-4 lg:sticky lg:top-20">
        <!-- Signed documents (contracts) -->
        <section class="panel">
          <h2 class="card-title"><span class="card-icon bg-primary-soft text-primary-ink">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </span>{{ L('Contract documents', 'ເອກະສານສັນຍາ') }}
          <span v-if="documents.length" class="badge-neutral tnum">{{ documents.length }}</span>
          <button type="button" class="ml-auto btn-secondary !min-h-8 !px-3 text-xs" @click="pickDocs">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
            {{ L('Add PDF', 'ເພີ່ມ PDF') }}
          </button>
          <input ref="docInput" type="file" accept="application/pdf,.pdf" multiple class="sr-only" tabindex="-1" @change="onDocsPicked">
          </h2>
          <div class="card-body flex flex-col gap-2 max-h-[26rem] overflow-y-auto scrollbar-thin">
            <p class="text-[11px] text-ink-subtle">PDF · {{ L('up to 10 MB each', 'ບໍ່ເກີນ 10 MB ຕໍ່ໄຟລ໌') }}</p>
            <p v-if="docError" role="alert" class="text-xs text-danger">{{ docError }}</p>

            <!-- Saved documents -->
            <div v-for="d in documents" :key="d.documentId" class="doc-row">
              <span class="doc-icon">PDF</span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-ink truncate">{{ d.title }}</p>
                <p class="text-[11px] text-ink-subtle truncate">{{ d.originalName }} · {{ fileSize(d.sizeBytes) }} · {{ fmt.date(d.createdAt) }}</p>
              </div>
              <button type="button" class="doc-btn hover:text-primary-ink hover:bg-primary-soft" :disabled="openingId === d.documentId" :aria-label="L('Open', 'ເປີດ') + ' ' + d.title" @click="openDocument(d)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </button>
              <button type="button" class="doc-btn hover:text-danger hover:bg-danger-soft" :aria-label="$t('common.delete') + ' ' + d.title" @click="deleteDocument(d)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>

            <!-- Picked, uploaded on save -->
            <div v-for="(p, i) in pendingDocs" :key="p.key" class="doc-row border-dashed border-primary bg-primary-soft/30">
              <span class="doc-icon">PDF</span>
              <div class="min-w-0 flex-1 flex flex-col gap-1">
                <input v-model="p.title" maxlength="150" required class="input-field !min-h-8 !py-1 text-sm" :aria-label="L('Document title', 'ຊື່ເອກະສານ')" :placeholder="L('Document title', 'ຊື່ເອກະສານ')">
                <p class="text-[11px] text-ink-subtle truncate">{{ p.file.name }} · {{ fileSize(p.file.size) }} · <span class="text-primary-ink">{{ L('uploads when you save', 'ຈະອັບໂຫລດເມື່ອກົດບັນທຶກ') }}</span></p>
              </div>
              <button type="button" class="doc-btn hover:text-danger hover:bg-danger-soft" :aria-label="L('Remove', 'ເອົາອອກ') + ' ' + p.file.name" @click="pendingDocs.splice(i, 1)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <p v-if="!documents.length && !pendingDocs.length" class="text-sm text-ink-subtle text-center py-4 rounded border border-dashed border-line">
              {{ L('No signed documents yet.', 'ຍັງບໍ່ມີເອກະສານສັນຍາ.') }}
            </p>
          </div>
        </section>

        <section class="panel overflow-hidden">
          <div class="px-4 pt-5 pb-4 flex flex-col items-center text-center">
            <!-- Photo: click to choose; saved together with the teacher -->
            <button
              type="button"
              class="group relative rounded-full ring-4 ring-[rgb(var(--surface))] focus-visible:outline-none focus-visible:ring-primary"
              :aria-label="shownPhoto ? L('Change photo', 'ປ່ຽນຮູບ') : L('Add photo', 'ເພີ່ມຮູບ')"
              @click="pickPhoto"
            >
              <PersonAvatar :name="form.fullNameLo || form.fullNameEn || '?'" :photo-url="shownPhoto" size="xl" />
              <span class="absolute inset-0 rounded-full bg-black/45 text-white flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {{ shownPhoto ? L('Change', 'ປ່ຽນຮູບ') : L('Add photo', 'ເພີ່ມຮູບ') }}
              </span>
              <span class="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center ring-2 ring-[rgb(var(--surface))]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
              </span>
            </button>
            <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" tabindex="-1" @change="onPhotoPicked">
            <p v-if="photoError" role="alert" class="mt-1.5 text-xs text-danger">{{ photoError }}</p>
            <button v-else-if="shownPhoto" type="button" class="mt-1.5 text-xs text-ink-subtle hover:text-danger" @click="removePhoto">
              {{ L('Remove photo', 'ລຶບຮູບ') }}
            </button>

            <p class="mt-2 text-base font-bold text-ink leading-tight break-words max-w-full">
              {{ form.fullNameLo || L('Teacher name', 'ຊື່ຄູສອນ') }}
            </p>
            <p class="text-xs text-ink-subtle break-words max-w-full">{{ form.fullNameEn || '—' }}</p>
            <p v-if="employeeCode" class="mt-1 text-xs font-mono text-ink-muted">{{ employeeCode }}</p>
            <div class="mt-3 flex flex-wrap justify-center gap-1.5">
              <span :class="isActive ? 'badge-success' : 'badge-danger'">{{ isActive ? $t('common.active') : $t('common.inactive') }}</span>
              <span v-if="form.gender" class="badge-neutral">{{ $t(`gender.${form.gender}`) }}</span>
              <span v-if="form.specialization" class="badge-neutral">{{ form.specialization }}</span>
              <span :class="hasAccount ? 'badge-info' : 'badge-warning'">{{ hasAccount ? L('Has login', 'ມີບັນຊີເຂົ້າລະບົບ') : L('No login yet', 'ຍັງບໍ່ມີບັນຊີ') }}</span>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-line grid grid-cols-2 gap-2">
            <NuxtLink to="/admin/teachers" class="btn-secondary">{{ $t('common.cancel') }}</NuxtLink>
            <button type="submit" :disabled="isSubmitting" class="btn-primary">
              {{ isSubmitting ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </section>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAdminStore } from '../../../application/stores/admin';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import { usePhotoPicker } from '../../../composables/usePhotoPicker';
import type { TeacherDocument } from '../../../domain/models/Teacher';
import { GENDERS, type Gender } from '../../../domain/models/Gender';

definePageMeta({ layout: 'admin' });

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const dialog = useDialog();
const { locale, t } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);

const editId = computed(() => (route.query.id ? Number(route.query.id) : null));
const isEdit = computed(() => editId.value !== null);
useHead({ title: computed(() => `${isEdit.value ? t('teachers.edit_teacher') : t('teachers.add_teacher')} — Smart School Admin`) });

const form = reactive({
  fullNameLo: '',
  fullNameEn: '',
  gender: '' as Gender | '',
  phoneNumber: '',
  email: '',
  specialization: '',
  qualification: '',
  hireDate: '',
  salary: '' as number | string,
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  provinceId: 0,
  districtId: 0,
  village: '',
  address: '',
  notes: '',
});
// Shown in the summary only; the server generates the code and new teachers start active.
const employeeCode = ref('');
const isActive = ref(true);
const hasAccount = ref(false);

const loading = ref(false);
const isSubmitting = ref(false);
const errorMsg = ref('');
const {
  input: photoInput,
  existingUrl: existingPhotoUrl,
  shown: shownPhoto,
  error: photoError,
  pick: pickPhoto,
  onPicked: onPhotoPicked,
  remove: removePhoto,
  persist: persistPhoto,
} = usePhotoPicker(L);

const { provinces, load: loadProvinces, name: placeName, districtsOf } = useProvinces();

const errorMessage = (err: unknown, fallback: string) => getErrorMessage(err, fallback);

// ── Signed documents (contracts) ──
const fmt = useFormat();
const MAX_DOC_BYTES = 10 * 1024 * 1024;
const docInput = ref<HTMLInputElement | null>(null);
const documents = ref<TeacherDocument[]>([]);
const pendingDocs = ref<{ key: number; file: File; title: string }[]>([]);
const docError = ref('');
const openingId = ref<number | null>(null);
let docKey = 0;

const pickDocs = () => docInput.value?.click();

const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const onDocsPicked = (e: Event) => {
  const el = e.target as HTMLInputElement;
  const files = Array.from(el.files ?? []);
  el.value = '';
  docError.value = '';
  const rejected: string[] = [];
  for (const file of files) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf || file.size > MAX_DOC_BYTES) {
      rejected.push(file.name);
      continue;
    }
    pendingDocs.value.push({ key: ++docKey, file, title: file.name.replace(/\.pdf$/i, '') });
  }
  if (rejected.length) {
    docError.value = L('Only PDF files up to 10 MB: ', 'ຮັບແຕ່ໄຟລ໌ PDF ບໍ່ເກີນ 10 MB: ') + rejected.join(', ');
  }
};

// The PDF is private, so it's fetched with the login token and shown from a local blob URL.
const openDocument = async (d: TeacherDocument) => {
  const win = window.open('', '_blank'); // opened before the await so popup blockers allow it
  openingId.value = d.documentId;
  try {
    const blob = await adminRepository.fetchTeacherDocumentFile(d.teacherId, d.documentId);
    const url = URL.createObjectURL(blob);
    if (win) win.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    win?.close();
    dialog.error(errorMessage(err, 'Failed to open the document'));
  } finally {
    openingId.value = null;
  }
};

const deleteDocument = (d: TeacherDocument) => {
  dialog.confirm({
    title: L('Delete document', 'ລຶບເອກະສານ'),
    message: L(`Delete "${d.title}"? This cannot be undone.`, `ລຶບ "${d.title}"? ການລຶບນີ້ບໍ່ສາມາດກູ້ຄືນໄດ້.`),
    confirmLabel: t('common.delete'),
    tone: 'danger',
    onConfirm: async () => {
      await adminRepository.deleteTeacherDocument(d.teacherId, d.documentId);
      documents.value = documents.value.filter((x) => x.documentId !== d.documentId);
    },
  });
};

/** Uploads the picked PDFs once the teacher exists; returns the ones that failed. */
const uploadPendingDocs = async (teacherId: number) => {
  const failed: string[] = [];
  for (const p of pendingDocs.value) {
    try {
      await adminRepository.uploadTeacherDocument(teacherId, p.file, p.title.trim() || p.file.name);
    } catch (err) {
      failed.push(`${p.file.name} (${errorMessage(err, '')})`);
    }
  }
  return failed;
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadProvinces();
    if (!editId.value) return;
    const teacher = await adminRepository.getTeacher(editId.value);
    Object.assign(form, {
      fullNameLo: teacher.user?.fullNameLo ?? '',
      fullNameEn: teacher.user?.fullNameEn ?? '',
      gender: teacher.gender ?? '',
      phoneNumber: teacher.user?.phoneNumber ?? '',
      email: teacher.user?.email ?? '',
      specialization: teacher.specialization ?? '',
      qualification: teacher.qualification ?? '',
      hireDate: teacher.hireDate ? teacher.hireDate.slice(0, 10) : '',
      salary: teacher.salary != null ? Number(teacher.salary) : '',
      bankName: teacher.bankName ?? '',
      bankAccountName: teacher.bankAccountName ?? '',
      bankAccountNumber: teacher.bankAccountNumber ?? '',
      provinceId: teacher.provinceId ?? 0,
      districtId: teacher.districtId ?? 0,
      village: teacher.village ?? '',
      address: teacher.address ?? '',
      notes: teacher.notes ?? '',
    });
    documents.value = await adminRepository.getTeacherDocuments(editId.value);
    employeeCode.value = teacher.employeeCode;
    isActive.value = teacher.user?.isActive ?? true;
    hasAccount.value = teacher.hasAccount ?? false;
    existingPhotoUrl.value = teacher.user?.avatarUrl ?? null;
  } catch (err) {
    errorMsg.value = errorMessage(err, 'Failed to load');
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  errorMsg.value = '';
  if (!form.phoneNumber.trim() && !form.email.trim()) {
    errorMsg.value = L('Enter a phone number or an email so the teacher can sign in.', 'ກະລຸນາປ້ອນເບີໂທ ຫຼື ອີເມວ ເພື່ອໃຊ້ເຂົ້າລະບົບ.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  isSubmitting.value = true;
  try {
    // Empty optional fields are left out on create and cleared (null) on edit.
    const blank = (v: unknown) => v === '' || v === null;
    const payload: Record<string, unknown> = {
      fullNameLo: form.fullNameLo.trim(),
      fullNameEn: form.fullNameEn.trim(),
    };
    for (const key of ['phoneNumber', 'email', 'specialization', 'qualification', 'bankName', 'bankAccountName', 'bankAccountNumber', 'village', 'address', 'notes'] as const) {
      const value = form[key].trim();
      if (value || isEdit.value) payload[key] = value;
    }
    for (const key of ['gender', 'hireDate', 'salary'] as const) {
      if (!blank(form[key])) payload[key] = form[key];
      else if (isEdit.value) payload[key] = null;
    }
    // 0 = nothing picked; on edit that clears the saved value.
    for (const key of ['provinceId', 'districtId'] as const) {
      if (form[key]) payload[key] = form[key];
      else if (isEdit.value) payload[key] = null;
    }

    const saved = editId.value
      ? await adminStore.updateTeacher(editId.value, payload)
      : await adminStore.createTeacher(payload);

    // The teacher is saved at this point; a failed photo step must not lose that.
    try {
      await persistPhoto(
        (file) => adminRepository.uploadTeacherPhoto(saved.teacherId, file),
        () => adminRepository.deleteTeacherPhoto(saved.teacherId),
      );
    } catch (err) {
      await dialog.warning(L('The teacher was saved, but the photo could not be saved: ', 'ບັນທຶກຄູສອນແລ້ວ ແຕ່ບັນທຶກຮູບບໍ່ສຳເລັດ: ') + errorMessage(err, ''));
    }
    const failedDocs = await uploadPendingDocs(saved.teacherId);
    if (failedDocs.length) {
      await dialog.warning(L('The teacher was saved, but these documents could not be uploaded: ', 'ບັນທຶກຄູສອນແລ້ວ ແຕ່ອັບໂຫລດເອກະສານເຫຼົ່ານີ້ບໍ່ສຳເລັດ: ') + failedDocs.join(', '));
    }
    router.push('/admin/teachers');
  } catch (err) {
    errorMsg.value = errorMessage(err, L('Failed to save teacher. Please try again.', 'ບັນທຶກບໍ່ສຳເລັດ. ກະລຸນາລອງໃໝ່.'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="postcss">
.card-title {
  @apply flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink border-b border-line;
}
.card-icon {
  @apply w-6 h-6 rounded flex items-center justify-center shrink-0;
}
.card-body {
  @apply p-4;
}
.field {
  @apply flex flex-col gap-1 min-w-0;
}
.field-label {
  @apply text-xs font-medium text-ink-muted;
}
.doc-row {
  @apply flex items-center gap-3 rounded border border-line px-3 py-2;
}
.doc-icon {
  @apply w-9 h-10 shrink-0 rounded bg-danger-soft text-danger text-[10px] font-bold flex items-center justify-center;
}
.doc-btn {
  @apply w-8 h-8 shrink-0 rounded flex items-center justify-center text-ink-subtle disabled:opacity-40;
}
</style>
