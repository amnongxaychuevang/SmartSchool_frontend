<template>
  <div class="flex flex-col gap-6">
    <!-- Header + Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search shops..."
          class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch"
        >
      </div>
      <div class="flex items-center gap-2">
        <button class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-[0_4px_14px_rgba(20,184,166,0.25)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.4)]" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Shop
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="glass-panel overflow-hidden">
      <!-- Loading -->
      <LoadingSpinner v-if="financeStore.shopsLoading" />

      <!-- Empty -->
      <div v-else-if="financeStore.shops.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p>No shops found.</p>
      </div>

      <!-- Data Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Shop Name</th>
                        <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Location</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Status</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="shop in financeStore.shops" :key="shop.shopId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <p class="text-sm font-medium text-white">{{ shop.shopNameEn }}</p>
              <p class="text-xs text-slate-500">{{ shop.shopNameLo }}</p>
            </td>
            <td class="px-6 py-4 text-sm text-slate-400">
              {{ shop.locationLo || shop.locationEn || '—' }}
            </td>
            <td class="px-6 py-4">
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium" :class="shop.isActive ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-500/20 text-slate-400'">
                {{ shop.isActive ? $t('common.active') : $t('common.inactive') }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" title="Edit" @click="openEditModal(shop)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete" @click="handleDelete(shop.shopId)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Placeholder -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <span class="text-sm text-slate-500">Page {{ financeStore.shopsPage }} of {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button :disabled="financeStore.shopsPage === 1" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(financeStore.shopsPage - 1)">Prev</button>
          <button :disabled="financeStore.shopsPage === totalPages" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(financeStore.shopsPage + 1)">Next</button>
        </div>
      </div>
    </div>


    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modal.open = false"/>
          <div class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-white">{{ modal.isEdit ? 'Edit Shop' : 'Add Shop' }}</h2>
              <button class="text-slate-400 hover:text-white transition-colors" @click="modal.open = false">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div v-if="modal.error" class="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ modal.error }}</div>

            <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shop Name (EN) *</label>
                <input v-model="modal.form.shopNameEn" required type="text" class="modal-input" >
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Shop Name (LO) *</label>
                <input v-model="modal.form.shopNameLo" required type="text" class="modal-input" >
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location (EN)</label>
                <input v-model="modal.form.locationEn" type="text" maxlength="100" class="modal-input" placeholder="Canteen, building A" >
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location (LO)</label>
                <input v-model="modal.form.locationLo" type="text" maxlength="100" class="modal-input" placeholder="ໂຮງອາຫານ, ຕຶກ A" >
              </div>
              <label class="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input v-model="modal.form.isActive" type="checkbox" class="accent-teal-500" >
                {{ $t('common.active') }}
              </label>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
                <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" @click="modal.open = false">Cancel</button>
                <button
  type="submit" :disabled="modal.saving"
                  class="px-5 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-colors disabled:opacity-60 flex items-center gap-2">
                  <svg v-if="modal.saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {{ modal.isEdit ? 'Update Shop' : 'Create Shop' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Shop } from '../../../domain/models/Finance';
import { ref, reactive, computed, onMounted } from 'vue';
import { useFinanceStore } from '../../../application/stores/finance';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Shops — Smart School Admin' });

const financeStore = useFinanceStore();
const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(financeStore.shopsTotal / 15));

onMounted(() => {
  financeStore.fetchShops();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    financeStore.fetchShops({ search: searchInput.value, page: 1 });
  }, 400);
};

const changePage = (page: number) => {
  financeStore.fetchShops({ search: searchInput.value, page });
};

const modal = reactive({
  open: false,
  saving: false,
  error: '',
  isEdit: false,
  shopId: null as number | null,
  form: {
    shopNameEn: '',
    shopNameLo: '',
    locationEn: '',
    locationLo: '',
    isActive: true
  }
});

const openCreateModal = () => {
  modal.isEdit = false;
  modal.shopId = null;
  modal.form.shopNameEn = '';
  modal.form.shopNameLo = '';
  modal.form.locationEn = '';
  modal.form.locationLo = '';
  modal.form.isActive = true;
  modal.error = '';
  modal.open = true;
};

const openEditModal = (shop: Shop) => {
  modal.isEdit = true;
  modal.shopId = shop.shopId;
  modal.form.shopNameEn = shop.shopNameEn;
  modal.form.shopNameLo = shop.shopNameLo;
  modal.form.locationEn = shop.locationEn ?? '';
  modal.form.locationLo = shop.locationLo ?? '';
  modal.form.isActive = shop.isActive;
  modal.error = '';
  modal.open = true;
};

const handleSubmit = async () => {
  modal.saving = true;
  modal.error = '';
  try {
    if (modal.isEdit && modal.shopId) {
      await financeStore.updateShop(modal.shopId, modal.form);
    } else {
      await financeStore.createShop(modal.form);
    }
    modal.open = false;
  } catch (err) {
    modal.error = getErrorMessage(err, 'Failed to save shop');
  } finally {
    modal.saving = false;
  }
};

const handleDelete = async (shopId: number) => {
  if (confirm('Are you sure you want to delete this shop?')) {
    try {
      await financeStore.deleteShop(shopId);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete shop'));
    }
  }
};
</script>

<style scoped lang="postcss">
.modal-input {
  @apply w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
