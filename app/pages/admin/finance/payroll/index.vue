<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('payroll.title')" :subtitle="$t('payroll.subtitle')">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="btn-primary flex items-center gap-2"
          @click="openGenerateModal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ $t('payroll.generate_period') }}</span>
        </button>
      </div>
    </PageHeader>

    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.periods') }}</p>
          <p class="text-2xl font-bold text-ink mt-0.5 tnum">{{ totalPeriods }}</p>
        </div>
      </div>

      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.total_net') }}</p>
          <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tnum">{{ f.kip(sumNetPayout) }}</p>
        </div>
      </div>

      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.teachers_count') }}</p>
          <p class="text-2xl font-bold text-ink mt-0.5 tnum">{{ latestTeacherCount }}</p>
        </div>
      </div>

      <div class="panel p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-500 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-ink-muted uppercase tracking-wider font-semibold">{{ $t('payroll.status_paid') }}</p>
          <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 tnum">{{ paidPeriodsCount }}</p>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <section class="panel overflow-hidden">
      <LoadingSpinner v-if="loading && !periods.length" />
      <div v-else-if="!periods.length" class="py-16 text-center text-sm text-ink-subtle">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-ink-subtle/50 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
        <p class="font-medium text-base text-ink mb-1">{{ $t('payroll.no_periods') }}</p>
        <p class="text-xs text-ink-muted">{{ $t('payroll.generate_desc') }}</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('payroll.period_month') }}</th>
              <th>{{ $t('payroll.status') }}</th>
              <th class="text-center">{{ $t('payroll.teachers_count') }}</th>
              <th class="text-right">{{ $t('payroll.total_gross') }}</th>
              <th class="text-right">{{ $t('payroll.total_deductions') }}</th>
              <th class="text-right">{{ $t('payroll.total_net') }}</th>
              <th>{{ $t('payroll.notes') }}</th>
              <th class="text-right">{{ $t('payroll.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in periods" :key="p.periodId">
              <td class="text-center tnum text-ink-subtle">{{ (page - 1) * limit + i + 1 }}</td>
              <td class="font-bold text-brand-600 dark:text-brand-400">
                <NuxtLink :to="`/admin/finance/payroll/${p.periodId}`" class="hover:underline flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ formatMonthDisplay(p.periodMonth) }}</span>
                </NuxtLink>
              </td>
              <td>
                <span
                  :class="[
                    'px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider',
                    p.status === 'paid' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                    p.status === 'approved' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                  ]"
                >
                  {{ $t(`payroll.status_${p.status}`) }}
                </span>
              </td>
              <td class="text-center tnum font-medium">{{ p.totalTeachers }}</td>
              <td class="text-right tnum">{{ f.kip(p.totalGross) }}</td>
              <td class="text-right tnum text-red-500 dark:text-red-400">-{{ f.kip(p.totalDeductions) }}</td>
              <td class="text-right tnum font-bold text-emerald-600 dark:text-emerald-400">{{ f.kip(p.totalNet) }}</td>
              <td class="text-xs text-ink-muted max-w-xs truncate">{{ p.notes || '—' }}</td>
              <td class="text-right">
                <div class="inline-flex items-center gap-1.5">
                  <NuxtLink
                    :to="`/admin/finance/payroll/${p.periodId}`"
                    class="btn-secondary !py-1 !px-2.5 text-xs inline-flex items-center gap-1"
                    :title="$t('payroll.view_details')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{{ $t('payroll.view_details') }}</span>
                  </NuxtLink>

                  <button
                    type="button"
                    class="btn-secondary !py-1 !px-2 text-xs text-emerald-600 dark:text-emerald-400"
                    :title="$t('payroll.export_bcel')"
                    @click="downloadExcel(p.periodId)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>

                  <button
                    v-if="p.status === 'draft'"
                    type="button"
                    class="btn-secondary !py-1 !px-2 text-xs text-red-500 hover:text-red-700"
                    :title="$t('payroll.delete_period')"
                    @click="confirmDelete(p.periodId)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Generate Period Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div class="panel max-w-md w-full p-6 shadow-2xl relative">
        <div class="flex items-center justify-between pb-4 border-b border-line mb-4">
          <h3 class="font-bold text-lg text-ink">{{ $t('payroll.generate_period') }}</h3>
          <button type="button" class="text-ink-subtle hover:text-ink" @click="showModal = false">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-xs text-ink-muted mb-4">{{ $t('payroll.generate_desc') }}</p>

        <form class="flex flex-col gap-4" @submit.prevent="handleGenerate">
          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase mb-1.5">{{ $t('payroll.select_month') }}</label>
            <input
              v-model="newMonth"
              type="month"
              required
              class="input-field w-full"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase mb-1.5">{{ $t('payroll.notes') }}</label>
            <textarea
              v-model="newNotes"
              rows="3"
              class="input-field w-full text-sm"
              :placeholder="$t('payroll.notes_placeholder')"
            />
          </div>

          <div v-if="genError" class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500">
            {{ genError }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
            <button type="button" class="btn-secondary" @click="showModal = false">
              {{ $t('payroll.cancel') }}
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              <span v-if="submitting">{{ $t('common.processing') }}</span>
              <span v-else>{{ $t('payroll.generate_period') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { payrollRepository } from '../../../../infrastructure/api/PayrollRepository';
import type { PayrollPeriod } from '../../../../domain/models/Payroll';
import { useFormat } from '../../../../composables/useFormat';
import PageHeader from '../../../../components/PageHeader.vue';
import LoadingSpinner from '../../../../components/LoadingSpinner.vue';

definePageMeta({
  layout: 'admin',
  permission: 'finance.view',
});

const { t, locale } = useI18n();
const router = useRouter();
const f = useFormat();

const loading = ref(false);
const periods = ref<PayrollPeriod[]>([]);
const totalPeriods = ref(0);
const page = ref(1);
const limit = ref(20);

// Modal state
const showModal = ref(false);
const submitting = ref(false);
const genError = ref('');
const newMonth = ref('');
const newNotes = ref('');

const sumNetPayout = computed(() => {
  return periods.value.reduce((sum, p) => sum + Number(p.totalNet || 0), 0);
});

const latestTeacherCount = computed(() => {
  return periods.value[0]?.totalTeachers || 0;
});

const paidPeriodsCount = computed(() => {
  return periods.value.filter(p => p.status === 'paid').length;
});

const formatMonthDisplay = (ym: string) => {
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

const loadPeriods = async () => {
  loading.value = true;
  try {
    const res = await payrollRepository.listPeriods({ page: page.value, limit: limit.value });
    if (res?.success) {
      periods.value = res.data.periods;
      totalPeriods.value = res.data.total;
    }
  } catch (error) {
    console.error('Failed to load payroll periods:', error);
  } finally {
    loading.value = false;
  }
};

const openGenerateModal = () => {
  // Default to current month YYYY-MM
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  newMonth.value = `${y}-${m}`;
  newNotes.value = '';
  genError.value = '';
  showModal.value = true;
};

const handleGenerate = async () => {
  if (!newMonth.value) return;
  submitting.value = true;
  genError.value = '';
  try {
    const res = await payrollRepository.generatePeriod(newMonth.value, newNotes.value);
    if (res?.success) {
      showModal.value = false;
      await loadPeriods();
      // Redirect to the newly generated period detail
      router.push(`/admin/finance/payroll/${res.data.period.periodId}`);
    }
  } catch (err: any) {
    genError.value = err?.data?.message || err.message || 'Failed to generate payroll';
  } finally {
    submitting.value = false;
  }
};

const downloadExcel = async (periodId: number) => {
  try {
    await payrollRepository.downloadExport(periodId, locale.value === 'lo' ? 'lo' : 'en');
  } catch (error) {
    console.error('Failed to download excel:', error);
  }
};

const confirmDelete = async (periodId: number) => {
  if (!confirm(t('payroll.delete_confirm'))) return;
  try {
    await payrollRepository.deletePeriod(periodId);
    await loadPeriods();
  } catch (error) {
    console.error('Failed to delete period:', error);
  }
};

onMounted(() => {
  loadPeriods();
});
</script>
