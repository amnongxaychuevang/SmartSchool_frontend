<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('cards_admin.title')" :subtitle="$t('cards_admin.subtitle')" />

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <div class="relative w-full sm:w-80">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" class="search-bar" :placeholder="$t('cards_admin.search')" :aria-label="$t('cards_admin.search')" @input="handleSearch">
        <button v-if="searchInput" type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" :aria-label="$t('common.clear_search')" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <select v-model="statusFilter" class="input-field w-full sm:w-48" :aria-label="$t('common.status')" @change="handleFilter">
        <option value="">{{ $t('cards_admin.all_status') }}</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ $t(`status.${s}`) }}</option>
      </select>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto sm:ml-auto">
        <NuxtLink to="/admin/cards/print" class="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>{{ $t('card_print.title') }}</span>
        </NuxtLink>
        <button v-if="canExport" type="button" class="btn-secondary flex-1 sm:flex-none" :disabled="exporting || !academicsStore.cardsTotal" @click="exportList">
          {{ exporting ? $t('common.loading') : $t('common.export_excel') }}
        </button>
        <button type="button" class="btn-primary flex-1 sm:flex-none" @click="openCreate">{{ $t('cards_admin.issue') }}</button>
      </div>
    </div>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="academicsStore.cardsLoading" />
      <p v-else-if="!academicsStore.cards.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('cards_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('cards_admin.col_uid') }}</th>
              <th>{{ $t('cards_admin.col_student_code') }}</th>
              <th>{{ $t('cards_admin.col_student') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('cards_admin.col_issued') }}</th>
              <th>{{ $t('cards_admin.col_expires') }}</th>
              <th>{{ $t('cards_admin.col_notes') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="card in academicsStore.cards" :key="card.cardId">
              <td class="font-mono font-semibold text-primary-ink whitespace-nowrap">{{ card.cardUid }}</td>
              <td class="font-mono text-xs text-ink-subtle whitespace-nowrap">{{ (card.student && card.student.studentCode) || '—' }}</td>
              <td class="font-medium whitespace-nowrap">{{ studentName(card) }}</td>
              <td><span :class="statusBadge[card.status]">{{ $t(`status.${card.status}`) }}</span></td>
              <td class="tnum">{{ f.date(card.issuedDate) }}</td>
              <td class="tnum">{{ f.date(card.expiredDate) }}</td>
              <td class="max-w-xs truncate text-ink-muted" :title="card.notes || undefined">{{ card.notes || '—' }}</td>
              <td class="text-right">
                <div class="inline-flex gap-2">
                  <NuxtLink :to="`/admin/cards/print?cardId=${card.cardId}`" class="btn-secondary min-h-8 px-2.5 flex items-center gap-1" :title="$t('card_print.title')">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </NuxtLink>
                  <button type="button" class="btn-secondary min-h-8 px-3" @click="openEdit(card)">{{ $t('common.edit') }}</button>
                  <button type="button" class="btn-danger min-h-8 px-3" @click="openDelete(card)">{{ $t('common.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        :loading="academicsStore.cardsLoading"
        :current-page="academicsStore.cardsPage"
        :total-pages="totalPages"
        :total="academicsStore.cardsTotal"
        :page-size="CARDS_PER_PAGE"
        @update:page="changePage"
      />
    </section>

    <AppModal :open="modal.open" :title="modal.cardId ? $t('cards_admin.edit') : $t('cards_admin.issue')" @update:open="modal.open = $event">
      <form id="card-form" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div>
          <label for="c-uid" class="block mb-1.5 text-sm font-semibold">{{ $t('cards_admin.uid') }}</label>
          <input id="c-uid" v-model.trim="modal.form.cardUid" :disabled="!!modal.cardId" required maxlength="50" class="input-field" :placeholder="$t('cards_admin.uid_placeholder')">
        </div>
        <div v-if="!modal.cardId">
          <label for="c-student" class="block mb-1.5 text-sm font-semibold">{{ $t('cards_admin.student') }}</label>
          <StudentPicker v-model="modal.form.studentId" input-id="c-student" />
        </div>
        <div v-else>
          <p class="text-sm font-semibold">{{ $t('cards_admin.student') }}</p>
          <p class="text-sm text-ink-muted">{{ modal.studentLabel }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-if="modal.cardId">
            <label for="c-status" class="block mb-1.5 text-sm font-semibold">{{ $t('common.status') }}</label>
            <select id="c-status" v-model="modal.form.status" class="input-field">
              <option v-for="s in statuses" :key="s" :value="s">{{ $t(`status.${s}`) }}</option>
            </select>
          </div>
          <div>
            <label for="c-exp" class="block mb-1.5 text-sm font-semibold">{{ $t('cards_admin.expires') }}</label>
            <input id="c-exp" v-model="modal.form.expiredDate" type="date" class="input-field">
          </div>
        </div>
        <div>
          <label for="c-notes" class="block mb-1.5 text-sm font-semibold">{{ $t('cards_admin.notes') }}</label>
          <input id="c-notes" v-model.trim="modal.form.notes" maxlength="255" class="input-field">
        </div>
        <p v-if="modal.error" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ modal.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="modal.saving" @click="modal.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="card-form" class="btn-primary" :disabled="modal.saving || (!modal.cardId && !modal.form.studentId)">
          {{ modal.saving ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </AppModal>

    <ConfirmDialog
      :open="del.open"
      tone="danger"
      :title="$t('cards_admin.delete_title')"
      :message="del.card ? $t('cards_admin.delete_msg', { uid: del.card.cardUid }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @update:open="del.open = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Card } from '../../../domain/models/Academics';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAcademicsStore, CARDS_PER_PAGE } from '../../../application/stores/academics';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import StudentPicker from '../../../components/StudentPicker.vue';
import { useFormat } from '../../../composables/useFormat';
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { useServerExport } from '../../../composables/useServerExport';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('cards_admin.title') });

const academicsStore = useAcademicsStore();
const statuses = ['active', 'lost', 'deactivated'] as const;
const statusBadge: Record<Card['status'], string> = { active: 'badge-success', lost: 'badge-danger', deactivated: 'badge-neutral' };
const searchInput = ref('');
const statusFilter = ref('');
const totalPages = computed(() => Math.ceil(academicsStore.cardsTotal / CARDS_PER_PAGE));
let searchTimeout: ReturnType<typeof setTimeout>;

const studentName = (c: Card) => (locale.value === 'lo' ? c.student?.fullNameLo : c.student?.fullNameEn) || c.student?.fullNameEn || '—';

onMounted(() => academicsStore.fetchCards());
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => academicsStore.fetchCards({ search: searchInput.value, page: 1 }), 400);
};
const clearSearch = () => { searchInput.value = ''; academicsStore.fetchCards({ search: '', page: 1 }); };
const handleFilter = () => academicsStore.fetchCards({ status: statusFilter.value, page: 1 });
const changePage = (page: number) => academicsStore.fetchCards({ page });

// Standard export: the server builds the file from the same filters (and audit-logs it).
const authStore = useAuthStore();
const canExport = computed(() => hasPermission(authStore.permissions, 'cards.export'));
const { exporting, download } = useServerExport();
const exportList = () => download('/cards/export', { search: searchInput.value, status: statusFilter.value }, 'student-cards');

// ── Issue / edit ──
const emptyForm = () => ({ cardUid: '', studentId: null as number | null, status: 'active' as Card['status'], expiredDate: '', notes: '' });
const modal = reactive({ open: false, saving: false, error: '', cardId: null as number | null, studentLabel: '', form: emptyForm() });
const openCreate = () => Object.assign(modal, { open: true, saving: false, error: '', cardId: null, studentLabel: '', form: emptyForm() });
const openEdit = (card: Card) => Object.assign(modal, {
  open: true, saving: false, error: '', cardId: card.cardId,
  studentLabel: `${studentName(card)} · ${card.student?.studentCode ?? ''}`,
  form: { cardUid: card.cardUid, studentId: card.studentId, status: card.status, expiredDate: card.expiredDate?.slice(0, 10) ?? '', notes: card.notes ?? '' },
});

async function handleSubmit() {
  modal.saving = true;
  modal.error = '';
  const { cardUid, studentId, status, expiredDate, notes } = modal.form;
  const optional = { ...(expiredDate ? { expiredDate } : {}), ...(notes ? { notes } : {}) };
  try {
    if (modal.cardId) await academicsStore.updateCard(modal.cardId, { status, ...optional });
    else await academicsStore.createCard({ cardUid, studentId, ...optional });
    modal.open = false;
  } catch (err) {
    modal.error = getErrorMessage(err, t('common.error'));
  } finally {
    modal.saving = false;
  }
}

// ── Delete ──
const del = reactive({ open: false, busy: false, error: '', card: null as Card | null });
const openDelete = (card: Card) => Object.assign(del, { open: true, busy: false, error: '', card });
async function handleDelete() {
  if (!del.card) return;
  del.busy = true;
  del.error = '';
  try {
    await academicsStore.deleteCard(del.card.cardId);
    del.open = false;
  } catch (err) {
    del.error = getErrorMessage(err, t('common.error'));
  } finally {
    del.busy = false;
  }
}
</script>
