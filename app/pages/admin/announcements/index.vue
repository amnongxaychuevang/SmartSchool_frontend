<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <SearchInput v-model="searchInput" class="flex-1 max-w-md" :placeholder="$t('common.search')" @input="handleSearch" @clear="handleSearch()" />
      
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
    <div v-else-if="announcements.length === 0" class="glass-panel">
      <EmptyState icon="megaphone" size="lg" :title="$t('admin.no_announcements_found')" :description="$t('admin.create_first_announcement')" />
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
                <IconButton icon="edit" :label="$t('common.edit')" @click="openEditModal(item)" />
                <IconButton icon="delete" :label="$t('common.delete')" @click="confirmDelete(item)" />
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
