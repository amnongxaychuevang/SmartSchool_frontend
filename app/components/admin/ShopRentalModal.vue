<template>
  <AppModal :open="isOpen" :title="$t('shops_admin.rental_management_title')" size="xl" @update:open="isOpen = $event">
    <div v-if="shop" class="space-y-6">
      <!-- Shop & Rental Info Banner -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/10 border border-teal-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              {{ pick(shop.shopNameLo, shop.shopNameEn) }}
            </h3>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {{ formatBillingType(shop.rentalBillingType) }}
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span v-if="shop.vendorName" class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {{ shop.vendorName }}
            </span>
            <span v-if="shop.vendorPhone" class="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {{ shop.vendorPhone }}
            </span>
            <span v-if="shop.rentalAmount" class="font-semibold text-slate-700 dark:text-slate-200">
              {{ $t('shops_admin.rate') }}: {{ format.kip(shop.rentalAmount) }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right">
            <span class="text-xs text-slate-500 dark:text-slate-400 block">{{ $t('shops_admin.outstanding_rent') }}</span>
            <span class="text-lg font-bold" :class="totalOutstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
              {{ format.kip(totalOutstanding) }}
            </span>
          </div>
          <button
            type="button"
            class="h-9 px-3 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            @click="showAddPeriod = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ $t('shops_admin.add_rental_period') }}
          </button>
        </div>
      </div>

      <!-- Add Rental Period Form Inline Panel -->
      <div v-if="showAddPeriod" class="p-4 rounded-xl border border-teal-500/30 bg-slate-50 dark:bg-slate-800/60 transition-all">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ $t('shops_admin.new_rental_invoice') }}
          </h4>
          <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" @click="showAddPeriod = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form class="grid grid-cols-1 sm:grid-cols-4 gap-3" @submit.prevent="handleAddPeriod">
          <div>
            <label class="block text-xs font-semibold mb-1">{{ $t('shops_admin.academic_year') }}</label>
            <input v-model.trim="newPeriod.academicYear" required placeholder="2026-2027" class="input-field text-xs">
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">{{ $t('shops_admin.period_label') }}</label>
            <input v-model.trim="newPeriod.periodLabel" required placeholder="ສົກຮຽນ 2026-2027 / ເດືອນ 10" class="input-field text-xs">
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">{{ $t('shops_admin.due_date') }}</label>
            <input v-model="newPeriod.dueDate" type="date" required class="input-field text-xs">
          </div>
          <div>
            <label class="block text-xs font-semibold mb-1">{{ $t('shops_admin.rental_amount') }} (LAK)</label>
            <input v-model.number="newPeriod.amount" type="number" min="1" step="1000" required class="input-field text-xs">
          </div>
          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold mb-1">{{ $t('shops_admin.rental_notes') }}</label>
            <input v-model.trim="newPeriod.notes" placeholder="ໝາຍເຫດເພີ່ມເຕີມ..." class="input-field text-xs">
          </div>
          <div class="flex items-end">
            <button type="submit" class="w-full h-9 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1" :disabled="addingPeriod">
              {{ addingPeriod ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Periods Table -->
      <div class="glass-panel overflow-x-auto">
        <LoadingSpinner v-if="loading" class="my-8" />
        <div v-else-if="!rentals.length" class="text-center py-12 text-slate-500 dark:text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm">{{ $t('shops_admin.no_rental_records') }}</p>
        </div>
        <table v-else class="data-table w-full min-w-max text-xs">
          <thead>
            <tr>
              <th>{{ $t('shops_admin.period_label') }}</th>
              <th>{{ $t('shops_admin.due_date') }}</th>
              <th class="text-right">{{ $t('shops_admin.rental_amount') }}</th>
              <th class="text-right">{{ $t('shops_admin.paid_amount') }}</th>
              <th class="text-right">{{ $t('shops_admin.outstanding_rent') }}</th>
              <th class="text-center">{{ $t('common.status') }}</th>
              <th class="text-center">{{ $t('shops_admin.slip') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
            <tr v-for="item in rentals" :key="item.rentalPaymentId" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="font-medium text-slate-900 dark:text-white">
                <div>{{ item.periodLabel }}</div>
                <span class="text-[10px] text-slate-400">{{ item.academicYear }}</span>
              </td>
              <td class="text-slate-500 dark:text-slate-400">
                {{ format.date(item.dueDate) }}
              </td>
              <td class="text-right font-medium text-slate-900 dark:text-white">
                {{ format.kip(item.amount) }}
              </td>
              <td class="text-right font-medium text-emerald-600 dark:text-emerald-400">
                {{ format.kip(item.paidAmount) }}
              </td>
              <td class="text-right font-medium" :class="Number(item.amount) - Number(item.paidAmount) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'">
                {{ format.kip(Math.max(Number(item.amount) - Number(item.paidAmount), 0)) }}
              </td>
              <td class="text-center">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                  :class="{
                    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20': item.status === 'paid',
                    'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20': item.status === 'partial',
                    'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20': item.status === 'unpaid',
                  }"
                >
                  {{ formatPaymentStatus(item.status) }}
                </span>
                <div v-if="item.receiptNo" class="text-[10px] text-slate-400 font-mono mt-0.5">
                  {{ item.receiptNo }}
                </div>
              </td>
              <td class="text-center">
                <div v-if="item.slipUrl" class="inline-flex items-center gap-1">
                  <button
                    type="button"
                    class="p-1 rounded text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10"
                    :title="$t('shops_admin.view_slip')"
                    @click="previewSlipUrl = item.slipUrl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    :title="$t('shops_admin.delete_slip')"
                    @click="handleDeleteSlip(item)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <label v-else class="cursor-pointer inline-flex items-center p-1 rounded text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-500/10" :title="$t('shops_admin.upload_slip')">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <input type="file" accept="image/*" class="hidden" @change="handleUploadSlip(item, $event)">
                </label>
              </td>
              <td>
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="item.status !== 'paid'"
                    type="button"
                    class="px-2 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                    @click="openRecordPayment(item)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {{ $t('shops_admin.record_payment') }}
                  </button>
                  <button
                    v-if="item.status === 'unpaid'"
                    type="button"
                    class="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    :title="$t('common.delete')"
                    @click="handleDeleteRental(item)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Record Payment Sub-Modal -->
    <AppModal :open="!!selectedRental" :title="$t('shops_admin.record_payment_modal_title')" size="md" @update:open="if (!$event) selectedRental = null">
      <form v-if="selectedRental" id="payment-form" class="space-y-4 text-sm" @submit.prevent="submitRecordPayment">
        <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <div class="font-semibold text-slate-900 dark:text-white">{{ selectedRental.periodLabel }}</div>
            <div class="text-xs text-slate-500">{{ $t('shops_admin.due_date') }}: {{ format.date(selectedRental.dueDate) }}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-500">{{ $t('shops_admin.outstanding_rent') }}</div>
            <div class="text-base font-bold text-amber-600 dark:text-amber-400">
              {{ format.kip(Math.max(Number(selectedRental.amount) - Number(selectedRental.paidAmount), 0)) }}
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5">{{ $t('shops_admin.payment_amount') }} (LAK)</label>
          <input
            v-model.number="payForm.amount"
            type="number"
            min="1000"
            step="1000"
            required
            class="input-field"
          >
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5">{{ $t('shops_admin.payment_method') }}</label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all" :class="payForm.paymentMethod === 'cash' ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 dark:border-slate-700'">
              <input v-model="payForm.paymentMethod" type="radio" value="cash" class="text-teal-500">
              <span class="font-medium text-xs">{{ $t('payment.cash') }}</span>
            </label>
            <label class="flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all" :class="payForm.paymentMethod === 'bank_transfer' ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 dark:border-slate-700'">
              <input v-model="payForm.paymentMethod" type="radio" value="bank_transfer" class="text-teal-500">
              <span class="font-medium text-xs">{{ $t('payment.bank_transfer') }}</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5">{{ $t('shops_admin.payment_date') }}</label>
          <input v-model="payForm.paidAt" type="date" class="input-field">
        </div>

        <div>
          <label class="block text-xs font-semibold mb-1.5">{{ $t('shops_admin.rental_notes') }}</label>
          <textarea v-model.trim="payForm.notes" rows="2" placeholder="ໝາຍເຫດການຊຳລະ..." class="input-field" />
        </div>

        <p v-if="payError" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-xs text-danger">{{ payError }}</p>
      </form>

      <template #footer>
        <button type="button" class="btn-secondary" :disabled="submittingPayment" @click="selectedRental = null">{{ $t('common.cancel') }}</button>
        <button type="submit" form="payment-form" class="btn-primary" :disabled="submittingPayment">
          {{ submittingPayment ? $t('common.saving') : $t('shops_admin.confirm_payment') }}
        </button>
      </template>
    </AppModal>

    <!-- Slip Image Preview Modal -->
    <AppModal :open="!!previewSlipUrl" :title="$t('shops_admin.transfer_slip_preview')" size="md" @update:open="if (!$event) previewSlipUrl = null">
      <div v-if="previewSlipUrl" class="flex flex-col items-center justify-center p-2">
        <img :src="previewSlipUrl" alt="Transfer Slip" class="max-h-[70vh] rounded-lg shadow object-contain">
      </div>
      <template #footer>
        <a v-if="previewSlipUrl" :href="previewSlipUrl" target="_blank" download class="btn-secondary text-xs mr-auto flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {{ $t('common.download') }}
        </a>
        <button type="button" class="btn-primary" @click="previewSlipUrl = null">{{ $t('common.close') }}</button>
      </template>
    </AppModal>

    <template #footer>
      <button type="button" class="btn-secondary" @click="isOpen = false">{{ $t('common.close') }}</button>
    </template>
  </AppModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppModal from '../AppModal.vue';
import LoadingSpinner from '../LoadingSpinner.vue';
import type { Shop, ShopRentalPayment } from '../../domain/models/Finance';
import { financeRepository } from '../../infrastructure/api/FinanceRepository';
import { useFormat } from '../../composables/useFormat';
import { useDialog } from '../../composables/useDialog';
import { getErrorMessage } from '../../utils/errors';

const props = defineProps<{
  open: boolean;
  shop: Shop | null;
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'updated'): void;
}>();

const { t } = useI18n();
const format = useFormat();
const dialog = useDialog();

const isOpen = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const loading = ref(false);
const rentals = ref<ShopRentalPayment[]>([]);
const showAddPeriod = ref(false);
const addingPeriod = ref(false);
const previewSlipUrl = ref<string | null>(null);

const selectedRental = ref<ShopRentalPayment | null>(null);
const submittingPayment = ref(false);
const payError = ref('');

const payForm = reactive({
  amount: 0,
  paymentMethod: 'cash' as 'cash' | 'bank_transfer',
  paidAt: new Date().toISOString().slice(0, 10),
  notes: '',
});

const newPeriod = reactive({
  academicYear: '2026-2027',
  periodLabel: '',
  dueDate: new Date().toISOString().slice(0, 10),
  amount: 0,
  notes: '',
});

const totalOutstanding = computed(() => {
  return rentals.value.reduce((s, r) => s + Math.max(Number(r.amount) - Number(r.paidAmount), 0), 0);
});

function pick(lo?: string | null, en?: string | null) {
  return lo || en || '—';
}

function formatBillingType(type?: string) {
  switch (type) {
    case 'annual': return t('shops_admin.rental_type_annual');
    case 'monthly': return t('shops_admin.rental_type_monthly');
    case 'installment': return t('shops_admin.rental_type_installment');
    default: return t('shops_admin.rental_type_none');
  }
}

function formatPaymentStatus(status: string) {
  switch (status) {
    case 'paid': return t('status.paid');
    case 'partial': return t('status.partial');
    default: return t('status.unpaid');
  }
}

async function loadRentals() {
  if (!props.shop) return;
  loading.value = true;
  try {
    const res = await financeRepository.getShopRentals({ shopId: props.shop.shopId, limit: 100 });
    rentals.value = res.rentalPayments;
  } catch (err) {
    dialog.error(getErrorMessage(err, t('common.error')));
  } finally {
    loading.value = false;
  }
}

watch(() => props.open, (newVal) => {
  if (newVal && props.shop) {
    showAddPeriod.value = false;
    newPeriod.amount = props.shop.rentalAmount ? Number(props.shop.rentalAmount) : 0;
    newPeriod.periodLabel = props.shop.rentalBillingType === 'annual' ? 'ສົກຮຽນ 2026-2027' : 'ເດືອນ 10/2026';
    loadRentals();
  }
});

async function handleAddPeriod() {
  if (!props.shop) return;
  addingPeriod.value = true;
  try {
    await financeRepository.createShopRental(props.shop.shopId, {
      academicYear: newPeriod.academicYear,
      periodLabel: newPeriod.periodLabel,
      dueDate: newPeriod.dueDate,
      amount: newPeriod.amount,
      notes: newPeriod.notes,
    });
    dialog.success(t('common.saved_successfully'));
    showAddPeriod.value = false;
    await loadRentals();
    emit('updated');
  } catch (err) {
    dialog.error(getErrorMessage(err, t('common.error')));
  } finally {
    addingPeriod.value = false;
  }
}

function openRecordPayment(item: ShopRentalPayment) {
  selectedRental.value = item;
  payError.value = '';
  payForm.amount = Math.max(Number(item.amount) - Number(item.paidAmount), 0);
  payForm.paymentMethod = 'cash';
  payForm.paidAt = new Date().toISOString().slice(0, 10);
  payForm.notes = '';
}

async function submitRecordPayment() {
  if (!selectedRental.value) return;
  submittingPayment.value = true;
  payError.value = '';
  try {
    await financeRepository.recordShopRentalPayment(selectedRental.value.rentalPaymentId, {
      amount: payForm.amount,
      paymentMethod: payForm.paymentMethod,
      paidAt: payForm.paidAt,
      notes: payForm.notes,
    });
    dialog.success(t('common.saved_successfully'));
    selectedRental.value = null;
    await loadRentals();
    emit('updated');
  } catch (err) {
    payError.value = getErrorMessage(err, t('common.error'));
  } finally {
    submittingPayment.value = false;
  }
}

async function handleUploadSlip(item: ShopRentalPayment, event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  try {
    await financeRepository.uploadShopRentalSlip(item.rentalPaymentId, file);
    dialog.success(t('common.saved_successfully'));
    await loadRentals();
  } catch (err) {
    dialog.error(getErrorMessage(err, t('common.error')));
  } finally {
    input.value = '';
  }
}

async function handleDeleteSlip(item: ShopRentalPayment) {
  try {
    await financeRepository.deleteShopRentalSlip(item.rentalPaymentId);
    dialog.success(t('common.saved_successfully'));
    await loadRentals();
  } catch (err) {
    dialog.error(getErrorMessage(err, t('common.error')));
  }
}

async function handleDeleteRental(item: ShopRentalPayment) {
  try {
    await financeRepository.deleteShopRental(item.rentalPaymentId);
    dialog.success(t('common.saved_successfully'));
    await loadRentals();
    emit('updated');
  } catch (err) {
    dialog.error(getErrorMessage(err, t('common.error')));
  }
}
</script>
