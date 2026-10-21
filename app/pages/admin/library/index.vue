<template>
  <div class="flex flex-col gap-6">
    <PageHeader
      :title="$t('library.title')"
      :subtitle="$t('library.subtitle')"
    >
      <div class="flex items-center gap-3">
        <button type="button" class="btn-primary flex items-center gap-2" @click="activeTab = 'terminal'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>{{ $t('library.borrow_terminal') }}</span>
        </button>
      </div>
    </PageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('library.total_titles') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ overview.totalTitles }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('library.total_copies') }}</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ overview.totalCopies }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('library.active_loans') }}</p>
          <p class="text-2xl font-bold text-emerald-500">{{ overview.activeLoans }}</p>
        </div>
      </div>

      <div class="panel p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted">{{ $t('library.overdue_loans') }}</p>
          <p class="text-2xl font-bold text-rose-500">{{ overview.overdueLoans }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-6">
      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'terminal' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
        @click="activeTab = 'terminal'"
      >
        {{ $t('library.tab_terminal') }}
      </button>
      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'books' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
        @click="activeTab = 'books'"
      >
        {{ $t('library.tab_catalog') }}
      </button>
      <button
        type="button"
        class="pb-3 text-sm font-semibold transition-colors border-b-2"
        :class="activeTab === 'loans' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'"
        @click="activeTab = 'loans'"
      >
        {{ $t('library.tab_loans') }}
      </button>
    </div>

    <!-- TAB 1: SMART CARD BORROW TERMINAL -->
    <section v-if="activeTab === 'terminal'" class="panel p-6 flex flex-col gap-6 max-w-4xl">
      <div class="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 class="font-bold text-lg text-slate-800 dark:text-white">{{ $t('library.terminal_title') }}</h3>
        <p class="text-xs text-ink-muted">{{ $t('library.terminal_subtitle') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Borrower Identification -->
        <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-teal-500 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h4 class="font-bold text-sm">{{ $t('library.step_borrower') }}</h4>
          </div>

          <div>
            <label class="block mb-1 text-xs font-semibold">{{ $t('library.step_borrower_card') }}</label>
            <input
              v-model.trim="borrowForm.cardUid"
              type="text"
              class="input-field"
              :placeholder="$t('library.card_ph')"
            />
          </div>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span class="flex-shrink mx-2 text-[11px] text-ink-muted uppercase">{{ $t('library.or_manual_student') }}</span>
            <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          <div>
            <label class="block mb-1 text-xs font-semibold">{{ $t('transport.col_student') }}</label>
            <StudentPicker v-model="borrowForm.studentId" input-id="borrow-student" />
          </div>
        </div>

        <!-- Book Selection -->
        <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-teal-500 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h4 class="font-bold text-sm">{{ $t('library.step_book') }}</h4>
          </div>

          <div>
            <label class="block mb-1 text-xs font-semibold">{{ $t('library.select_book') }} *</label>
            <select v-model="borrowForm.bookId" class="input-field" required>
              <option :value="undefined">{{ $t('library.select_book_ph') }}</option>
              <option v-for="b in books" :key="b.bookId" :value="b.bookId" :disabled="b.availableCopies <= 0">
                {{ locale === 'lo' ? b.titleLo : (b.titleEn || b.titleLo) }} [{{ b.isbn || 'No ISBN' }}] ({{ $t('library.remaining_copies', { count: b.availableCopies }) }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block mb-1 text-xs font-semibold">{{ $t('library.loan_duration') }}</label>
              <input v-model.number="borrowForm.days" type="number" min="1" max="60" class="input-field" />
            </div>
            <div>
              <label class="block mb-1 text-xs font-semibold">{{ $t('library.notes') }}</label>
              <input v-model.trim="borrowForm.notes" type="text" class="input-field" :placeholder="$t('library.notes_ph')" />
            </div>
          </div>

          <div v-if="borrowFeedback" class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-semibold">
            {{ borrowFeedback }}
          </div>

          <button
            type="button"
            class="btn-primary mt-auto py-2.5 flex items-center justify-center gap-2"
            :disabled="borrowing || (!borrowForm.studentId && !borrowForm.cardUid) || !borrowForm.bookId"
            @click="submitBorrow"
          >
            <span>{{ borrowing ? $t('common.loading') : $t('library.confirm_borrow') }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- TAB 2: BOOK CATALOG -->
    <section v-if="activeTab === 'books'" class="panel overflow-hidden">
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <input
          v-model="bookSearch"
          type="text"
          class="input-field max-w-sm"
          :placeholder="$t('library.search_books_ph')"
          @input="fetchBooks"
        />
        <div class="flex items-center gap-2">
          <button type="button" class="btn-secondary text-xs" @click="categoryModalOpen = true">
            {{ $t('library.manage_categories') }}
          </button>
          <button type="button" class="btn-primary text-xs" @click="openBookModal()">
            + {{ $t('library.add_book') }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th>{{ $t('library.col_isbn') }}</th>
              <th>{{ $t('library.col_title') }}</th>
              <th>{{ $t('library.col_category') }}</th>
              <th>{{ $t('library.col_author') }}</th>
              <th>{{ $t('library.col_shelf') }}</th>
              <th>{{ $t('library.col_total') }}</th>
              <th>{{ $t('library.col_available') }}</th>
              <th class="text-right">{{ $t('library.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!books.length">
              <td colspan="8" class="text-center py-10 text-ink-muted">{{ $t('library.empty_books') }}</td>
            </tr>
            <tr v-for="b in books" :key="b.bookId">
              <td class="font-mono text-xs text-ink-muted">{{ b.isbn || '—' }}</td>
              <td>
                <p class="font-bold text-sm text-slate-800 dark:text-white">
                  {{ locale === 'lo' ? b.titleLo : (b.titleEn || b.titleLo) }}
                </p>
                <p class="text-xs text-ink-muted">
                  {{ locale === 'lo' ? b.titleEn : b.titleLo }}
                </p>
              </td>
              <td class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {{ (locale === 'lo' ? b.category?.nameLo : b.category?.nameEn) || b.category?.nameLo || '—' }}
              </td>
              <td class="text-xs text-ink-muted">{{ b.author }}</td>
              <td class="text-xs font-mono font-semibold text-teal-500">{{ b.shelfLocation || '—' }}</td>
              <td class="text-xs font-bold">{{ b.totalCopies }}</td>
              <td>
                <span
                  class="badge text-xs px-2 py-0.5 rounded font-bold"
                  :class="b.availableCopies > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'"
                >
                  {{ b.availableCopies }} {{ $t('library.copies_unit') }}
                </span>
              </td>
              <td class="text-right whitespace-nowrap">
                <button type="button" class="btn-secondary text-xs px-2.5 py-1 mr-2" @click="openBookModal(b)">
                  {{ $t('common.edit') }}
                </button>
                <button type="button" class="btn-danger text-xs px-2.5 py-1" @click="deleteBook(b.bookId)">
                  {{ $t('common.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- TAB 3: LOAN RECORDS -->
    <section v-if="activeTab === 'loans'" class="panel overflow-hidden">
      <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3">
          <select v-model="loanStatusFilter" class="input-field w-auto text-xs" @change="fetchLoans">
            <option value="">{{ $t('library.all_status') }}</option>
            <option value="borrowed">{{ $t('library.borrowed_status') }}</option>
            <option value="overdue">{{ $t('library.overdue_status') }}</option>
            <option value="returned">{{ $t('library.returned_status') }}</option>
          </select>
        </div>
        <button type="button" class="btn-secondary text-xs" @click="fetchLoans">{{ $t('transport.refresh') }}</button>
      </div>

      <div class="overflow-x-auto">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th>{{ $t('library.col_student') }}</th>
              <th>{{ $t('library.col_title') }}</th>
              <th>{{ $t('library.col_borrowed_date') }}</th>
              <th>{{ $t('library.col_due_date') }}</th>
              <th>{{ $t('library.col_status') }}</th>
              <th class="text-right">{{ $t('library.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loans.length">
              <td colspan="6" class="text-center py-10 text-ink-muted">{{ $t('library.empty_loans') }}</td>
            </tr>
            <tr v-for="l in loans" :key="l.loanId">
              <td>
                <p class="font-semibold text-sm text-slate-800 dark:text-white">
                  {{ locale === 'lo' ? l.student.fullNameLo : (l.student.fullNameEn || l.student.fullNameLo) }}
                </p>
                <p class="text-xs text-ink-muted font-mono">{{ l.student.studentCode }}</p>
              </td>
              <td>
                <p class="font-bold text-sm text-slate-800 dark:text-white">
                  {{ locale === 'lo' ? l.book.titleLo : (l.book.titleEn || l.book.titleLo) }}
                </p>
                <p class="text-xs text-ink-muted font-mono">{{ l.book.isbn || '' }}</p>
              </td>
              <td class="text-xs text-ink-muted">{{ formatDate(l.borrowedDate) }}</td>
              <td class="text-xs font-semibold" :class="l.isOverdue ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-300'">
                {{ formatDate(l.dueDate) }}
                <span v-if="l.renewCount" class="block text-[11px] font-normal text-ink-subtle">{{ $t('library.renewed_times', { count: l.renewCount }) }}</span>
              </td>
              <td>
                <span
                  class="badge text-xs px-2 py-0.5 rounded font-bold"
                  :class="loanStatusBadgeClass(l)"
                >
                  {{ loanStatusLabel(l) }}
                </span>
              </td>
              <td class="text-right whitespace-nowrap">
                <button
                  v-if="!l.returnedDate && l.status !== 'lost' && (l.renewCount ?? 0) < MAX_RENEWALS"
                  type="button"
                  class="btn-secondary text-xs px-3 py-1 mr-2"
                  @click="renewLoan(l)"
                >
                  {{ $t('library.renew') }}
                </button>
                <button
                  v-if="!l.returnedDate && l.status !== 'lost'"
                  type="button"
                  class="btn-primary text-xs px-3 py-1"
                  @click="returnBook(l.loanId)"
                >
                  {{ $t('library.return_book') }}
                </button>
                <span v-else class="text-xs text-ink-muted">{{ $t('library.returned_status') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal: Add Book -->
    <!-- Modal: Manage categories -->
    <AppModal :open="categoryModalOpen" :title="$t('library.manage_categories')" @update:open="categoryModalOpen = $event">
      <div class="flex flex-col gap-4">
        <ul v-if="categories.length" class="flex flex-col divide-y divide-line border border-line rounded-lg">
          <li v-for="c in categories" :key="c.categoryId" class="flex items-center gap-3 px-3 py-2">
            <template v-if="editingCategoryId === c.categoryId">
              <input v-model.trim="categoryEdit.nameLo" type="text" class="input-field flex-1" :aria-label="$t('library.category_name_lo')" />
              <input v-model.trim="categoryEdit.nameEn" type="text" class="input-field flex-1" :aria-label="$t('library.category_name_en')" />
              <button type="button" class="btn-primary text-xs px-2.5 py-1" :disabled="!categoryEdit.nameLo || !categoryEdit.nameEn" @click="saveCategory(c.categoryId)">{{ $t('common.save') }}</button>
              <button type="button" class="btn-secondary text-xs px-2.5 py-1" @click="editingCategoryId = null">{{ $t('common.cancel') }}</button>
            </template>
            <template v-else>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold truncate">{{ locale === 'lo' ? c.nameLo : c.nameEn }}</p>
                <p class="text-xs text-ink-muted truncate">{{ locale === 'lo' ? c.nameEn : c.nameLo }} · {{ $t('library.category_books', { count: c._count?.books ?? 0 }) }}</p>
              </div>
              <button type="button" class="btn-secondary text-xs px-2.5 py-1" @click="startEditCategory(c)">{{ $t('common.edit') }}</button>
              <button type="button" class="btn-danger text-xs px-2.5 py-1" @click="deleteCategory(c)">{{ $t('common.delete') }}</button>
            </template>
          </li>
        </ul>
        <p v-else class="text-sm text-ink-muted text-center py-4">{{ $t('library.no_categories') }}</p>

        <form class="flex flex-col sm:flex-row gap-2 pt-4 border-t border-line" @submit.prevent="addCategory">
          <input v-model.trim="categoryNew.nameLo" type="text" class="input-field flex-1" required :placeholder="$t('library.category_name_lo')" />
          <input v-model.trim="categoryNew.nameEn" type="text" class="input-field flex-1" required :placeholder="$t('library.category_name_en')" />
          <button type="submit" class="btn-primary shrink-0">+ {{ $t('library.add_category') }}</button>
        </form>
      </div>
    </AppModal>

    <AppModal :open="bookModalOpen" :title="editingBookId ? $t('library.modal_edit_book') : $t('library.modal_add_book')" @update:open="bookModalOpen = $event">
      <form class="flex flex-col gap-4" @submit.prevent="submitBook">
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('library.col_isbn') }}</label>
          <input v-model.trim="bookForm.isbn" type="text" class="input-field" :placeholder="$t('library.isbn_ph')" />
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('library.title_lo') }} *</label>
          <input v-model.trim="bookForm.titleLo" type="text" class="input-field" required />
        </div>
        <div>
          <label class="block mb-1.5 text-sm font-semibold">{{ $t('library.title_en') }} *</label>
          <input v-model.trim="bookForm.titleEn" type="text" class="input-field" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('library.author_label') }} *</label>
            <input v-model.trim="bookForm.author" type="text" class="input-field" required />
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('library.col_category') }}</label>
            <select v-model="bookForm.categoryId" class="input-field">
              <option :value="undefined">{{ $t('library.select_category') }}</option>
              <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">
                {{ locale === 'lo' ? c.nameLo : (c.nameEn || c.nameLo) }}
              </option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('library.shelf_label') }}</label>
            <input v-model.trim="bookForm.shelfLocation" type="text" class="input-field" :placeholder="$t('library.shelf_ph')" />
          </div>
          <div>
            <label class="block mb-1.5 text-sm font-semibold">{{ $t('library.total_copies_label') }} *</label>
            <input v-model.number="bookForm.totalCopies" type="number" min="1" max="1000" class="input-field" required />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" class="btn-secondary" @click="bookModalOpen = false">{{ $t('common.cancel') }}</button>
          <button type="submit" class="btn-primary">{{ $t('common.save') }}</button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import PageHeader from '../../../components/PageHeader.vue';
import AppModal from '../../../components/AppModal.vue';
import StudentPicker from '../../../components/StudentPicker.vue';
import { useApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../infrastructure/api/endpoints';

definePageMeta({ layout: 'admin' });

const { locale, t } = useI18n();
const dialog = useDialog();
const apiClient = useApiClient();

const activeTab = ref<'terminal' | 'books' | 'loans'>('terminal');

const overview = ref({
  totalTitles: 0,
  totalCopies: 0,
  activeLoans: 0,
  overdueLoans: 0,
});

const books = ref<any[]>([]);
const categories = ref<any[]>([]);
const loans = ref<any[]>([]);

const bookSearch = ref('');
const loanStatusFilter = ref('');

const bookModalOpen = ref(false);
const borrowing = ref(false);
const borrowFeedback = ref('');

const borrowForm = reactive({
  cardUid: '',
  studentId: null as number | null,
  bookId: undefined as number | undefined,
  days: 14,
  notes: '',
});

const bookForm = reactive({
  isbn: '',
  titleLo: '',
  titleEn: '',
  author: '',
  categoryId: undefined as number | undefined,
  shelfLocation: '',
  totalCopies: 1,
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const loanStatusLabel = (loan: any) => {
  if (loan.status === 'returned') return t('library.returned_status');
  if (loan.isOverdue) return t('library.overdue_status');
  return t('library.borrowed_status');
};

const loanStatusBadgeClass = (loan: any) => {
  if (loan.status === 'returned') return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  if (loan.isOverdue) return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
  return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
};

const fetchOverview = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.library.overview, { method: 'GET' });
    if (res?.data) overview.value = res.data;
    else if (res) overview.value = res;
  } catch (err) {
    console.error('Error fetching library overview:', err);
  }
};

const fetchCategories = async () => {
  try {
    const res = await apiClient<any>(API_ENDPOINTS.library.categories, { method: 'GET' });
    const list = res?.data?.categories || res?.categories;
    if (list) categories.value = list;
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

const fetchBooks = async () => {
  try {
    const query: any = {};
    if (bookSearch.value) query.search = bookSearch.value;
    const res = await apiClient<any>(API_ENDPOINTS.library.books, { method: 'GET', query });
    const list = res?.data?.books || res?.books;
    if (list) books.value = list;
  } catch (err) {
    console.error('Error fetching books:', err);
  }
};

const fetchLoans = async () => {
  try {
    const query: any = {};
    if (loanStatusFilter.value) query.status = loanStatusFilter.value;
    const res = await apiClient<any>(API_ENDPOINTS.library.loans, { method: 'GET', query });
    const list = res?.data?.loans || res?.loans;
    if (list) loans.value = list;
  } catch (err) {
    console.error('Error fetching loans:', err);
  }
};

const submitBorrow = async () => {
  borrowing.value = true;
  borrowFeedback.value = '';
  try {
    const res = await apiClient<any>(API_ENDPOINTS.library.borrow, { method: 'POST', body: borrowForm });
    const loan = res?.data?.loan || res?.loan;
    const dueDateStr = loan?.dueDate ? formatDate(loan.dueDate) : '';
    borrowFeedback.value = `✓ ${t('library.borrow_success', { date: dueDateStr })}`;
    borrowForm.cardUid = '';
    borrowForm.studentId = null;
    borrowForm.bookId = undefined;
    await fetchOverview();
    await fetchBooks();
    await fetchLoans();
  } catch (err: any) {
    borrowFeedback.value = `❌ ${err?.data?.message || err?.message}`;
  } finally {
    borrowing.value = false;
  }
};

// Mirrors the server's limit (LibraryRepository.MAX_RENEWALS); the server is the one that enforces it.
const MAX_RENEWALS = 2;
const renewLoan = (loan: any) => {
  dialog.confirm({
    message: t('library.confirm_renew', { days: 14 }),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.library.loans}/${loan.loanId}/renew`, { method: 'POST', body: { days: 14 } });
      await Promise.all([fetchOverview(), fetchLoans()]);
    },
  });
};

const returnBook = (loanId: number) => {
  dialog.confirm({
    message: t('library.confirm_return'),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.library.loans}/${loanId}/return`, { method: 'POST', body: {} });
      await Promise.all([fetchOverview(), fetchBooks(), fetchLoans()]);
    },
  });
};

// The same modal adds a book or, given one, edits it.
const editingBookId = ref<number | null>(null);
const openBookModal = (b?: any) => {
  editingBookId.value = b?.bookId ?? null;
  bookForm.isbn = b?.isbn ?? '';
  bookForm.titleLo = b?.titleLo ?? '';
  bookForm.titleEn = b?.titleEn ?? '';
  bookForm.author = b?.author ?? '';
  bookForm.categoryId = b ? (b.categoryId ?? undefined) : categories.value[0]?.categoryId;
  bookForm.shelfLocation = b?.shelfLocation ?? '';
  bookForm.totalCopies = b?.totalCopies ?? 1;
  bookModalOpen.value = true;
};

const submitBook = async () => {
  try {
    if (editingBookId.value) {
      await apiClient(`${API_ENDPOINTS.library.books}/${editingBookId.value}`, { method: 'PUT', body: bookForm });
    } else {
      await apiClient(API_ENDPOINTS.library.books, { method: 'POST', body: bookForm });
    }
    bookModalOpen.value = false;
    await Promise.all([fetchOverview(), fetchBooks()]);
  } catch (err) {
    dialog.error(getErrorMessage(err));
  }
};

const deleteBook = (id: number) => {
  dialog.confirm({
    message: t('library.confirm_delete_book'),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.library.books}/${id}`, { method: 'DELETE' });
      await Promise.all([fetchOverview(), fetchBooks()]);
    },
  });
};

// ── Categories ──
const categoryModalOpen = ref(false);
const categoryNew = reactive({ nameLo: '', nameEn: '' });
const categoryEdit = reactive({ nameLo: '', nameEn: '' });
const editingCategoryId = ref<number | null>(null);

const addCategory = async () => {
  try {
    await apiClient(API_ENDPOINTS.library.categories, { method: 'POST', body: { ...categoryNew } });
    categoryNew.nameLo = '';
    categoryNew.nameEn = '';
    await fetchCategories();
  } catch (err) {
    dialog.error(getErrorMessage(err));
  }
};

const startEditCategory = (c: any) => {
  editingCategoryId.value = c.categoryId;
  categoryEdit.nameLo = c.nameLo;
  categoryEdit.nameEn = c.nameEn;
};

const saveCategory = async (id: number) => {
  try {
    await apiClient(`${API_ENDPOINTS.library.categories}/${id}`, { method: 'PUT', body: { ...categoryEdit } });
    editingCategoryId.value = null;
    await Promise.all([fetchCategories(), fetchBooks()]);
  } catch (err) {
    dialog.error(getErrorMessage(err));
  }
};

const deleteCategory = (c: any) => {
  dialog.confirm({
    message: t('library.confirm_delete_category', { name: locale.value === 'lo' ? c.nameLo : c.nameEn }),
    tone: 'danger',
    confirmLabel: t('common.delete'),
    onConfirm: async () => {
      await apiClient(`${API_ENDPOINTS.library.categories}/${c.categoryId}`, { method: 'DELETE' });
      await Promise.all([fetchCategories(), fetchBooks()]);
    },
  });
};

onMounted(() => {
  fetchOverview();
  fetchCategories();
  fetchBooks();
  fetchLoans();
});
</script>
