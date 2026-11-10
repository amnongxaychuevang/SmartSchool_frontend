<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ $t('academic_terms_ui.title') }}</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('academic_terms_ui.subtitle') }}
        </p>
      </div>
      <button type="button" class="h-9 px-3.5 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:shadow-none" @click="openModal()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        {{ $t('academic_terms_ui.add_term') }}
      </button>
    </div>

    <div class="glass-panel overflow-hidden">
      <div class="overflow-x-auto">
        <LoadingSpinner v-if="loading" class="my-12" />
        <EmptyState v-else-if="terms.length === 0" icon="calendar" :title="$t('academic_terms_ui.no_terms')" />
        <table v-else class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('academic_terms_ui.col_academic_year') }}</th>
              <th>{{ $t('academic_terms_ui.col_term') }}</th>
              <th class="hidden sm:table-cell">{{ $t('academic_terms_ui.col_dates') }}</th>
              <th>{{ $t('academic_terms_ui.col_status') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
            <tr v-for="(term, i) in terms" :key="term.termId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="text-center tnum text-ink-subtle">{{ i + 1 }}</td>
              <td class="text-sm font-semibold text-slate-900 dark:text-white">{{ term.academicYear }}</td>
              <td class="text-sm text-slate-700 dark:text-slate-300">{{ locale === 'lo' ? term.termNameLo : term.termNameEn }}</td>
              <td class="text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">{{ term.startDate.slice(0, 10) }} → {{ term.endDate.slice(0, 10) }}</td>
              <td class="">
                <StatusBadge :status="term.status" :tone="TERM_TONE[term.status]" :label="statusLabel(term.status)" />
              </td>
              <td class="">
                <div class="flex items-center justify-end gap-1">
                  <IconButton icon="edit" :label="$t('common.edit')" @click="openModal(term)" />
                  <IconButton icon="delete" :label="$t('common.delete')" @click="askDelete(term)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit/Add Modal -->
    <AppModal :open="modal.open" :title="modal.termId ? $t('academic_terms_ui.edit_term') : $t('academic_terms_ui.add_term')" @update:open="modal.open = $event">
      <form id="term-form" class="flex flex-col gap-4" @submit.prevent="save">
        <div v-if="modal.error" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-4 py-2.5">
          {{ modal.error }}
        </div>

        <FormField v-slot="{ id }" class="field" :label="$t('academic_terms_ui.col_academic_year')" required>
          <input :id="id" v-model="modal.form.academicYear" required pattern="\d{4}-\d{4}" placeholder="2026-2027" class="input-field" >
        </FormField>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField v-slot="{ id }" class="field" :label="$t('academic_terms_ui.name_en')" required>
            <input :id="id" v-model="modal.form.termNameEn" required class="input-field" placeholder="Term 1" >
          </FormField>
          <FormField v-slot="{ id }" class="field" :label="$t('academic_terms_ui.name_lo')" required>
            <input :id="id" v-model="modal.form.termNameLo" required class="input-field" placeholder="ພາກຮຽນ 1" >
          </FormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField v-slot="{ id }" class="field" :label="$t('academic_terms_ui.start')" required>
            <input :id="id" v-model="modal.form.startDate" required type="date" class="input-field" >
          </FormField>
          <FormField v-slot="{ id }" class="field" :label="$t('academic_terms_ui.end')" required>
            <input :id="id" v-model="modal.form.endDate" required type="date" class="input-field" :min="modal.form.startDate || undefined">
          </FormField>
        </div>

        <FormField v-slot="{ id }" class="field" :label="$t('academic_terms_ui.col_status')">
          <select :id="id" v-model="modal.form.status" class="input-field">
            <option v-for="s in STATUSES" :key="s" :value="s">{{ statusLabel(s) }}</option>
          </select>
        </FormField>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" @click="modal.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="term-form" :disabled="modal.saving" class="btn-primary disabled:opacity-60">
          {{ modal.saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </AppModal>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :open="del.open"
      tone="danger"
      :title="$t('academic_terms_ui.delete_term')"
      :message="del.term ? $t('academic_terms_ui.delete_confirm', { name: locale === 'lo' ? del.term.termNameLo : del.term.termNameEn }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @update:open="del.open = $event"
      @confirm="removeTerm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { academicsRepository, type AcademicTerm } from '../../../infrastructure/api/AcademicsRepository';
import type { StatusTone } from '../../../components/StatusBadge.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
useHead({ title: () => t('page_titles.academic_terms') });

const STATUSES = ['active', 'upcoming', 'completed'] as const;
type Status = (typeof STATUSES)[number];

const TERM_TONE: Record<Status, StatusTone> = { active: 'success', upcoming: 'info', completed: 'neutral' };

const statusLabel = (s: Status) =>
  ({ active: t('academic_terms_ui.status_active'), upcoming: t('academic_terms_ui.status_upcoming'), completed: t('academic_terms_ui.status_completed') })[s];

const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && err.message) || fallback;

const terms = ref<AcademicTerm[]>([]);
const loading = ref(true);

const fetchTerms = async () => {
  loading.value = true;
  try {
    terms.value = await academicsRepository.getTerms();
  } finally {
    loading.value = false;
  }
};
onMounted(fetchTerms);

const emptyForm = () => ({ academicYear: '', termNameEn: '', termNameLo: '', startDate: '', endDate: '', status: 'upcoming' as Status });
const modal = reactive({ open: false, saving: false, error: '', termId: null as number | null, form: emptyForm() });

const openModal = (term?: AcademicTerm) => {
  modal.termId = term?.termId ?? null;
  modal.form = term
    ? { academicYear: term.academicYear, termNameEn: term.termNameEn, termNameLo: term.termNameLo,
        startDate: term.startDate.slice(0, 10), endDate: term.endDate.slice(0, 10), status: term.status }
    : emptyForm();
  modal.error = '';
  modal.open = true;
};

const save = async () => {
  if (modal.form.endDate < modal.form.startDate) {
    modal.error = t('academic_terms_ui.err_end_date');
    return;
  }
  modal.saving = true;
  modal.error = '';
  try {
    await academicsRepository.saveTerm(modal.termId, modal.form);
    modal.open = false;
    await fetchTerms();
  } catch (err) {
    modal.error = errorMessage(err, 'Failed to save term');
  } finally {
    modal.saving = false;
  }
};

const del = reactive({ open: false, busy: false, error: '', term: null as AcademicTerm | null });
const askDelete = (term: AcademicTerm) => {
  del.term = term;
  del.error = '';
  del.open = true;
};

const removeTerm = async () => {
  if (!del.term) return;
  del.busy = true;
  del.error = '';
  try {
    await academicsRepository.deleteTerm(del.term.termId);
    del.open = false;
    await fetchTerms();
  } catch (err) {
    del.error = errorMessage(err, t('academic_terms_ui.err_in_use'));
  } finally {
    del.busy = false;
  }
};
</script>

<style scoped>
.field {
  @apply flex flex-col gap-1.5;
}
</style>
