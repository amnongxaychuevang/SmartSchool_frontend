<template>
  <div class="flex flex-col gap-6">
    <PageHeader
      :eyebrow="$t('nav.fees')"
      :title="$t('fees_admin.title')"
      :subtitle="$t('fees_admin.subtitle')"
    >
      <div class="relative w-64">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchInput" type="text" class="search-bar" :placeholder="$t('fees_admin.search')" @input="handleSearch">
        <button v-if="searchInput" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors" @click="clearSearch">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <select
        v-model="statusFilter"
        class="input-field w-auto"
        :aria-label="$t('common.status')"
        @change="load(1)"
      >
        <option value="">{{ $t("fees_admin.all_status") }}</option>
        <option value="unpaid">{{ $t("invoice_print.status_unpaid") }}</option>
        <option value="partial">
          {{ $t("invoice_print.status_partial") }}
        </option>
        <option value="paid">{{ $t("invoice_print.status_paid") }}</option>
        <option value="overdue">{{ $t("fees_admin.overdue") }}</option>
        <option value="void">{{ $t("invoice_print.status_void") }}</option>
      </select>
    </PageHeader>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="panel px-4 py-3">
        <p
          class="text-xs font-semibold text-ink-subtle uppercase tracking-wider"
        >
          {{ $t("fees_admin.stat_total") }}
        </p>
        <p class="mt-1 text-2xl font-bold tnum">
          {{ f.number(financeStore.invoicesTotal) }}
        </p>
      </div>
      <div class="panel px-4 py-3">
        <p
          class="text-xs font-semibold text-ink-subtle uppercase tracking-wider"
        >
          {{ $t("fees_admin.stat_unpaid") }}
        </p>
        <p class="mt-1 text-2xl font-bold tnum text-amber-600">
          {{ f.number(stats.unpaid) }}
        </p>
      </div>
      <div class="panel px-4 py-3">
        <p
          class="text-xs font-semibold text-ink-subtle uppercase tracking-wider"
        >
          {{ $t("fees_admin.stat_partial") }}
        </p>
        <p class="mt-1 text-2xl font-bold tnum text-blue-600">
          {{ f.number(stats.partial) }}
        </p>
      </div>
      <div class="panel px-4 py-3">
        <p
          class="text-xs font-semibold text-ink-subtle uppercase tracking-wider"
        >
          {{ $t("fees_admin.stat_overdue") }}
        </p>
        <p class="mt-1 text-2xl font-bold tnum text-danger">
          {{ f.number(stats.overdue) }}
        </p>
      </div>
    </div>

    <!-- Invoice table -->
    <section class="panel overflow-hidden">
      <LoadingSpinner
        v-if="financeStore.invoicesLoading && !financeStore.invoices.length"
      />
      <p
        v-else-if="!financeStore.invoices.length"
        class="py-12 text-center text-sm text-ink-subtle"
      >
        {{ $t("fees_admin.empty") }}
      </p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t("fees_admin.col_invoice") }}</th>
              <th>{{ $t("fees_admin.col_student") }}</th>
              <th>{{ $t("fees_admin.col_class") }}</th>
              <th>{{ $t("fees_admin.col_fee_type") }}</th>
              <th class="text-right">{{ $t("fees_admin.col_amount") }}</th>
              <th class="text-right">{{ $t("fees_admin.col_paid") }}</th>
              <th class="text-right">{{ $t("fees_admin.col_outstanding") }}</th>
              <th>{{ $t("fees_admin.col_due_date") }}</th>
              <th>{{ $t("common.status") }}</th>
              <th class="text-right">{{ $t("common.actions") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(inv, i) in financeStore.invoices" :key="inv.invoiceId">
              <td class="text-center tnum text-ink-subtle">
                {{ (financeStore.invoicesPage - 1) * INVOICES_PER_PAGE + i + 1 }}
              </td>
              <td class="font-mono text-xs whitespace-nowrap">
                {{ inv.invoiceNo }}
              </td>
              <td class="font-semibold">{{ studentName(inv) }}</td>
              <td class="text-ink-muted">{{ className(inv) || "—" }}</td>
              <td class="text-ink-muted">{{ feeTypeName(inv) }}</td>
              <td class="text-right font-semibold tnum">
                {{ f.kip(inv.amountDue) }}
              </td>
              <td class="text-right tnum text-success">
                {{ f.kip(inv.paidAmount) }}
              </td>
              <td
                class="text-right tnum"
                :class="
                  inv.outstanding > 0
                    ? 'text-danger font-semibold'
                    : 'text-success'
                "
              >
                {{ f.kip(inv.outstanding) }}
              </td>
              <td
                class="whitespace-nowrap"
                :class="
                  inv.overdue ? 'text-danger font-semibold' : 'text-ink-muted'
                "
              >
                {{ f.date(inv.dueDate) }}
                <span
                  v-if="inv.overdue"
                  class="ml-1 badge-danger text-[10px]"
                  >{{ $t("fees_admin.overdue") }}</span
                >
              </td>
              <td>
                <span :class="statusBadge[inv.status]">{{
                  $t(`invoice_print.status_${inv.status}`)
                }}</span>
              </td>
              <td class="text-right">
                <div class="inline-flex gap-1">
                  <NuxtLink
                    :to="`/admin/finance/invoice/${inv.invoiceId}`"
                    class="btn-secondary min-h-8 px-2.5"
                    :title="$t('fees_admin.view_invoice')"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </NuxtLink>
                  <button
                    v-if="inv.status !== 'paid' && inv.status !== 'void'"
                    type="button"
                    class="btn-primary min-h-8 px-2.5"
                    :title="$t('fees_admin.record_payment')"
                    @click="openPayment(inv)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                  <button
                    v-if="inv.status !== 'void' && inv.paidAmount === 0"
                    type="button"
                    class="btn-danger min-h-8 px-2.5"
                    :title="$t('fees_admin.void')"
                    @click="openVoid(inv)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar
        :loading="financeStore.invoicesLoading"
        :current-page="financeStore.invoicesPage"
        :total-pages="totalPages"
        @update:page="load"
      />
    </section>

    <!-- Payment modal -->
    <AppModal
      :open="pay.open"
      :title="$t('fees_admin.pay_title')"
      :subtitle="
        pay.invoice
          ? $t('fees_admin.pay_for', {
              invoiceNo: pay.invoice.invoiceNo,
              outstanding: f.kip(pay.invoice.outstanding),
            })
          : ''
      "
      size="sm"
      @update:open="pay.open = $event"
    >
      <form
        id="pay-form"
        class="flex flex-col gap-4"
        @submit.prevent="handlePayment"
      >
        <div>
          <label for="pay-amount" class="block mb-1.5 text-sm font-semibold">{{
            $t("fees_admin.pay_amount")
          }}</label>
          <input
            id="pay-amount"
            v-model.number="pay.amount"
            required
            type="number"
            min="1000"
            step="1000"
            :max="pay.invoice ? pay.invoice.outstanding : undefined"
            class="input-field tnum"
          />
        </div>
        <div>
          <label for="pay-method" class="block mb-1.5 text-sm font-semibold">{{
            $t("fees_admin.pay_method")
          }}</label>
          <select
            id="pay-method"
            v-model="pay.method"
            required
            class="input-field"
          >
            <option value="cash">{{ $t("fees_admin.pay_method_cash") }}</option>
            <option value="bank_transfer">
              {{ $t("fees_admin.pay_method_bank") }}
            </option>
          </select>
        </div>
        <div>
          <label for="pay-ref" class="block mb-1.5 text-sm font-semibold">{{
            $t("fees_admin.pay_reference")
          }}</label>
          <input
            id="pay-ref"
            v-model.trim="pay.referenceNo"
            type="text"
            class="input-field"
          />
        </div>
        <div>
          <label for="pay-notes" class="block mb-1.5 text-sm font-semibold">{{
            $t("fees_admin.pay_notes")
          }}</label>
          <textarea
            id="pay-notes"
            v-model.trim="pay.notes"
            rows="2"
            class="input-field"
          />
        </div>
        <p
          v-if="pay.error"
          role="alert"
          class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {{ pay.error }}
        </p>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn-secondary"
          :disabled="pay.busy"
          @click="pay.open = false"
        >
          {{ $t("common.cancel") }}
        </button>
        <button
          type="submit"
          form="pay-form"
          class="btn-primary"
          :disabled="pay.busy || !pay.amount"
        >
          {{ pay.busy ? $t("common.saving") : $t("fees_admin.pay_confirm") }}
        </button>
      </template>
    </AppModal>

    <!-- Void dialog -->
    <AppModal
      :open="voidDlg.open"
      :title="$t('fees_admin.void_title')"
      size="sm"
      @update:open="voidDlg.open = $event"
    >
      <form id="void-form" @submit.prevent="handleVoid">
        <p class="mb-4 text-sm text-ink-muted">
          {{
            voidDlg.invoice
              ? $t("fees_admin.void_msg", {
                  invoiceNo: voidDlg.invoice.invoiceNo,
                })
              : ""
          }}
        </p>
        <label for="void-reason" class="block mb-1.5 text-sm font-semibold">{{
          $t("fees_admin.void_reason")
        }}</label>
        <textarea
          id="void-reason"
          v-model.trim="voidDlg.reason"
          rows="3"
          required
          class="input-field"
          :placeholder="$t('fees_admin.void_placeholder')"
        />
        <p
          v-if="voidDlg.error"
          role="alert"
          class="mt-3 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {{ voidDlg.error }}
        </p>
      </form>
      <template #footer>
        <button
          type="button"
          class="btn-secondary"
          :disabled="voidDlg.busy"
          @click="voidDlg.open = false"
        >
          {{ $t("common.cancel") }}
        </button>
        <button
          type="submit"
          form="void-form"
          class="btn-danger"
          :disabled="voidDlg.busy || !voidDlg.reason"
        >
          {{
            voidDlg.busy ? $t("common.saving") : $t("fees_admin.void_confirm")
          }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type { Invoice } from "../../../domain/models/Finance";
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useFinanceStore, INVOICES_PER_PAGE } from "../../../application/stores/finance";
import PageHeader from "../../../components/PageHeader.vue";
import PaginationBar from "../../../components/PaginationBar.vue";
import AppModal from "../../../components/AppModal.vue";
import LoadingSpinner from "../../../components/LoadingSpinner.vue";
import { useFormat } from "../../../composables/useFormat";

definePageMeta({ layout: "admin" });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t("fees_admin.title") });

const financeStore = useFinanceStore();
const searchInput = ref("");
const statusFilter = ref("");
const totalPages = computed(() =>
  Math.ceil(financeStore.invoicesTotal / INVOICES_PER_PAGE),
);
let searchTimeout: ReturnType<typeof setTimeout>;

const stats = computed(() => {
  const list = financeStore.invoices;
  return {
    unpaid: list.filter((i) => i.status === "unpaid").length,
    partial: list.filter((i) => i.status === "partial").length,
    overdue: list.filter((i) => i.overdue).length,
  };
});

const statusBadge: Record<Invoice["status"], string> = {
  unpaid: "badge-warning",
  partial: "badge-info",
  paid: "badge-success",
  void: "badge-muted",
};

const studentName = (inv: Invoice) => {
  const s = inv.student;
  if (!s) return "—";
  return (locale.value === "lo" ? s.fullNameLo : s.fullNameEn) || s.fullNameEn;
};
const className = (inv: Invoice) => {
  const c = inv.student?.class;
  if (!c) return "";
  return (
    (locale.value === "lo" ? c.classNameLo : c.classNameEn) || c.classNameEn
  );
};
const feeTypeName = (inv: Invoice) => {
  const ft = inv.feeStructure?.feeType;
  if (!ft) return "—";
  return (locale.value === "lo" ? ft.nameLo : ft.nameEn) || ft.nameEn;
};

const load = (page: number) =>
  financeStore.fetchInvoices({
    search: searchInput.value,
    status: statusFilter.value,
    page,
  });
onMounted(() => load(1));
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => load(1), 400);
};
const clearSearch = () => { searchInput.value = ''; load(1); };

// Payment
const pay = reactive({
  open: false,
  busy: false,
  error: "",
  invoice: null as Invoice | null,
  amount: 0,
  method: "cash" as "cash" | "bank_transfer",
  referenceNo: "",
  notes: "",
});
const openPayment = (inv: Invoice) =>
  Object.assign(pay, {
    open: true,
    busy: false,
    error: "",
    invoice: inv,
    amount: Number(inv.outstanding),
    method: "cash",
    referenceNo: "",
    notes: "",
  });
async function handlePayment() {
  if (!pay.invoice || !pay.amount) return;
  pay.busy = true;
  pay.error = "";
  try {
    await financeStore.recordPayment(pay.invoice.invoiceId, {
      amount: pay.amount,
      method: pay.method,
      referenceNo: pay.referenceNo || undefined,
      notes: pay.notes || undefined,
    });
    pay.open = false;
  } catch (err) {
    pay.error = getErrorMessage(err, t("common.error"));
  } finally {
    pay.busy = false;
  }
}

// Void
const voidDlg = reactive({
  open: false,
  busy: false,
  error: "",
  reason: "",
  invoice: null as Invoice | null,
});
const openVoid = (inv: Invoice) =>
  Object.assign(voidDlg, {
    open: true,
    busy: false,
    error: "",
    reason: "",
    invoice: inv,
  });
async function handleVoid() {
  if (!voidDlg.invoice || !voidDlg.reason) return;
  voidDlg.busy = true;
  voidDlg.error = "";
  try {
    await financeStore.voidInvoice(voidDlg.invoice.invoiceId, voidDlg.reason);
    voidDlg.open = false;
  } catch (err) {
    voidDlg.error = getErrorMessage(err, t("common.error"));
  } finally {
    voidDlg.busy = false;
  }
}
</script>
