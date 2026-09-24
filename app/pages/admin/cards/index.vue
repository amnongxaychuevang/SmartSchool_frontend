<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('navSection.attendance')" :title="$t('cards_admin.title')" :subtitle="$t('cards_admin.subtitle')">
      <input v-model="searchInput" type="search" class="input-field w-64" :placeholder="$t('cards_admin.search')" @input="handleSearch">
      <select v-model="statusFilter" class="input-field w-auto" :aria-label="$t('common.status')" @change="handleFilter">
        <option value="">{{ $t('cards_admin.all_status') }}</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ $t(`status.${s}`) }}</option>
      </select>
      <button type="button" class="btn-primary" @click="openCreate">{{ $t('cards_admin.issue') }}</button>
    </PageHeader>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="academicsStore.cardsLoading" />
      <p v-else-if="!academicsStore.cards.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('cards_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('cards_admin.col_uid') }}</th>
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
              <td class="font-mono font-semibold text-primary-ink">{{ card.cardUid }}</td>
              <td>
                <p class="font-semibold">{{ studentName(card) }}</p>
                <p class="text-xs text-ink-subtle font-mono">{{ card.student?.studentCode }}</p>
              </td>
              <td><span :class="statusBadge[card.status]">{{ $t(`status.${card.status}`) }}</span></td>
              <td class="tnum">{{ f.date(card.issuedDate) }}</td>
              <td class="tnum">{{ f.date(card.expiredDate) }}</td>
              <td class="max-w-xs truncate text-ink-muted" :title="card.notes ?? undefined">{{ card.notes || '—' }}</td>
              <td class="text-right">
                <div class="inline-flex gap-2">
                  <button type="button" class="btn-secondary min-h-8 px-3" @click="openEdit(card)">{{ $t('common.edit') }}</button>
                  <button type="button" class="btn-danger min-h-8 px-3" @click="openDelete(card)">{{ $t('common.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :current-page="academicsStore.cardsPage" :total-pages="totalPages" @update:page="changePage" />
    </section>

    <AppModal v-model:open="modal.open" :title="modal.cardId ? $t('cards_admin.edit') : $t('cards_admin.issue')">
      <form id="card-form" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div>
          <label for="c-uid" class="block mb-1.5 text-sm font-semibold">{{ $t('cards_admin.uid') }}</label>
          <input id="c-uid" v-model.trim="modal.form.cardUid" :disabled="!!modal.cardId" required maxlength="50" class="input-field font-mono" :placeholder="$t('cards_admin.uid_placeholder')">
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
      v-model:open="del.open"
      tone="danger"
      :title="$t('cards_admin.delete_title')"
      :message="del.card ? $t('cards_admin.delete_msg', { uid: del.card.cardUid }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Card } from '../../../domain/models/Academics';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAcademicsStore } from '../../../application/stores/academics';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import StudentPicker from '../../../components/StudentPicker.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('cards_admin.title') });

const academicsStore = useAcademicsStore();
const statuses = ['active', 'lost', 'deactivated'] as const;
const statusBadge: Record<Card['status'], string> = { active: 'badge-success', lost: 'badge-danger', deactivated: 'badge-neutral' };
const searchInput = ref('');
const statusFilter = ref('');
const totalPages = computed(() => Math.ceil(academicsStore.cardsTotal / 15));
let searchTimeout: ReturnType<typeof setTimeout>;

const studentName = (c: Card) => (locale.value === 'lo' ? c.student?.fullNameLo : c.student?.fullNameEn) || c.student?.fullNameEn || '—';

onMounted(() => academicsStore.fetchCards());
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => academicsStore.fetchCards({ search: searchInput.value, page: 1 }), 400);
};
const handleFilter = () => academicsStore.fetchCards({ status: statusFilter.value, page: 1 });
const changePage = (page: number) => academicsStore.fetchCards({ page });

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
