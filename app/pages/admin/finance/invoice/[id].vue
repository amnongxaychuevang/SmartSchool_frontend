<template>
  <div class="flex flex-col gap-6">
    <!-- Screen-only toolbar -->
    <div class="flex items-center justify-between print:hidden">
      <button type="button" class="btn-secondary inline-flex items-center gap-2" @click="$router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        {{ $t('common.back') }}
      </button>
      <button type="button" class="btn-primary inline-flex items-center gap-2" @click="handlePrint">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
        {{ $t('invoice_print.print') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="panel p-8 text-center">
      <p class="text-danger font-semibold">{{ error }}</p>
      <button type="button" class="btn-secondary mt-4" @click="fetchInvoice">{{ $t('common.retry') }}</button>
    </div>

    <!-- Invoice document -->
    <div v-else-if="invoice" id="invoice-document" class="invoice-paper mx-auto w-full max-w-[800px] bg-white text-slate-900 rounded-lg shadow-xl print:shadow-none print:rounded-none">

      <!-- School header -->
      <header class="border-b-2 border-teal-600 pb-5 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-2xl font-bold text-teal-700 tracking-tight">Smart School</h1>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">
              {{ $t('invoice_print.school_address') }}<br>
              {{ $t('invoice_print.school_phone') }}<br>
              {{ $t('invoice_print.school_email') }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold uppercase tracking-wider" :class="statusColor">
              {{ $t(`invoice_print.status_${invoice.status}`) }}
            </p>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{{ $t('invoice_print.document_title') }}</p>
          </div>
        </div>
      </header>

      <!-- Invoice meta + student info -->
      <div class="grid grid-cols-2 gap-6 mb-8">
        <!-- Invoice details -->
        <div>
          <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{{ $t('invoice_print.invoice_details') }}</h3>
          <dl class="text-sm space-y-1.5">
            <div class="flex gap-2">
              <dt class="text-slate-500 w-28 shrink-0">{{ $t('invoice_print.invoice_no') }}</dt>
              <dd class="font-semibold font-mono">{{ invoice.invoiceNo }}</dd>
            </div>
            <div class="flex gap-2">
              <dt class="text-slate-500 w-28 shrink-0">{{ $t('invoice_print.issue_date') }}</dt>
              <dd>{{ f.date(invoice.issuedAt) }}</dd>
            </div>
            <div class="flex gap-2">
              <dt class="text-slate-500 w-28 shrink-0">{{ $t('invoice_print.due_date') }}</dt>
              <dd :class="invoice.overdue ? 'text-red-600 font-semibold' : ''">{{ f.date(invoice.dueDate) }}</dd>
            </div>
            <div class="flex gap-2">
              <dt class="text-slate-500 w-28 shrink-0">{{ $t('invoice_print.academic_year') }}</dt>
              <dd>{{ invoice.feeStructure ? invoice.feeStructure.academicYear : '' }}</dd>
            </div>
            <div v-if="invoice.feeStructure && invoice.feeStructure.term" class="flex gap-2">
              <dt class="text-slate-500 w-28 shrink-0">{{ $t('invoice_print.term') }}</dt>
              <dd>{{ isLao ? invoice.feeStructure.term.termNameLo : invoice.feeStructure.term.termNameEn }}</dd>
            </div>
          </dl>
        </div>

        <!-- Student info -->
        <div>
          <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{{ $t('invoice_print.bill_to') }}</h3>
          <dl class="text-sm space-y-1.5">
            <div class="flex gap-2">
              <dt class="text-slate-500 w-28 shrink-0">{{ $t('invoice_print.student_name') }}</dt>
              <dd class="font-semibold">{{ studentName }}</dd>
            </div>
            <div class="flex gap-2">
              <dt class="text-slate-500 w-28 shrink-0">{{ $t('invoice_print.student_code') }}</dt>
              <dd class="font-mono">{{ invoice.student ? invoice.student.studentCode : '' }}</dd>
            </div>
            <div v-if="className" class="flex gap-2">
              <dt class="text-slate-500 w-28 shrink-0">{{ $t('invoice_print.class') }}</dt>
              <dd>{{ className }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Fee breakdown table -->
      <section class="mb-8">
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{{ $t('invoice_print.fee_breakdown') }}</h3>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-600">
              <th class="text-left py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_description') }}</th>
              <th class="text-right py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_amount') }}</th>
              <th class="text-right py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_discount') }}</th>
              <th class="text-right py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_net') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-200">
              <td class="py-3 px-3">{{ feeTypeName }}</td>
              <td class="py-3 px-3 text-right font-mono tabular-nums">{{ f.kip(invoice.amount) }}</td>
              <td class="py-3 px-3 text-right font-mono tabular-nums text-red-500">
                {{ invoice.discount > 0 ? `- ${f.kip(invoice.discount)}` : '—' }}
              </td>
              <td class="py-3 px-3 text-right font-mono tabular-nums font-semibold">{{ f.kip(invoice.amountDue) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-slate-300">
              <td colspan="3" class="py-3 px-3 text-right font-semibold text-slate-600">{{ $t('invoice_print.subtotal') }}</td>
              <td class="py-3 px-3 text-right font-mono tabular-nums font-bold">{{ f.kip(invoice.amountDue) }}</td>
            </tr>
            <tr>
              <td colspan="3" class="py-2 px-3 text-right font-semibold text-slate-600">{{ $t('invoice_print.total_paid') }}</td>
              <td class="py-2 px-3 text-right font-mono tabular-nums font-bold text-green-600">{{ f.kip(invoice.paidAmount) }}</td>
            </tr>
            <tr class="bg-slate-50">
              <td colspan="3" class="py-3 px-3 text-right font-bold text-slate-800 text-base">{{ $t('invoice_print.outstanding') }}</td>
              <td class="py-3 px-3 text-right font-mono tabular-nums font-bold text-base" :class="invoice.outstanding > 0 ? 'text-red-600' : 'text-green-600'">
                {{ f.kip(invoice.outstanding) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <!-- Payment history -->
      <section v-if="invoice.payments && invoice.payments.length" class="mb-8">
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{{ $t('invoice_print.payment_history') }}</h3>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-600">
              <th class="text-left py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_receipt_no') }}</th>
              <th class="text-left py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_date') }}</th>
              <th class="text-right py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_amount') }}</th>
              <th class="text-left py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_method') }}</th>
              <th class="text-left py-2.5 px-3 font-semibold text-xs uppercase tracking-wider">{{ $t('invoice_print.col_received_by') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in invoice.payments" :key="p.paymentId" class="border-b border-slate-200">
              <td class="py-2.5 px-3 font-mono text-xs">{{ p.receiptNo }}</td>
              <td class="py-2.5 px-3">{{ f.dateTime(p.paidAt) }}</td>
              <td class="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-green-700">{{ f.kip(p.amount) }}</td>
              <td class="py-2.5 px-3">
                <span class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" :class="p.method === 'cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'">
                  {{ $t(`invoice_print.method_${p.method}`) }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-xs text-slate-500">{{ receiverName(p) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- No payments message -->
      <section v-else class="mb-8 text-center py-6 text-sm text-slate-400 italic border border-dashed border-slate-300 rounded-lg">
        {{ $t('invoice_print.no_payments') }}
      </section>

      <!-- Notes -->
      <section v-if="invoice.notes" class="mb-8 bg-slate-50 rounded-lg p-4 border border-slate-200">
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{{ $t('invoice_print.notes') }}</h3>
        <p class="text-sm text-slate-600">{{ invoice.notes }}</p>
      </section>

      <!-- Footer -->
      <footer class="border-t-2 border-slate-200 pt-6 mt-8">
        <div class="grid grid-cols-2 gap-8">
          <!-- Stamp / signature area -->
          <div class="flex flex-col items-center">
            <div class="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
              <span class="text-[10px] text-slate-400 uppercase tracking-wider">{{ $t('invoice_print.school_stamp') }}</span>
            </div>
            <div class="mt-3 text-center">
              <div class="w-40 border-b border-slate-300 mb-1" />
              <p class="text-[10px] text-slate-400 uppercase tracking-wider">{{ $t('invoice_print.authorized_signature') }}</p>
            </div>
          </div>

          <!-- Payment notes -->
          <div class="text-xs text-slate-500 leading-relaxed space-y-1.5">
            <h4 class="font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-2">{{ $t('invoice_print.payment_notes_title') }}</h4>
            <p>{{ $t('invoice_print.payment_note_1') }}</p>
            <p>{{ $t('invoice_print.payment_note_2') }}</p>
            <p>{{ $t('invoice_print.payment_note_3') }}</p>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="mt-6 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
          <p>{{ $t('invoice_print.footer_text') }}</p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Invoice, FeePayment } from '../../../../domain/models/Finance';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useApiClient } from '../../../../infrastructure/api/apiClient';
import { useFormat } from '../../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const route = useRoute();
const f = useFormat();

useHead({ title: () => invoice.value ? `${t('invoice_print.document_title')} — ${invoice.value.invoiceNo}` : t('invoice_print.document_title') });

const isLao = computed(() => locale.value === 'lo');

// State
const loading = ref(true);
const error = ref('');
const invoice = ref<Invoice | null>(null);

// Computed helpers
const studentName = computed(() => {
  const s = invoice.value?.student;
  if (!s) return '—';
  return isLao.value ? (s.fullNameLo || s.fullNameEn) : s.fullNameEn;
});

const className = computed(() => {
  const c = invoice.value?.student?.class;
  if (!c) return '';
  return isLao.value ? (c.classNameLo || c.classNameEn) : c.classNameEn;
});

const feeTypeName = computed(() => {
  const ft = invoice.value?.feeStructure?.feeType;
  if (!ft) return '—';
  return isLao.value ? (ft.nameLo || ft.nameEn) : ft.nameEn;
});

const statusColor = computed(() => {
  switch (invoice.value?.status) {
    case 'paid': return 'text-green-600';
    case 'partial': return 'text-amber-600';
    case 'void': return 'text-slate-400';
    default: return 'text-red-600';
  }
});

function receiverName(payment: FeePayment) {
  const r = payment.receiver;
  if (!r) return '—';
  return isLao.value ? (r.fullNameLo || r.fullNameEn) : r.fullNameEn;
}

// Fetch invoice
async function fetchInvoice() {
  loading.value = true;
  error.value = '';
  try {
    const client = useApiClient();
    const res = await client<{ success: boolean; data: { invoice: Invoice } }>(`/invoices/${route.params.id}`, { method: 'GET' });
    if (!res.success) throw new Error('Failed to load invoice');
    invoice.value = res.data.invoice;
  } catch (err) {
    error.value = getErrorMessage(err, t('common.error'));
  } finally {
    loading.value = false;
  }
}

function handlePrint() {
  window.print();
}

onMounted(fetchInvoice);
</script>

<style scoped>
.invoice-paper {
  padding: 2.5rem;
}

/* Tabular numbers for financial figures */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* ── Print styles ── */
@media print {
  /* Reset page to white */
  :deep(body),
  :deep(html) {
    background: white !important;
    color: black !important;
  }

  /* Hide admin sidebar, top bar, and toolbar */
  :deep(.admin-sidebar),
  :deep(.admin-topbar),
  :deep(nav),
  :deep(aside),
  :deep(header:not(#invoice-document header)) {
    display: none !important;
  }

  /* Let the invoice fill the page */
  :deep(.admin-main),
  :deep(.admin-content),
  :deep(main) {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    width: 100% !important;
  }

  .invoice-paper {
    max-width: none !important;
    width: 100% !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0.5cm !important;
    margin: 0 !important;
    page-break-inside: avoid;
  }

  /* Ensure clean table printing */
  table {
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
  }
  thead {
    display: table-header-group;
  }

  /* Hide interactive elements */
  .print\:hidden {
    display: none !important;
  }

  /* Page setup */
  @page {
    size: A4;
    margin: 1cm;
  }
}
</style>
