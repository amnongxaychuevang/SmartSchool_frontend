<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('parent_behavior.title')" :subtitle="$t('parent_behavior.subtitle')">
      <select v-if="parentStore.children.length > 1" v-model="selectedChildId" class="input-field w-auto" :aria-label="$t('parentPortal.select_child')" @change="loadChild">
        <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">{{ personName(child) }}</option>
      </select>
    </PageHeader>

    <p v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ loadError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="data">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('parent_behavior.score') }}</p>
          <p class="mt-1 text-3xl font-bold">{{ data.summary.finalScore }}<span class="text-base font-normal text-ink-muted">/100</span></p>
          <span class="mt-2 inline-block" :class="ratingBadge">{{ $t(`behavior.rating_${data.summary.rating}`) }}</span>
        </section>
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('behavior.merits') }}</p>
          <p class="mt-1 text-2xl font-bold text-success tnum">+{{ data.summary.totalMerits }}</p>
        </section>
        <section class="panel p-5">
          <p class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('behavior.demerits') }}</p>
          <p class="mt-1 text-2xl font-bold text-danger tnum">-{{ data.summary.totalDemerits }}</p>
        </section>
      </div>

      <section class="panel overflow-hidden">
        <h2 class="px-5 py-4 text-sm font-semibold border-b border-line">{{ $t('behavior.incident_timeline') }}</h2>
        <p v-if="!data.records.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('behavior.empty_timeline') }}</p>
        <ul v-else class="divide-y divide-line">
          <li v-for="rec in data.records" :key="rec.recordId" class="px-5 py-3.5 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span :class="rec.type === 'merit' ? 'badge-success' : 'badge-danger'">{{ rec.type === 'merit' ? $t('behavior.type_merit') : $t('behavior.type_demerit') }}</span>
                <p class="font-semibold">{{ pick(rec.titleLo, rec.titleEn) }}</p>
              </div>
              <p class="text-xs text-ink-muted mt-1">
                {{ fmt.date(rec.incidentDate) }}<template v-if="rec.category"> · {{ pick(rec.category.nameLo, rec.category.nameEn) }}</template>
              </p>
              <p v-if="rec.description" class="text-sm text-ink-muted mt-1">{{ rec.description }}</p>
              <p v-if="rec.actionTaken" class="text-sm mt-1">{{ $t('behavior.action_taken_label') }}: {{ rec.actionTaken }}</p>
            </div>
            <span class="shrink-0 text-lg font-bold tnum" :class="rec.type === 'merit' ? 'text-success' : 'text-danger'">
              {{ rec.type === 'merit' ? '+' : '-' }}{{ rec.points }}
            </span>
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
import { parentRepository, type ChildBehavior } from '../../infrastructure/api/ParentRepository';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const fmt = useFormat();
useHead({ title: () => `${t('parent_behavior.title')} — ${t('parentPortal.title')}` });

const parentStore = useParentStore();
const selectedChildId = ref<number | null>(null);
const loading = ref(true);
const loadError = ref('');

const personName = (p: { fullNameEn: string; fullNameLo: string }) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';
const data = ref<ChildBehavior | null>(null);
const ratingBadge = computed(() => ({
  excellent: 'badge-success', good: 'badge-teal', fair: 'badge-warning', needs_improvement: 'badge-danger',
}[data.value?.summary.rating ?? 'good']));

async function loadChild() {
  if (!selectedChildId.value) return;
  loadError.value = '';
  try {
    data.value = await parentRepository.getChildBehavior(selectedChildId.value);
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
