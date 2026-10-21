<template>
  <div class="flex flex-col gap-6">
    <!-- Screen-only toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-3 print:hidden">
      <button type="button" class="btn-secondary inline-flex items-center gap-2" @click="$router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        {{ $t('common.back') }}
      </button>
      <div class="flex items-center gap-3">
        <span class="hidden sm:inline text-xs text-ink-subtle">{{ $t('receipt.pdf_hint') }}</span>
        <button type="button" class="btn-primary inline-flex items-center gap-2" :disabled="!receipt" @click="print">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          {{ $t('receipt.download') }}
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" />
    <p v-else-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ error }}</p>

    <article v-else-if="receipt" id="receipt-document" class="print-document receipt-paper mx-auto w-full max-w-[720px] bg-white text-slate-900 rounded-lg shadow-xl">
      <!-- School -->
      <header class="flex flex-wrap items-start justify-between gap-4 pb-5 border-b-2 border-slate-900">
        <div>
          <h1 class="text-xl font-bold">{{ pick(receipt.school.nameLo, receipt.school.nameEn) || $t('auth.title') }}</h1>
          <p v-if="pick(receipt.school.addressLo, receipt.school.addressEn)" class="text-xs text-slate-600 mt-1">{{ pick(receipt.school.addressLo, receipt.school.addressEn) }}</p>
          <p class="text-xs text-slate-600">
            <template v-if="receipt.school.phone">{{ receipt.school.phone }}</template>
            <template v-if="receipt.school.phone && receipt.school.email"> · </template>
            <template v-if="receipt.school.email">{{ receipt.school.email }}</template>
          </p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold tracking-wide">{{ $t('receipt.title') }}</p>
          <p class="text-xs text-slate-500 uppercase tracking-widest">{{ receipt.kind === 'fee' ? $t('receipt.kind_fee') : $t('receipt.kind_topup') }}</p>
        </div>
      </header>

      <!-- Receipt facts -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 py-5 text-sm">
        <div class="row"><span>{{ $t('receipt.no') }}</span><b class="font-mono">{{ receipt.receiptNo }}</b></div>
        <div class="row"><span>{{ $t('receipt.date') }}</span><b class="tnum">{{ dateTime(receipt.date) }}</b></div>
        <div class="row"><span>{{ $t('receipt.student') }}</span><b>{{ pick(receipt.student.fullNameLo, receipt.student.fullNameEn) }}</b></div>
        <div class="row"><span>{{ $t('receipt.student_code') }}</span><b class="font-mono">{{ receipt.student.studentCode }}</b></div>
        <div v-if="receipt.student.class" class="row"><span>{{ $t('receipt.class') }}</span><b>{{ pick(receipt.student.class.classNameLo, receipt.student.class.classNameEn) }}</b></div>
        <template v-if="receipt.kind === 'fee'">
          <div class="row"><span>{{ $t('receipt.invoice_no') }}</span><b class="font-mono">{{ receipt.fee.invoiceNo }}</b></div>
          <div class="row"><span>{{ $t('receipt.academic_year') }}</span><b class="tnum">{{ receipt.fee.academicYear }}<template v-if="pick(receipt.fee.termLo, receipt.fee.termEn)"> · {{ pick(receipt.fee.termLo, receipt.fee.termEn) }}</template></b></div>
        </template>
      </section>

      <!-- Amounts -->
      <table class="w-full text-sm border-collapse">
        <thead>
          <tr class="bg-slate-100 text-slate-600">
            <th class="text-left py-2 px-3 font-semibold">{{ $t('receipt.description') }}</th>
            <th class="text-right py-2 px-3 font-semibold">{{ $t('receipt.amount') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-slate-200">
            <td class="py-3 px-3">
              {{ receipt.kind === 'fee' ? pick(receipt.fee.feeTypeLo, receipt.fee.feeTypeEn) : $t('receipt.topup_line') }}
              <span class="block text-xs text-slate-500">{{ $t('receipt.method') }}: {{ methodLabel }}<template v-if="receipt.referenceNo"> · {{ $t('receipt.reference') }} {{ receipt.referenceNo }}</template></span>
            </td>
            <td class="py-3 px-3 text-right font-semibold tnum">{{ kip(receipt.amount) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="pt-3 px-3 text-right font-bold">{{ $t('receipt.received') }}</td>
            <td class="pt-3 px-3 text-right text-lg font-bold tnum">{{ kip(receipt.amount) }}</td>
          </tr>
        </tfoot>
      </table>

      <dl class="mt-5 ml-auto w-full sm:w-80 text-sm flex flex-col gap-1">
        <template v-if="receipt.kind === 'fee'">
          <div class="row"><dt>{{ $t('receipt.amount_due') }}</dt><dd class="tnum">{{ kip(receipt.fee.amountDue) }}</dd></div>
          <div class="row"><dt>{{ $t('receipt.paid_to_date') }}</dt><dd class="tnum">{{ kip(receipt.fee.paidToDate) }}</dd></div>
          <div class="row font-bold"><dt>{{ $t('receipt.outstanding') }}</dt><dd class="tnum">{{ receipt.fee.outstanding > 0 ? kip(receipt.fee.outstanding) : $t('receipt.paid_in_full') }}</dd></div>
        </template>
        <template v-else>
          <div class="row"><dt>{{ $t('receipt.balance_before') }}</dt><dd class="tnum">{{ kip(receipt.topup.balanceBefore) }}</dd></div>
          <div class="row font-bold"><dt>{{ $t('receipt.balance_after') }}</dt><dd class="tnum">{{ kip(receipt.topup.balanceAfter) }}</dd></div>
        </template>
      </dl>

      <!-- Signature -->
      <footer class="mt-12 flex flex-wrap items-end justify-between gap-6 text-xs text-slate-500">
        <p>{{ $t('receipt.generated') }}</p>
        <div class="text-center w-48">
          <p v-if="receipt.receivedBy" class="text-sm text-slate-900 mb-1">{{ pick(receipt.receivedBy.fullNameLo, receipt.receivedBy.fullNameEn) }}</p>
          <div class="border-t border-slate-400 pt-1">{{ $t('receipt.received_by') }}</div>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import LoadingSpinner from './LoadingSpinner.vue';
import { receiptRepository, type Receipt, type ReceiptKind } from '../infrastructure/api/ReceiptRepository';

const props = defineProps<{ kind: ReceiptKind; id: number }>();

const { t, locale } = useI18n();
const fmt = useFormat();

const receipt = ref<Receipt | null>(null);
const loading = ref(true);
const error = ref('');

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const kip = (n: number) => fmt.kip(n);

// Numbers from Intl (locale-free), month names from the translations: Lao prints
// correctly even in browsers without Lao locale data.
const dateTime = (iso: string) => {
  const d = new Date(iso);
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Vientiane' }).format(d);
  const hm = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Vientiane', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
  return `${Number(ymd.slice(8))} ${t(`calendar.month_${Number(ymd.slice(5, 7))}`)} ${ymd.slice(0, 4)}, ${hm}`;
};

const methodLabel = computed(() => {
  const m = receipt.value?.method;
  if (m === 'cash') return t('receipt.method_cash');
  if (m === 'bank_transfer' || m === 'mobile_banking') return t('receipt.method_transfer');
  return t('receipt.method_office');
});

onMounted(async () => {
  try {
    receipt.value = await receiptRepository.get(props.kind, props.id);
  } catch (err) {
    error.value = getErrorMessage(err, t('common.error'));
  } finally {
    loading.value = false;
  }
});

// The browser's print dialog offers "Save as PDF" on computers and phones alike.
const print = () => window.print();
</script>

<style scoped>
.receipt-paper { padding: 2.5rem; }
.row { display: flex; justify-content: space-between; gap: 1rem; }
.row > :first-child { color: rgb(100 116 139); }
/* Hiding the layout when printing is the global .print-document rule (main.css). */
@media print {
  .receipt-paper { padding: 0; }
}
</style>
