<template>
  <div class="flex flex-col gap-6 page-enter">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex flex-col gap-1">
        <p class="text-xs font-semibold text-teal-400 uppercase tracking-widest">{{ $t('nav.settings') }}</p>
        <h2 class="text-2xl font-bold text-white">{{ locale === 'lo' ? 'ການຕັ້ງຄ່າຮ້ານຄ້າໃນໂຮງຮຽນ' : 'Shop Settings' }}</h2>
        <p class="text-sm text-slate-400">{{ locale === 'lo' ? 'ຈັດການຮ້ານຄ້າທີ່ອະນຸຍາດໃຫ້ຈ່າຍຜ່ານກະເປົາເງິນ' : 'Manage shops authorized for wallet payments' }}</p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button class="btn-primary flex items-center gap-2" @click="showAddModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ locale === 'lo' ? 'ເພີ່ມຮ້ານຄ້າ' : 'Add Shop' }}
        </button>
      </div>
    </div>

    <!-- Shops List -->
    <div class="glass-panel overflow-hidden flex flex-col">
      <div class="p-5 border-b border-slate-800/50 flex items-center justify-between">
        <h3 class="text-lg font-bold text-white">{{ locale === 'lo' ? 'ລາຍຊື່ຮ້ານຄ້າທັງໝົດ' : 'All Registered Shops' }}</h3>
      </div>

      <div class="overflow-x-auto relative min-h-[300px]">
        <!-- Loading State -->
        <div v-if="financeStore.shopsLoading" class="absolute inset-0 z-10 bg-[#0a101d]/60 backdrop-blur-sm flex flex-col items-center justify-center text-teal-400">
          <svg class="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span class="text-sm font-semibold tracking-wider animate-pulse">{{ $t('common.loading') }}</span>
        </div>

        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/20">
              <th class="px-6 py-3">ID</th>
              <th class="px-6 py-3">{{ locale === 'lo' ? 'ຊື່ຮ້ານຄ້າ (English)' : 'Shop Name (EN)' }}</th>
              <th class="px-6 py-3">{{ locale === 'lo' ? 'ຊື່ຮ້ານຄ້າ (ລາວ)' : 'Shop Name (LO)' }}</th>
              <th class="px-6 py-3 text-right">{{ locale === 'lo' ? 'ຈັດການ' : 'Actions' }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-xs">
            <tr v-for="shop in financeStore.shops" :key="shop.shopId" class="hover:bg-slate-800/10 transition-colors">
              <td class="px-6 py-3 text-slate-500 font-mono">#{{ shop.shopId }}</td>
              <td class="px-6 py-3 font-bold text-white">{{ shop.shopNameEn }}</td>
              <td class="px-6 py-3 font-medium text-slate-300">{{ shop.shopNameLo }}</td>
              <td class="px-6 py-3 text-right">
                <button class="px-2 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded transition-colors text-[10px] uppercase font-bold tracking-wider" @click="deleteShop(shop.shopId)">
                  {{ locale === 'lo' ? 'ລຶບ' : 'Delete' }}
                </button>
              </td>
            </tr>
            <tr v-if="financeStore.shops.length === 0 && !financeStore.shopsLoading">
              <td colspan="4" class="text-center py-16 text-slate-500 font-medium">
                <div class="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p class="text-lg">{{ locale === 'lo' ? 'ບໍ່ພົບຂໍ້ມູນຮ້ານຄ້າ' : 'No shops registered yet' }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Shop Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="showAddModal = false"/>
        
        <div class="relative glass-panel w-full max-w-md flex flex-col animate-[fadeSlideUp_0.3s_ease]">
          <div class="p-6 border-b border-slate-800/50 flex justify-between items-center shrink-0">
            <h3 class="text-xl font-bold text-white">{{ locale === 'lo' ? 'ເພີ່ມຮ້ານຄ້າໃໝ່' : 'Add New Shop' }}</h3>
            <button class="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" @click="showAddModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form class="flex flex-col" @submit.prevent="submitAddShop">
            <div class="p-6 flex flex-col gap-5">
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ locale === 'lo' ? 'ຊື່ຮ້ານຄ້າ (English)' : 'Shop Name (EN)' }}</label>
                <input v-model="newShop.shopNameEn" type="text" required class="input-field" placeholder="Shop Name..." >
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ locale === 'lo' ? 'ຊື່ຮ້ານຄ້າ (ລາວ)' : 'Shop Name (LO)' }}</label>
                <input v-model="newShop.shopNameLo" type="text" required class="input-field" placeholder="ຊື່ຮ້ານຄ້າ..." >
              </div>
            </div>

            <div class="p-6 border-t border-slate-800/50 flex justify-end gap-3 shrink-0 bg-slate-900/20 rounded-b-2xl">
              <button type="button" class="btn-ghost" @click="showAddModal = false">
                {{ $t('common.cancel') }}
              </button>
              <button type="submit" :disabled="saving" class="btn-primary flex items-center gap-2">
                <svg v-if="saving" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span v-else>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {{ saving ? $t('common.saving') : $t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useFinanceStore } from '~/application/stores/finance';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Shop Settings — Smart School Admin' });

const { locale } = useI18n();
const financeStore = useFinanceStore();

const showAddModal = ref(false);
const saving = ref(false);

const newShop = reactive({
  shopNameEn: '',
  shopNameLo: ''
});

onMounted(() => {
  financeStore.fetchShops();
});

const submitAddShop = async () => {
  if (!newShop.shopNameEn || !newShop.shopNameLo) return;
  
  saving.value = true;
  try {
    await financeStore.createShop({ ...newShop });
    showAddModal.value = false;
    newShop.shopNameEn = '';
    newShop.shopNameLo = '';
  } catch (error) {
    console.error('Failed to save shop:', error);
  } finally {
    saving.value = false;
  }
};

const deleteShop = async (shopId: number) => {
  const confirmMsg = locale.value === 'lo' ? 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຮ້ານຄ້ານີ້?' : 'Are you sure you want to delete this shop?';
  if (confirm(confirmMsg)) {
    try {
      await financeStore.deleteShop(shopId);
    } catch (error) {
      console.error('Failed to delete shop:', error);
    }
  }
};
</script>
