<template>
  <div class="flex flex-col gap-6">
    <!-- Header & Controls -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          {{ $t('cashflow.title') }}
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ $t('cashflow.subtitle') }}
        </p>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-2.5 text-xs">
        <div>
          <select v-model="filterYear" class="input-field text-xs py-1.5" @change="loadData">
            <option value="">{{ $t('cashflow.all_years') }}</option>
            <option value="2026-2027">2026-2027</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>
        <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <input v-model="filterStartDate" type="date" class="bg-transparent border-0 text-xs text-slate-700 dark:text-slate-200 focus:ring-0 p-1">
          <span class="text-slate-400">—</span>
          <input v-model="filterEndDate" type="date" class="bg-transparent border-0 text-xs text-slate-700 dark:text-slate-200 focus:ring-0 p-1">
        </div>
        <button
          type="button"
          class="h-8 px-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-sm"
          @click="loadData"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {{ $t('common.filter') }}
        </button>
        <button
          type="button"
          class="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center transition-colors"
          :title="$t('common.refresh')"
          @click="resetFilters"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" class="my-16" />

    <div v-else-if="report" class="space-y-6">
      <!-- 3 Summary KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Income Card -->
        <div class="panel p-5 relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                {{ $t('cashflow.total_income') }}
              </span>
              <div class="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {{ format.kip(report.summary.totalIncome) }}
              </div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-emerald-500/20 flex flex-col gap-1 text-xs">
            <div class="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{{ $t('cashflow.student_fees_income') }}:</span>
              <span class="font-semibold">{{ format.kip(report.summary.totalStudentFees) }}</span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{{ $t('cashflow.shop_rentals_income') }}:</span>
              <span class="font-semibold">{{ format.kip(report.summary.totalShopRentals) }}</span>
            </div>
          </div>
        </div>

        <!-- Expense Card -->
        <div class="panel p-5 relative overflow-hidden bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent border-rose-500/20">
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                {{ $t('cashflow.total_expense') }}
              </span>
              <div class="text-2xl font-black text-rose-700 dark:text-rose-300">
                {{ format.kip(report.summary.totalExpense) }}
              </div>
            </div>
            <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-rose-500/20 flex flex-col gap-1 text-xs">
            <div class="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{{ $t('cashflow.teacher_payroll_expense') }}:</span>
              <span class="font-semibold">{{ format.kip(report.summary.totalPayrollExpense) }}</span>
            </div>
            <div class="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{{ $t('cashflow.general_operating_expenses') }}:</span>
              <span class="font-semibold">{{ format.kip(report.summary.totalGeneralExpense || 0) }}</span>
            </div>
            <div class="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>{{ $t('cashflow.payroll_periods_count') }}:</span>
              <span>{{ report.breakdown.payroll.periodCount }} {{ $t('cashflow.periods') }} ({{ report.breakdown.payroll.itemCount }} {{ $t('cashflow.slips') }})</span>
            </div>
          </div>
        </div>

        <!-- Net Cashflow Card -->
        <div
          class="panel p-5 relative overflow-hidden bg-gradient-to-br border"
          :class="report.summary.netCashflow >= 0
            ? 'from-teal-500/15 via-emerald-500/10 to-transparent border-teal-500/30'
            : 'from-amber-500/15 via-rose-500/10 to-transparent border-amber-500/30'"
        >
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider block mb-1" :class="report.summary.netCashflow >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'">
                {{ $t('cashflow.net_cashflow') }}
              </span>
              <div class="text-2xl font-black" :class="report.summary.netCashflow >= 0 ? 'text-teal-700 dark:text-teal-300' : 'text-amber-700 dark:text-amber-300'">
                {{ report.summary.netCashflow >= 0 ? '+' : '' }}{{ format.kip(report.summary.netCashflow) }}
              </div>
            </div>
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
              :class="report.summary.netCashflow >= 0 ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'"
            >
              {{ report.summary.netCashflow >= 0 ? '₭+' : '₭-' }}
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-slate-400">{{ $t('cashflow.financial_health') }}:</span>
            <span
              class="font-bold px-2 py-0.5 rounded-full text-[11px]"
              :class="report.summary.netCashflow >= 0 ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'"
            >
              {{ report.summary.netCashflow >= 0 ? $t('cashflow.surplus') : $t('cashflow.deficit') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2 Column Breakdown Tables: Fees vs Rentals -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Student Fees Breakdown Panel -->
        <div class="panel overflow-hidden">
          <div class="p-4 border-b border-line flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {{ $t('cashflow.breakdown_student_fees') }}
            </h3>
            <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {{ format.kip(report.summary.totalStudentFees) }}
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table w-full text-xs">
              <thead>
                <tr>
                  <th>{{ $t('cashflow.fee_type') }}</th>
                  <th class="text-center">{{ $t('cashflow.payments_count') }}</th>
                  <th class="text-right">{{ $t('cashflow.total_collected') }}</th>
                  <th class="text-right w-20">{{ $t('cashflow.share') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
                <tr v-for="ft in report.breakdown.feesByType" :key="ft.nameEn" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="font-medium text-slate-900 dark:text-white">{{ pick(ft.nameLo, ft.nameEn) }}</td>
                  <td class="text-center text-slate-500 dark:text-slate-400">{{ ft.count }}</td>
                  <td class="text-right font-semibold text-slate-900 dark:text-white">{{ format.kip(ft.total) }}</td>
                  <td class="text-right text-slate-500 dark:text-slate-400">
                    {{ report.summary.totalIncome > 0 ? ((ft.total / report.summary.totalIncome) * 100).toFixed(1) + '%' : '0%' }}
                  </td>
                </tr>
                <tr v-if="!report.breakdown.feesByType.length">
                  <td colspan="4" class="py-8 text-center text-slate-400">{{ $t('common.no_data') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Shop Rentals Breakdown Panel -->
        <div class="panel overflow-hidden">
          <div class="p-4 border-b border-line flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {{ $t('cashflow.breakdown_shop_rentals') }}
            </h3>
            <span class="text-xs font-semibold text-teal-600 dark:text-teal-400">
              {{ format.kip(report.summary.totalShopRentals) }}
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table w-full text-xs">
              <thead>
                <tr>
                  <th>{{ $t('cashflow.shop_name') }}</th>
                  <th class="text-center">{{ $t('cashflow.payments_count') }}</th>
                  <th class="text-right">{{ $t('cashflow.total_collected') }}</th>
                  <th class="text-right w-20">{{ $t('cashflow.share') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800/60">
                <tr v-for="sr in report.breakdown.rentalsByShop" :key="sr.shopNameEn" class="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td class="font-medium text-slate-900 dark:text-white">{{ pick(sr.shopNameLo, sr.shopNameEn) }}</td>
                  <td class="text-center text-slate-500 dark:text-slate-400">{{ sr.count }}</td>
                  <td class="text-right font-semibold text-slate-900 dark:text-white">{{ format.kip(sr.total) }}</td>
                  <td class="text-right text-slate-500 dark:text-slate-400">
                    {{ report.summary.totalIncome > 0 ? ((sr.total / report.summary.totalIncome) * 100).toFixed(1) + '%' : '0%' }}
                  </td>
                </tr>
                <tr v-if="!report.breakdown.rentalsByShop.length">
                  <td colspan="4" class="py-8 text-center text-slate-400">{{ $t('common.no_data') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Teacher Payroll Expenses Detail Panel -->
      <div class="panel p-5 overflow-hidden">
        <h3 class="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center justify-between">
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ $t('cashflow.breakdown_teacher_payroll') }}
          </span>
          <NuxtLink to="/admin/finance/payroll" class="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 font-semibold">
            {{ $t('cashflow.manage_payroll') }} &rarr;
          </NuxtLink>
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <span class="text-xs text-slate-500 dark:text-slate-400 block mb-1">{{ $t('cashflow.base_salary_total') }}</span>
            <span class="text-sm font-bold text-slate-900 dark:text-white">{{ format.kip(report.breakdown.payroll.totalBaseSalary) }}</span>
          </div>
          <div class="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20">
            <span class="text-xs text-emerald-600 dark:text-emerald-400 block mb-1">{{ $t('cashflow.allowances_total') }}</span>
            <span class="text-sm font-bold text-emerald-700 dark:text-emerald-300">+{{ format.kip(report.breakdown.payroll.totalAllowances) }}</span>
          </div>
          <div class="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20">
            <span class="text-xs text-rose-600 dark:text-rose-400 block mb-1">{{ $t('cashflow.deductions_total') }}</span>
            <span class="text-sm font-bold text-rose-700 dark:text-rose-300">-{{ format.kip(report.breakdown.payroll.totalDeductions) }}</span>
          </div>
          <div class="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30">
            <span class="text-xs text-teal-700 dark:text-teal-300 block mb-1">{{ $t('cashflow.net_salaries_paid') }}</span>
            <span class="text-sm font-black text-teal-800 dark:text-teal-200">{{ format.kip(report.breakdown.payroll.totalNetSalary) }}</span>
          </div>
        </div>
      </div>

      <!-- General Operating Expenses Breakdown Panel -->
      <div v-if="report.breakdown.expensesByCategory?.length" class="panel overflow-hidden">
        <div class="p-4 border-b border-line flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ $t('cashflow.breakdown_general_expenses') }}
          </h3>
          <NuxtLink to="/admin/finance/expenses" class="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 font-semibold">
            {{ $t('cashflow.manage_expenses') }} &rarr;
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table w-full text-xs">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <th>{{ $t('cashflow.category') }}</th>
                <th class="text-center">{{ $t('cashflow.payments_count') }}</th>
                <th class="text-right">{{ $t('cashflow.total_collected') }}</th>
                <th class="text-right w-20">{{ $t('cashflow.share') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="cat in report.breakdown.expensesByCategory" :key="cat.categoryId" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                <td class="font-semibold text-slate-900 dark:text-white">
                  {{ pick(cat.nameLo, cat.nameEn) }}
                </td>
                <td class="text-center text-slate-500 dark:text-slate-400 tnum">
                  {{ cat.count }}
                </td>
                <td class="text-right font-bold text-rose-600 dark:text-rose-400 tnum">
                  {{ format.kip(cat.total) }}
                </td>
                <td class="text-right text-slate-500 dark:text-slate-400 tnum">
                  {{ report.summary.totalExpense > 0 ? Math.round((cat.total / report.summary.totalExpense) * 100) : 0 }}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { financeRepository, type CashflowReport } from '../../../infrastructure/api/FinanceRepository';
import { useFormat } from '../../../composables/useFormat';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const format = useFormat();
useHead({ title: () => t('cashflow.page_title') });

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) ?? '—';

const loading = ref(true);
const report = ref<CashflowReport | null>(null);

const filterYear = ref('');
const filterStartDate = ref('');
const filterEndDate = ref('');

async function loadData() {
  loading.value = true;
  try {
    report.value = await financeRepository.getCashflowSummary({
      academicYear: filterYear.value || undefined,
      startDate: filterStartDate.value || undefined,
      endDate: filterEndDate.value || undefined,
    });
  } catch (err) {
    console.error('Failed to load cashflow report', err);
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filterYear.value = '';
  filterStartDate.value = '';
  filterEndDate.value = '';
  loadData();
}

onMounted(() => {
  loadData();
});
</script>
