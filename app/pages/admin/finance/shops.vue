<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" :placeholder="$t('shops_admin.search')" class="search-bar" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="searchInput = ''; handleSearch()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="flex flex-1 flex-wrap items-center gap-3">
        <button
          type="button" class="ml-auto h-9 px-3.5 bg-teal-500 hover:bg-teal-600 dark:hover:bg-teal-400 !text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)] disabled:opacity-50 disabled:shadow-none"
          @click="openCreate">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('shops_admin.add') }}
        </button>
      </div>
    </div>

    <div class="glass-panel overflow-x-auto">
      <LoadingSpinner v-if="financeStore.shopsLoading" class="my-12" />
      <div v-else-if="!financeStore.shops.length" class="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p>{{ $t('shops_admin.empty') }}</p>
      </div>
      <table v-else class="data-table w-full min-w-max">
        <thead>
          <tr>
            <th class="w-12 text-center">#</th>
            <th>{{ $t('shops_admin.col_name') }}</th>
            <th>{{ $t('shops_admin.col_description') }}</th>
            <th>{{ $t('shops_admin.col_vendor') }}</th>
            <th>{{ $t('shops_admin.col_phone') }}</th>
            <th>{{ $t('shops_admin.col_rental_type') }}</th>
            <th class="text-right">{{ $t('shops_admin.col_rental_amount') }}</th>
            <th class="text-right">{{ $t('shops_admin.outstanding_rent') }}</th>
            <th>{{ $t('shops_admin.col_location') }}</th>
            <th>{{ $t('common.status') }}</th>
            <th class="text-right">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
          <tr v-for="(shop, index) in financeStore.shops" :key="shop.shopId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <td class="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              {{ (financeStore.shopsPage - 1) * 15 + index + 1 }}
            </td>
            <td class="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
              {{ pick(shop.shopNameLo, shop.shopNameEn) }}
            </td>
            <td class="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" :title="pick(shop.descriptionLo, shop.descriptionEn) || ''">
              {{ pick(shop.descriptionLo, shop.descriptionEn) || '—' }}
            </td>
            <td class="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
              {{ shop.vendorName || '—' }}
            </td>
            <td class="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
              {{ shop.vendorPhone || '—' }}
            </td>
            <td class="text-sm whitespace-nowrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {{ formatBillingType(shop.rentalBillingType) }}
              </span>
            </td>
            <td class="text-sm text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">
              {{ shop.rentalAmount ? format.kip(shop.rentalAmount) : '—' }}
            </td>
            <td class="text-sm text-right font-medium whitespace-nowrap">
              <span v-if="(shop.outstandingRental ?? 0) > 0" class="text-amber-600 dark:text-amber-400 font-bold">
                {{ format.kip(shop.outstandingRental) }}
              </span>
              <span v-else class="text-emerald-600 dark:text-emerald-400 font-semibold text-xs inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ $t('status.paid') }}
              </span>
            </td>
            <td class="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{{ pick(shop.locationLo, shop.locationEn) || '—' }}</td>
            <td class="whitespace-nowrap">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                :class="shop.isActive ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'"
              >
                {{ shop.isActive ? $t('status.active') : $t('status.inactive') }}
              </span>
            </td>
            <td>
              <div class="flex items-center justify-end gap-1">
                <button
                  class="p-1.5 rounded-lg text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('shops_admin.manage_rentals')"
                  @click="openRentals(shop)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                  :title="$t('common.edit')"
                  @click="openEdit(shop)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  :title="$t('common.delete')"
                  @click="openDelete(shop)">
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
    <PaginationBar
      :loading="financeStore.shopsLoading"
      :current-page="financeStore.shopsPage"
      :total-pages="totalPages"
      :total="financeStore.shopsTotal"
      :page-size="SHOPS_PER_PAGE"
      @update:page="changePage"
    />

    <ShopFormModal :open="modal.open" :shop="modal.shop" @update:open="modal.open = $event" />
    <ShopRentalModal :open="rentalModal.open" :shop="rentalModal.shop" @update:open="rentalModal.open = $event" @updated="financeStore.fetchShops()" />

    <ConfirmDialog
      :open="del.open"
      tone="danger"
      :title="$t('shops_admin.delete_title')"
      :message="del.shop ? $t('shops_admin.delete_msg', { name: pick(del.shop.shopNameLo, del.shop.shopNameEn) }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="del.busy"
      :error="del.error"
      @update:open="del.open = $event"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Shop } from '../../../domain/models/Finance';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFinanceStore, SHOPS_PER_PAGE } from '../../../application/stores/finance';
import { useFormat } from '../../../composables/useFormat';
import { getErrorMessage } from '../../../utils/errors';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import ShopFormModal from '../../../components/admin/ShopFormModal.vue';
import ShopRentalModal from '../../../components/admin/ShopRentalModal.vue';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const format = useFormat();
useHead({ title: () => t('shops_admin.title') });

// Lao first in Lao, English first in English, falling back to whichever exists.
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) ?? '';

function formatBillingType(type?: string) {
  switch (type) {
    case 'annual': return t('shops_admin.rental_type_annual');
    case 'monthly': return t('shops_admin.rental_type_monthly');
    case 'installment': return t('shops_admin.rental_type_installment');
    default: return t('shops_admin.rental_type_none');
  }
}

const financeStore = useFinanceStore();
const searchInput = ref('');
const totalPages = computed(() => Math.ceil(financeStore.shopsTotal / SHOPS_PER_PAGE));
let searchTimeout: ReturnType<typeof setTimeout>;

onMounted(() => financeStore.fetchShops());
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => financeStore.fetchShops({ search: searchInput.value, page: 1 }), 400);
};
const changePage = (page: number) => financeStore.fetchShops({ search: searchInput.value, page });

const modal = reactive({ open: false, shop: null as Shop | null });
const openCreate = () => Object.assign(modal, { open: true, shop: null });
const openEdit = (s: Shop) => Object.assign(modal, { open: true, shop: s });

const rentalModal = reactive({ open: false, shop: null as Shop | null });
const openRentals = (s: Shop) => Object.assign(rentalModal, { open: true, shop: s });

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
