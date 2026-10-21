<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('assignments.title')" :subtitle="$t('assignments.parent_subtitle')">
      <select v-if="parentStore.children.length > 1" v-model="selectedChildId" class="input-field w-auto" :aria-label="$t('parentPortal.select_child')" @change="loadChild">
        <option v-for="child in parentStore.children" :key="child.studentId" :value="child.studentId">{{ personName(child) }}</option>
      </select>
    </PageHeader>

    <p v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ loadError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="selectedChildId">
      <p v-if="!assignments.length" class="panel p-12 text-center text-sm text-ink-subtle">{{ $t('assignments.empty') }}</p>
      <template v-for="group in groups" :key="group.id">
        <section v-if="group.items.length" class="panel overflow-hidden">
          <h2 class="px-5 py-4 text-sm font-semibold border-b border-line">{{ group.label }}</h2>
          <ul class="divide-y divide-line">
            <li v-for="a in group.items" :key="a.assignmentId" class="px-5 py-3.5 flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="font-semibold">{{ a.title }}</p>
                <p class="text-xs text-ink-muted">
                  {{ a.subject ? pick(a.subject.subjectNameLo, a.subject.subjectNameEn) : $t('assignments.no_subject') }}
                  <template v-if="a.creator"> · {{ pick(a.creator.fullNameLo, a.creator.fullNameEn) }}</template>
                </p>
                <p v-if="a.description" class="text-sm text-ink-muted mt-1 whitespace-pre-line">{{ a.description }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-semibold tnum">{{ fmt.date(a.dueDate) }}</p>
                <p class="text-xs" :class="group.id === 'upcoming' && daysLeft(a.dueDate) <= 1 ? 'text-danger font-semibold' : 'text-ink-muted'">{{ dueLabel(a.dueDate) }}</p>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import LoadingSpinner from '../../components/LoadingSpinner.vue';
import { useParentStore } from '../../application/stores/parent';
import { parentRepository, type ChildAssignment } from '../../infrastructure/api/ParentRepository';

definePageMeta({ layout: 'parent' });

const { t, locale } = useI18n();
const fmt = useFormat();
useHead({ title: () => `${t('assignments.title')} — ${t('parentPortal.title')}` });

const parentStore = useParentStore();
const selectedChildId = ref<number | null>(null);
const assignments = ref<ChildAssignment[]>([]);
const loading = ref(true);
const loadError = ref('');

const personName = (p: { fullNameEn: string; fullNameLo: string }) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) || '';

const daysLeft = (due: string) => {
  const d = new Date(due.slice(0, 10) + 'T00:00:00');
  return Math.round((d.getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
};
const dueLabel = (due: string) => {
  const n = daysLeft(due);
  if (n < 0) return t('assignments.overdue_by', { count: -n });
  if (n === 0) return t('assignments.due_today');
  return t('assignments.due_in', { count: n });
};
const groups = computed(() => [
  { id: 'upcoming', label: t('assignments.tab_upcoming'), items: assignments.value.filter((a) => daysLeft(a.dueDate) >= 0) },
  { id: 'past', label: t('assignments.tab_past'), items: assignments.value.filter((a) => daysLeft(a.dueDate) < 0) },
]);

async function loadChild() {
  if (!selectedChildId.value) return;
  loadError.value = '';
  try {
    assignments.value = await parentRepository.getChildAssignments(selectedChildId.value);
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
