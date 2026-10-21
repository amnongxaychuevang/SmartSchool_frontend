<template>
  <div class="flex flex-col gap-6">
    <PageHeader :title="$t('fee_structures.title')" :subtitle="$t('fee_structures.subtitle')" />

    <div class="flex flex-wrap items-end justify-between gap-3">
      <!-- Tabs -->
      <div role="tablist" class="flex max-w-full overflow-x-auto gap-6">
        <button
          v-for="tab in tabs"
          :id="`tab-${tab.id}`"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`panel-${tab.id}`"
          :class="[
            'flex items-center gap-2 pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2',
            activeTab === tab.id ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white',
          ]"
          @click="selectTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'structures'" class="flex items-center gap-2 pb-2">
        <select v-model="yearFilter" class="input-field w-auto" :aria-label="$t('fee_structures.col_year')" @change="financeStore.fetchFeeStructures(yearFilter)">
          <option value="">{{ $t('fee_structures.all_years') }}</option>
          <option v-for="y in academicYears" :key="y" :value="y">{{ y }}</option>
        </select>
        <button type="button" class="btn-primary inline-flex items-center gap-1.5" @click="openStructureForm()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          {{ $t('fee_structures.add_structure') }}
        </button>
      </div>
      <button v-else type="button" class="btn-primary inline-flex items-center gap-1.5 mb-2" @click="openTypeForm()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        {{ $t('fee_structures.add_type') }}
      </button>
    </div>

    <!-- ── Fee Types ── -->
    <section v-show="activeTab === 'types'" id="panel-types" role="tabpanel" aria-labelledby="tab-types" class="panel overflow-hidden">
      <p class="px-5 py-3 text-xs text-ink-muted border-b border-line">{{ $t('fee_structures.types_subtitle') }}</p>
      <LoadingSpinner v-if="financeStore.feeTypesLoading" class="my-8" />
      <p v-else-if="!financeStore.feeTypes.length" class="px-5 py-8 text-center text-sm text-ink-subtle">{{ $t('fee_structures.type_empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('fee_structures.type_name_en') }}</th>
              <th>{{ $t('fee_structures.type_name_lo') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('fee_structures.col_invoices') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ft, i) in financeStore.feeTypes" :key="ft.feeTypeId">
              <td class="text-center tnum text-ink-subtle">{{ i + 1 }}</td>
              <td class="font-semibold">{{ ft.nameEn }}</td>
              <td>{{ ft.nameLo }}</td>
              <td><span :class="ft.isActive ? 'badge-success' : 'badge-muted'">{{ ft.isActive ? $t('status.active') : $t('status.inactive') }}</span></td>
              <td class="text-ink-muted">{{ $t('fee_structures.type_used', { count: (ft._count && ft._count.structures) || 0 }) }}</td>
              <td class="text-right">
                <div class="inline-flex gap-1">
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" :title="$t('common.edit')" @click="openTypeForm(ft)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" :title="$t('common.delete')" @click="openTypeDelete(ft)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Fee Structures ── -->
    <section v-show="activeTab === 'structures'" id="panel-structures" role="tabpanel" aria-labelledby="tab-structures" class="panel overflow-hidden">
      <p class="px-5 py-3 text-xs text-ink-muted border-b border-line">{{ $t('fee_structures.structures_subtitle') }}</p>
      <LoadingSpinner v-if="financeStore.feeStructuresLoading" class="my-8" />
      <p v-else-if="!financeStore.feeStructures.length" class="px-5 py-8 text-center text-sm text-ink-subtle">{{ $t('fee_structures.empty') }}</p>
      <div v-else class="overflow-x-auto">
        <table class="data-table w-full min-w-max">
          <thead>
            <tr>
              <th class="w-12 text-center">#</th>
              <th>{{ $t('fee_structures.col_fee_type') }}</th>
              <th>{{ $t('fee_structures.col_year') }}</th>
              <th>{{ $t('fee_structures.col_term') }}</th>
              <th>{{ $t('fee_structures.col_class') }}</th>
              <th class="text-right">{{ $t('fee_structures.col_amount') }}</th>
              <th>{{ $t('fee_structures.col_due') }}</th>
              <th class="text-right">{{ $t('fee_structures.col_invoices') }}</th>
              <th class="text-right">{{ $t('fee_structures.col_collected') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, i) in financeStore.feeStructures" :key="s.feeStructureId">
              <td class="text-center tnum text-ink-subtle">{{ i + 1 }}</td>
              <td class="font-semibold">{{ pick(s.feeType && s.feeType.nameLo, s.feeType && s.feeType.nameEn) }}</td>
              <td>{{ s.academicYear }}</td>
              <td class="text-ink-muted">{{ s.term ? pick(s.term.termNameLo, s.term.termNameEn) : $t('fee_structures.all_terms') }}</td>
              <td class="text-ink-muted">{{ s.class ? pick(s.class.classNameLo, s.class.classNameEn) : $t('fee_structures.all_classes') }}</td>
              <td class="text-right font-semibold tnum">{{ f.kip(s.amount) }}</td>
              <td class="whitespace-nowrap text-ink-muted">{{ f.date(s.dueDate) }}</td>
              <td class="text-right tnum">{{ f.number(s.invoiceCount || 0) }}</td>
              <td class="text-right tnum">
                <span v-if="(s.billed || 0) > 0">{{ f.kip(s.collected) }} / {{ f.kip(s.billed) }}</span>
                <span v-else class="text-ink-subtle">—</span>
              </td>
              <td class="text-right">
                <div class="inline-flex gap-1">
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" :title="$t('fee_structures.generate')" @click="openGenerate(s)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </button>
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" :title="$t('common.edit')" @click="openStructureForm(s)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button type="button" class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" :title="$t('common.delete')" @click="openStructureDelete(s)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Fee Type Form Modal ── -->
    <AppModal :open="typeForm.open" :title="typeForm.editing ? $t('fee_structures.edit_type') : $t('fee_structures.add_type')" size="sm" @update:open="typeForm.open = $event">
      <form id="type-form" class="flex flex-col gap-4" @submit.prevent="handleTypeSave">
        <div>
          <label for="ft-name-en" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.type_name_en') }}</label>
          <input id="ft-name-en" v-model.trim="typeForm.nameEn" required class="input-field">
        </div>
        <div>
          <label for="ft-name-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.type_name_lo') }}</label>
          <input id="ft-name-lo" v-model.trim="typeForm.nameLo" required class="input-field">
        </div>
        <div>
          <label for="ft-desc-en" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.type_desc_en') }}</label>
          <input id="ft-desc-en" v-model.trim="typeForm.descriptionEn" class="input-field">
        </div>
        <div>
          <label for="ft-desc-lo" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.type_desc_lo') }}</label>
          <input id="ft-desc-lo" v-model.trim="typeForm.descriptionLo" class="input-field">
        </div>
        <label class="inline-flex items-center gap-2 text-sm">
          <input v-model="typeForm.isActive" type="checkbox" class="accent-primary">
          {{ $t('fee_structures.type_active') }}
        </label>
        <p v-if="typeForm.error" role="alert" class="rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ typeForm.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="typeForm.busy" @click="typeForm.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="type-form" class="btn-primary" :disabled="typeForm.busy || !typeForm.nameEn || !typeForm.nameLo">
          {{ typeForm.busy ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </AppModal>

    <!-- ── Fee Type Delete ── -->
    <ConfirmDialog
      :open="typeDel.open"
      tone="danger"
      :title="$t('fee_structures.type_delete_title')"
      :message="typeDel.ft ? $t('fee_structures.type_delete_msg', { name: pick(typeDel.ft.nameLo, typeDel.ft.nameEn) }) : ''"
      :confirm-label="$t('common.delete')"
      :busy="typeDel.busy"
      :error="typeDel.error"
      @update:open="typeDel.open = $event"
      @confirm="handleTypeDelete"
    />

    <!-- ── Structure Form Modal ── -->
    <AppModal :open="structForm.open" :title="structForm.editing ? $t('fee_structures.edit_structure') : $t('fee_structures.add_structure')" size="md" @update:open="structForm.open = $event">
      <form id="struct-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="handleStructSave">
        <div>
          <label for="sf-type" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.field_type') }}</label>
          <select id="sf-type" v-model.number="structForm.feeTypeId" required class="input-field" :disabled="structForm.editing && structForm.hasInvoices">
            <option value="" disabled>—</option>
            <option v-for="ft in activeFeeTypes" :key="ft.feeTypeId" :value="ft.feeTypeId">{{ pick(ft.nameLo, ft.nameEn) }}</option>
          </select>
        </div>
        <div>
          <label for="sf-year" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.field_year') }}</label>
          <select id="sf-year" v-model="structForm.academicYear" required class="input-field" :disabled="structForm.editing && structForm.hasInvoices">
            <option value="" disabled>—</option>
            <option v-for="y in academicYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div>
          <label for="sf-term" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.field_term') }}</label>
          <select id="sf-term" v-model="structForm.termId" class="input-field" :disabled="structForm.editing && structForm.hasInvoices">
            <option :value="null">{{ $t('fee_structures.all_terms') }}</option>
            <option v-for="tm in terms" :key="tm.termId" :value="tm.termId">{{ pick(tm.termNameLo, tm.termNameEn) }}</option>
          </select>
        </div>
        <div>
          <label for="sf-class" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.field_class') }}</label>
          <select id="sf-class" v-model="structForm.classId" class="input-field" :disabled="structForm.editing && structForm.hasInvoices">
            <option :value="null">{{ $t('fee_structures.all_classes') }}</option>
            <option v-for="c in classes" :key="c.classId" :value="c.classId">{{ pick(c.classNameLo, c.classNameEn) }}</option>
          </select>
        </div>
        <div>
          <label for="sf-amount" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.field_amount') }}</label>
          <input id="sf-amount" v-model.number="structForm.amount" required type="number" min="1000" step="1000" class="input-field tnum" :disabled="structForm.editing && structForm.hasInvoices">
        </div>
        <div>
          <label for="sf-due" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.field_due') }}</label>
          <input id="sf-due" v-model="structForm.dueDate" required type="date" class="input-field">
        </div>
        <div class="sm:col-span-2">
          <label for="sf-notes" class="block mb-1.5 text-sm font-semibold">{{ $t('fee_structures.field_notes') }}</label>
          <textarea id="sf-notes" v-model.trim="structForm.notes" rows="2" class="input-field" />
        </div>
        <p v-if="structForm.error" role="alert" class="sm:col-span-2 rounded border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger">{{ structForm.error }}</p>
      </form>
      <template #footer>
        <button type="button" class="btn-secondary" :disabled="structForm.busy" @click="structForm.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="struct-form" class="btn-primary" :disabled="structForm.busy || !structForm.feeTypeId || !structForm.academicYear || !structForm.amount">
          {{ structForm.busy ? $t('common.saving') : $t('common.save') }}
        </button>
      </template>
    </AppModal>

    <!-- ── Structure Delete ── -->
    <ConfirmDialog
      :open="structDel.open"
      tone="danger"
      :title="$t('fee_structures.delete_title')"
      :message="$t('fee_structures.delete_msg')"
      :confirm-label="$t('common.delete')"
      :busy="structDel.busy"
      :error="structDel.error"
      @update:open="structDel.open = $event"
      @confirm="handleStructDelete"
    />

    <!-- ── Generate Invoices ── -->
    <ConfirmDialog
      :open="gen.open"
      :title="$t('fee_structures.generate_title')"
      :message="$t('fee_structures.generate_msg')"
      :confirm-label="$t('fee_structures.generate_confirm')"
      :busy="gen.busy"
      :error="gen.error"
      @update:open="gen.open = $event"
      @confirm="handleGenerate"
    />
  </div>
</template>

<script setup lang="ts">
import type { FeeType, FeeStructure } from '../../../domain/models/Finance';
import type { AcademicTerm } from '../../../infrastructure/api/AcademicsRepository';
import type { SchoolClass } from '../../../domain/models/SchoolClass';
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFinanceStore } from '../../../application/stores/finance';
import { academicsRepository } from '../../../infrastructure/api/AcademicsRepository';
import { adminRepository } from '../../../infrastructure/api/AdminRepository';
import PageHeader from '../../../components/PageHeader.vue';
import AppModal from '../../../components/AppModal.vue';
import ConfirmDialog from '../../../components/ConfirmDialog.vue';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { useFormat } from '../../../composables/useFormat';

definePageMeta({ layout: 'admin' });

const { t, locale } = useI18n();
const f = useFormat();
useHead({ title: () => t('fee_structures.title') });

const financeStore = useFinanceStore();
const pick = (lo?: string | null, en?: string | null) => (locale.value === 'lo' ? lo || en : en || lo) ?? '';

const yearFilter = ref('');
const academicYears = ref<string[]>([]);
const terms = ref<AcademicTerm[]>([]);
const classes = ref<SchoolClass[]>([]);

const activeFeeTypes = computed(() => financeStore.feeTypes.filter(ft => ft.isActive));

// ── Tabs (kept in the URL as ?tab=types so a refresh stays put) ──
type TabId = 'structures' | 'types';
const route = useRoute();
const router = useRouter();
const dialog = useDialog();
const activeTab = ref<TabId>(route.query.tab === 'types' ? 'types' : 'structures');
const selectTab = (id: TabId) => {
  activeTab.value = id;
  router.replace({ query: { ...route.query, tab: id === 'types' ? 'types' : undefined } });
};
const tabs = computed(() => [
  { id: 'structures' as const, label: t('fee_structures.structures_title') },
  { id: 'types' as const, label: t('fee_structures.types_title') },
]);

onMounted(async () => {
  financeStore.fetchFeeTypes();
  financeStore.fetchFeeStructures();
  academicYears.value = await adminRepository.getClassAcademicYears();
  terms.value = await academicsRepository.getTerms();
  const classRes = await adminRepository.getClasses({ limit: 200 });
  classes.value = classRes.classes;
});

// ── Fee Type Form ──
const typeForm = reactive({ open: false, busy: false, error: '', editing: null as FeeType | null, nameEn: '', nameLo: '', descriptionEn: '', descriptionLo: '', isActive: true });
function openTypeForm(ft?: FeeType) {
  Object.assign(typeForm, {
    open: true, busy: false, error: '', editing: ft ?? null,
    nameEn: ft?.nameEn ?? '', nameLo: ft?.nameLo ?? '',
    descriptionEn: ft?.descriptionEn ?? '', descriptionLo: ft?.descriptionLo ?? '',
    isActive: ft?.isActive ?? true,
  });
}
async function handleTypeSave() {
  typeForm.busy = true;
  typeForm.error = '';
  const payload = { nameEn: typeForm.nameEn, nameLo: typeForm.nameLo, descriptionEn: typeForm.descriptionEn || undefined, descriptionLo: typeForm.descriptionLo || undefined, isActive: typeForm.isActive };
  try {
    if (typeForm.editing) {
      await financeStore.updateFeeType(typeForm.editing.feeTypeId, payload);
    } else {
      await financeStore.createFeeType(payload);
    }
    typeForm.open = false;
  } catch (err) {
    typeForm.error = getErrorMessage(err, t('common.error'));
  } finally {
    typeForm.busy = false;
  }
}

// ── Fee Type Delete ──
const typeDel = reactive({ open: false, busy: false, error: '', ft: null as FeeType | null });
const openTypeDelete = (ft: FeeType) => Object.assign(typeDel, { open: true, busy: false, error: '', ft });
async function handleTypeDelete() {
  if (!typeDel.ft) return;
  typeDel.busy = true;
  typeDel.error = '';
  try {
    await financeStore.deleteFeeType(typeDel.ft.feeTypeId);
    typeDel.open = false;
  } catch (err) {
    typeDel.error = getErrorMessage(err, t('common.error'));
  } finally {
    typeDel.busy = false;
  }
}

// ── Structure Form ──
const structForm = reactive({
  open: false, busy: false, error: '', editing: null as FeeStructure | null, hasInvoices: false,
  feeTypeId: '' as number | '', academicYear: '', termId: null as number | null, classId: null as number | null,
  amount: 0, dueDate: '', notes: '',
});
function openStructureForm(s?: FeeStructure) {
  Object.assign(structForm, {
    open: true, busy: false, error: '', editing: s ?? null, hasInvoices: (s?.invoiceCount ?? 0) > 0,
    feeTypeId: s?.feeTypeId ?? '', academicYear: s?.academicYear ?? (academicYears.value[0] || ''),
    termId: s?.termId ?? null, classId: s?.classId ?? null,
    amount: s ? Number(s.amount) : 0, dueDate: s?.dueDate ? String(s.dueDate).slice(0, 10) : '',
    notes: s?.notes ?? '',
  });
}
async function handleStructSave() {
  structForm.busy = true;
  structForm.error = '';
  const payload: Record<string, unknown> = {
    feeTypeId: structForm.feeTypeId, academicYear: structForm.academicYear,
    termId: structForm.termId, classId: structForm.classId,
    amount: structForm.amount, dueDate: structForm.dueDate,
    notes: structForm.notes || undefined,
  };
  try {
    if (structForm.editing) {
      await financeStore.updateFeeStructure(structForm.editing.feeStructureId, payload);
    } else {
      await financeStore.createFeeStructure(payload);
    }
    structForm.open = false;
  } catch (err) {
    structForm.error = getErrorMessage(err, t('common.error'));
  } finally {
    structForm.busy = false;
  }
}

// ── Structure Delete ──
const structDel = reactive({ open: false, busy: false, error: '', structure: null as FeeStructure | null });
const openStructureDelete = (s: FeeStructure) => Object.assign(structDel, { open: true, busy: false, error: '', structure: s });
async function handleStructDelete() {
  if (!structDel.structure) return;
  structDel.busy = true;
  structDel.error = '';
  try {
    await financeStore.deleteFeeStructure(structDel.structure.feeStructureId);
    structDel.open = false;
  } catch (err) {
    structDel.error = getErrorMessage(err, t('common.error'));
  } finally {
    structDel.busy = false;
  }
}

// ── Generate Invoices ──
const gen = reactive({ open: false, busy: false, error: '', structureId: 0 });
const openGenerate = (s: FeeStructure) => Object.assign(gen, { open: true, busy: false, error: '', structureId: s.feeStructureId });
async function handleGenerate() {
  gen.busy = true;
  gen.error = '';
  try {
    const result = await financeStore.generateInvoices(gen.structureId);
    gen.open = false;
    dialog.success(t('fee_structures.generate_result', { created: result.created, existing: result.alreadyBilled }));
  } catch (err) {
    gen.error = getErrorMessage(err, t('common.error'));
  } finally {
    gen.busy = false;
  }
}
</script>
