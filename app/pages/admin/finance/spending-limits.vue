<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-white">Student Spending Limits</h1>
      <div class="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search students..."
          class="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          @input="handleSearch"
        >
      </div>
    </div>

    <!-- We reuse the students list from adminStore for this page -->
    <div class="glass-panel overflow-hidden">
      <!-- Loading -->
      <LoadingSpinner v-if="adminStore.studentsLoading" />

      <div v-else-if="adminStore.students.length === 0" class="flex flex-col items-center justify-center py-20 text-slate-500">
        <p>No students found.</p>
      </div>

      <!-- Data Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Student Name</th>
            <th class="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Student Code</th>
            <th class="text-right text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="student in adminStore.students" :key="student.studentId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4">
              <p class="text-sm font-medium text-white">{{ student.fullNameEn }}</p>
            </td>
            <td class="px-6 py-4 text-sm text-slate-300">
              {{ student.studentCode }}
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button class="px-3 py-1.5 rounded-lg text-sm bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 transition-all font-semibold" @click="openLimitModal(student)">
                  Manage Limit
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Placeholder -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <span class="text-sm text-slate-500">Page {{ adminStore.studentsPage }} of {{ totalPages }}</span>
        <div class="flex items-center gap-2">
          <button :disabled="adminStore.studentsPage === 1" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(adminStore.studentsPage - 1)">Prev</button>
          <button :disabled="adminStore.studentsPage === totalPages" class="px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50" @click="changePage(adminStore.studentsPage + 1)">Next</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modal.open = false"/>
        <div class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white">Set Spending Limits</h2>
            <button class="text-slate-400 hover:text-white transition-colors" @click="modal.open = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="modal.error" class="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ modal.error }}</div>
          <LoadingSpinner v-if="modal.loading" padding="py-8" />

          <form v-else class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Limit (₭)</label>
              <input v-model.number="modal.form.dailyMax" type="number" class="modal-input" placeholder="Leave empty for no limit" >
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Limit (₭)</label>
              <input v-model.number="modal.form.weeklyMax" type="number" class="modal-input" placeholder="Leave empty for no limit" >
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
              <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" @click="modal.open = false">Cancel</button>
              <button
type="submit" :disabled="modal.saving"
                class="px-5 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white transition-colors disabled:opacity-60 flex items-center gap-2">
                <svg v-if="modal.saving" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Save Limits
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useAdminStore } from '../../../application/stores/admin';
import { financeRepository } from '../../../infrastructure/api/FinanceRepository';
import type { Student } from '../../../domain/models/Student';

definePageMeta({ layout: 'admin' });
useHead({ title: 'Spending Limits — Smart School Admin' });

const adminStore = useAdminStore();
const searchInput = ref('');
let searchTimeout: ReturnType<typeof setTimeout>;

const totalPages = computed(() => Math.ceil(adminStore.studentsTotal / 15));

onMounted(() => {
  adminStore.fetchStudents();
});

const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    adminStore.fetchStudents({ search: searchInput.value, page: 1 });
  }, 400);
};

const changePage = (page: number) => {
  adminStore.fetchStudents({ search: searchInput.value, page });
};

const modal = reactive({
  open: false,
  loading: false,
  saving: false,
  error: '',
  studentId: null as number | null,
  form: {
    dailyMax: null as number | null,
    weeklyMax: null as number | null
  }
});

const openLimitModal = async (student: Student) => {
  modal.studentId = student.studentId;
  modal.error = '';
  modal.open = true;
  modal.loading = true;
  try {
    const data = await financeRepository.getSpendingLimit(student.studentId);
    const limits = data?.spendingLimit;
    modal.form.dailyMax = limits?.dailyMax != null ? Number(limits.dailyMax) : null;
    modal.form.weeklyMax = limits?.weeklyMax != null ? Number(limits.weeklyMax) : null;
  } catch {
    // If not found, just leave empty
    modal.form.dailyMax = null;
    modal.form.weeklyMax = null;
  } finally {
    modal.loading = false;
  }
};

const handleSubmit = async () => {
  if (!modal.studentId) return;
  modal.saving = true;
  modal.error = '';
  try {
    await financeRepository.updateSpendingLimit(modal.studentId, {
      // null clears the limit (the API treats an empty value as "no limit").
      dailyMax: modal.form.dailyMax || null,
      weeklyMax: modal.form.weeklyMax || null
    });
    modal.open = false;
  } catch (err) {
    modal.error = (err instanceof Error && err.message) || 'Failed to update spending limits';
  } finally {
    modal.saving = false;
  }
};
</script>

<style scoped lang="postcss">
.modal-input {
  @apply w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
