<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-col gap-1">
        <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.announcements') }}</p>
        <h2 class="text-2xl font-bold text-white">{{ $t('admin.manage_announcements') }}</h2>
        <p class="text-sm text-slate-400">{{ $t('admin.manage_announcements_desc') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn-primary flex items-center gap-2 shadow-[0_4px_15px_rgba(45,212,191,0.25)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.4)]" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('admin.new_announcement') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" padding="p-12" />

    <!-- Empty State -->
    <div v-else-if="announcements.length === 0" class="glass-panel p-16 flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      </div>
      <h3 class="text-lg text-white font-bold mb-2">{{ $t('admin.no_announcements_found') }}</h3>
      <p class="text-slate-400 text-sm max-w-sm">{{ $t('admin.create_first_announcement') }}</p>
    </div>

    <!-- Data Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="item in announcements" :key="item.announcementId" class="glass-panel-hover p-6 flex flex-col gap-4">
        <div class="flex justify-between items-start gap-3">
          <h3 class="text-white font-semibold line-clamp-2">{{ locale === 'lo' ? item.titleLo : item.titleEn }}</h3>
          <span class="badge-teal shrink-0">
            {{ audienceLabel(item) }}
          </span>
        </div>
        <p class="text-sm text-slate-400 line-clamp-3 flex-1 leading-relaxed">{{ locale === 'lo' ? item.contentLo : item.contentEn }}</p>

        <div class="flex items-center justify-between border-t border-slate-800/50 pt-4 mt-2">
          <div class="flex flex-col">
            <span class="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">{{ $t('admin.published') }}</span>
            <span class="text-xs text-slate-300 font-medium">{{ formatDate(item.publishDate) }}</span>
          </div>
          <div class="flex gap-2">
            <button class="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-red-500/80 transition-all shadow-sm" @click="deleteItem(item.announcementId)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="closeModal"/>
        
        <div class="relative glass-panel w-full max-w-2xl max-h-[90vh] flex flex-col animate-[fadeSlideUp_0.3s_ease]">
          <div class="p-6 border-b border-slate-800/50 flex justify-between items-center shrink-0">
            <h3 class="text-xl font-bold text-white">{{ $t('admin.new_announcement') }}</h3>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <form id="announcementForm" class="flex flex-col gap-5" @submit.prevent="saveAnnouncement">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('admin.title_lo') }}</label>
                  <input v-model="form.titleLo" type="text" required class="input-field" placeholder="ຫົວຂໍ້ປະກາດ..." >
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('admin.title_en') }}</label>
                  <input v-model="form.titleEn" type="text" required class="input-field" placeholder="Announcement Title..." >
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('admin.content_lo') }}</label>
                <textarea v-model="form.contentLo" required rows="4" class="input-field resize-none" placeholder="ເນື້ອໃນປະກາດ..."/>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('admin.content_en') }}</label>
                <textarea v-model="form.contentEn" required rows="4" class="input-field resize-none" placeholder="Announcement Content..."/>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('admin.audience') }}</label>
                  <select v-model="form.targetAudience" class="input-field cursor-pointer">
                    <option value="all">{{ $t('admin.everyone') }}</option>
                    <option value="teachers">{{ $t('admin.teachers_only') }}</option>
                    <option value="parents">{{ $t('admin.parents_only') }}</option>
                    <option value="class">{{ $t('admin.class_only') }}</option>
                  </select>
                </div>
                <div v-if="form.targetAudience === 'class'" class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('common.class') }} *</label>
                  <select v-model="form.classId" required class="input-field cursor-pointer">
                    <option :value="null" disabled>—</option>
                    <option v-for="cls in adminStore.classes" :key="cls.classId" :value="cls.classId">
                      {{ locale === 'lo' ? cls.classNameLo : cls.classNameEn }} ({{ cls.academicYear }})
                    </option>
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $t('admin.expiry_date') }}</label>
                  <input v-model="form.expiryDate" type="date" class="input-field" >
                </div>
              </div>
            </form>
          </div>

          <div class="p-6 border-t border-slate-800/50 flex justify-end gap-3 shrink-0 bg-slate-900/20 rounded-b-2xl">
            <button type="button" class="btn-ghost" @click="closeModal">
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
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from '../../../infrastructure/api/types';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { useAdminStore } from '../../../application/stores/admin';

definePageMeta({
  layout: 'admin'
});

const { locale, t } = useI18n();
const adminStore = useAdminStore();
const apiClient = useApiClient();
interface Announcement {
  announcementId: string | number;
  titleLo: string;
  titleEn: string;
  contentLo: string;
  contentEn: string;
  targetAudience: 'all' | 'teachers' | 'parents' | 'class';
  classId?: number | null;
  class?: { classNameEn: string; classNameLo: string } | null;
  publishDate: string;
  expiryDate?: string;
}

const announcements = ref<Announcement[]>([]);

const audienceLabel = (item: Announcement) => {
  if (item.targetAudience === 'class') {
    const name = item.class && (locale.value === 'lo' ? item.class.classNameLo : item.class.classNameEn);
    return name ? `${t('common.class')}: ${name}` : t('admin.class_only');
  }
  return t(item.targetAudience === 'all' ? 'admin.everyone' : `admin.${item.targetAudience}_only`);
};
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);

const form = ref({
  titleLo: '',
  titleEn: '',
  contentLo: '',
  contentEn: '',
  targetAudience: 'all' as Announcement['targetAudience'],
  classId: null as number | null,
  expiryDate: ''
});

const fetchAnnouncements = async () => {
  try {
    loading.value = true;
    const res = await apiClient<ApiResponse<Announcement[]>>(API_ENDPOINTS.announcements.base);
    if (res?.success) {
      announcements.value = res.data;
    }
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  form.value = {
    titleLo: '',
    titleEn: '',
    contentLo: '',
    contentEn: '',
    targetAudience: 'all',
    classId: null,
    expiryDate: ''
  };
  if (adminStore.classes.length === 0) adminStore.fetchClasses();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveAnnouncement = async () => {
  try {
    saving.value = true;
    const res = await apiClient<ApiResponse<Announcement>>(API_ENDPOINTS.announcements.base, {
      method: 'POST',
      body: {
        ...form.value,
        classId: form.value.targetAudience === 'class' ? form.value.classId : undefined,
        // An empty date input would fail validation; omit it for "no expiry".
        expiryDate: form.value.expiryDate || undefined,
      },
    });
    if (res?.success) {
      closeModal();
      await fetchAnnouncements();
    }
  } catch (error) {
    console.error('Failed to save announcement:', error);
  } finally {
    saving.value = false;
  }
};

const deleteItem = async (id: string | number) => {
  if (confirm('Are you sure you want to delete this announcement?')) {
    try {
      await apiClient(`${API_ENDPOINTS.announcements.base}/${id}`, { method: 'DELETE' });
      await fetchAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

onMounted(() => {
  fetchAnnouncements();
});
</script>

<style scoped lang="postcss">
/* Custom scrollbar for modal content */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-700/50 rounded-full;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-600/50;
}
</style>
