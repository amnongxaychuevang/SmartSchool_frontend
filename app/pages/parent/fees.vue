<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('parent_fees.title')" :subtitle="$t('parent_fees.subtitle')">
      <select v-if="parentStore.children.length > 1" v-model="selectedChildId" class="input-field w-auto" :aria-label="$t('parentPortal.select_child')" @change="loadChild">
        <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">{{ personName(child) }}</option>
      </select>
    </PageHeader>

    <p v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ loadError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="selectedChildId">
      <!-- Totals -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_fees.outstanding') }}</p>
          <p class="mt-1 text-2xl font-bold tnum" :class="totals.outstanding > 0 ? 'text-danger' : 'text-ink'">{{ fmt.kip(totals.outstanding) }}</p>
        </section>
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_fees.overdue') }}</p>
          <p class="mt-1 text-2xl font-bold tnum" :class="totals.overdue > 0 ? 'text-danger' : 'text-ink'">{{ fmt.number(totals.overdue) }}</p>
        </section>
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_fees.paid_total') }}</p>
          <p class="mt-1 text-2xl font-bold tnum text-success">{{ fmt.kip(totals.paid) }}</p>
        </section>
      </div>

      <p v-if="!invoices.length" class="panel p-12 text-center text-sm text-ink-subtle">{{ $t('parent_fees.empty') }}</p>

      <!-- One card per invoice, with its payments and their receipts -->
      <section v-for="inv in invoices" :key="inv.invoiceId" class="panel overflow-hidden">
        <div class="px-5 py-4 flex flex-wrap items-start justify-between gap-3 border-b border-line">
          <div class="min-w-0">
            <h2 class="font-semibold">{{ feeName(inv) }}</h2>
            <p class="text-xs text-ink-subtle tnum">
              {{ inv.invoiceNo }} · {{ inv.feeStructure?.academicYear }} · {{ $t('parent_fees.due', { date: fmt.date(inv.dueDate) }) }}
            </p>
          </div>
          <div class="text-right">
            <span :class="statusBadge(inv)">{{ statusText(inv) }}</span>
            <p class="mt-1 text-sm tnum">
              <template v-if="inv.outstanding > 0">{{ $t('parent_fees.still_owed', { amount: fmt.kip(inv.outstanding) }) }}</template>
              <template v-else>{{ fmt.kip(inv.amountDue) }}</template>
            </p>
          </div>
        </div>
        <p v-if="!inv.payments?.length" class="px-5 py-3 text-sm text-ink-subtle">{{ $t('parent_fees.no_payments') }}</p>
        <ul v-else class="divide-y divide-line">
          <li v-for="p in inv.payments" :key="p.paymentId" class="px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span class="tnum">
              {{ fmt.date(p.paidAt) }} · <b>{{ fmt.kip(p.amount) }}</b>
              <span class="text-ink-subtle font-mono text-xs ml-1">{{ p.receiptNo }}</span>
            </span>
            <NuxtLink :to="`/parent/receipt/fee/${p.paymentId}`" class="btn-secondary min-h-8 px-3 text-xs">{{ $t('receipt.view') }}</NuxtLink>
          </li>
        </ul>
      </section>

      <p class="text-xs text-ink-subtle">{{ $t('parent_fees.how_to_pay') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import { useParentStore } from '../../application/stores/parent';
import { parentRepository } from '../../infrastructure/api/ParentRepository';
import type { Invoice } from '../../domain/models/Finance';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const fmt = useFormat();
useHead({ title: () => `${t('parent_fees.title')} — ${t('parentPortal.title')}` });

const parentStore = useParentStore();
const selectedChildId = ref<number | null>(null);
const invoices = ref<Invoice[]>([]);
const loading = ref(true);
const loadError = ref('');

const personName = (p: { fullNameEn: string; fullNameLo: string }) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;
const feeName = (inv: Invoice) => {
  const ft = inv.feeStructure?.feeType;
  return (ft && ((locale.value === 'lo' ? ft.nameLo : ft.nameEn) || ft.nameEn)) || inv.invoiceNo;
};
const statusText = (inv: Invoice) => (inv.overdue ? t('parent_fees.status_overdue') : t(`parent_fees.status_${inv.status}`));
const statusBadge = (inv: Invoice) => (inv.overdue ? 'badge-danger' : inv.status === 'paid' ? 'badge-success' : 'badge-warning');

const totals = computed(() => ({
  outstanding: invoices.value.reduce((s, i) => s + i.outstanding, 0),
  overdue: invoices.value.filter((i) => i.overdue).length,
  paid: invoices.value.reduce((s, i) => s + i.paidAmount, 0),
}));

async function loadChild() {
  if (!selectedChildId.value) return;
  loadError.value = '';
  try {
    invoices.value = await parentRepository.getChildInvoices(selectedChildId.value);
  } catch (err) {
    loadError.value = getErrorMessage(err);
  }
}

onMounted(async () => {
  try {
    await parentStore.fetchChildren();
    selectedChildId.value = parentStore.children[0]?.studentId ?? null;
    await loadChild();
  } catch (err) {
    loadError.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
});
</script>
