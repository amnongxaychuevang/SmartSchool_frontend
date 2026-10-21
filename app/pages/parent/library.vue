<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('parent_library.title')" :subtitle="$t('parent_library.subtitle')">
      <select v-if="parentStore.children.length > 1" v-model="selectedChildId" class="input-field w-auto" :aria-label="$t('parentPortal.select_child')" @change="loadChild">
        <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">{{ personName(child) }}</option>
      </select>
    </PageHeader>

    <p v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ loadError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="selectedChildId">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_library.borrowed_now') }}</p>
          <p class="mt-1 text-2xl font-bold tnum">{{ openLoans.length }}</p>
        </section>
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_library.overdue') }}</p>
          <p class="mt-1 text-2xl font-bold tnum" :class="overdueCount ? 'text-danger' : 'text-ink'">{{ overdueCount }}</p>
        </section>
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_library.total_borrowed') }}</p>
          <p class="mt-1 text-2xl font-bold tnum">{{ loans.length }}</p>
        </section>
      </div>

      <section class="panel overflow-hidden">
        <p v-if="!loans.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('parent_library.empty') }}</p>
        <ul v-else class="divide-y divide-line">
          <li v-for="loan in loans" :key="loan.loanId" class="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="font-semibold">{{ pick(loan.book.titleLo, loan.book.titleEn) }}</p>
              <p class="text-xs text-ink-muted">{{ loan.book.author }}</p>
            </div>
            <div class="text-right text-sm">
              <span :class="statusBadge(loan.status)">{{ statusText(loan.status) }}</span>
              <p class="mt-1 text-xs text-ink-muted tnum">
                <template v-if="loan.returnedDate">{{ $t('parent_library.returned_on', { date: fmt.date(loan.returnedDate) }) }}</template>
                <template v-else>{{ $t('parent_library.due_on', { date: fmt.date(loan.dueDate) }) }}<template v-if="loan.renewCount"> · {{ $t('library.renewed_times', { count: loan.renewCount }) }}</template></template>
              </p>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import { useParentStore } from '../../application/stores/parent';
import { parentRepository, type ChildLoan } from '../../infrastructure/api/ParentRepository';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const fmt = useFormat();
useHead({ title: () => `${t('parent_library.title')} — ${t('parentPortal.title')}` });

const parentStore = useParentStore();
const selectedChildId = ref<number | null>(null);
const loading = ref(true);
const loadError = ref('');

const personName = (p: { fullNameEn: string; fullNameLo: string }) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const loans = ref<ChildLoan[]>([]);
const openLoans = computed(() => loans.value.filter((l) => !l.returnedDate));
const overdueCount = computed(() => loans.value.filter((l) => l.status === 'overdue').length);
const statusBadge = (s: ChildLoan['status']) => ({ borrowed: 'badge-info', overdue: 'badge-danger', returned: 'badge-success', lost: 'badge-slate' }[s]);
const statusText = (s: ChildLoan['status']) => t(`parent_library.status_${s}`);

async function loadChild() {
  if (!selectedChildId.value) return;
  loadError.value = '';
  try {
    loans.value = await parentRepository.getChildLibrary(selectedChildId.value);
  } catch (err) {
    loadError.value = getErrorMessage(err);
  }
}

onMounted(async () => {
  try {
    await parentStore.fetchChildren();
    selectedChildId.value = parentStore.children[0]?.studentId ?? null;
    await loadChild();
  } catch (err) {
    loadError.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
});
</script>
