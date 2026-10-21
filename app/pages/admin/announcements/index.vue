<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="$t('common.search')" class="search-bar" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="searchInput = ''; handleSearch()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <button class="ml-auto h-9 px-3.5 btn-primary flex items-center gap-2 shadow-[0_4px_15px_rgba(45,212,191,0.25)] hover:shadow-[0_6px_20px_rgba(45,212,191,0.4)]" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('admin.new_announcement') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" class="my-12" />

    <!-- Empty State -->
    <div v-else-if="announcements.length === 0" class="glass-panel p-16 flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      </div>
      <h3 class="text-lg text-white font-bold mb-2">{{ announcements.length === 0 ? $t('admin.no_announcements_found') : $t('common.no_data') }}</h3>
      <p class="text-slate-400 text-sm max-w-sm">{{ announcements.length === 0 ? $t('admin.create_first_announcement') : '' }}</p>
    </div>

    <!-- Data Grid -> Table -->
    <div v-else class="glass-panel overflow-x-auto">
      <table class="data-table w-full min-w-max">
        <thead>
          <tr>
            <th class="w-12 text-center">#</th>
            <th>{{ $t('common.title') }}</th>
            <th class="hidden md:table-cell">{{ $t('common.content') }}</th>
            <th>{{ $t('admin.audience') }}</th>
            <th class="hidden sm:table-cell">{{ $t('admin.published') }}</th>
            <th class="text-right">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
          <tr v-for="(item, index) in announcements" :key="item.announcementId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              {{ (currentPage - 1) * limit + index + 1 }}
            </td>
            <td class="px-4 py-3">
              <p class="text-sm font-medium text-slate-900 dark:text-white line-clamp-2 max-w-[200px]">
                {{ locale === 'lo' ? item.titleLo : item.titleEn }}
              </p>
            </td>
            <td class="hidden md:table-cell">
              <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 max-w-md pr-4">
                {{ locale === 'lo' ? item.contentLo : item.contentEn }}
              </p>
            </td>
            <td class="px-4 py-3">
              <span class="badge-teal">{{ audienceLabel(item) }}</span>
            </td>
            <td class="hidden sm:table-cell">
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">{{ formatDate(item.publishDate) }}</span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" :title="$t('common.edit')" @click="openEditModal(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" :title="$t('common.delete')" @click="confirmDelete(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <PaginationBar
      :loading="loading"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total="totalItems"
      :page-size="limit"
      @update:page="handlePageChange"
    />

    <!-- Create Modal -->
    <AdminAnnouncementModal
      v-model="showModal"
      :is-edit-mode="isEditMode"
      :saving="saving"
      :form="form"
      :class-options="classOptions"
      @save="saveAnnouncement"
    />

    <ConfirmDialog
      :open="del.open"
      tone="danger"
      :title="$t('announcements_admin.delete_title') || $t('common.delete')"
      :message="del.item ? $t('announcements_admin.delete_confirm') : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @update:open="del.open = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponse } from '../../../infrastructure/api/types';
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import type { SchoolClass } from '../../../domain/models/SchoolClass';

definePageMeta({
  layout: 'admin'
});

const { locale, t } = useI18n();
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

const searchInput = ref('');
const currentPage = ref(1);
const limit = ref(10);
const totalItems = ref(0);
const totalPages = ref(1);

const isEditMode = ref(false);
const editingId = ref<string | number | null>(null);
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    fetchAnnouncements();
  }, 300);
};

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchAnnouncements();
  }
};

// Every active class (not the paginated/filtered list of the Classes page).
const classOptions = ref<SchoolClass[]>([]);
const loadClassOptions = async () => {
  try {
    classOptions.value = await adminRepository.getAllClasses();
  } catch (error) {
    console.error('Failed to fetch classes:', error);
  }
};

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
    const searchParam = searchInput.value ? `&search=${encodeURIComponent(searchInput.value)}` : '';
    const res = await apiClient<ApiResponse<Announcement[]>>(`${API_ENDPOINTS.announcements.base}?page=${currentPage.value}&limit=${limit.value}${searchParam}`);
    if (res?.success) {
      announcements.value = res.data;
      totalItems.value = res.meta?.total || 0;
      totalPages.value = res.meta?.totalPages || 1;
    }
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  form.value = {
    titleLo: '',
    titleEn: '',
    contentLo: '',
    contentEn: '',
    targetAudience: 'all',
    classId: null,
    expiryDate: ''
  };
  if (classOptions.value.length === 0) loadClassOptions();
  showModal.value = true;
};

const openEditModal = (item: Announcement) => {
  isEditMode.value = true;
  editingId.value = item.announcementId;
  form.value = {
    titleLo: item.titleLo,
    titleEn: item.titleEn,
    contentLo: item.contentLo,
    contentEn: item.contentEn,
    targetAudience: item.targetAudience,
    classId: item.classId || null,
    expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0]! : ''
  };
  if (classOptions.value.length === 0) loadClassOptions();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveAnnouncement = async () => {
  try {
    saving.value = true;
    const method = isEditMode.value ? 'PUT' : 'POST';
    const url = isEditMode.value ? `${API_ENDPOINTS.announcements.base}/${editingId.value}` : API_ENDPOINTS.announcements.base;
    const res = await apiClient<ApiResponse<Announcement>>(url, {
      method,
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

const del = reactive({
  open: false,
  item: null as Announcement | null,
  busy: false,
  error: ''
});

const confirmDelete = (item: Announcement) => {
  del.item = item;
  del.open = true;
  del.error = '';
};

const handleDelete = async () => {
  if (!del.item) return;
  try {
    del.busy = true;
    del.error = '';
    await apiClient(`${API_ENDPOINTS.announcements.base}/${del.item.announcementId}`, { method: 'DELETE' });
    del.open = false;
    await fetchAnnouncements();
  } catch (error: any) {
    console.error('Failed to delete announcement:', error);
    del.error = error.message || t('common.error');
  } finally {
    del.busy = false;
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
