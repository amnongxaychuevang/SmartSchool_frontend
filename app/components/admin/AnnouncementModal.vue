<template>
  <AppModal :open="isOpen" :title="isEditMode ? $t('common.edit') : $t('admin.new_announcement')" @update:open="isOpen = $event">
    <form id="announcementForm" class="flex flex-col gap-2" @submit.prevent="emit('save')">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('admin.title_lo') }}</label>
          <input v-model="form.titleLo" type="text" required class="input-field" :placeholder="$t('announcements_admin.ph_title_lo')">
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('admin.title_en') }}</label>
          <input v-model="form.titleEn" type="text" required class="input-field" :placeholder="$t('announcements_admin.ph_title_en')">
        </div>
      </div>

      <div>
        <label class="block mb-1.5 text-sm font-semibold">{{ $t('admin.content_lo') }}</label>
        <textarea v-model="form.contentLo" required rows="2" class="input-field resize-none" :placeholder="$t('announcements_admin.ph_content_lo')"></textarea>
      </div>

      <div>
        <label class="block mb-1.5 text-sm font-semibold">{{ $t('admin.content_en') }}</label>
        <textarea v-model="form.contentEn" required rows="2" class="input-field resize-none" :placeholder="$t('announcements_admin.ph_content_en')"></textarea>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('admin.audience') }}</label>
          <select v-model="form.targetAudience" class="input-field cursor-pointer">
            <option value="all">{{ $t('admin.everyone') }}</option>
            <option value="teachers">{{ $t('admin.teachers_only') }}</option>
            <option value="parents">{{ $t('admin.parents_only') }}</option>
            <option value="class">{{ $t('admin.class_only') }}</option>
          </select>
        </div>
        <div v-if="form.targetAudience === 'class'">
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('common.class') }} *</label>
          <select v-model="form.classId" required class="input-field cursor-pointer">
            <option :value="null" disabled>—</option>
            <option v-for="cls in classOptions" :key="cls.classId" :value="cls.classId">
              {{ locale === 'lo' ? cls.classNameLo : cls.classNameEn }} ({{ cls.academicYear }})
            </option>
          </select>
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('admin.expiry_date') }}</label>
          <input v-model="form.expiryDate" type="date" class="input-field">
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">
        {{ $t('common.cancel') }}
      </button>
      <button form="announcementForm" type="submit" :disabled="saving" class="btn-primary flex items-center gap-2">
        <svg v-if="saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span v-else>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </span>
        {{ $t('admin.publish_announcement') }}
      </button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppModal from '../AppModal.vue';
import type { SchoolClass } from '~/domain/models/SchoolClass';

const { locale } = useI18n();

const props = defineProps<{
  modelValue: boolean;
  isEditMode: boolean;
  saving: boolean;
  form: {
    titleLo: string;
    titleEn: string;
    contentLo: string;
    contentEn: string;
    targetAudience: 'all' | 'teachers' | 'parents' | 'class';
    classId: number | null;
    expiryDate: string;
  };
  classOptions: SchoolClass[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save'): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>
