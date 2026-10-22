<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('expenses.title')" :subtitle="$t('expenses.subtitle')">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-secondary flex items-center gap-2"
          @click="openCategoryModal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>{{ $t('expenses.add_category_quick') }}</span>
        </button>

        <button
          type="button"
          class="btn-primary flex items-center gap-2"
          @click="openAddModal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ $t('expenses.add_expense') }}</span>
        </button>
      </div>
    </PageHeader>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('expenses.total_expenses') }}</p>
          <p class="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 tnum">{{ f.kip(totalAmount) }}</p>
        </div>
      </div>

      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('expenses.total_records') }}</p>
          <p class="text-2xl font-bold text-ink mt-0.5 tnum">{{ totalItems }}</p>
        </div>
      </div>

      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('expenses.categories_count') }}</p>
          <p class="text-2xl font-bold text-ink mt-0.5 tnum">{{ categories.length }}</p>
        </div>
      </div>
    </div>

    <!-- Filters Row under 3 Cards (All aligned to the Left) -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search Bar -->
      <div class="relative w-full sm:w-72">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          class="search-bar"
          :placeholder="$t('expenses.search_placeholder')"
          @input="handleSearch"
        />
        <button
          v-if="searchInput"
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors"
          :aria-label="$t('common.clear')"
          @click="clearSearch"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Category Filter -->
      <select
        v-model="filters.categoryId"
        class="input-field w-auto"
        :aria-label="$t('expenses.category_col')"
        @change="applyFilters"
      >
        <option :value="undefined">{{ $t('expenses.all_categories') }}</option>
        <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">
          {{ pick(c.nameLo, c.nameEn) }}
        </option>
      </select>

      <!-- Academic Year Filter -->
      <select
        v-model="filters.academicYear"
        class="input-field w-auto"
        :aria-label="$t('common.academic_year')"
        @change="applyFilters"
      >
        <option value="">{{ $t('expenses.all_years') }}</option>
        <option v-for="y in academicYears" :key="y" :value="y">{{ y }}</option>
      </select>

      <!-- Date Range Filter -->
      <div class="flex items-center gap-1.5 text-xs text-ink-muted">
        <input
          v-model="filters.startDate"
          type="date"
          class="input-field w-auto text-xs"
          :aria-label="$t('expenses.date')"
          @change="applyFilters"
        />
        <span>-</span>
        <input
          v-model="filters.endDate"
          type="date"
          class="input-field w-auto text-xs"
          :aria-label="$t('expenses.date')"
          @change="applyFilters"
        />
      </div>

      <!-- Clear Filters Button -->
      <button
        v-if="hasActiveFilters"
        type="button"
        class="btn-secondary text-xs px-2.5 py-1.5 text-ink-muted hover:text-rose-500 transition-colors"
        @click="clearFilters"
      >
        {{ $t('common.clear') }}
      </button>
    </div>

    <!-- Table Section -->
    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="loading && !expenses.length" />
      <div v-else-if="!expenses.length" class="py-16 text-center text-sm text-ink-subtle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-ink-subtle/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
        <p class="font-medium text-base text-ink">{{ $t('expenses.no_expenses') }}</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-28">{{ $t('expenses.date') }}</th>
              <th class="w-32">{{ $t('expenses.expense_no') }}</th>
              <th>{{ $t('expenses.title_col') }}</th>
              <th>{{ $t('expenses.category_col') }}</th>
              <th>{{ $t('expenses.paid_to') }}</th>
              <th class="text-right">{{ $t('expenses.amount_col') }}</th>
              <th class="text-center w-28">{{ $t('expenses.payment_method') }}</th>
              <th class="text-center w-28">{{ $t('expenses.receipt_col') }}</th>
              <th class="text-right w-24">{{ $t('expenses.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in expenses" :key="e.expenseId" class="hover:bg-ink-muted/5 transition-colors">
              <td class="text-xs text-ink-muted tnum whitespace-nowrap">
                {{ f.date(e.expenseDate) }}
              </td>
              <td>
                <span class="inline-block px-2 py-0.5 text-xs font-mono font-semibold rounded bg-slate-500/10 text-slate-700 dark:text-slate-300">
                  {{ e.expenseNo }}
                </span>
              </td>
              <td>
                <div class="font-medium text-ink">{{ e.title }}</div>
                <div v-if="e.description" class="text-xs text-ink-muted truncate max-w-xs mt-0.5">
                  {{ e.description }}
                </div>
                <div v-if="e.referenceNo" class="text-[11px] text-ink-subtle mt-0.5">
                  Ref: <span class="font-mono">{{ e.referenceNo }}</span>
                </div>
              </td>
              <td>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-300">
                  <span>{{ pick(e.category?.nameLo, e.category?.nameEn) }}</span>
                </span>
              </td>
              <td class="text-sm text-ink-muted">
                {{ e.paidTo || '-' }}
              </td>
              <td class="text-right font-bold text-rose-600 dark:text-rose-400 tnum">
                {{ f.kip(e.amount) }}
              </td>
              <td class="text-center">
                <span
                  class="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
                  :class="e.paymentMethod === 'bank_transfer' ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'"
                >
                  {{ e.paymentMethod === 'bank_transfer' ? $t('expenses.bank_transfer') : $t('expenses.cash') }}
                </span>
              </td>
              <td class="text-center">
                <div v-if="e.receiptUrl" class="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    class="group relative block w-9 h-9 rounded-lg overflow-hidden border border-line bg-surface hover:ring-2 hover:ring-primary transition-all shrink-0 shadow-sm"
                    :title="$t('expenses.view_receipt')"
                    @click="viewReceipt(e)"
                  >
                    <img :src="mediaUrl(e.receiptUrl)!" :alt="$t('expenses.receipt_col')" class="h-9 w-9 object-cover group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    type="button"
                    class="p-1 rounded text-ink-subtle hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                    :title="$t('expenses.remove_receipt')"
                    @click="confirmRemoveReceipt(e)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div v-else>
                  <label class="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{{ $t('expenses.upload_receipt') }}</span>
                    <input type="file" accept="image/*" class="hidden" @change="(evt) => handleRowReceiptUpload(e, evt)" />
                  </label>
                </div>
              </td>
              <td class="text-right">
                <div class="inline-flex items-center gap-1">
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-ink-muted hover:text-primary hover:bg-primary/10 transition-colors"
                    :title="$t('expenses.edit_expense')"
                    @click="openEditModal(e)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                    :title="$t('common.delete')"
                    @click="confirmDeleteExpense(e)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="p-4 border-t border-line">
        <PaginationBar :current-page="page" :total-pages="totalPages" @update:page="changePage" />
      </div>
    </section>

    <!-- Modal 1: Add / Edit Expense -->
    <div v-if="showFormModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div class="panel max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-ink mb-1">
          {{ isEditing ? $t('expenses.edit_expense') : $t('expenses.add_expense') }}
        </h3>
        <p class="text-xs text-ink-muted mb-5">
          {{ $t('expenses.subtitle') }}
        </p>

        <form class="space-y-4" @submit.prevent="saveExpense">
          <!-- Category -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-ink uppercase tracking-wider">{{ $t('expenses.category_col') }} *</label>
              <button type="button" class="text-xs text-primary hover:underline font-medium" @click="openCategoryModal">
                {{ $t('expenses.add_category_quick') }}
              </button>
            </div>
            <select v-model.number="form.categoryId" required class="input-field w-full">
              <option :value="0" disabled>{{ $t('expenses.select_category') }}</option>
              <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">
                {{ pick(c.nameLo, c.nameEn) }}
              </option>
            </select>
          </div>

          <!-- Academic Year & Date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
                {{ $t('expenses.academic_year') }} *
              </label>
              <input v-model="form.academicYear" required type="text" placeholder="2026-2027" class="input-field w-full" />
            </div>
            <div>
              <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
                {{ $t('expenses.date') }} *
              </label>
              <input v-model="form.expenseDate" required type="date" class="input-field w-full" />
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
              {{ $t('expenses.title_col') }} *
            </label>
            <input
              v-model="form.title"
              required
              type="text"
              :placeholder="$t('expenses.title_placeholder')"
              class="input-field w-full"
            />
          </div>

          <!-- Amount & Payment Method -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
                {{ $t('expenses.amount_col') }} *
              </label>
              <input
                v-model.number="form.amount"
                required
                type="number"
                min="1000"
                step="500"
                placeholder="50000"
                class="input-field w-full font-mono font-bold text-rose-600 dark:text-rose-400"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
                {{ $t('expenses.payment_method') }} *
              </label>
              <select v-model="form.paymentMethod" class="input-field w-full">
                <option value="cash">{{ $t('expenses.cash') }}</option>
                <option value="bank_transfer">{{ $t('expenses.bank_transfer') }}</option>
              </select>
            </div>
          </div>

          <!-- Paid To & Reference No -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
                {{ $t('expenses.paid_to') }}
              </label>
              <input
                v-model="form.paidTo"
                type="text"
                :placeholder="$t('expenses.paid_to_placeholder')"
                class="input-field w-full"
              />
            </div>
            <div>
              <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
                {{ $t('expenses.reference_no') }}
              </label>
              <input
                v-model="form.referenceNo"
                type="text"
                :placeholder="$t('expenses.ref_placeholder')"
                class="input-field w-full font-mono"
              />
            </div>
          </div>

          <!-- Description / Notes -->
          <div>
            <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
              {{ $t('expenses.description') }}
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              :placeholder="$t('expenses.notes_placeholder')"
              class="input-field w-full"
            ></textarea>
          </div>

          <!-- Optional Receipt file picker -->
          <div>
            <label class="text-xs font-semibold text-ink uppercase tracking-wider block mb-1">
              {{ $t('expenses.receipt_col') }}
            </label>
            <div class="flex items-center gap-3">
              <input
                ref="receiptFileInput"
                type="file"
                accept="image/*"
                class="input-field text-xs w-full file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                @change="handleFormReceiptSelected"
              />
            </div>
          </div>

          <div v-if="formError" class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            {{ formError }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button type="button" class="btn-secondary text-xs" :disabled="saving" @click="showFormModal = false">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" class="btn-primary text-xs" :disabled="saving">
              {{ saving ? $t('common.saving') : $t('expenses.save_expense') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Create Category Modal -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
      <div class="panel max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-line">
          <h3 class="text-base font-bold text-ink">{{ $t('expenses.add_category_quick') }}</h3>
          <button type="button" class="text-ink-muted hover:text-ink text-xl font-bold leading-none" @click="showCategoryModal = false">&times;</button>
        </div>

        <form class="space-y-4" @submit.prevent="addCategory">
          <div>
            <label class="block text-xs font-semibold text-ink mb-1.5">
              {{ $t('expenses.category_name_lo') }} <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="newCategory.nameLo"
              type="text"
              required
              :placeholder="$t('expenses.category_name_lo')"
              class="input-field w-full text-sm"
              autofocus
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink mb-1.5">
              {{ $t('expenses.category_name_en') }} <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="newCategory.nameEn"
              type="text"
              required
              :placeholder="$t('expenses.category_name_en')"
              class="input-field w-full text-sm"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              class="btn-secondary text-xs px-3.5 py-2"
              @click="showCategoryModal = false"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="btn-primary text-xs px-4 py-2"
              :disabled="savingCategory || (!newCategory.nameLo.trim() && !newCategory.nameEn.trim())"
            >
              {{ savingCategory ? $t('common.saving') : $t('expenses.save_category') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 3: Receipt Viewer Modal -->
    <div v-if="viewingReceiptExpense" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
      <div class="panel max-w-2xl w-full p-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-line">
          <div>
            <h3 class="text-base font-bold text-ink">{{ viewingReceiptExpense.title }}</h3>
            <p class="text-xs text-ink-muted">
              {{ viewingReceiptExpense.expenseNo }} &bull; {{ f.kip(viewingReceiptExpense.amount) }} &bull; {{ f.date(viewingReceiptExpense.expenseDate) }}
            </p>
          </div>
          <button type="button" class="text-ink-muted hover:text-ink text-2xl font-bold leading-none" @click="viewingReceiptExpense = null">&times;</button>
        </div>

        <div class="flex-1 overflow-auto flex items-center justify-center bg-slate-900/5 rounded-xl p-2 min-h-[300px]">
          <img
            v-if="viewingReceiptExpense.receiptUrl"
            :src="mediaUrl(viewingReceiptExpense.receiptUrl)!"
            :alt="$t('expenses.receipt_col')"
            class="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-line"
          />
        </div>

        <div class="flex items-center justify-between pt-3 mt-3 border-t border-line">
          <button
            type="button"
            class="btn-secondary text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5"
            @click="confirmRemoveReceipt(viewingReceiptExpense)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>{{ $t('expenses.remove_receipt') }}</span>
          </button>

          <div class="flex items-center gap-2">
            <a
              v-if="viewingReceiptExpense.receiptUrl"
              :href="mediaUrl(viewingReceiptExpense.receiptUrl)!"
              target="_blank"
              class="btn-secondary text-xs flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>{{ $t('common.view') }}</span>
            </a>
            <button type="button" class="btn-primary text-xs" @click="viewingReceiptExpense = null">
              {{ $t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '../../../components/PageHeader.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import PaginationBar from '../../../components/PaginationBar.vue';
import { financeRepository } from '../../../infrastructure/api/FinanceRepository';
import type { Expense, ExpenseCategory } from '../../../domain/models/Finance';
import { useFormat } from '../../../composables/useFormat';
import { useMediaUrl } from '../../../composables/useMediaUrl';

definePageMeta({
  layout: 'admin',
  permission: 'finance.view',
});

const { t, locale } = useI18n();
const f = useFormat();
const mediaUrl = useMediaUrl();

const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) ?? '—';

useHead({ title: () => t('expenses.page_title') });

// Data state
const loading = ref(false);
const saving = ref(false);
const savingCategory = ref(false);
const expenses = ref<Expense[]>([]);
const categories = ref<ExpenseCategory[]>([]);
const totalItems = ref(0);
const totalPages = ref(1);
const page = ref(1);
const limit = ref(20);

// Filters
const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const filters = ref({
  search: '',
  categoryId: undefined as number | undefined,
  academicYear: '',
  startDate: '',
  endDate: '',
});

const academicYears = computed(() => {
  const current = new Date().getFullYear();
  return [
    `${current - 1}-${current}`,
    `${current}-${current + 1}`,
    `${current + 1}-${current + 2}`,
  ];
});

const totalAmount = computed(() => {
  return expenses.value.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
});

const hasActiveFilters = computed(() => {
  return !!(
    filters.value.search ||
    filters.value.categoryId ||
    filters.value.academicYear ||
    filters.value.startDate ||
    filters.value.endDate
  );
});

// Modal states
const showFormModal = ref(false);
const showCategoryModal = ref(false);
const isEditing = ref(false);
const editingExpenseId = ref<number | null>(null);
const formError = ref('');
const pendingReceiptFile = ref<File | null>(null);
const viewingReceiptExpense = ref<Expense | null>(null);

const form = ref({
  categoryId: 0,
  academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  title: '',
  description: '',
  amount: 0,
  expenseDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'cash',
  paidTo: '',
  referenceNo: '',
});

const newCategory = ref({
  nameLo: '',
  nameEn: '',
});

// Loaders
const loadCategories = async () => {
  try {
    const list = await financeRepository.getExpenseCategories();
    categories.value = list;
    if (categories.value.length && form.value.categoryId === 0) {
      form.value.categoryId = categories.value[0]?.categoryId ?? 0;
    }
  } catch (error) {
    console.error('Failed to load expense categories:', error);
  }
};

const loadExpenses = async () => {
  loading.value = true;
  try {
    const res = await financeRepository.getExpenses({
      search: filters.value.search || undefined,
      categoryId: filters.value.categoryId || undefined,
      academicYear: filters.value.academicYear || undefined,
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
      page: page.value,
      limit: limit.value,
    });
    expenses.value = res.expenses;
    totalItems.value = res.total;
    totalPages.value = Math.max(1, Math.ceil(res.total / limit.value));
  } catch (error) {
    console.error('Failed to load expenses:', error);
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  page.value = 1;
  loadExpenses();
};

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.search = searchInput.value;
    applyFilters();
  }, 350);
};

const clearSearch = () => {
  searchInput.value = '';
  filters.value.search = '';
  applyFilters();
};

const clearFilters = () => {
  searchInput.value = '';
  filters.value = {
    search: '',
    categoryId: undefined,
    academicYear: '',
    startDate: '',
    endDate: '',
  };
  page.value = 1;
  loadExpenses();
};

const changePage = (p: number) => {
  page.value = p;
  loadExpenses();
};

// Form handling
const openAddModal = () => {
  isEditing.value = false;
  editingExpenseId.value = null;
  formError.value = '';
  pendingReceiptFile.value = null;
  form.value = {
    categoryId: categories.value[0]?.categoryId ?? 0,
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    title: '',
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    paidTo: '',
    referenceNo: '',
  };
  showFormModal.value = true;
};

const openEditModal = (expense: Expense) => {
  isEditing.value = true;
  editingExpenseId.value = expense.expenseId;
  formError.value = '';
  pendingReceiptFile.value = null;
  form.value = {
    categoryId: expense.categoryId,
    academicYear: expense.academicYear,
    title: expense.title,
    description: expense.description || '',
    amount: expense.amount,
    expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
    paymentMethod: expense.paymentMethod || 'cash',
    paidTo: expense.paidTo || '',
    referenceNo: expense.referenceNo || '',
  };
  showFormModal.value = true;
};

const handleFormReceiptSelected = (evt: Event) => {
  const input = evt.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    pendingReceiptFile.value = input.files[0];
  }
};

const saveExpense = async () => {
  if (form.value.categoryId <= 0) {
    formError.value = t('expenses.select_category');
    return;
  }
  if (!form.value.title.trim()) {
    formError.value = 'Please provide an expense title';
    return;
  }
  if (form.value.amount <= 0) {
    formError.value = 'Amount must be greater than zero';
    return;
  }

  saving.value = true;
  formError.value = '';

  try {
    let savedExpense: Expense;
    if (isEditing.value && editingExpenseId.value) {
      savedExpense = await financeRepository.updateExpense(editingExpenseId.value, {
        categoryId: form.value.categoryId,
        academicYear: form.value.academicYear,
        title: form.value.title.trim(),
        description: form.value.description.trim() || undefined,
        amount: Number(form.value.amount),
        expenseDate: form.value.expenseDate,
        paymentMethod: form.value.paymentMethod,
        paidTo: form.value.paidTo.trim() || undefined,
        referenceNo: form.value.referenceNo.trim() || undefined,
      });
    } else {
      savedExpense = await financeRepository.createExpense({
        categoryId: form.value.categoryId,
        academicYear: form.value.academicYear,
        title: form.value.title.trim(),
        description: form.value.description.trim() || undefined,
        amount: Number(form.value.amount),
        expenseDate: form.value.expenseDate,
        paymentMethod: form.value.paymentMethod,
        paidTo: form.value.paidTo.trim() || undefined,
        referenceNo: form.value.referenceNo.trim() || undefined,
      });
    }

    // Upload receipt if file was chosen
    if (pendingReceiptFile.value && savedExpense?.expenseId) {
      await financeRepository.uploadExpenseReceipt(savedExpense.expenseId, pendingReceiptFile.value);
    }

    showFormModal.value = false;
    await loadExpenses();
  } catch (err: any) {
    formError.value = err?.data?.message || err.message || 'Failed to save expense';
  } finally {
    saving.value = false;
  }
};

const confirmDeleteExpense = async (expense: Expense) => {
  if (!confirm(t('expenses.delete_confirm'))) return;
  try {
    await financeRepository.deleteExpense(expense.expenseId);
    await loadExpenses();
  } catch (error) {
    console.error('Failed to delete expense:', error);
  }
};

// Receipt viewer & actions
const viewReceipt = (expense: Expense) => {
  viewingReceiptExpense.value = expense;
};

const handleRowReceiptUpload = async (expense: Expense, evt: Event) => {
  const input = evt.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  try {
    const updated = await financeRepository.uploadExpenseReceipt(expense.expenseId, file);
    expense.receiptUrl = updated.receiptUrl;
  } catch (error) {
    console.error('Failed to upload receipt:', error);
  } finally {
    input.value = '';
  }
};

const confirmRemoveReceipt = async (expense: Expense) => {
  if (!confirm(t('expenses.delete_receipt_confirm'))) return;
  try {
    await financeRepository.deleteExpenseReceipt(expense.expenseId);
    expense.receiptUrl = null;
    if (viewingReceiptExpense.value?.expenseId === expense.expenseId) {
      viewingReceiptExpense.value = null;
    }
  } catch (error) {
    console.error('Failed to remove receipt:', error);
  }
};

// Category management
const openCategoryModal = () => {
  newCategory.value = { nameLo: '', nameEn: '' };
  showCategoryModal.value = true;
};

const addCategory = async () => {
  const lo = newCategory.value.nameLo.trim();
  const en = newCategory.value.nameEn.trim();
  if (!lo && !en) return;
  savingCategory.value = true;
  try {
    const created = await financeRepository.createExpenseCategory({
      nameLo: lo || en,
      nameEn: en || lo,
    });
    newCategory.value = { nameLo: '', nameEn: '' };
    showCategoryModal.value = false;
    await loadCategories();
    if (created?.categoryId) {
      form.value.categoryId = created.categoryId;
    }
  } catch (error) {
    console.error('Failed to add category:', error);
  } finally {
    savingCategory.value = false;
  }
};

const deleteCategory = async (cat: ExpenseCategory) => {
  if (!confirm(t('expenses.delete_category_confirm'))) return;
  try {
    await financeRepository.deleteExpenseCategory(cat.categoryId);
    await loadCategories();
  } catch (err: any) {
    alert(err?.data?.message || err.message || 'Cannot delete category');
  }
};

onMounted(async () => {
  await loadCategories();
  await loadExpenses();
});
</script>
