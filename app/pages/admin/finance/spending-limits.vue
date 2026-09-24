<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('nav.finance')" :title="$t('limits_admin.title')" :subtitle="$t('limits_admin.subtitle')">
      <input v-model="searchInput" type="search" class="input-field w-64" :placeholder="$t('limits_admin.search')" @input="handleSearch">
    </PageHeader>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="adminStore.studentsLoading" />
      <p v-else-if="!adminStore.students.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('limits_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('limits_admin.col_student') }}</th>
              <th>{{ $t('limits_admin.col_class') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in adminStore.students" :key="s.studentId">
              <td>
                <p class="font-semibold">{{ studentName(s) }}</p>
                <p class="text-xs text-ink-subtle font-mono">{{ s.studentCode }}</p>
              </td>
              <td class="text-ink-muted">{{ className(s) }}</td>
              <td class="text-right">
                <button type="button" class="btn-secondary min-h-8 px-3" @click="openLimits(s)">{{ $t('limits_admin.manage') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :current-page="adminStore.studentsPage" :total-pages="totalPages" @update:page="changePage" />
    </section>

    <AppModal
      v-model:open="modal.open"
      :title="modal.student ? $t('limits_admin.modal_title', { name: studentName(modal.student) }) : ''"
      :subtitle="$t('limits_admin.empty_means')"
      size="lg"
    >
      <LoadingSpinner v-if="modal.loading" padding="py-8" />
      <form v-else id="limits-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleSubmit">
        <div v-for="field in moneyFields" :key="field.key">
          <label :for="`l-${field.key}`" class="block mb-1.5 text-sm font-semibold">{{ $t(field.label) }}</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-subtle">₭</span>
            <input :id="`l-${field.key}`" v-model.number="modal.form[field.key]" type="number" min="0" step="1000" class="input-field pl-7 tnum">
          </div>
        </div>

        <fieldset class="sm:col-span-2">
          <legend class="text-sm font-semibold">{{ $t('limits_admin.blocked') }}</legend>
          <p class="text-xs text-ink-subtle mb-2">{{ $t('limits_admin.blocked_hint') }}</p>
          <p v-if="!shops.length" class="text-sm text-ink-subtle">{{ $t('limits_admin.no_shops') }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label v-for="shop in shops" :key="shop.shopId" class="flex items-center gap-2 rounded border border-line px-3 py-2 text-sm">
              <input v-model="modal.form.blockedShops" type="checkbox" :value="shop.shopId" class="h-4 w-4 rounded border-line-strong">
              {{ locale === 'lo' ? shop.shopNameLo : shop.shopNameEn }}
            </label>
          </div>
        </fieldset>

        <div class="sm:col-span-2">
          <label for="l-notes" class="block mb-1.5 text-sm font-semibold">{{ $t('limits_admin.notes') }}</label>
          <input id="l-notes" v-model.trim="modal.form.notes" maxlength="255" class="input-field" :placeholder="$t('limits_admin.notes_placeholder')">
        </div>
        <p v-if="modal.error" role="alert" class="sm:col-span-2 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ modal.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="modal.saving" @click="modal.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="limits-form" class="btn-primary" :disabled="modal.saving || modal.loading">{{ modal.saving ? $t('common.saving') : $t('common.save') }}</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '../../../domain/models/Student';
import type { Shop } from '../../../domain/models/Finance';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAdminStore } from '../../../application/stores/admin';
import { financeRepository } from '../../../infrastructure/api/FinanceRepository';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import AppModal from '../../../components/AppModal.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
useHead({ title: () => t('limits_admin.title') });

const adminStore = useAdminStore();
const searchInput = ref('');
const totalPages = computed(() => Math.ceil(adminStore.studentsTotal / 15));
let searchTimeout: ReturnType<typeof setTimeout>;

const studentName = (s: Student) => (locale.value === 'lo' ? s.fullNameLo : s.fullNameEn) || s.fullNameEn;
const className = (s: Student) => {
  const c = s.classStudents?.[0]?.class;
  return c ? (locale.value === 'lo' ? c.classNameLo : c.classNameEn) : '—';
};

const shops = ref<Shop[]>([]);
onMounted(async () => {
  adminStore.fetchStudents({ page: 1 });
  shops.value = (await financeRepository.getShops({ limit: 200 })).shops;
});
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => adminStore.fetchStudents({ search: searchInput.value, page: 1 }), 400);
};
const changePage = (page: number) => adminStore.fetchStudents({ search: searchInput.value, page });

type MoneyKey = 'dailyMax' | 'weeklyMax' | 'perTransactionMax' | 'alertThreshold';
const moneyFields: { key: MoneyKey; label: string }[] = [
  { key: 'dailyMax', label: 'limits_admin.daily' },
  { key: 'weeklyMax', label: 'limits_admin.weekly' },
  { key: 'perTransactionMax', label: 'limits_admin.per_tx' },
  { key: 'alertThreshold', label: 'limits_admin.alert' },
];
const emptyForm = () => ({
  dailyMax: '' as number | '', weeklyMax: '' as number | '', perTransactionMax: '' as number | '', alertThreshold: '' as number | '',
  blockedShops: [] as number[], notes: '',
});
const modal = reactive({ open: false, loading: false, saving: false, error: '', student: null as Student | null, form: emptyForm() });

async function openLimits(student: Student) {
  Object.assign(modal, { open: true, loading: true, saving: false, error: '', student, form: emptyForm() });
  try {
    const { spendingLimit: l } = await financeRepository.getSpendingLimit(student.studentId);
    if (l) {
      const money = (v: unknown) => (v === null || v === undefined ? '' : Number(v));
      modal.form = {
        dailyMax: money(l.dailyMax), weeklyMax: money(l.weeklyMax), perTransactionMax: money(l.perTransactionMax),
        alertThreshold: money(l.alertThreshold), blockedShops: [...(l.blockedShops ?? [])], notes: l.notes ?? '',
      };
    }
  } catch (err) {
    modal.error = getErrorMessage(err, t('common.error'));
  } finally {
    modal.loading = false;
  }
}

async function handleSubmit() {
  if (!modal.student) return;
  modal.saving = true;
  modal.error = '';
  // An empty field is sent as null, which the API stores as "no limit".
  const money = (v: number | '') => (v === '' ? null : v);
  const f = modal.form;
  try {
    await financeRepository.updateSpendingLimit(modal.student.studentId, {
      dailyMax: money(f.dailyMax), weeklyMax: money(f.weeklyMax),
      perTransactionMax: money(f.perTransactionMax), alertThreshold: money(f.alertThreshold),
      blockedShops: f.blockedShops, notes: f.notes,
    });
    modal.open = false;
  } catch (err) {
    modal.error = getErrorMessage(err, t('common.error'));
  } finally {
    modal.saving = false;
  }
}
</script>
