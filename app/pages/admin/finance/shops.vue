<template>
  <div class="flex flex-col gap-6">
    <PageHeader :eyebrow="$t('nav.finance')" :title="$t('shops_admin.title')" :subtitle="$t('shops_admin.subtitle')">
      <input v-model="searchInput" type="search" class="input-field w-64" :placeholder="$t('shops_admin.search')" @input="handleSearch">
      <button type="button" class="btn-primary" @click="openCreate">{{ $t('shops_admin.add') }}</button>
    </PageHeader>

    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="financeStore.shopsLoading" />
      <p v-else-if="!financeStore.shops.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('shops_admin.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th>{{ $t('shops_admin.col_name') }}</th>
              <th>{{ $t('shops_admin.col_location') }}</th>
              <th>{{ $t('shops_admin.col_description') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shop in financeStore.shops" :key="shop.shopId">
              <td>
                <p class="font-semibold">{{ pick(shop.shopNameLo, shop.shopNameEn) }}</p>
                <p class="text-xs text-ink-subtle">{{ pick(shop.shopNameEn, shop.shopNameLo) }}</p>
              </td>
              <td class="text-ink-muted">{{ pick(shop.locationLo, shop.locationEn) || '—' }}</td>
              <td class="max-w-xs truncate text-ink-muted">{{ pick(shop.descriptionLo, shop.descriptionEn) || '—' }}</td>
              <td>
                <span :class="shop.isActive ? 'badge-success' : 'badge-neutral'">{{ shop.isActive ? $t('status.active') : $t('status.inactive') }}</span>
              </td>
              <td class="text-right">
                <div class="inline-flex gap-2">
                  <button type="button" class="btn-secondary min-h-8 px-3" @click="openEdit(shop)">{{ $t('common.edit') }}</button>
                  <button type="button" class="btn-danger min-h-8 px-3" @click="openDelete(shop)">{{ $t('common.delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar :current-page="financeStore.shopsPage" :total-pages="totalPages" @update:page="changePage" />
    </section>

    <AppModal v-model:open="modal.open" :title="modal.shopId ? $t('shops_admin.edit') : $t('shops_admin.add')" size="lg">
      <form id="shop-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleSubmit">
        <div>
          <label for="sh-name-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.name_lo') }}</label>
          <input id="sh-name-lo" v-model.trim="modal.form.shopNameLo" required maxlength="100" lang="lo" class="input-field">
        </div>
        <div>
          <label for="sh-name-en" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.name_en') }}</label>
          <input id="sh-name-en" v-model.trim="modal.form.shopNameEn" required maxlength="100" lang="en" class="input-field">
        </div>
        <div>
          <label for="sh-loc-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.location_lo') }}</label>
          <input id="sh-loc-lo" v-model.trim="modal.form.locationLo" maxlength="100" lang="lo" class="input-field">
        </div>
        <div>
          <label for="sh-loc-en" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.location_en') }}</label>
          <input id="sh-loc-en" v-model.trim="modal.form.locationEn" maxlength="100" lang="en" class="input-field">
        </div>
        <div>
          <label for="sh-desc-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.description_lo') }}</label>
          <textarea id="sh-desc-lo" v-model.trim="modal.form.descriptionLo" rows="2" lang="lo" class="input-field" />
        </div>
        <div>
          <label for="sh-desc-en" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.description_en') }}</label>
          <textarea id="sh-desc-en" v-model.trim="modal.form.descriptionEn" rows="2" lang="en" class="input-field" />
        </div>
        <label class="sm:col-span-2 flex items-center gap-2 text-sm">
          <input v-model="modal.form.isActive" type="checkbox" class="h-4 w-4 rounded border-line-strong">
          {{ $t('shops_admin.active') }}
        </label>
        <p v-if="modal.error" role="alert" class="sm:col-span-2 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ modal.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="modal.saving" @click="modal.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="shop-form" class="btn-primary" :disabled="modal.saving">{{ modal.saving ? $t('common.saving') : $t('common.save') }}</button>
      </template>
    </AppModal>

    <ConfirmDialog
      v-model:open="del.open"
      tone="danger"
      :title="$t('shops_admin.delete_title')"
      :message="del.shop ? $t('shops_admin.delete_msg', { name: pick(del.shop.shopNameLo, del.shop.shopNameEn) }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Shop } from '../../../domain/models/Finance';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFinanceStore } from '../../../application/stores/finance';
import PageHeader from '../../../components/PageHeader.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
useHead({ title: () => t('shops_admin.title') });

// Lao first in Lao, English first in English, falling back to whichever exists.
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) ?? '';

const financeStore = useFinanceStore();
const searchInput = ref('');
const totalPages = computed(() => Math.ceil(financeStore.shopsTotal / 15));
let searchTimeout: ReturnType<typeof setTimeout>;

onMounted(() => financeStore.fetchShops());
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => financeStore.fetchShops({ search: searchInput.value, page: 1 }), 400);
};
const changePage = (page: number) => financeStore.fetchShops({ search: searchInput.value, page });

const emptyForm = () => ({ shopNameEn: '', shopNameLo: '', locationEn: '', locationLo: '', descriptionEn: '', descriptionLo: '', isActive: true });
const modal = reactive({ open: false, saving: false, error: '', shopId: null as number | null, form: emptyForm() });
const openCreate = () => Object.assign(modal, { open: true, saving: false, error: '', shopId: null, form: emptyForm() });
const openEdit = (s: Shop) => Object.assign(modal, {
  open: true, saving: false, error: '', shopId: s.shopId,
  form: {
    shopNameEn: s.shopNameEn, shopNameLo: s.shopNameLo, locationEn: s.locationEn ?? '', locationLo: s.locationLo ?? '',
    descriptionEn: s.descriptionEn ?? '', descriptionLo: s.descriptionLo ?? '', isActive: s.isActive,
  },
});

async function handleSubmit() {
  modal.saving = true;
  modal.error = '';
  try {
    if (modal.shopId) await financeStore.updateShop(modal.shopId, modal.form);
    else await financeStore.createShop(modal.form);
    modal.open = false;
  } catch (err) {
    modal.error = getErrorMessage(err, t('common.error'));
  } finally {
    modal.saving = false;
  }
}

const del = reactive({ open: false, busy: false, error: '', shop: null as Shop | null });
const openDelete = (shop: Shop) => Object.assign(del, { open: true, busy: false, error: '', shop });
async function handleDelete() {
  if (!del.shop) return;
  del.busy = true;
  del.error = '';
  try {
    await financeStore.deleteShop(del.shop.shopId);
    del.open = false;
  } catch (err) {
    del.error = getErrorMessage(err, t('common.error'));
  } finally {
    del.busy = false;
  }
}
</script>
