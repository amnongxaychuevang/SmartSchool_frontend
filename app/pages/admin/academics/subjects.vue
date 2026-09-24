<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('nav.academic')" :title="$t('subjects_admin.title')" :subtitle="$t('subjects_admin.subtitle')">
      <input v-model="searchInput" type="search" class="input-field w-64" :placeholder="$t('subjects_admin.search')" @input="handleSearch">
      <button type="button" class="btn-primary" @click="openCreate">{{ $t('subjects_admin.add') }}</button>
    </PageHeader>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="academicsStore.subjectsLoading" />
      <p v-else-if="!academicsStore.subjects.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('subjects_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('subjects_admin.col_code') }}</th>
              <th>{{ $t('subjects_admin.col_name') }}</th>
              <th class="text-right">{{ $t('subjects_admin.col_credits') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in academicsStore.subjects" :key="subject.subjectId">
              <td class="font-mono text-ink-muted">{{ subject.subjectCode || '—' }}</td>
              <td>
                <p class="font-semibold">{{ locale === 'lo' ? subject.subjectNameLo : subject.subjectNameEn }}</p>
                <p class="text-xs text-ink-subtle">{{ locale === 'lo' ? subject.subjectNameEn : subject.subjectNameLo }}</p>
              </td>
              <td class="text-right tnum">{{ f.number(subject.credits, 1) }}</td>
              <td>
                <span :class="subject.isActive ? 'badge-success' : 'badge-neutral'">
                  {{ subject.isActive ? $t('status.active') : $t('status.inactive') }}
                </span>
              </td>
              <td class="text-right">
                <div class="inline-flex gap-2">
                  <button type="button" class="btn-secondary min-h-8 px-3" @click="openEdit(subject)">{{ $t('common.edit') }}</button>
                  <button type="button" class="btn-danger min-h-8 px-3" @click="openDelete(subject)">{{ $t('common.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :current-page="academicsStore.subjectsPage" :total-pages="totalPages" @update:page="changePage" />
    </section>

    <AppModal v-model:open="modal.open" :title="modal.subjectId ? $t('subjects_admin.edit') : $t('subjects_admin.add')">
      <form id="subject-form" class="grid grid-cols-2 gap-4" @submit.prevent="handleSubmit">
        <div>
          <label for="s-code" class="block mb-1.5 text-sm font-semibold">{{ $t('subjects_admin.code') }}</label>
          <input id="s-code" v-model.trim="modal.form.subjectCode" maxlength="20" class="input-field font-mono" :placeholder="$t('subjects_admin.code_placeholder')">
        </div>
        <div>
          <label for="s-credits" class="block mb-1.5 text-sm font-semibold">{{ $t('subjects_admin.credits') }}</label>
          <input id="s-credits" v-model.number="modal.form.credits" type="number" min="0" step="0.5" class="input-field tnum">
        </div>
        <div class="col-span-2">
          <label for="s-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('subjects_admin.name_lo') }}</label>
          <input id="s-lo" v-model.trim="modal.form.subjectNameLo" required lang="lo" class="input-field">
        </div>
        <div class="col-span-2">
          <label for="s-en" class="block mb-1.5 text-sm font-semibold">{{ $t('subjects_admin.name_en') }}</label>
          <input id="s-en" v-model.trim="modal.form.subjectNameEn" required lang="en" class="input-field">
        </div>
        <label class="col-span-2 flex items-center gap-2 text-sm">
          <input v-model="modal.form.isActive" type="checkbox" class="h-4 w-4 rounded border-line-strong">
          {{ $t('subjects_admin.active') }}
        </label>
        <p v-if="modal.error" role="alert" class="col-span-2 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ modal.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="modal.saving" @click="modal.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="subject-form" class="btn-primary" :disabled="modal.saving">{{ modal.saving ? $t('common.saving') : $t('common.save') }}</button>
      </template>
    </AppModal>

    <ConfirmDialog
      v-model:open="del.open"
      tone="danger"
      :title="$t('subjects_admin.delete_title')"
      :message="del.subject ? $t('subjects_admin.delete_msg', { name: locale === 'lo' ? del.subject.subjectNameLo : del.subject.subjectNameEn }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Subject } from '../../../domain/models/Academics';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAcademicsStore } from '../../../application/stores/academics';
import PageHeader from '../../../components/PageHeader.vue';
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
