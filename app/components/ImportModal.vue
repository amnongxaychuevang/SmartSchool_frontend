<template>
  <AppModal
    :open="open"
    :title="$t('common.import_title')"
    :subtitle="$t('common.import_desc')"
    size="lg"
    @update:open="emit('update:open', $event)"
  >
    <div class="flex flex-col gap-5">
      <!-- Template download bar -->
      <div class="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 border border-line">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-ink">{{ $t('common.download_template') }}</p>
            <p class="text-[11px] text-ink-muted">Excel (.xlsx) template with sample format</p>
          </div>
        </div>
        <button
          type="button"
          class="btn-secondary !text-xs !py-1.5 !px-3 flex items-center gap-1.5"
          @click="downloadTemplate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ $t('common.download_template') }}
        </button>
      </div>

      <!-- File Dropzone -->
      <div
        class="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
        :class="[
          isDragging ? 'border-primary bg-primary/5' : 'border-line hover:border-ink-muted hover:bg-surface-2/40',
          selectedFile ? 'bg-surface-2/60 border-teal-500/50' : ''
        ]"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="fileInputRef?.click()"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv, .xlsx, .xls"
          class="hidden"
          @change="onFileChange"
        >

        <div v-if="!selectedFile" class="flex flex-col items-center">
          <div class="w-12 h-12 rounded-2xl bg-surface-2 text-ink-muted flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p class="text-sm font-medium text-ink">{{ $t('common.import_file_label') }}</p>
          <p class="text-xs text-ink-subtle mt-1">.xlsx, .xls, .csv (Max 10 MB)</p>
        </div>

        <div v-else class="flex items-center gap-3 w-full max-w-sm">
          <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="text-left min-w-0 flex-1">
            <p class="text-sm font-medium text-ink truncate">{{ selectedFile.name }}</p>
            <p class="text-xs text-ink-muted">{{ formatBytes(selectedFile.size) }}</p>
          </div>
          <button
            type="button"
            class="p-1 rounded-lg text-ink-subtle hover:text-red-400 hover:bg-surface-3 transition-colors"
            @click.stop="selectedFile = null"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Result Feedback -->
      <div v-if="resultMessage" class="p-3.5 rounded-xl text-sm" :class="resultType === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'">
        {{ resultMessage }}
      </div>

      <!-- Error Table if validation failed on rows -->
      <div v-if="rowErrors.length > 0" class="flex flex-col gap-2 max-h-48 overflow-y-auto rounded-xl border border-line bg-surface-2/40 p-3">
        <p class="text-xs font-semibold text-red-400">{{ $t('common.import_errors', { count: rowErrors.length }) }}:</p>
        <ul class="text-xs text-ink-muted divide-y divide-line/60">
          <li v-for="(err, idx) in rowErrors" :key="idx" class="py-1.5 flex items-start gap-2">
            <span class="text-red-400 font-mono shrink-0">Row {{ err.row }}:</span>
            <span class="text-ink-subtle">{{ err.field ? `[${err.field}] ` : '' }}{{ err.message }}</span>
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn-secondary" :disabled="loading" @click="emit('update:open', false)">
        {{ $t('common.cancel') }}
      </button>
      <button
        type="button"
        class="btn-primary flex items-center gap-2"
        :disabled="!selectedFile || loading"
        @click="handleImport"
      >
        <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        {{ loading ? $t('common.importing') : $t('common.import_excel') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as XLSX from 'xlsx';
import AppModal from './AppModal.vue';
import { adminRepository } from '../infrastructure/api/AdminRepository';

const props = defineProps<{
  open: boolean;
  type: 'students' | 'teachers' | 'parents';
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'imported'): void;
}>();

const { t } = useI18n();
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const loading = ref(false);
const resultMessage = ref<string | null>(null);
const resultType = ref<'success' | 'error'>('success');
const rowErrors = ref<{ row: number; field: string; message: string }[]>([]);

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    resultMessage.value = null;
    rowErrors.value = [];
  }
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    selectedFile.value = e.dataTransfer.files[0];
    resultMessage.value = null;
    rowErrors.value = [];
  }
}

function downloadTemplate() {
  let sampleData: Record<string, any>[] = [];
  let filename = `${props.type}_template.xlsx`;

  if (props.type === 'students') {
    sampleData = [
      {
        fullNameEn: 'Somxay Sengsavang',
        fullNameLo: 'ສົມໄຊ ແສງສະຫວ່າງ',
        dateOfBirth: '2015-05-14',
        gender: 'male',
        classId: 1,
        nationalityEn: 'Lao',
        nationalityLo: 'ລາວ',
        village: 'Dongdok',
        provinceId: 1,
        districtId: 1,
      },
      {
        fullNameEn: 'Chansouk Vongphachanh',
        fullNameLo: 'ຈັນສຸກ ວົງພະຈັນ',
        dateOfBirth: '2015-08-20',
        gender: 'female',
        classId: 1,
        nationalityEn: 'Lao',
        nationalityLo: 'ລາວ',
        village: 'Phonthan',
        provinceId: 1,
        districtId: 1,
      },
    ];
  } else if (props.type === 'teachers') {
    sampleData = [
      {
        fullNameEn: 'Bounmy Sisavath',
        fullNameLo: 'ບຸນມີ ສີສະຫວັດ',
        gender: 'male',
        specialization: 'Mathematics',
        qualification: 'Bachelor of Education',
        phoneNumber: '02055551122',
        email: 'bounmy@smartschool.edu.la',
      },
      {
        fullNameEn: 'Keomany Phommavong',
        fullNameLo: 'ແກ້ວມະນີ ພົມມະວົງ',
        gender: 'female',
        specialization: 'English',
        qualification: 'Master of Arts',
        phoneNumber: '02055553344',
        email: 'keomany@smartschool.edu.la',
      },
    ];
  } else if (props.type === 'parents') {
    sampleData = [
      {
        fullNameEn: 'Khamphou Sengsavang',
        fullNameLo: 'ຄຳພູ ແສງສະຫວ່າງ',
        phoneNumber: '02099887766',
        email: 'khamphou@gmail.com',
        occupation: 'Civil Servant',
        studentCodes: 'STU-0001',
      },
    ];
  }

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, filename);
}

async function handleImport() {
  if (!selectedFile.value) return;
  loading.value = true;
  resultMessage.value = null;
  rowErrors.value = [];

  try {
    const res = await adminRepository.importRecords(props.type, selectedFile.value);
    if (res.errors && res.errors.length > 0) {
      rowErrors.value = res.errors;
      if (res.imported > 0) {
        resultType.value = 'error';
        resultMessage.value = `${t('common.import_success', { count: res.imported })}, but ${t('common.import_errors', { count: res.errors.length })}`;
        emit('imported');
      } else {
        resultType.value = 'error';
        resultMessage.value = t('common.import_errors', { count: res.errors.length });
      }
    } else {
      resultType.value = 'success';
      resultMessage.value = t('common.import_success', { count: res.imported });
      selectedFile.value = null;
      emit('imported');
      setTimeout(() => {
        emit('update:open', false);
      }, 1500);
    }
  } catch (err: any) {
    resultType.value = 'error';
    resultMessage.value = err?.message || t('common.error');
  } finally {
    loading.value = false;
  }
}
</script>
