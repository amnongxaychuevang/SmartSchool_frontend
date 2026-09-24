<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">{{ L('Academic Terms', 'ສົກຮຽນ / ພາກຮຽນ') }}</h1>
        <p class="text-sm text-slate-400 mt-1">
          {{ L('Exactly one term should be Active — new class subjects and grades go into it.', 'ຄວນມີພາກຮຽນທີ່ "ກຳລັງດຳເນີນ" ພຽງອັນດຽວ — ວິຊາ ແລະ ຄະແນນໃໝ່ຈະຢູ່ໃນພາກຮຽນນີ້.') }}
        </p>
      </div>
      <button class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors" @click="openModal()">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        {{ L('Add Term', 'ເພີ່ມພາກຮຽນ') }}
      </button>
    </div>

    <div class="glass-panel overflow-x-auto">
      <LoadingSpinner v-if="loading" />
      <div v-else-if="terms.length === 0" class="py-16 text-center text-slate-500 text-sm">
        {{ L('No academic terms yet.', 'ຍັງບໍ່ມີພາກຮຽນ.') }}
      </div>
      <table v-else class="w-full min-w-max">
        <thead>
          <tr class="border-b border-slate-800">
            <th class="th">{{ L('Academic Year', 'ສົກຮຽນ') }}</th>
            <th class="th">{{ L('Term', 'ພາກຮຽນ') }}</th>
            <th class="th hidden sm:table-cell">{{ L('Dates', 'ວັນທີ') }}</th>
            <th class="th">{{ L('Status', 'ສະຖານະ') }}</th>
            <th class="th text-right">{{ L('Actions', 'ຈັດການ') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          <tr v-for="term in terms" :key="term.termId" class="hover:bg-slate-800/40 transition-colors">
            <td class="px-6 py-4 text-sm text-white font-medium">{{ term.academicYear }}</td>
            <td class="px-6 py-4 text-sm text-slate-300">{{ locale === 'lo' ? term.termNameLo : term.termNameEn }}</td>
            <td class="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">{{ term.startDate.slice(0, 10) }} → {{ term.endDate.slice(0, 10) }}</td>
            <td class="px-6 py-4">
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium" :class="STATUS_CLASS[term.status]">{{ statusLabel(term.status) }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all" :title="$t('common.edit')" @click="openModal(term)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all" :title="$t('common.delete')" @click="removeTerm(term)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="modal.open = false"/>
        <form class="relative bg-[#0d1626] border border-slate-700/60 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4" @submit.prevent="save">
          <h2 class="text-xl font-bold text-white">{{ modal.termId ? L('Edit Term', 'ແກ້ໄຂພາກຮຽນ') : L('Add Term', 'ເພີ່ມພາກຮຽນ') }}</h2>
          <div v-if="modal.error" class="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{{ modal.error }}</div>

          <label class="field">
            <span>{{ L('Academic Year', 'ສົກຮຽນ') }} *</span>
            <input v-model="modal.form.academicYear" required pattern="\d{4}-\d{4}" placeholder="2026-2027" class="modal-input" >
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>{{ L('Name (EN)', 'ຊື່ (EN)') }} *</span><input v-model="modal.form.termNameEn" required class="modal-input" placeholder="Term 1" ></label>
            <label class="field"><span>{{ L('Name (LO)', 'ຊື່ (LO)') }} *</span><input v-model="modal.form.termNameLo" required class="modal-input" placeholder="ພາກຮຽນ 1" ></label>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <label class="field"><span>{{ L('Start', 'ເລີ່ມ') }} *</span><input v-model="modal.form.startDate" required type="date" class="modal-input" ></label>
            <label class="field"><span>{{ L('End', 'ສິ້ນສຸດ') }} *</span><input v-model="modal.form.endDate" required type="date" class="modal-input" ></label>
          </div>
          <label class="field">
            <span>{{ L('Status', 'ສະຖານະ') }}</span>
            <select v-model="modal.form.status" class="modal-input">
              <option v-for="s in STATUSES" :key="s" :value="s">{{ statusLabel(s) }}</option>
            </select>
          </label>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800" @click="modal.open = false">{{ $t('common.cancel') }}</button>
            <button type="submit" :disabled="modal.saving" class="px-5 py-2 rounded-lg text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white disabled:opacity-60">
              {{ modal.saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { academicsRepository, type AcademicTerm } from '../../../infrastructure/api/AcademicsRepository';

definePageMeta({ layout: 'admin' });
useHead({ title: () => useNuxtApp().$i18n.t('page_titles.academic_terms') });

const { locale } = useI18n();
const L = (en: string, lo: string) => (locale.value === 'lo' ? lo : en);

const STATUSES = ['active', 'upcoming', 'completed'] as const;
type Status = (typeof STATUSES)[number];
const STATUS_CLASS: Record<Status, string> = {
  active: 'bg-teal-500/20 text-teal-400',
  upcoming: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-slate-500/20 text-slate-400',
};
const statusLabel = (s: Status) =>
  ({ active: L('Active', 'ກຳລັງດຳເນີນ'), upcoming: L('Upcoming', 'ກຳລັງຈະມາ'), completed: L('Completed', 'ສຳເລັດແລ້ວ') })[s];

const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || (err instanceof Error && err.message) || fallback;

const terms = ref<AcademicTerm[]>([]);
const loading = ref(true);

const fetchTerms = async () => {
  loading.value = true;
  try {
    terms.value = await academicsRepository.getTerms();
  } finally {
    loading.value = false;
  }
};
onMounted(fetchTerms);

const emptyForm = () => ({ academicYear: '', termNameEn: '', termNameLo: '', startDate: '', endDate: '', status: 'upcoming' as Status });
const modal = reactive({ open: false, saving: false, error: '', termId: null as number | null, form: emptyForm() });

const openModal = (term?: AcademicTerm) => {
  modal.termId = term?.termId ?? null;
  modal.form = term
    ? { academicYear: term.academicYear, termNameEn: term.termNameEn, termNameLo: term.termNameLo,
        startDate: term.startDate.slice(0, 10), endDate: term.endDate.slice(0, 10), status: term.status }
    : emptyForm();
  modal.error = '';
  modal.open = true;
};

const save = async () => {
  if (modal.form.endDate < modal.form.startDate) {
    modal.error = L('End date must be after the start date', 'ວັນສິ້ນສຸດຕ້ອງຫຼັງວັນເລີ່ມ');
    return;
  }
  modal.saving = true;
  modal.error = '';
  try {
    await academicsRepository.saveTerm(modal.termId, modal.form);
    modal.open = false;
    await fetchTerms();
  } catch (err) {
    modal.error = errorMessage(err, 'Failed to save term');
  } finally {
    modal.saving = false;
  }
};

const removeTerm = async (term: AcademicTerm) => {
  if (!confirm(L(`Delete "${term.termNameEn}"?`, `ລຶບ "${term.termNameLo}"?`))) return;
  try {
    await academicsRepository.deleteTerm(term.termId);
    await fetchTerms();
  } catch (err) {
    // Terms that already have class subjects can't be deleted.
    alert(errorMessage(err, L('This term is in use and cannot be deleted', 'ພາກຮຽນນີ້ຖືກໃຊ້ຢູ່ ລຶບບໍ່ໄດ້')));
  }
};
</script>

<style scoped lang="postcss">
.th {
  @apply text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3;
}
.field {
  @apply flex flex-col gap-1.5;
}
.field > span {
  @apply text-xs font-semibold text-slate-400 uppercase tracking-wider;
}
.modal-input {
  @apply w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all;
}
</style>
