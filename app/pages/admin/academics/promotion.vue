<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('promotion.title')" :subtitle="$t('promotion.subtitle')">
      <div class="flex items-center gap-2">
        <label for="from-year" class="sr-only">{{ $t('promotion.from_year') }}</label>
        <select id="from-year" v-model="fromYear" class="input-field w-auto tnum" @change="onFromYearChange">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <span class="text-ink-subtle" aria-hidden="true">→</span>
        <label for="to-year" class="sr-only">{{ $t('promotion.to_year') }}</label>
        <select id="to-year" v-model="toYear" class="input-field w-auto tnum" @change="load">
          <option v-for="y in toYearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </PageHeader>

    <p v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ loadError }}</p>
    <LoadingSpinner v-if="loading" />

    <template v-else-if="preview">
      <div v-if="!preview.toClasses.length" class="panel border-warning-line bg-warning-soft text-warning px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-3">
        <span>{{ $t('promotion.no_target_classes', { year: toYear }) }}</span>
        <NuxtLink to="/admin/classes/create" class="btn-secondary">{{ $t('promotion.create_classes') }}</NuxtLink>
      </div>

      <p class="rounded-lg border border-line bg-surface-2 px-4 py-3 text-sm text-ink-muted">{{ $t('promotion.how_it_works') }}</p>

      <p v-if="!preview.fromClasses.length" class="panel p-12 text-center text-sm text-ink-subtle">{{ $t('promotion.no_classes', { year: fromYear }) }}</p>

      <!-- One tab per class; a tick once every student has a choice -->
      <div v-if="preview.fromClasses.length" role="tablist" class="inline-flex self-start max-w-full overflow-x-auto p-0.5 gap-0.5 rounded-lg border border-line bg-surface-2">
        <button
          v-for="cls in preview.fromClasses"
          :id="`tab-class-${cls.classId}`"
          :key="cls.classId"
          type="button"
          role="tab"
          :aria-selected="activeId === cls.classId"
          :aria-controls="`panel-class-${cls.classId}`"
          :class="[
            'flex items-center gap-2 h-8 px-3 rounded-md text-sm font-semibold whitespace-nowrap transition-colors',
            activeId === cls.classId ? 'bg-surface text-primary-ink shadow-float' : 'text-ink-muted hover:text-ink',
          ]"
          @click="activeClassId = cls.classId"
        >
          {{ (locale === 'lo' ? cls.classNameLo : cls.classNameEn) || cls.classNameEn }}
          <svg v-if="cls.students.length && !undecided(cls)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" :aria-label="$t('promotion.all_decided')">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <section
        v-for="cls in shownClasses"
        :id="`panel-class-${cls.classId}`"
        :key="cls.classId"
        role="tabpanel"
        :aria-labelledby="`tab-class-${cls.classId}`"
        class="panel overflow-hidden"
      >
        <div class="px-5 py-4 border-b border-line flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-semibold">{{ className(cls) }}</h2>
            <p class="text-xs text-ink-subtle">
              {{ $t('promotion.student_count', { n: cls.students.length }) }}
              <template v-if="placedCount(cls)"> · {{ $t('promotion.already_done', { n: placedCount(cls) }) }}</template>
            </p>
          </div>
          <div v-if="openStudents(cls).length" class="flex items-center gap-2 text-sm">
            <label :for="`whole-${cls.classId}`" class="text-ink-muted">{{ $t('promotion.whole_class') }}</label>
            <div class="select-wrap">
              <select :id="`whole-${cls.classId}`" class="input-field select-fit" :value="classChoice[cls.classId] || ''" @change="onWholeClassChange(cls, $event)">
                <option value="">{{ $t('promotion.choose') }}</option>
                <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <button
                v-if="classChoice[cls.classId]"
                type="button"
                class="clear-btn"
                :title="$t('promotion.clear_class')"
                :aria-label="$t('promotion.clear_class')"
                @click="clearWholeClass(cls)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>

        <p v-if="!cls.students.length" class="py-8 text-center text-sm text-ink-subtle">{{ $t('promotion.empty_class') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="data-table w-full min-w-max">
            <!-- Compact rows: a class can hold 40+ students, each with a select. -->
            <thead>
              <tr>
                <th class="py-2 w-12 text-center">#</th>
                <th class="py-2">{{ $t('wallets_admin.col_code') }}</th>
                <th class="py-2">{{ $t('wallets_admin.col_student') }}</th>
                <th class="py-2 col-fit">{{ $t('promotion.next_year') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in cls.students" :key="s.studentId">
                <td class="py-1 text-sm text-center tnum text-ink-subtle">{{ i + 1 }}</td>
                <td class="py-1 text-sm tnum text-ink-muted whitespace-nowrap">{{ s.studentCode }}</td>
                <td class="py-1 text-sm font-semibold">{{ personName(s) }}</td>
                <td class="py-1 col-fit">
                  <span v-if="s.placedInClassId" class="badge-success">{{ $t('promotion.placed_in', { cls: targetName(s.placedInClassId) }) }}</span>
                  <div v-else class="select-wrap">
                    <select
                      v-model="choice[s.studentId]"
                      class="input-field select-fit select-compact"
                      :class="choice[s.studentId] === 'graduate' || choice[s.studentId] === 'transfer' ? 'text-warning' : ''"
                      :aria-label="$t('promotion.next_year')"
                    >
                      <option value="">{{ $t('promotion.choose') }}</option>
                      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                    <button
                      v-if="choice[s.studentId]"
                      type="button"
                      class="clear-btn"
                      :title="$t('promotion.clear')"
                      :aria-label="$t('promotion.clear')"
                      @click="choice[s.studentId] = ''"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Summary and apply -->
      <div v-if="preview.fromClasses.length" class="panel p-4 flex flex-wrap items-center justify-between gap-4 sticky bottom-4">
        <p class="text-sm text-ink-muted">
          {{ $t('promotion.summary', { move: summary.move, graduate: summary.graduate, transfer: summary.transfer, open: summary.open }) }}
        </p>
        <button type="button" class="btn-primary" :disabled="!moves.length || !canApply" :title="canApply ? undefined : $t('promotion.no_permission')" @click="confirmApply">
          {{ $t('promotion.apply', { n: moves.length }) }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PageHeader from '../../../components/PageHeader.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import { academicsRepository, type AcademicTerm } from '../../../infrastructure/api/AcademicsRepository';
import { promotionRepository, type PromotionPreview, type PromotionClass, type PromotionMove, type PromotionResult } from '../../../infrastructure/api/PromotionRepository';
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const dialog = useDialog();
useHead({ title: () => t('promotion.title') });

const authStore = useAuthStore();
// The server needs both: classes change and students' status changes.
const canApply = computed(() => hasPermission(authStore.permissions, 'academics.manage') && hasPermission(authStore.permissions, 'students.manage'));

const nextYear = (y: string) => `${Number(y.slice(0, 4)) + 1}-${Number(y.slice(5)) + 1}`;

const years = ref<string[]>([]);
const fromYear = ref('');
const toYear = ref('');
// The year after the source year, plus any later year that already has classes.
const toYearOptions = computed(() => {
  if (!fromYear.value) return [];
  return [...new Set([nextYear(fromYear.value), ...years.value.filter((y) => y > fromYear.value)])].sort();
});

const preview = ref<PromotionPreview | null>(null);
const loading = ref(true);
const loadError = ref('');
// Per student: "c:<classId>", "graduate", "transfer" or "" (not decided yet).
const choice = ref<Record<number, string>>({});
const classChoice = ref<Record<number, string>>({});

const personName = (p: { fullNameEn: string; fullNameLo: string }) => (locale.value === 'lo' ? p.fullNameLo : p.fullNameEn) || p.fullNameEn;
const className = (c: PromotionClass) => {
  const name = (locale.value === 'lo' ? c.classNameLo : c.classNameEn) || c.classNameEn;
  const grade = (locale.value === 'lo' ? c.gradeLevelLo : c.gradeLevelEn) || c.gradeLevelEn;
  return grade ? `${name} (${grade})` : name;
};
const targetName = (classId: number) => {
  const c = preview.value?.toClasses.find((x) => x.classId === classId);
  return c ? className(c) : `#${classId}`;
};

const options = computed(() => [
  ...(preview.value?.toClasses ?? []).map((c) => ({ value: `c:${c.classId}`, label: `${toYear.value} · ${className(c)}` })),
  { value: 'graduate', label: t('promotion.graduate') },
  { value: 'transfer', label: t('promotion.transfer') },
]);

type FromClass = PromotionPreview['fromClasses'][number];
const openStudents = (cls: FromClass) => cls.students.filter((s) => !s.placedInClassId);
const placedCount = (cls: FromClass) => cls.students.length - openStudents(cls).length;

// The class-level choice is copied to every student of the class; each row can still be changed after.
const activeClassId = ref<number | null>(null);
const activeClass = computed(() =>
  preview.value?.fromClasses.find((c) => c.classId === activeClassId.value) ?? preview.value?.fromClasses[0] ?? null,
);
const activeId = computed(() => (activeClass.value ? activeClass.value.classId : null));
// The tab panel shows the one selected class.
const shownClasses = computed(() => (activeClass.value ? [activeClass.value] : []));
const undecided = (cls: FromClass) => openStudents(cls).filter((s) => !choice.value[s.studentId]).length;

const clearWholeClass = (cls: FromClass) => {
  classChoice.value[cls.classId] = '';
  for (const s of openStudents(cls)) choice.value[s.studentId] = '';
};

const onWholeClassChange = (cls: FromClass, e: Event) => {
  const value = (e.target as HTMLSelectElement).value;
  classChoice.value[cls.classId] = value;
  for (const s of openStudents(cls)) choice.value[s.studentId] = value;
};

const moves = computed<PromotionMove[]>(() =>
  (preview.value?.fromClasses ?? []).flatMap((cls) => openStudents(cls).flatMap((s): PromotionMove[] => {
    const v = choice.value[s.studentId];
    if (v === 'graduate' || v === 'transfer') return [{ studentId: s.studentId, action: v }];
    if (v?.startsWith('c:')) return [{ studentId: s.studentId, action: 'move', toClassId: Number(v.slice(2)) }];
    return [];
  })),
);
const summary = computed(() => {
  const open = (preview.value?.fromClasses ?? []).reduce((n, cls) => n + openStudents(cls).length, 0);
  const count = (a: PromotionMove['action']) => moves.value.filter((m) => m.action === a).length;
  return { move: count('move'), graduate: count('graduate'), transfer: count('transfer'), open: open - moves.value.length };
});

async function load() {
  if (!fromYear.value || !toYear.value) return;
  loading.value = true;
  loadError.value = '';
  try {
    preview.value = await promotionRepository.preview(fromYear.value, toYear.value);
    classChoice.value = {};
    choice.value = Object.fromEntries(preview.value.fromClasses.flatMap((cls) => openStudents(cls).map((s) => [s.studentId, ''])));
  } catch (err) {
    loadError.value = getErrorMessage(err, t('common.error'));
  } finally {
    loading.value = false;
  }
}

const onFromYearChange = () => {
  toYear.value = nextYear(fromYear.value);
  load();
};

onMounted(async () => {
  try {
    const [classYears, terms] = await Promise.all([
      adminRepository.getClassAcademicYears(),
      academicsRepository.getTerms().catch(() => [] as AcademicTerm[]),
    ]);
    years.value = [...classYears].sort();
    // Promotion moves the current year's students on (the new year's classes may already exist).
    const activeYear = terms.find((term) => term.status === 'active')?.academicYear;
    fromYear.value = activeYear && years.value.includes(activeYear) ? activeYear : years.value[0] ?? '';
    toYear.value = fromYear.value ? nextYear(fromYear.value) : '';
    await load();
  } catch (err) {
    loadError.value = getErrorMessage(err, t('common.error'));
    loading.value = false;
  }
});

async function confirmApply() {
  const s = summary.value;
  let result: PromotionResult | null = null;
  const ok = await dialog.confirm({
    title: t('promotion.confirm_title', { from: fromYear.value, to: toYear.value }),
    message: t('promotion.confirm_msg', { move: s.move, graduate: s.graduate, transfer: s.transfer, open: s.open }),
    confirmLabel: t('promotion.apply', { n: moves.value.length }),
    tone: s.graduate || s.transfer ? 'danger' : 'primary',
    onConfirm: async () => {
      result = await promotionRepository.apply(fromYear.value, toYear.value, moves.value);
    },
  });
  if (!ok || !result) return;
  await load();
  // Shown after the confirm dialog has closed (one dialog at a time).
  dialog.success(t('promotion.done', { ...(result as PromotionResult) }));
}
</script>

<style scoped>
/* A row per student: a shorter select keeps 40+ rows readable. Scoped, so it beats .input-field's min-height. */
.select-compact {
  min-height: 0;
  height: 2rem;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 0.8125rem;
}
/* As wide as the longest option, not the whole column. The right padding leaves
   room for the clear button and the arrow, so the text never runs under them. */
.select-fit {
  width: auto;
  min-width: 10rem;
  padding-right: 3.25rem;
}
/* The choice column hugs its content; the name column takes the rest.
   1px, not 1%: with the table's min-width: max-content a percentage blows the table up. */
.col-fit {
  width: 1px;
  white-space: nowrap;
}
/* The clear button sits inside the field, just left of the arrow, and shows
   while the pointer is over the field (or the field has keyboard focus). */
.select-wrap {
  position: relative;
  display: inline-flex;
}
.clear-btn {
  position: absolute;
  top: 50%;
  right: 1.75rem;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  color: rgb(var(--ink-subtle));
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s;
}
.select-wrap:hover .clear-btn,
.select-wrap:focus-within .clear-btn {
  opacity: 1;
  pointer-events: auto;
}
.clear-btn:hover {
  color: rgb(var(--danger));
  background-color: rgb(var(--danger-soft));
}
</style>
