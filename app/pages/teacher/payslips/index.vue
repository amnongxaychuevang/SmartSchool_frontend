<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('payroll.my_payslips')" :subtitle="$t('payroll.my_payslips_subtitle')" />

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.net_salary') }} ({{ $t('payroll.title') }})</p>
          <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tnum">{{ f.kip(latestNet) }}</p>
        </div>
      </div>

      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.periods') }}</p>
          <p class="text-2xl font-bold text-ink mt-0.5 tnum">{{ total }}</p>
        </div>
      </div>

      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.bank_info') }}</p>
          <p class="text-sm font-bold text-ink mt-0.5 truncate font-mono">
            {{ bankOnRecord }}
          </p>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="loading && !payslips.length" />
      <div v-else-if="!payslips.length" class="py-16 text-center text-sm text-ink-subtle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-ink-subtle/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="font-medium text-base text-ink mb-1">{{ $t('payroll.no_payslips') }}</p>
        <p class="text-xs text-ink-muted">{{ $t('payroll.my_payslips_subtitle') }}</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('payroll.period_month') }}</th>
              <th class="text-right">{{ $t('payroll.base_salary') }}</th>
              <th class="text-right">{{ $t('payroll.earnings') }}</th>
              <th class="text-right text-red-500">{{ $t('payroll.deductions') }}</th>
              <th class="text-right font-bold">{{ $t('payroll.net_salary') }}</th>
              <th>{{ $t('payroll.status') }}</th>
              <th class="text-center">{{ $t('payroll.transfer_slip') }}</th>
              <th class="text-right">{{ $t('payroll.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in payslips" :key="p.itemId">
              <td class="text-center tnum text-ink-subtle">{{ i + 1 }}</td>
              <td class="font-bold text-ink">
                {{ formatMonthDisplay(p.period?.periodMonth) }}
              </td>
              <td class="text-right tnum font-medium text-xs">{{ f.kip(p.baseSalary) }}</td>
              <td class="text-right tnum text-xs text-emerald-600 dark:text-emerald-400">
                +{{ f.kip(Number(p.teachingAllowance || 0) + Number(p.attendanceBonus || 0) + Number(p.otherAllowance || 0)) }}
              </td>
              <td class="text-right tnum text-xs text-red-500">
                -{{ f.kip(Number(p.absenceDeduction || 0) + Number(p.taxDeduction || 0) + Number(p.otherDeduction || 0)) }}
              </td>
              <td class="text-right tnum font-bold text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                {{ f.kip(p.netSalary) }}
              </td>
              <td>
                <span
                  :class="[
                    'px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider',
                    p.paymentStatus === 'paid' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  ]"
                >
                  {{ $t(`payroll.status_${p.paymentStatus}`) }}
                </span>
              </td>
              <td class="text-center">
                <button
                  v-if="p.slipUrl"
                  type="button"
                  class="group relative inline-block rounded-lg overflow-hidden border border-line focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  :title="$t('payroll.view_slip')"
                  @click="viewingSlip = p"
                >
                  <img :src="mediaUrl(p.slipUrl)!" :alt="$t('payroll.transfer_slip')" class="h-9 w-9 object-cover group-hover:scale-110 transition-transform">
                  <span class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </span>
                </button>
                <span v-else class="text-[11px] text-ink-subtle">—</span>
              </td>
              <td class="text-right">
                <button
                  type="button"
                  class="btn-secondary !py-1 !px-2.5 text-xs inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400"
                  @click="selectedPayslip = p"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{{ $t('payroll.view_details') }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Printable Payslip Modal -->
    <div
      v-if="selectedPayslip"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="panel max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:p-0">
        <!-- Close & Print buttons -->
        <div class="flex items-center justify-between pb-4 border-b border-line mb-6 print:hidden">
          <h3 class="font-bold text-lg text-ink">{{ $t('payroll.payslip_title') }}</h3>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-primary flex items-center gap-2 text-xs"
              @click="printDoc"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>{{ $t('payroll.print') }}</span>
            </button>
            <button type="button" class="text-ink-subtle hover:text-ink p-1" @click="selectedPayslip = null">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Printable Area -->
        <div class="payslip-print-area text-slate-800 dark:text-slate-100 font-sans">
          <div class="text-center pb-5 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-xl font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              {{ $t('payroll.school_name') }}
            </h2>
            <p class="text-base font-semibold mt-1">
              {{ $t('payroll.payslip_title') }}
            </p>
            <p class="text-xs text-ink-muted mt-0.5 font-medium">
              {{ $t('payroll.period_month') }}: {{ formatMonthDisplay(selectedPayslip.period?.periodMonth) }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200 dark:border-slate-700">
            <div class="space-y-1">
              <p><span class="text-ink-muted">{{ $t('payroll.teacher_name') }}:</span> <strong>{{ selectedPayslip.teacher?.fullNameLo }} ({{ selectedPayslip.teacher?.fullNameEn }})</strong></p>
              <p><span class="text-ink-muted">{{ $t('payroll.teacher_code') }}:</span> <span class="font-mono">{{ selectedPayslip.teacher?.teacherCode }}</span></p>
              <p><span class="text-ink-muted">{{ $t('teachers.department') }}:</span> {{ selectedPayslip.teacher?.department || '—' }}</p>
            </div>
            <div class="space-y-1 text-right sm:text-left">
              <p><span class="text-ink-muted">{{ $t('payroll.bank_name') }}:</span> {{ selectedPayslip.bankName || 'BCEL' }}</p>
              <p><span class="text-ink-muted">{{ $t('payroll.bank_account_number') }}:</span> <span class="font-mono">{{ selectedPayslip.bankAccountNumber || '—' }}</span></p>
              <p><span class="text-ink-muted">{{ $t('payroll.status') }}:</span> <span class="uppercase font-semibold">{{ $t(`payroll.status_${selectedPayslip.paymentStatus}`) }}</span></p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
            <!-- Earnings -->
            <div class="border border-emerald-500/20 rounded-xl p-3.5 bg-emerald-500/5">
              <h4 class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 pb-1 border-b border-emerald-500/20">
                {{ $t('payroll.earnings') }}
              </h4>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.base_salary') }}</span>
                  <span class="font-mono font-medium">{{ f.kip(selectedPayslip.baseSalary) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.teaching_allowance') }}</span>
                  <span class="font-mono text-emerald-600 dark:text-emerald-400">+{{ f.kip(selectedPayslip.teachingAllowance) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.attendance_bonus') }}</span>
                  <span class="font-mono text-emerald-600 dark:text-emerald-400">+{{ f.kip(selectedPayslip.attendanceBonus) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.other_allowance') }}</span>
                  <span class="font-mono text-emerald-600 dark:text-emerald-400">+{{ f.kip(selectedPayslip.otherAllowance) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-emerald-500/20 font-bold">
                  <span>{{ $t('payroll.total_gross') }}</span>
                  <span class="font-mono">{{ f.kip(Number(selectedPayslip.baseSalary) + Number(selectedPayslip.teachingAllowance) + Number(selectedPayslip.attendanceBonus) + Number(selectedPayslip.otherAllowance)) }}</span>
                </div>
              </div>
            </div>

            <!-- Deductions -->
            <div class="border border-red-500/20 rounded-xl p-3.5 bg-red-500/5">
              <h4 class="text-xs font-bold text-red-500 uppercase tracking-wider mb-2.5 pb-1 border-b border-red-500/20">
                {{ $t('payroll.deductions') }}
              </h4>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.absence_deduction') }}</span>
                  <span class="font-mono text-red-500">-{{ f.kip(selectedPayslip.absenceDeduction) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.tax_deduction') }}</span>
                  <span class="font-mono text-red-500">-{{ f.kip(selectedPayslip.taxDeduction) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.other_deduction') }}</span>
                  <span class="font-mono text-red-500">-{{ f.kip(selectedPayslip.otherDeduction) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-red-500/20 font-bold">
                  <span>{{ $t('payroll.total_deductions') }}</span>
                  <span class="font-mono text-red-500">-{{ f.kip(Number(selectedPayslip.absenceDeduction) + Number(selectedPayslip.taxDeduction) + Number(selectedPayslip.otherDeduction)) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Net Highlight -->
          <div class="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between my-3">
            <div>
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold">{{ $t('payroll.net_salary') }}</p>
              <p class="text-[11px] text-slate-400">{{ formatMonthDisplay(selectedPayslip.period?.periodMonth) }}</p>
            </div>
            <p class="text-2xl font-bold font-mono text-emerald-400 tnum">
              {{ f.kip(selectedPayslip.netSalary) }}
            </p>
          </div>

          <!-- Transfer Slip Proof Section -->
          <div v-if="selectedPayslip.slipUrl" class="my-4 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img :src="mediaUrl(selectedPayslip.slipUrl)!" :alt="$t('payroll.transfer_slip')" class="h-16 w-16 object-cover rounded-lg border border-line shadow-sm">
              <div>
                <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ $t('payroll.slip_uploaded') }}</span>
                </p>
                <p class="text-[11px] text-ink-muted mt-0.5">{{ $t('payroll.transfer_slip') }} ({{ selectedPayslip.bankName || 'BCEL' }})</p>
                <p v-if="selectedPayslip.paidAt" class="text-[10px] text-ink-subtle tnum">{{ f.dateTime(selectedPayslip.paidAt) }}</p>
              </div>
            </div>
            <button
              type="button"
              class="btn-secondary !py-1 !px-2.5 text-xs print:hidden"
              @click="viewingSlip = selectedPayslip"
            >
              {{ $t('payroll.view_slip') }}
            </button>
          </div>

          <!-- Signatures -->
          <div class="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs">
            <div>
              <div class="h-16 border-b border-dashed border-slate-400 mx-auto w-3/4 mb-2"></div>
              <p class="font-semibold text-ink">{{ $t('payroll.received_by') }}</p>
              <p class="text-[10px] text-ink-muted">{{ selectedPayslip.teacher?.fullNameLo }}</p>
            </div>
            <div>
              <div class="h-16 border-b border-dashed border-slate-400 mx-auto w-3/4 mb-2"></div>
              <p class="font-semibold text-ink">{{ $t('payroll.approved_by') }}</p>
              <p class="text-[10px] text-ink-muted">Smart School Management</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slip Lightbox Modal -->
    <div
      v-if="viewingSlip"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      @click.self="viewingSlip = null"
    >
      <div class="panel max-w-lg w-full p-5 shadow-2xl relative flex flex-col gap-4">
        <div class="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 class="font-bold text-base text-ink">{{ $t('payroll.transfer_slip') }}</h3>
            <p class="text-xs text-ink-muted">
              {{ formatMonthDisplay(viewingSlip.period?.periodMonth) }} · {{ f.kip(viewingSlip.netSalary) }}
            </p>
          </div>
          <button type="button" class="text-ink-subtle hover:text-ink p-1" @click="viewingSlip = null">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex justify-center bg-black/10 rounded-xl overflow-hidden p-2">
          <img
            v-if="viewingSlip.slipUrl"
            :src="mediaUrl(viewingSlip.slipUrl)!"
            :alt="$t('payroll.transfer_slip')"
            class="max-h-[60vh] object-contain rounded-lg shadow-md"
          />
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-surface-sunken border border-line">
          <div>
            <span class="text-ink-subtle block">{{ $t('payroll.bank_info') }}:</span>
            <span class="font-medium text-ink">{{ viewingSlip.bankName || 'BCEL' }}</span>
            <span class="text-[11px] block font-mono text-ink-muted">{{ viewingSlip.bankAccountNumber || '—' }}</span>
          </div>
          <div class="text-right">
            <span class="text-ink-subtle block">{{ $t('payroll.net_salary') }}:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{{ f.kip(viewingSlip.netSalary) }}</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <button type="button" class="btn-secondary text-xs" @click="viewingSlip = null">
            {{ $t('payroll.close') }}
          </button>
          <a
            v-if="viewingSlip.slipUrl"
            :href="mediaUrl(viewingSlip.slipUrl)!"
            target="_blank"
            download
            class="btn-primary text-xs"
          >
            {{ $t('common.download') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { payrollRepository } from '../../../infrastructure/api/PayrollRepository';
import type { PayrollItem, PayrollPeriod } from '../../../domain/models/Payroll';
import { useFormat } from '../../../composables/useFormat';
import PageHeader from '../../../components/PageHeader.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';

definePageMeta({
  layout: 'teacher',
});

const { t, locale } = useI18n();
const f = useFormat();
const mediaUrl = useMediaUrl();

const loading = ref(false);
const payslips = ref<(PayrollItem & { period: PayrollPeriod })[]>([]);
const total = ref(0);
const selectedPayslip = ref<(PayrollItem & { period: PayrollPeriod }) | null>(null);
const viewingSlip = ref<(PayrollItem & { period: PayrollPeriod }) | null>(null);

const latestNet = computed(() => {
  return payslips.value[0]?.netSalary || 0;
});

const bankOnRecord = computed(() => {
  const p = payslips.value[0];
  if (!p?.bankAccountNumber) return '—';
  return `${p.bankName || 'BCEL'} - ${p.bankAccountNumber}`;
});

const formatMonthDisplay = (ym?: string) => {
  if (!ym) return '—';
  const parts = ym.split('-');
  const y = parts[0] || '';
  const m = parts[1] || '';
  const monthNum = parseInt(m, 10);
  const monthsLo = ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'];
  const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (locale.value === 'lo') {
    return `${monthsLo[monthNum - 1] || m} ${y}`;
  }
  return `${monthsEn[monthNum - 1] || m} ${y}`;
};

const loadPayslips = async () => {
  loading.value = true;
  try {
    const res = await payrollRepository.getMyPayslips();
    if (res?.success) {
      payslips.value = res.data.payslips;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error('Failed to load payslips:', error);
  } finally {
    loading.value = false;
  }
};

const printDoc = () => {
  window.print();
};

onMounted(() => {
  loadPayslips();
});
</script>

<style scoped>
@media print {
  body * {
    visibility: hidden;
  }
  .payslip-print-area, .payslip-print-area * {
    visibility: visible;
  }
  .payslip-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
  }
}
</style>
