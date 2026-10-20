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
      <div>
        <label for="sh-desc-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.description_lo') }}</label>
        <textarea id="sh-desc-lo" v-model.trim="form.descriptionLo" rows="2" lang="lo" class="input-field" />
      </div>
      <div>
        <label for="sh-desc-en" class="block mb-1.5 text-sm font-semibold">{{ $t('shops_admin.description_en') }}</label>
        <textarea id="sh-desc-en" v-model.trim="form.descriptionEn" rows="2" lang="en" class="input-field" />
      </div>
      <label class="sm:col-span-2 flex items-center gap-2 text-sm">
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

const emptyForm = () => ({ shopNameEn: '', shopNameLo: '', locationEn: '', locationLo: '', descriptionEn: '', descriptionLo: '', isActive: true });
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
        shopNameEn: s.shopNameEn, shopNameLo: s.shopNameLo, locationEn: s.locationEn ?? '', locationLo: s.locationLo ?? '',
        descriptionEn: s.descriptionEn ?? '', descriptionLo: s.descriptionLo ?? '', isActive: s.isActive,
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
    if (shopId.value) {
      await financeStore.updateShop(shopId.value, { ...form });
    } else {
      await financeStore.createShop({ ...form });
    }
    isOpen.value = false;
  } catch (err) {
    error.value = getErrorMessage(err, t('common.error'));
  } finally {
    saving.value = false;
  }
}
</script>
