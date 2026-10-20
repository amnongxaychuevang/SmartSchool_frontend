<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-start gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="$t('subjects_admin.search')" class="search-bar" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="searchInput = ''; handleSearch()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 flex-1">
        <button class="sm:ml-auto w-full sm:w-auto justify-center h-9 px-3.5 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:shadow-none" @click="openCreate">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          {{ $t('subjects_admin.add') }}
        </button>
      </div>
    </div>

    <div v-if="academicsStore.subjectsLoading" class="glass-panel p-12 flex justify-center">
      <LoadingSpinner />
    </div>
    <div v-else-if="!academicsStore.subjects.length" class="glass-panel flex flex-col items-center justify-center py-20 text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <p>{{ $t('subjects_admin.empty') }}</p>
    </div>
    <div v-else class="glass-panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('subjects_admin.col_code') }}</th>
              <th>{{ $t('subjects_admin.col_name') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
            <tr v-for="(subject, index) in academicsStore.subjects" :key="subject.subjectId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="text-sm text-slate-500 dark:text-slate-400 text-center">{{ (academicsStore.subjectsPage - 1) * 15 + index + 1 }}</td>
              <td class="text-sm text-slate-500 dark:text-slate-400 font-mono">{{ subject.subjectCode || '—' }}</td>
              <td>
                <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ locale === 'lo' ? subject.subjectNameLo : subject.subjectNameEn }}</span>
              </td>
              <td class="align-middle text-right">
                <div class="inline-flex items-center justify-end gap-1">
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" :title="$t('common.edit')" @click="openEdit(subject)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" :title="$t('common.delete')" @click="openDelete(subject)">
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
    </div>
    
    <!-- Pagination -->
    <PaginationBar :loading="academicsStore.subjectsLoading" :current-page="academicsStore.subjectsPage" :total-pages="totalPages" @update:page="changePage" />

    <AppModal :open="modal.open" :title="modal.subjectId ? $t('subjects_admin.edit') : $t('subjects_admin.add')" @update:open="modal.open = $event">
      <form id="subject-form" class="grid grid-cols-2 gap-4" @submit.prevent="handleSubmit">

        <div class="col-span-2">
          <label for="s-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('subjects_admin.name_lo') }}</label>
          <input id="s-lo" v-model.trim="modal.form.subjectNameLo" required lang="lo" class="input-field">
        </div>
        <div class="col-span-2">
          <label for="s-en" class="block mb-1.5 text-sm font-semibold">{{ $t('subjects_admin.name_en') }}</label>
          <input id="s-en" v-model.trim="modal.form.subjectNameEn" required lang="en" class="input-field">
        </div>
        <p v-if="modal.error" role="alert" class="col-span-2 rounded border border-danger-line bg-danger-soft text-sm text-danger">{{ modal.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="modal.saving" @click="modal.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="subject-form" class="btn-primary" :disabled="modal.saving">{{ modal.saving ? $t('common.saving') : $t('common.save') }}</button>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="del.open"
      tone="danger"
      :title="$t('subjects_admin.delete_title')"
      :message="del.subject ? $t('subjects_admin.delete_msg', { name: locale === 'lo' ? del.subject.subjectNameLo : del.subject.subjectNameEn }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @update:open="del.open = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Subject } from '../../../domain/models/Academics';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAcademicsStore } from '../../../application/stores/academics';
import PaginationBar from '../../../components/PaginationBar.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('subjects_admin.title') });

const academicsStore = useAcademicsStore();
const searchInput = ref('');
const totalPages = computed(() => Math.ceil(academicsStore.subjectsTotal / 15));
let searchTimeout: ReturnType<typeof setTimeout>;

onMounted(() => academicsStore.fetchSubjects());
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => academicsStore.fetchSubjects({ search: searchInput.value, page: 1 }), 400);
};
const changePage = (page: number) => academicsStore.fetchSubjects({ search: searchInput.value, page });

const emptyForm = () => ({ subjectCode: '', subjectNameEn: '', subjectNameLo: '', credits: 1, isActive: true });
const modal = reactive({ open: false, saving: false, error: '', subjectId: null as number | null, form: emptyForm() });
const openCreate = () => Object.assign(modal, { open: true, saving: false, error: '', subjectId: null, form: emptyForm() });
const openEdit = (s: Subject) => Object.assign(modal, {
  open: true, saving: false, error: '', subjectId: s.subjectId,
  form: { subjectCode: s.subjectCode ?? '', subjectNameEn: s.subjectNameEn, subjectNameLo: s.subjectNameLo, credits: Number(s.credits), isActive: s.isActive },
});

async function handleSubmit() {
  modal.saving = true;
  modal.error = '';
  try {
    if (modal.subjectId) await academicsStore.updateSubject(modal.subjectId, modal.form);
    else await academicsStore.createSubject(modal.form);
    modal.open = false;
  } catch (err) {
    modal.error = getErrorMessage(err, t('common.error'));
  } finally {
    modal.saving = false;
  }
}

const del = reactive({ open: false, busy: false, error: '', subject: null as Subject | null });
const openDelete = (subject: Subject) => Object.assign(del, { open: true, busy: false, error: '', subject });
async function handleDelete() {
  if (!del.subject) return;
  del.busy = true;
  del.error = '';
  try {
    await academicsStore.deleteSubject(del.subject.subjectId);
    del.open = false;
  } catch (err) {
    del.error = getErrorMessage(err, t('common.error'));
  } finally {
    del.busy = false;
  }
}
</script>
