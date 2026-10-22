<template>
  <AppModal :open="isOpen" :title="shopId ? $t('shops_admin.edit') : $t('shops_admin.add')" size="lg" @update:open="isOpen = $event">
    <form id="shop-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleSubmit">
      <div>
        <label for="sh-name-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.name_lo') }}</label>
        <input id="sh-name-lo" v-model.trim="form.shopNameLo" required maxlength="100" lang="lo" class="input-field">
      </div>
      <div>
        <label for="sh-name-en" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.name_en') }}</label>
        <input id="sh-name-en" v-model.trim="form.shopNameEn" required maxlength="100" lang="en" class="input-field">
      </div>
      <div>
        <label for="sh-loc-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.location_lo') }}</label>
        <input id="sh-loc-lo" v-model.trim="form.locationLo" maxlength="100" lang="lo" class="input-field">
      </div>
      <div>
        <label for="sh-loc-en" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.location_en') }}</label>
        <input id="sh-loc-en" v-model.trim="form.locationEn" maxlength="100" lang="en" class="input-field">
      </div>

      <!-- Vendor & Rental Section -->
      <div class="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-3 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {{ $t('shops_admin.vendor_rental_section') }}
        </h4>
      </div>

      <div>
        <label for="sh-vendor-name" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.vendor_name') }}</label>
        <input id="sh-vendor-name" v-model.trim="form.vendorName" maxlength="150" :placeholder="$t('shops_admin.vendor_name_placeholder')" class="input-field">
      </div>
      <div>
        <label for="sh-vendor-phone" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.vendor_phone') }}</label>
        <input id="sh-vendor-phone" v-model.trim="form.vendorPhone" maxlength="50" placeholder="+856 20 ..." class="input-field">
      </div>

      <div>
        <label for="sh-rental-type" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.rental_type') }}</label>
        <select id="sh-rental-type" v-model="form.rentalBillingType" class="input-field">
          <option value="none">{{ $t('shops_admin.rental_type_none') }}</option>
          <option value="annual">{{ $t('shops_admin.rental_type_annual') }}</option>
          <option value="monthly">{{ $t('shops_admin.rental_type_monthly') }}</option>
          <option value="installment">{{ $t('shops_admin.rental_type_installment') }}</option>
        </select>
      </div>

      <div>
        <label for="sh-rental-amount" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.rental_amount') }} (LAK)</label>
        <input
          id="sh-rental-amount"
          v-model.number="form.rentalAmount"
          type="number"
          min="0"
          step="1000"
          :placeholder="form.rentalBillingType === 'none' ? '—' : '0'"
          :disabled="form.rentalBillingType === 'none'"
          class="input-field"
        >
      </div>

      <div class="sm:col-span-2">
        <label for="sh-rental-notes" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.rental_notes') }}</label>
        <textarea id="sh-rental-notes" v-model.trim="form.rentalNotes" rows="2" :placeholder="$t('shops_admin.rental_notes_placeholder')" class="input-field" />
      </div>

      <div>
        <label for="sh-desc-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.description_lo') }}</label>
        <textarea id="sh-desc-lo" v-model.trim="form.descriptionLo" rows="2" lang="lo" class="input-field" />
      </div>
      <div>
        <label for="sh-desc-en" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.description_en') }}</label>
        <textarea id="sh-desc-en" v-model.trim="form.descriptionEn" rows="2" lang="en" class="input-field" />
      </div>

      <label class="sm:col-span-2 flex items-center gap-2 text-sm mt-1">
        <input v-model="form.isActive" type="checkbox" class="h-4 w-4 rounded border-line-strong">
        {{ $t('shops_admin.active') }}
      </label>
      <p v-if="error" role="alert" class="sm:col-span-2 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ error }}</p>
    </form>
    <template #footer>
      <button type="button" class="btn-secondary" :disabled="saving" @click="isOpen = false">{{ $t('common.cancel') }}</button>
      <button type="submit" form="shop-form" class="btn-primary" :disabled="saving">{{ saving ? $t('common.saving') : $t('common.save') }}</button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppModal from '../AppModal.vue';
import type { Shop } from '../../domain/models/Finance';
import { useFinanceStore } from '../../application/stores/finance';
import { getErrorMessage } from '../../utils/errors';

const props = defineProps<{
  open: boolean;
  shop: Shop | null;
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
}>();

const { t } = useI18n();
const financeStore = useFinanceStore();

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val)
});

const emptyForm = () => ({
  shopNameEn: '',
  shopNameLo: '',
  locationEn: '',
  locationLo: '',
  descriptionEn: '',
  descriptionLo: '',
  vendorName: '',
  vendorPhone: '',
  rentalBillingType: 'none',
  rentalAmount: null as number | null,
  rentalNotes: '',
  isActive: true,
});

const form = reactive(emptyForm());
const shopId = computed(() => props.shop?.shopId || null);
const saving = ref(false);
const error = ref('');

watch(() => props.open, (newVal) => {
  if (newVal) {
    saving.value = false;
    error.value = '';
    if (props.shop) {
      const s = props.shop;
      Object.assign(form, {
        shopNameEn: s.shopNameEn,
        shopNameLo: s.shopNameLo,
        locationEn: s.locationEn ?? '',
        locationLo: s.locationLo ?? '',
        descriptionEn: s.descriptionEn ?? '',
        descriptionLo: s.descriptionLo ?? '',
        vendorName: s.vendorName ?? '',
        vendorPhone: s.vendorPhone ?? '',
        rentalBillingType: s.rentalBillingType ?? 'none',
        rentalAmount: s.rentalAmount !== undefined && s.rentalAmount !== null ? Number(s.rentalAmount) : null,
        rentalNotes: s.rentalNotes ?? '',
        isActive: s.isActive,
      });
    } else {
      Object.assign(form, emptyForm());
    }
  }
});

async function handleSubmit() {
  saving.value = true;
  error.value = '';
  try {
    const payload = {
      ...form,
      rentalAmount: form.rentalBillingType === 'none' ? null : (form.rentalAmount !== null ? Number(form.rentalAmount) : 0),
    };

    if (shopId.value) {
      await financeStore.updateShop(shopId.value, payload);
    } else {
      await financeStore.createShop(payload);
    }
    isOpen.value = false;
  } catch (err) {
    error.value = getErrorMessage(err, t('common.error'));
  } finally {
    saving.value = false;
  }
}
</script>
