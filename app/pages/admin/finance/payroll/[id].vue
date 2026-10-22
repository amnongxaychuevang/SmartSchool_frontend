<template>
  <div class="flex flex-col gap-6">
    <!-- Header with Back Button and Quick Actions -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/admin/finance/payroll"
          class="btn-secondary !p-2 rounded-xl text-ink-subtle hover:text-ink"
          :title="$t('payroll.back_to_list')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </NuxtLink>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl sm:text-2xl font-bold text-ink">
              {{ formatMonthDisplay(period?.periodMonth) }}
            </h1>
            <span
              v-if="period"
              :class="[
                'px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider',
                period.status === 'paid' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                period.status === 'approved' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20'
              ]"
            >
              {{ $t(`payroll.status_${period.status}`) }}
            </span>
          </div>
          <p class="text-xs text-ink-muted mt-0.5">{{ period?.notes || $t('payroll.period_summary') }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="period" class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          class="btn-secondary flex items-center gap-2 text-xs"
          @click="downloadExcel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{{ $t('payroll.export_bcel') }}</span>
        </button>

        <button
          v-if="period.status === 'draft'"
          type="button"
          class="btn-primary flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700"
          :disabled="statusUpdating"
          @click="updateStatus('approved')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ $t('payroll.approve_period') }}</span>
        </button>

        <button
          v-if="period.status === 'approved'"
          type="button"
          class="btn-primary flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700"
          :disabled="statusUpdating"
          @click="updateStatus('paid')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ $t('payroll.mark_as_paid') }}</span>
        </button>
      </div>
    </div>

    <!-- Summary Metrics Cards -->
    <div v-if="period" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="panel p-4 flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.teachers_count') }}</p>
          <p class="text-xl font-bold text-ink mt-0.5 tnum">{{ period.totalTeachers }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-500/10 text-slate-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.total_gross') }}</p>
          <p class="text-lg font-bold text-ink mt-0.5 tnum">{{ f.kip(period.totalGross) }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.total_deductions') }}</p>
          <p class="text-lg font-bold text-red-500 mt-0.5 tnum">-{{ f.kip(period.totalDeductions) }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.total_net') }}</p>
          <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tnum">{{ f.kip(period.totalNet) }}</p>
        </div>
      </div>
    </div>

    <!-- Filter & Table of Teacher Salary Items -->
    <section class="panel overflow-hidden">
      <div class="p-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
        <div class="relative w-72">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            class="search-bar w-full !py-1.5 !text-xs"
            :placeholder="$t('common.search')"
          />
        </div>
        <p class="text-xs text-ink-muted">
          {{ filteredItems.length }} / {{ period?.items?.length || 0 }} {{ $t('payroll.teachers_count') }}
        </p>
      </div>

      <LoadingSpinner v-if="loading" />
      <div v-else-if="!filteredItems.length" class="py-12 text-center text-sm text-ink-subtle">
        {{ $t('common.no_results') }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-10 text-center">#</th>
              <th>{{ $t('payroll.teacher_name') }}</th>
              <th class="text-right">{{ $t('payroll.base_salary') }}</th>
              <th class="text-right">{{ $t('payroll.teaching_allowance') }}</th>
              <th class="text-right">{{ $t('payroll.attendance_bonus') }}</th>
              <th class="text-right">{{ $t('payroll.other_allowance') }}</th>
              <th class="text-right text-red-500">{{ $t('payroll.absence_deduction') }}</th>
              <th class="text-right text-red-500">{{ $t('payroll.tax_deduction') }}</th>
              <th class="text-right text-red-500">{{ $t('payroll.other_deduction') }}</th>
              <th class="text-right font-bold">{{ $t('payroll.net_salary') }}</th>
              <th>{{ $t('payroll.bank_info') }}</th>
              <th class="text-center">{{ $t('payroll.transfer_slip') }}</th>
              <th class="text-right">{{ $t('payroll.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in filteredItems" :key="item.itemId">
              <td class="text-center tnum text-ink-subtle text-xs">{{ i + 1 }}</td>
              <td>
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {{ item.teacher?.fullNameEn?.[0] || 'T' }}
                  </div>
                  <div>
                    <p class="font-semibold text-xs text-ink">{{ locale === 'lo' ? item.teacher?.fullNameLo : item.teacher?.fullNameEn }}</p>
                    <p class="text-[10px] text-ink-muted tnum">{{ item.teacher?.teacherCode }}</p>
                  </div>
                </div>
              </td>
              <td class="text-right tnum font-medium text-xs">{{ f.kip(item.baseSalary) }}</td>
              <td class="text-right tnum text-xs text-emerald-600 dark:text-emerald-400">
                {{ item.teachingAllowance ? `+${f.kip(item.teachingAllowance)}` : '—' }}
              </td>
              <td class="text-right tnum text-xs text-emerald-600 dark:text-emerald-400">
                {{ item.attendanceBonus ? `+${f.kip(item.attendanceBonus)}` : '—' }}
              </td>
              <td class="text-right tnum text-xs text-emerald-600 dark:text-emerald-400">
                {{ item.otherAllowance ? `+${f.kip(item.otherAllowance)}` : '—' }}
              </td>
              <td class="text-right tnum text-xs text-red-500">
                {{ item.absenceDeduction ? `-${f.kip(item.absenceDeduction)}` : '—' }}
              </td>
              <td class="text-right tnum text-xs text-red-500">
                {{ item.taxDeduction ? `-${f.kip(item.taxDeduction)}` : '—' }}
              </td>
              <td class="text-right tnum text-xs text-red-500">
                {{ item.otherDeduction ? `-${f.kip(item.otherDeduction)}` : '—' }}
              </td>
              <td class="text-right tnum font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                {{ f.kip(item.netSalary) }}
              </td>
              <td class="text-xs">
                <div v-if="item.bankAccountNumber" class="flex flex-col text-[11px]">
                  <span class="font-medium text-ink">{{ item.bankName || 'BCEL' }}</span>
                  <span class="tnum text-ink-muted font-mono">{{ item.bankAccountNumber }}</span>
                </div>
                <span v-else class="text-ink-subtle text-[11px]">—</span>
              </td>
              <td class="text-center">
                <div v-if="item.slipUrl" class="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    class="group relative inline-block rounded-lg overflow-hidden border border-line focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                    :title="$t('payroll.view_slip')"
                    @click="previewSlip(item)"
                  >
                    <img :src="mediaUrl(item.slipUrl)!" :alt="$t('payroll.transfer_slip')" class="h-9 w-9 object-cover group-hover:scale-110 transition-transform">
                    <span class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </span>
                  </button>
                  <button
                    type="button"
                    class="text-ink-subtle hover:text-red-500 p-1"
                    :title="$t('payroll.delete_slip')"
                    @click="deleteItemSlip(item)"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div v-else class="inline-flex items-center">
                  <label
                    class="btn-secondary !py-1 !px-2 text-xs cursor-pointer inline-flex items-center gap-1 text-ink-muted hover:text-brand-500"
                    :title="$t('payroll.upload_slip')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{{ $t('payroll.upload_slip') }}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      class="hidden"
                      @change="handleFileUpload($event, item)"
                    />
                  </label>
                </div>
              </td>
              <td class="text-right">
                <div class="inline-flex items-center gap-1">
                  <button
                    type="button"
                    class="btn-secondary !py-1 !px-2 text-xs"
                    :title="$t('payroll.edit_item')"
                    @click="openEditModal(item)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="btn-secondary !py-1 !px-2 text-xs text-brand-600 dark:text-brand-400"
                    :title="$t('payroll.print_payslip')"
                    @click="openPayslipModal(item)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Edit Item Modal -->
    <div
      v-if="editingItem"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="panel max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-line mb-4">
          <div>
            <h3 class="font-bold text-lg text-ink">{{ $t('payroll.edit_item') }}</h3>
            <p class="text-xs text-ink-muted">
              {{ locale === 'lo' ? editingItem.teacher?.fullNameLo : editingItem.teacher?.fullNameEn }}
              ({{ editingItem.teacher?.teacherCode }})
            </p>
          </div>
          <button type="button" class="text-ink-subtle hover:text-ink" @click="editingItem = null">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="saveItem">
          <!-- Base Salary -->
          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase mb-1">{{ $t('payroll.base_salary') }}</label>
            <input
              v-model.number="editForm.baseSalary"
              type="number"
              min="0"
              required
              class="input-field w-full font-mono text-sm"
            />
          </div>

          <!-- Allowances Section -->
          <div class="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col gap-3">
            <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {{ $t('payroll.earnings') }}
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.teaching_allowance') }}</label>
                <input
                  v-model.number="editForm.teachingAllowance"
                  type="number"
                  min="0"
                  class="input-field w-full font-mono text-xs"
                />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.attendance_bonus') }}</label>
                <input
                  v-model.number="editForm.attendanceBonus"
                  type="number"
                  min="0"
                  class="input-field w-full font-mono text-xs"
                />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.other_allowance') }}</label>
                <input
                  v-model.number="editForm.otherAllowance"
                  type="number"
                  min="0"
                  class="input-field w-full font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Deductions Section -->
          <div class="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 flex flex-col gap-3">
            <p class="text-xs font-bold text-red-500 uppercase tracking-wider">
              {{ $t('payroll.deductions') }}
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.absence_deduction') }}</label>
                <input
                  v-model.number="editForm.absenceDeduction"
                  type="number"
                  min="0"
                  class="input-field w-full font-mono text-xs"
                />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.tax_deduction') }}</label>
                <input
                  v-model.number="editForm.taxDeduction"
                  type="number"
                  min="0"
                  class="input-field w-full font-mono text-xs"
                />
              </div>
              <div>
                <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.other_deduction') }}</label>
                <input
                  v-model.number="editForm.otherDeduction"
                  type="number"
                  min="0"
                  class="input-field w-full font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <!-- Live Calculated Net Salary -->
          <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
            <span class="text-xs font-semibold text-ink-muted">{{ $t('payroll.net_salary') }}:</span>
            <span class="text-lg font-bold text-emerald-600 dark:text-emerald-400 tnum font-mono">
              {{ f.kip(previewNetSalary) }}
            </span>
          </div>

          <!-- Bank Account Info -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.bank_name') }}</label>
              <input
                v-model="editForm.bankName"
                type="text"
                class="input-field w-full text-xs"
              />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.bank_account_name') }}</label>
              <input
                v-model="editForm.bankAccountName"
                type="text"
                class="input-field w-full text-xs"
              />
            </div>
            <div>
              <label class="block text-[11px] font-medium text-ink-muted mb-1">{{ $t('payroll.bank_account_number') }}</label>
              <input
                v-model="editForm.bankAccountNumber"
                type="text"
                class="input-field w-full text-xs font-mono"
              />
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-semibold text-ink-muted mb-1">{{ $t('payroll.notes') }}</label>
            <textarea
              v-model="editForm.notes"
              rows="2"
              class="input-field w-full text-xs"
              :placeholder="$t('payroll.notes_placeholder')"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
            <button type="button" class="btn-secondary" @click="editingItem = null">
              {{ $t('payroll.cancel') }}
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving">{{ $t('common.processing') }}</span>
              <span v-else>{{ $t('payroll.save') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Printable Payslip Modal -->
    <div
      v-if="payslipItem"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="panel max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:p-0">
        <!-- Close & Print buttons (hidden during print) -->
        <div class="flex items-center justify-between pb-4 border-b border-line mb-6 print:hidden">
          <h3 class="font-bold text-lg text-ink">{{ $t('payroll.payslip_title') }}</h3>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn-primary flex items-center gap-2 text-xs"
              @click="printPayslip"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>{{ $t('payroll.print') }}</span>
            </button>
            <button type="button" class="text-ink-subtle hover:text-ink p-1" @click="payslipItem = null">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Printable Document Body -->
        <div class="payslip-print-area text-slate-800 dark:text-slate-100 font-sans">
          <!-- School Header -->
          <div class="text-center pb-5 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-xl font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              {{ $t('payroll.school_name') }}
            </h2>
            <p class="text-base font-semibold mt-1">
              {{ $t('payroll.payslip_title') }}
            </p>
            <p class="text-xs text-ink-muted mt-0.5 font-medium">
              {{ $t('payroll.period_month') }}: {{ formatMonthDisplay(period?.periodMonth) }}
            </p>
          </div>

          <!-- Teacher & Period Info Grid -->
          <div class="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200 dark:border-slate-700">
            <div class="space-y-1">
              <p><span class="text-ink-muted">{{ $t('payroll.teacher_name') }}:</span> <strong>{{ payslipItem.teacher?.fullNameLo }} ({{ payslipItem.teacher?.fullNameEn }})</strong></p>
              <p><span class="text-ink-muted">{{ $t('payroll.teacher_code') }}:</span> <span class="font-mono">{{ payslipItem.teacher?.teacherCode }}</span></p>
              <p><span class="text-ink-muted">{{ $t('teachers.department') }}:</span> {{ payslipItem.teacher?.department || '—' }}</p>
            </div>
            <div class="space-y-1 text-right sm:text-left">
              <p><span class="text-ink-muted">{{ $t('payroll.bank_name') }}:</span> {{ payslipItem.bankName || 'BCEL' }}</p>
              <p><span class="text-ink-muted">{{ $t('payroll.bank_account_number') }}:</span> <span class="font-mono">{{ payslipItem.bankAccountNumber || '—' }}</span></p>
              <p><span class="text-ink-muted">{{ $t('payroll.status') }}:</span> <span class="uppercase font-semibold">{{ $t(`payroll.status_${period?.status}`) }}</span></p>
            </div>
          </div>

          <!-- Breakdown: Earnings & Deductions Tables -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4">
            <!-- Earnings -->
            <div class="border border-emerald-500/20 rounded-xl p-3.5 bg-emerald-500/5">
              <h4 class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 pb-1 border-b border-emerald-500/20">
                {{ $t('payroll.earnings') }}
              </h4>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.base_salary') }}</span>
                  <span class="font-mono font-medium">{{ f.kip(payslipItem.baseSalary) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.teaching_allowance') }}</span>
                  <span class="font-mono text-emerald-600 dark:text-emerald-400">+{{ f.kip(payslipItem.teachingAllowance) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.attendance_bonus') }}</span>
                  <span class="font-mono text-emerald-600 dark:text-emerald-400">+{{ f.kip(payslipItem.attendanceBonus) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.other_allowance') }}</span>
                  <span class="font-mono text-emerald-600 dark:text-emerald-400">+{{ f.kip(payslipItem.otherAllowance) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-emerald-500/20 font-bold">
                  <span>{{ $t('payroll.total_gross') }}</span>
                  <span class="font-mono">{{ f.kip(Number(payslipItem.baseSalary) + Number(payslipItem.teachingAllowance) + Number(payslipItem.attendanceBonus) + Number(payslipItem.otherAllowance)) }}</span>
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
                  <span class="font-mono text-red-500">-{{ f.kip(payslipItem.absenceDeduction) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.tax_deduction') }}</span>
                  <span class="font-mono text-red-500">-{{ f.kip(payslipItem.taxDeduction) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-ink-muted">{{ $t('payroll.other_deduction') }}</span>
                  <span class="font-mono text-red-500">-{{ f.kip(payslipItem.otherDeduction) }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-red-500/20 font-bold">
                  <span>{{ $t('payroll.total_deductions') }}</span>
                  <span class="font-mono text-red-500">-{{ f.kip(Number(payslipItem.absenceDeduction) + Number(payslipItem.taxDeduction) + Number(payslipItem.otherDeduction)) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Net Salary Highlight Banner -->
          <div class="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between my-3">
            <div>
              <p class="text-xs uppercase tracking-wider text-slate-400 font-semibold">{{ $t('payroll.net_salary') }}</p>
              <p class="text-[11px] text-slate-400">{{ formatMonthDisplay(period?.periodMonth) }}</p>
            </div>
            <p class="text-2xl font-bold font-mono text-emerald-400 tnum">
              {{ f.kip(payslipItem.netSalary) }}
            </p>
          </div>

          <!-- Transfer Slip Proof Section -->
          <div v-if="payslipItem.slipUrl" class="my-4 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <img :src="mediaUrl(payslipItem.slipUrl)!" :alt="$t('payroll.transfer_slip')" class="h-16 w-16 object-cover rounded-lg border border-line shadow-sm">
              <div>
                <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ $t('payroll.slip_uploaded') }}</span>
                </p>
                <p class="text-[11px] text-ink-muted mt-0.5">{{ $t('payroll.transfer_slip') }} (BCEL)</p>
                <p v-if="payslipItem.paidAt" class="text-[10px] text-ink-subtle tnum">{{ f.dateTime(payslipItem.paidAt) }}</p>
              </div>
            </div>
            <button
              type="button"
              class="btn-secondary !py-1 !px-2.5 text-xs print:hidden"
              @click="previewSlip(payslipItem)"
            >
              {{ $t('payroll.view_slip') }}
            </button>
          </div>

          <!-- Signature Blocks for Official Slip -->
          <div class="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs">
            <div>
              <div class="h-16 border-b border-dashed border-slate-400 mx-auto w-3/4 mb-2"></div>
              <p class="font-semibold text-ink">{{ $t('payroll.received_by') }}</p>
              <p class="text-[10px] text-ink-muted">{{ payslipItem.teacher?.fullNameLo }}</p>
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
      v-if="viewingSlipItem"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      @click.self="viewingSlipItem = null"
    >
      <div class="panel max-w-lg w-full p-5 shadow-2xl relative flex flex-col gap-4">
        <div class="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 class="font-bold text-base text-ink">{{ $t('payroll.transfer_slip') }}</h3>
            <p class="text-xs text-ink-muted">
              {{ locale === 'lo' ? viewingSlipItem.teacher?.fullNameLo : viewingSlipItem.teacher?.fullNameEn }}
              · {{ f.kip(viewingSlipItem.netSalary) }}
            </p>
          </div>
          <button type="button" class="text-ink-subtle hover:text-ink p-1" @click="viewingSlipItem = null">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex justify-center bg-black/10 rounded-xl overflow-hidden p-2">
          <img
            v-if="viewingSlipItem.slipUrl"
            :src="mediaUrl(viewingSlipItem.slipUrl)!"
            :alt="$t('payroll.transfer_slip')"
            class="max-h-[60vh] object-contain rounded-lg shadow-md"
          />
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-surface-sunken border border-line">
          <div>
            <span class="text-ink-subtle block">{{ $t('payroll.bank_info') }}:</span>
            <span class="font-medium text-ink">{{ viewingSlipItem.bankName || 'BCEL' }}</span>
            <span class="text-[11px] block font-mono text-ink-muted">{{ viewingSlipItem.bankAccountNumber || '—' }}</span>
          </div>
          <div class="text-right">
            <span class="text-ink-subtle block">{{ $t('payroll.net_salary') }}:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">{{ f.kip(viewingSlipItem.netSalary) }}</span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-line">
          <button
            type="button"
            class="btn-secondary text-xs text-red-500 hover:text-red-700"
            @click="deleteItemSlip(viewingSlipItem); viewingSlipItem = null"
          >
            {{ $t('payroll.delete_slip') }}
          </button>
          <a
            v-if="viewingSlipItem.slipUrl"
            :href="mediaUrl(viewingSlipItem.slipUrl)!"
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
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { payrollRepository } from '../../../../infrastructure/api/PayrollRepository';
import type { PayrollPeriod, PayrollItem, PayrollStatus } from '../../../../domain/models/Payroll';
import { useFormat } from '../../../../composables/useFormat';
import LoadingSpinner from '../../../../components/LoadingSpinner.vue';

definePageMeta({
  layout: 'admin',
  permission: 'finance.view',
});

const route = useRoute();
const { t, locale } = useI18n();
const f = useFormat();
const mediaUrl = useMediaUrl();

const periodId = computed(() => parseInt(route.params.id as string, 10));

const loading = ref(false);
const statusUpdating = ref(false);
const saving = ref(false);
const period = ref<PayrollPeriod | null>(null);
const search = ref('');

// Modals
const editingItem = ref<PayrollItem | null>(null);
const payslipItem = ref<PayrollItem | null>(null);
const viewingSlipItem = ref<PayrollItem | null>(null);

const editForm = ref({
  baseSalary: 0,
  teachingAllowance: 0,
  attendanceBonus: 0,
  otherAllowance: 0,
  absenceDeduction: 0,
  taxDeduction: 0,
  otherDeduction: 0,
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  notes: '',
});

const previewNetSalary = computed(() => {
  const gross = Number(editForm.value.baseSalary || 0) +
    Number(editForm.value.teachingAllowance || 0) +
    Number(editForm.value.attendanceBonus || 0) +
    Number(editForm.value.otherAllowance || 0);
  const deductions = Number(editForm.value.absenceDeduction || 0) +
    Number(editForm.value.taxDeduction || 0) +
    Number(editForm.value.otherDeduction || 0);
  return Math.max(0, gross - deductions);
});

const filteredItems = computed(() => {
  if (!period.value?.items) return [];
  if (!search.value.trim()) return period.value.items;
  const q = search.value.toLowerCase().trim();
  return period.value.items.filter(item => {
    const lo = item.teacher?.fullNameLo?.toLowerCase() || '';
    const en = item.teacher?.fullNameEn?.toLowerCase() || '';
    const code = item.teacher?.teacherCode?.toLowerCase() || '';
    const bank = item.bankAccountNumber?.toLowerCase() || '';
    return lo.includes(q) || en.includes(q) || code.includes(q) || bank.includes(q);
  });
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

const loadPeriod = async () => {
  if (!periodId.value) return;
  loading.value = true;
  try {
    const res = await payrollRepository.getPeriod(periodId.value);
    if (res?.success) {
      period.value = res.data.period;
    }
  } catch (error) {
    console.error('Failed to load period detail:', error);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (status: PayrollStatus) => {
  const confirmMsg = status === 'approved' ? t('payroll.approve_confirm') : t('payroll.paid_confirm');
  if (!confirm(confirmMsg)) return;

  statusUpdating.value = true;
  try {
    const res = await payrollRepository.updatePeriodStatus(periodId.value, status);
    if (res?.success) {
      await loadPeriod();
    }
  } catch (error) {
    console.error('Failed to update period status:', error);
  } finally {
    statusUpdating.value = false;
  }
};

const openEditModal = (item: PayrollItem) => {
  editingItem.value = item;
  editForm.value = {
    baseSalary: Number(item.baseSalary || 0),
    teachingAllowance: Number(item.teachingAllowance || 0),
    attendanceBonus: Number(item.attendanceBonus || 0),
    otherAllowance: Number(item.otherAllowance || 0),
    absenceDeduction: Number(item.absenceDeduction || 0),
    taxDeduction: Number(item.taxDeduction || 0),
    otherDeduction: Number(item.otherDeduction || 0),
    bankName: item.bankName || 'BCEL',
    bankAccountName: item.bankAccountName || '',
    bankAccountNumber: item.bankAccountNumber || '',
    notes: item.notes || '',
  };
};

const saveItem = async () => {
  if (!editingItem.value) return;
  saving.value = true;
  try {
    const res = await payrollRepository.updateItem(editingItem.value.itemId, editForm.value);
    if (res?.success) {
      editingItem.value = null;
      await loadPeriod();
    }
  } catch (error) {
    console.error('Failed to save payroll item:', error);
  } finally {
    saving.value = false;
  }
};

const openPayslipModal = (item: PayrollItem) => {
  payslipItem.value = item;
};

const previewSlip = (item: PayrollItem) => {
  viewingSlipItem.value = item;
};

const handleFileUpload = async (event: Event, item: PayrollItem) => {
  const target = event.target as HTMLInputElement;
  const file = target?.files?.[0];
  if (!file) return;

  try {
    const res = await payrollRepository.uploadSlip(item.itemId, file);
    if (res?.success) {
      item.slipUrl = res.data.item.slipUrl;
      item.paidAt = res.data.item.paidAt;
      item.paymentStatus = 'paid';
      await loadPeriod();
    }
  } catch (error) {
    console.error('Failed to upload slip:', error);
  } finally {
    target.value = '';
  }
};

const deleteItemSlip = async (item: PayrollItem) => {
  if (!confirm(t('payroll.delete_slip_confirm'))) return;
  try {
    const res = await payrollRepository.deleteSlip(item.itemId);
    if (res?.success) {
      item.slipUrl = null;
      await loadPeriod();
    }
  } catch (error) {
    console.error('Failed to delete slip:', error);
  }
};

const printPayslip = () => {
  window.print();
};

const downloadExcel = async () => {
  try {
    await payrollRepository.downloadExport(periodId.value, locale.value === 'lo' ? 'lo' : 'en');
  } catch (error) {
    console.error('Failed to export excel:', error);
  }
};

onMounted(() => {
  loadPeriod();
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
