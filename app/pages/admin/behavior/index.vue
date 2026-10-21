<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <PageHeader
      :title="$t('behavior.title')"
      :subtitle="$t('behavior.subtitle')"
    >
      <div class="flex items-center gap-3">
        <button type="button" class="btn-primary flex items-center gap-2" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ $t('behavior.log_incident') }}</span>
        </button>
      </div>
    </PageHeader>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('behavior.total_records') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ overview.totalRecords }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('behavior.merits') }}</p>
          <p class="text-2xl font-bold text-emerald-500">+{{ overview.totalMerits }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('behavior.demerits') }}</p>
          <p class="text-2xl font-bold text-rose-500">-{{ overview.totalDemerits }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('behavior.active_students') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ overview.totalStudents }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex gap-6">
      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'records' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
        @click="activeTab = 'records'"
      >
        {{ $t('behavior.tab_records') }}
      </button>
      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'scores' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
        @click="activeTab = 'scores'"
      >
        {{ $t('behavior.tab_scores') }}
      </button>
      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'categories' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
        @click="activeTab = 'categories'"
      >
        {{ $t('behavior.tab_categories') }}
      </button>
    </div>

    <!-- TAB 1: RECORDS -->
    <section v-if="activeTab === 'records'" class="panel overflow-hidden">
      <!-- Filters -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1 min-w-[240px]">
          <input
            v-model="searchQuery"
            type="text"
            class="input-field max-w-sm"
            :placeholder="$t('behavior.search_placeholder')"
            @input="debouncedFetch"
          />
          <select v-model="typeFilter" class="input-field w-auto" @change="fetchRecords">
            <option value="">{{ $t('behavior.all_types') }}</option>
            <option value="merit">{{ $t('behavior.type_merit') }}</option>
            <option value="demerit">{{ $t('behavior.type_demerit') }}</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th>{{ $t('behavior.col_date') }}</th>
              <th>{{ $t('behavior.col_student') }}</th>
              <th>{{ $t('behavior.col_type') }}</th>
              <th>{{ $t('behavior.col_title') }}</th>
              <th>{{ $t('behavior.col_points') }}</th>
              <th>{{ $t('behavior.col_action') }}</th>
              <th>{{ $t('behavior.col_recorded_by') }}</th>
              <th class="text-right">{{ $t('behavior.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingRecords">
              <td colspan="8" class="text-center py-10 text-ink-muted">{{ $t('common.loading') }}</td>
            </tr>
            <tr v-else-if="!records.length">
              <td colspan="8" class="text-center py-10 text-ink-muted">{{ $t('behavior.empty_records') }}</td>
            </tr>
            <tr v-for="rec in records" :key="rec.recordId">
              <td class="text-xs text-ink-muted whitespace-nowrap">
                {{ formatDate(rec.incidentDate) }}
              </td>
              <td>
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {{ (locale === 'lo' ? rec.student.fullNameLo : rec.student.fullNameEn).charAt(0) }}
                  </div>
                  <div>
                    <button type="button" class="font-semibold text-slate-800 dark:text-white hover:text-teal-500 text-left" @click="viewStudentConduct(rec.student.studentId)">
                      {{ locale === 'lo' ? rec.student.fullNameLo : rec.student.fullNameEn }}
                    </button>
                    <p class="text-[11px] text-ink-muted font-mono">{{ rec.student.studentCode }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span
                  class="badge font-semibold text-xs px-2 py-0.5 rounded-md"
                  :class="rec.type === 'merit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                >
                  {{ rec.type === 'merit' ? $t('behavior.type_merit') : $t('behavior.type_demerit') }}
                </span>
              </td>
              <td>
                <p class="font-medium text-sm text-slate-800 dark:text-white">
                  {{ locale === 'lo' ? rec.titleLo : rec.titleEn }}
                </p>
                <p v-if="rec.description" class="text-xs text-ink-muted line-clamp-1">{{ rec.description }}</p>
              </td>
              <td>
                <span class="font-bold text-sm" :class="rec.type === 'merit' ? 'text-emerald-500' : 'text-rose-500'">
                  {{ rec.type === 'merit' ? `+${rec.points}` : `-${rec.points}` }}
                </span>
              </td>
              <td class="text-xs text-ink-muted max-w-[150px] truncate">
                {{ rec.actionTaken || '—' }}
              </td>
              <td class="text-xs text-ink-muted">
                {{ rec.recorder ? (locale === 'lo' ? rec.recorder.fullNameLo : rec.recorder.fullNameEn) : '—' }}
              </td>
              <td class="text-right whitespace-nowrap">
                <button type="button" class="btn-secondary text-xs px-2.5 py-1 mr-2" @click="openEditRecord(rec)">
                  {{ $t('common.edit') }}
                </button>
                <button
                  type="button"
                  class="btn-danger text-xs px-2.5 py-1"
                  @click="deleteRecord(rec.recordId)"
                >
                  {{ $t('common.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- TAB 2: CONDUCT SCORES -->
    <section v-if="activeTab === 'scores'" class="panel overflow-hidden">
      <div class="p-4 border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-md">
          <label class="block text-sm font-semibold mb-2">{{ $t('behavior.select_student_score') }}</label>
          <StudentPicker v-model="selectedStudentId" @update:model-value="loadStudentConductScore" />
        </div>
      </div>

      <div class="p-4">
      <div v-if="studentProfile" class="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-6">
        <!-- Student Header -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-2xl">
              {{ (locale === 'lo' ? studentProfile.student.fullNameLo : studentProfile.student.fullNameEn).charAt(0) }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-800 dark:text-white">
                {{ locale === 'lo' ? studentProfile.student.fullNameLo : studentProfile.student.fullNameEn }}
              </h3>
              <p class="text-sm text-ink-muted font-mono">{{ studentProfile.student.studentCode }}</p>
            </div>
          </div>

          <!-- Score Card -->
          <div class="flex items-center gap-4 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="text-right">
              <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('behavior.conduct_score') }}</p>
              <span
                class="badge font-bold text-xs px-2.5 py-0.5 rounded-full"
                :class="ratingClass(studentProfile.summary.rating)"
              >
                {{ $t(`behavior.rating_${studentProfile.summary.rating}`) }}
              </span>
            </div>
            <div class="text-4xl font-extrabold text-teal-500">
              {{ studentProfile.summary.finalScore }}<span class="text-lg text-ink-muted font-normal">/100</span>
            </div>
          </div>
        </div>

        <!-- Student Timeline -->
        <div>
          <h4 class="font-bold text-sm mb-3">{{ $t('behavior.incident_timeline') }}</h4>
          <div v-if="!studentProfile.records.length" class="text-sm text-ink-muted py-4">
            {{ $t('behavior.empty_timeline') }}
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="rec in studentProfile.records"
              :key="rec.recordId"
              class="p-4 rounded-xl border flex items-center justify-between gap-4"
              :class="rec.type === 'merit' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'"
            >
              <div>
                <p class="font-semibold text-sm text-slate-800 dark:text-white">
                  {{ locale === 'lo' ? rec.titleLo : rec.titleEn }}
                </p>
                <p class="text-xs text-ink-muted">
                  {{ formatDate(rec.incidentDate) }} • {{ rec.category ? (locale === 'lo' ? rec.category.nameLo : rec.category.nameEn) : '—' }}
                </p>
                <p v-if="rec.actionTaken" class="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {{ $t('behavior.action_taken_label') }}: {{ rec.actionTaken }}
                </p>
              </div>
              <span class="font-bold text-lg" :class="rec.type === 'merit' ? 'text-emerald-500' : 'text-rose-500'">
                {{ rec.type === 'merit' ? `+${rec.points}` : `-${rec.points}` }}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>

    <!-- TAB 3: CATEGORIES -->
    <section v-if="activeTab === 'categories'" class="panel overflow-hidden">
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h3 class="font-bold text-base">{{ $t('behavior.category_title') }}</h3>
        <button type="button" class="btn-secondary text-sm" @click="openCategoryModal()">
          + {{ $t('behavior.add_category') }}
        </button>
      </div>

      <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="cat in categories" :key="cat.categoryId" class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge text-xs px-2 py-0.5 rounded" :class="cat.type === 'merit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'">
                {{ cat.type === 'merit' ? $t('behavior.type_merit') : $t('behavior.type_demerit') }}
              </span>
              <p class="font-bold text-sm text-slate-800 dark:text-white">{{ locale === 'lo' ? cat.nameLo : cat.nameEn }}</p>
            </div>
            <p class="text-xs text-ink-muted mt-0.5">{{ locale === 'lo' ? cat.nameEn : cat.nameLo }}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="font-bold text-sm tnum" :class="cat.type === 'merit' ? 'text-emerald-500' : 'text-rose-500'">
              {{ cat.type === 'merit' ? `+${cat.defaultPoints}` : `-${cat.defaultPoints}` }} {{ $t('behavior.points_unit') }}
            </span>
            <button type="button" class="btn-secondary text-xs px-2.5 py-1" @click="openCategoryModal(cat)">{{ $t('common.edit') }}</button>
            <button type="button" class="btn-danger text-xs px-2.5 py-1" @click="deleteCategory(cat)">{{ $t('common.delete') }}</button>
          </div>
        </div>
      </div>
      </div>
    </section>

    <!-- Modal: Create Behavior Record -->
    <AppModal :open="createModalOpen" :title="editingRecord ? $t('behavior.modal_edit_title') : $t('behavior.modal_log_title')" @update:open="createModalOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submitRecord">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_student') }} *</label>
            <p v-if="editingRecord" class="input-field bg-surface-2 text-ink-muted">
              {{ locale === 'lo' ? editingRecord.student.fullNameLo : editingRecord.student.fullNameEn }}
            </p>
            <StudentPicker v-else v-model="form.studentId" input-id="behavior-student" />
          </div>
          <div>
            <label for="behavior-date" class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_date') }} *</label>
            <input id="behavior-date" v-model="form.incidentDate" type="date" class="input-field" required :max="todayStr" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_type') }} *</label>
            <select v-model="form.type" class="input-field" required @change="onTypeChange">
              <option value="merit">{{ $t('behavior.type_merit') }}</option>
              <option value="demerit">{{ $t('behavior.type_demerit') }}</option>
            </select>
          </div>

          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.tab_categories') }}</label>
            <select v-model="form.categoryId" class="input-field" @change="onCategorySelect">
              <option :value="undefined">---</option>
              <option v-for="c in filteredCategories" :key="c.categoryId" :value="c.categoryId">
                {{ locale === 'lo' ? c.nameLo : c.nameEn }} ({{ c.defaultPoints }} {{ $t('behavior.points_unit') }})
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.title_lo') }} *</label>
          <input v-model.trim="form.titleLo" type="text" class="input-field" required />
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.title_en') }} *</label>
          <input v-model.trim="form.titleEn" type="text" class="input-field" required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_points') }} *</label>
            <input v-model.number="form.points" type="number" min="1" max="50" class="input-field" required />
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_action') }}</label>
            <input v-model.trim="form.actionTaken" type="text" class="input-field" />
          </div>
        </div>

        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('common.description') }}</label>
          <textarea v-model.trim="form.description" class="input-field" rows="2"></textarea>
        </div>

        <div v-if="!editingRecord" class="flex items-center gap-2 pt-2">
          <input id="notify-parent" v-model="form.notifyParent" type="checkbox" class="rounded text-teal-500 focus:ring-teal-400" />
          <label for="notify-parent" class="text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ $t('behavior.notify_parent_checkbox') }}
          </label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="createModalOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary" :disabled="savingRecord">
            {{ savingRecord ? $t('common.loading') : $t('common.save') }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Add Category -->
    <AppModal :open="categoryModalOpen" :title="editingCategoryId ? $t('behavior.modal_cat_edit_title') : $t('behavior.modal_cat_title')" @update:open="categoryModalOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submitCategory">
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.name_lo') }} *</label>
          <input v-model.trim="categoryForm.nameLo" type="text" class="input-field" required />
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.name_en') }} *</label>
          <input v-model.trim="categoryForm.nameEn" type="text" class="input-field" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_type') }} *</label>
            <select v-model="categoryForm.type" class="input-field" required>
              <option value="merit">{{ $t('behavior.type_merit') }}</option>
              <option value="demerit">{{ $t('behavior.type_demerit') }}</option>
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('behavior.col_points') }} *</label>
            <input v-model.number="categoryForm.defaultPoints" type="number" min="1" max="50" class="input-field" required />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="categoryModalOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary">{{ $t('common.save') }}</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import PageHeader from '../../../components/PageHeader.vue';
import AppModal from '../../../components/AppModal.vue';
import StudentPicker from '../../../components/StudentPicker.vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

definePageMeta({ layout: 'admin' });

const { locale, t } = useI18n();
const dialog = useDialog();
const apiClient = useApiClient();
const activeTab = ref<'records' | 'scores' | 'categories'>('records');

const overview = ref({
  totalRecords: 0,
  totalMerits: 0,
  totalDemerits: 0,
  totalStudents: 0,
});

const records = ref<any[]>([]);
const categories = ref<any[]>([]);
const loadingRecords = ref(false);
const searchQuery = ref('');
const typeFilter = ref('');

const selectedStudentId = ref<number | null>(null);
const studentProfile = ref<any>(null);

const createModalOpen = ref(false);
const categoryModalOpen = ref(false);
const savingRecord = ref(false);

const form = reactive({
  studentId: null as number | null,
  categoryId: undefined as number | undefined,
  type: 'merit' as 'merit' | 'demerit',
  titleLo: '',
  titleEn: '',
  description: '',
  points: 5,
  actionTaken: '',
  notifyParent: true,
  incidentDate: '',
});

const categoryForm = reactive({
  nameLo: '',
  nameEn: '',
  type: 'merit' as 'merit' | 'demerit',
  defaultPoints: 5,
});

const filteredCategories = computed(() => {
  return categories.value.filter((c) => c.type === form.type);
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ratingClass = (rating: string) => {
  switch (rating) {
    case 'excellent': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'good': return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    case 'fair': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    default: return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  }
};

const fetchOverview = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.behavior.overview, { method: 'GET' });
    if (res?.data) overview.value = res.data;
  } catch (err) {
    console.error('Error fetching behavior overview:', err);
  }
};

const fetchCategories = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.behavior.categories, { method: 'GET' });
    if (res?.data?.categories) categories.value = res.data.categories;
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

const fetchRecords = async () => {
  loadingRecords.value = true;
  try {
    const query: any = {};
    if (searchQuery.value) query.search = searchQuery.value;
    if (typeFilter.value) query.type = typeFilter.value;
    const res = await apiClient<any>(API_ENDPOINTS.behavior.records, { method: 'GET', query });
    if (res?.data?.records) records.value = res.data.records;
  } catch (err) {
    console.error('Error fetching records:', err);
  } finally {
    loadingRecords.value = false;
  }
};

let debounceTimer: any = null;
const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchRecords, 300);
};

const loadStudentConductScore = async (studentId: number | null) => {
  if (!studentId) {
    studentProfile.value = null;
    return;
  }
  try {
    const res = await apiClient<any>(`${API_ENDPOINTS.behavior.students}/${studentId}`, { method: 'GET' });
    if (res?.data) studentProfile.value = res.data;
  } catch (err) {
    console.error('Error loading conduct score:', err);
  }
};

const viewStudentConduct = (studentId: number) => {
  selectedStudentId.value = studentId;
  activeTab.value = 'scores';
  loadStudentConductScore(studentId);
};

// Calendar date on this device, as the date input expects (YYYY-MM-DD).
const localDate = (d: Date) => d.toLocaleDateString('en-CA');
const todayStr = computed(() => localDate(new Date()));
const editingRecord = ref<any>(null);

const openCreateModal = () => {
  editingRecord.value = null;
  form.incidentDate = todayStr.value;
  form.studentId = null;
  form.categoryId = undefined;
  form.type = 'merit';
  form.titleLo = '';
  form.titleEn = '';
  form.description = '';
  form.points = 5;
  form.actionTaken = '';
  form.notifyParent = true;
  createModalOpen.value = true;
};

const openEditRecord = (rec: any) => {
  editingRecord.value = rec;
  form.studentId = rec.student.studentId;
  form.categoryId = rec.categoryId ?? undefined;
  form.type = rec.type;
  form.titleLo = rec.titleLo;
  form.titleEn = rec.titleEn;
  form.description = rec.description ?? '';
  form.points = rec.points;
  form.actionTaken = rec.actionTaken ?? '';
  form.incidentDate = localDate(new Date(rec.incidentDate));
  createModalOpen.value = true;
};

const onTypeChange = () => {
  form.categoryId = undefined;
};

const onCategorySelect = () => {
  const cat = categories.value.find((c) => c.categoryId === form.categoryId);
  if (cat) {
    form.titleLo = cat.nameLo;
    form.titleEn = cat.nameEn;
    form.points = cat.defaultPoints;
  }
};

const submitRecord = async () => {
  if (!form.studentId) return;
  savingRecord.value = true;
  try {
    if (editingRecord.value) {
      const { studentId: _s, notifyParent: _n, ...changes } = form;
      await apiClient(`${API_ENDPOINTS.behavior.records}/${editingRecord.value.recordId}`, {
        method: 'PUT',
        body: { ...changes, categoryId: changes.categoryId ?? null },
      });
    } else {
      await apiClient(API_ENDPOINTS.behavior.records, { method: 'POST', body: form });
    }
    createModalOpen.value = false;
    await Promise.all([fetchRecords(), fetchOverview()]);
    if (selectedStudentId.value) loadStudentConductScore(selectedStudentId.value);
  } catch (err) {
    dialog.error(getErrorMessage(err));
  } finally {
    savingRecord.value = false;
  }
};

const deleteRecord = (id: number) => {
  dialog.confirm({
    message: t('behavior.confirm_delete'),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.behavior.records}/${id}`, { method: 'DELETE' });
      await Promise.all([fetchRecords(), fetchOverview()]);
    },
  });
};

// The same modal adds a category or, given one, edits it.
const editingCategoryId = ref<number | null>(null);
const openCategoryModal = (cat?: any) => {
  editingCategoryId.value = cat?.categoryId ?? null;
  categoryForm.nameLo = cat?.nameLo ?? '';
  categoryForm.nameEn = cat?.nameEn ?? '';
  categoryForm.type = cat?.type ?? 'merit';
  categoryForm.defaultPoints = cat?.defaultPoints ?? 5;
  categoryModalOpen.value = true;
};

const submitCategory = async () => {
  try {
    if (editingCategoryId.value) {
      await apiClient(`${API_ENDPOINTS.behavior.categories}/${editingCategoryId.value}`, { method: 'PUT', body: categoryForm });
    } else {
      await apiClient(API_ENDPOINTS.behavior.categories, { method: 'POST', body: categoryForm });
    }
    categoryModalOpen.value = false;
    await fetchCategories();
  } catch (err) {
    dialog.error(getErrorMessage(err));
  }
};

const deleteCategory = (cat: any) => {
  dialog.confirm({
    message: t('behavior.confirm_delete_category', { name: locale.value === 'lo' ? cat.nameLo : cat.nameEn }),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.behavior.categories}/${cat.categoryId}`, { method: 'DELETE' });
      await fetchCategories();
    },
  });
};

onMounted(() => {
  fetchOverview();
  fetchCategories();
  fetchRecords();
});
</script>
