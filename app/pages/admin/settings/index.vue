<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader
      :eyebrow="$t('nav.settings')"
      :title="$t('settings.title')"
      :subtitle="$t('settings.subtitle')"
    />

    <div v-if="loadError" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm flex items-center justify-between gap-4">
      <span>{{ $t('settings_ui.load_error') }}: {{ loadError }}</span>
      <button type="button" class="btn-secondary" @click="load">{{ $t('common.refresh') }}</button>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else class="flex flex-col gap-4">
      <!-- Tabs -->
      <div role="tablist" class="inline-flex self-start max-w-full overflow-x-auto p-0.5 gap-0.5 rounded-lg border border-line bg-surface-2">
        <button
          v-for="tab in tabs"
          :id="`tab-${tab.id}`"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`panel-${tab.id}`"
          :title="tab.ok ? $t('settings_ui.configured') : $t('settings_ui.not_configured')"
          :class="[
            'flex items-center gap-2 h-8 px-3 rounded-md text-sm font-semibold whitespace-nowrap transition-colors',
            activeTab === tab.id ? 'bg-surface text-primary-ink shadow-float' : 'text-ink-muted hover:text-ink',
          ]"
          @click="selectTab(tab.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
          </svg>
          {{ tab.label }}
          <span :class="['w-1.5 h-1.5 rounded-full', tab.ok ? 'bg-success' : 'bg-line-strong']" aria-hidden="true" />
        </button>
      </div>

      <!-- School information -->
      <section v-show="activeTab === 'school'" id="panel-school" role="tabpanel" aria-labelledby="tab-school" class="panel p-6 max-w-3xl">
        <form class="flex flex-col gap-4" @submit.prevent="handleSchoolSave">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="school-name-lo" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('settings.school_name_lo') }}</label>
              <input id="school-name-lo" v-model="schoolForm.schoolNameLo" type="text" required maxlength="150" class="input-field">
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="school-name-en" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('settings.school_name_en') }}</label>
              <input id="school-name-en" v-model="schoolForm.schoolNameEn" type="text" required maxlength="150" class="input-field">
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="school-email" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('settings.contact_email') }}</label>
              <input id="school-email" v-model="schoolForm.contactEmail" type="email" maxlength="150" class="input-field">
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="school-phone" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('settings.contact_phone') }}</label>
              <input id="school-phone" v-model="schoolForm.contactPhone" type="text" maxlength="30" class="input-field">
            </div>
          </div>

          <p v-if="saveError" role="alert" class="text-sm text-danger">{{ saveError }}</p>

          <div class="flex items-center justify-end gap-3">
            <span v-if="successSchool" class="text-xs text-success">{{ $t('settings_ui.school_saved') }}</span>
            <button type="submit" :disabled="savingSchool" class="btn-primary">
              {{ savingSchool ? $t('common.saving') : $t('settings.save') }}
            </button>
          </div>
        </form>
      </section>

      <!-- School account parents transfer top-ups to -->
      <section v-show="activeTab === 'payment'" id="panel-payment" role="tabpanel" aria-labelledby="tab-payment" class="panel p-6 max-w-3xl flex flex-col gap-4">
        <p class="text-sm text-ink-muted">{{ $t('payment_info.subtitle') }}</p>

        <form class="flex flex-col gap-4" @submit.prevent="handlePaymentSave">
          <div class="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_160px] gap-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label for="pay-bank" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('payment_info.bank_name') }}</label>
                <input id="pay-bank" v-model="paymentForm.bankName" type="text" required maxlength="100" class="input-field" placeholder="BCEL">
              </div>
              <div class="flex flex-col gap-1.5">
                <label for="pay-number" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('payment_info.account_number') }}</label>
                <input id="pay-number" v-model="paymentForm.accountNumber" type="text" required maxlength="50" class="input-field tnum">
              </div>
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label for="pay-name" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('payment_info.account_name') }}</label>
                <input id="pay-name" v-model="paymentForm.accountName" type="text" required maxlength="150" class="input-field">
              </div>
              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label for="pay-note" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('payment_info.note') }}</label>
                <input id="pay-note" v-model="paymentForm.note" type="text" maxlength="255" class="input-field" :placeholder="$t('payment_info.note_placeholder')">
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('payment_info.qr') }}</span>
              <label class="relative aspect-square rounded-lg border border-dashed border-line-strong bg-surface-2 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors">
                <img v-if="qrPreview" :src="qrPreview" :alt="$t('payment_info.qr')" class="w-full h-full object-contain">
                <span v-else class="text-xs text-ink-subtle text-center px-3">{{ $t('payment_info.qr_hint') }}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="onQrChange">
              </label>
              <button v-if="qrPreview" type="button" class="text-xs text-danger self-start hover:underline" @click="removeQr">{{ $t('common.delete') }}</button>
            </div>
          </div>

          <p v-if="paymentError" role="alert" class="text-sm text-danger">{{ paymentError }}</p>

          <div class="flex items-center justify-end gap-3">
            <span v-if="paymentSaved" class="text-xs text-success">{{ $t('payment_info.saved') }}</span>
            <button type="submit" :disabled="savingPayment" class="btn-primary">
              {{ savingPayment ? $t('common.saving') : $t('settings.save') }}
            </button>
          </div>
        </form>
      </section>

      <!-- Automatic absence at the daily cut-off -->
      <section v-show="activeTab === 'attendance'" id="panel-attendance" role="tabpanel" aria-labelledby="tab-attendance" class="panel p-6 max-w-3xl flex flex-col gap-5">
        <p class="text-sm text-ink-muted">{{ $t('auto_absence.subtitle') }}</p>

        <form class="flex flex-col gap-5" @submit.prevent="handleAutoAbsenceSave">
          <label class="flex items-center gap-3 cursor-pointer self-start">
            <input v-model="autoAbsenceForm.enabled" type="checkbox" class="h-4 w-4 accent-primary">
            <span class="text-sm font-semibold">{{ $t('auto_absence.enabled') }}</span>
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label for="aa-cutoff" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('auto_absence.cutoff') }}</label>
              <input id="aa-cutoff" v-model="autoAbsenceForm.cutoffTime" type="time" required class="input-field tnum w-40" :disabled="!autoAbsenceForm.enabled">
              <p class="text-xs text-ink-subtle">{{ $t('auto_absence.cutoff_hint') }}</p>
            </div>
            <label class="flex items-start gap-3 cursor-pointer sm:pt-6">
              <input v-model="autoAbsenceForm.notifyParents" type="checkbox" class="mt-0.5 h-4 w-4 accent-primary" :disabled="!autoAbsenceForm.enabled">
              <span class="text-sm">{{ $t('auto_absence.notify_parents') }}</span>
            </label>
          </div>

          <fieldset class="flex flex-col gap-2" :disabled="!autoAbsenceForm.enabled">
            <legend class="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">{{ $t('auto_absence.school_days') }}</legend>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="d in WEEKDAYS"
                :key="d"
                :class="[
                  'h-9 px-3 inline-flex items-center gap-2 rounded-lg border text-sm cursor-pointer select-none',
                  autoAbsenceForm.schoolDays.includes(d) ? 'border-primary bg-primary-soft text-primary-ink font-semibold' : 'border-line text-ink-muted',
                ]"
              >
                <input v-model="autoAbsenceForm.schoolDays" type="checkbox" :value="d" class="sr-only">
                {{ $t(`auto_absence.day_${d}`) }}
              </label>
            </div>
          </fieldset>

          <p class="rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-ink-muted">{{ $t('auto_absence.rules') }}</p>

          <p v-if="autoAbsenceError" role="alert" class="text-sm text-danger">{{ autoAbsenceError }}</p>

          <div class="flex flex-wrap items-center justify-end gap-3">
            <span v-if="autoAbsenceSaved" class="text-xs text-success">{{ $t('auto_absence.saved') }}</span>
            <span v-if="runResult" class="text-xs text-ink-muted">{{ runResult }}</span>
            <button v-if="canRunAutoAbsence" type="button" class="btn-secondary" :disabled="runningAutoAbsence" @click="handleRunAutoAbsence">
              {{ runningAutoAbsence ? $t('common.saving') : $t('auto_absence.run_now') }}
            </button>
            <button type="submit" :disabled="savingAutoAbsence" class="btn-primary">
              {{ savingAutoAbsence ? $t('common.saving') : $t('settings.save') }}
            </button>
          </div>
        </form>
      </section>

      <!-- Active term (read from the academic terms, managed on their own page) -->
      <section v-show="activeTab === 'term'" id="panel-term" role="tabpanel" aria-labelledby="tab-term" class="panel p-6 max-w-3xl flex flex-col gap-5">
        <dl v-if="activeTerm" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="flex flex-col gap-0.5">
            <dt class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('settings.current_year') }}</dt>
            <dd class="text-base font-semibold tnum">{{ activeTerm.academicYear }}</dd>
          </div>
          <div class="flex flex-col gap-0.5">
            <dt class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('settings.active_term') }}</dt>
            <dd class="text-base font-semibold">{{ termName(activeTerm) }}</dd>
          </div>
          <div class="flex flex-col gap-0.5">
            <dt class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('settings_ui.term_dates') }}</dt>
            <dd class="text-base font-semibold tnum">{{ f.date(activeTerm.startDate) }} – {{ f.date(activeTerm.endDate) }}</dd>
          </div>
        </dl>
        <p v-else class="rounded-lg border border-warning-line bg-warning-soft text-warning px-4 py-3 text-sm">{{ $t('settings_ui.no_active_term') }}</p>

        <div class="flex justify-end">
          <NuxtLink to="/admin/settings/academic-terms" class="btn-secondary">
            {{ $t('settings_ui.manage_terms') }}
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { useSettingsStore, type AutoAbsenceSettings } from '../../../application/stores/settings';
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { settingsRepository } from '../../../infrastructure/api/SettingsRepository';
import { academicsRepository, type AcademicTerm } from '../../../infrastructure/api/AcademicsRepository';

type TabId = 'school' | 'payment' | 'attendance' | 'term';
const TAB_IDS: TabId[] = ['school', 'payment', 'attendance', 'term'];

definePageMeta({ layout: 'admin' });
const { t, locale } = useI18n();
useHead({ title: () => t('page_titles.settings') });

const route = useRoute();
const router = useRouter();
const settingsStore = useSettingsStore();
const f = useFormat();

// The open tab lives in the URL (?tab=payment) so a refresh or a shared link keeps it.
const activeTab = ref<TabId>(TAB_IDS.includes(route.query.tab as TabId) ? (route.query.tab as TabId) : 'school');
const selectTab = (id: TabId) => {
  activeTab.value = id;
  router.replace({ query: { ...route.query, tab: id === 'school' ? undefined : id } });
};

const schoolForm = reactive({ schoolNameEn: '', schoolNameLo: '', contactEmail: '', contactPhone: '' });
const terms = ref<AcademicTerm[]>([]);
const loading = ref(true);
const loadError = ref('');
const savingSchool = ref(false);
const successSchool = ref(false);
const saveError = ref('');

const activeTerm = computed(() => terms.value.find((term) => term.status === 'active') ?? null);
const termName = (term: AcademicTerm) => (locale.value === 'lo' ? term.termNameLo : term.termNameEn) || term.termNameEn;

// Tab dots reflect what is saved, not unsaved edits.
const tabs = computed(() => [
  {
    id: 'school' as const,
    label: t('settings.school_info'),
    ok: Boolean(settingsStore.schoolInfo.schoolNameLo && settingsStore.schoolInfo.schoolNameEn),
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    id: 'payment' as const,
    label: t('payment_info.title'),
    ok: Boolean(settingsStore.paymentInfo),
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    id: 'attendance' as const,
    label: t('auto_absence.title'),
    ok: Boolean(settingsStore.autoAbsence?.enabled),
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'term' as const,
    label: t('settings.academic_settings'),
    ok: Boolean(activeTerm.value),
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
]);

const load = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    // Terms need academics.view; without it the school form must still work.
    const [, termList] = await Promise.all([
      settingsStore.loadSettings(),
      academicsRepository.getTerms().catch(() => [] as AcademicTerm[]),
    ]);
    terms.value = termList;
    Object.assign(schoolForm, settingsStore.schoolInfo);
    const pay = settingsStore.paymentInfo;
    Object.assign(paymentForm, {
      bankName: pay?.bankName ?? '',
      accountName: pay?.accountName ?? '',
      accountNumber: pay?.accountNumber ?? '',
      note: pay?.note ?? '',
    });
    qrUrl.value = pay?.qrUrl ?? '';
    const aa = settingsStore.autoAbsence;
    Object.assign(autoAbsenceForm, {
      enabled: aa?.enabled ?? false,
      cutoffTime: aa?.cutoffTime ?? '09:00',
      schoolDays: [...(aa?.schoolDays ?? [1, 2, 3, 4, 5])],
      notifyParents: aa?.notifyParents ?? true,
    });
  } catch (err) {
    loadError.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const handleSchoolSave = async () => {
  savingSchool.value = true;
  successSchool.value = false;
  saveError.value = '';
  try {
    await settingsStore.saveSchoolInfo({ ...schoolForm });
    successSchool.value = true;
    setTimeout(() => { successSchool.value = false; }, 3000);
  } catch (err) {
    saveError.value = getErrorMessage(err, t('settings_ui.save_error'));
  } finally {
    savingSchool.value = false;
  }
};

// ── Payment account ──
const mediaUrl = useMediaUrl();
const paymentForm = reactive({ bankName: '', accountName: '', accountNumber: '', note: '' });
const qrUrl = ref('');
const qrFile = ref<File | null>(null);
const qrPreview = computed(() => (qrFile.value ? URL.createObjectURL(qrFile.value) : mediaUrl(qrUrl.value)));
const savingPayment = ref(false);
const paymentSaved = ref(false);
const paymentError = ref('');

const onQrChange = (e: Event) => {
  qrFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
};
const removeQr = () => {
  qrFile.value = null;
  qrUrl.value = '';
};

const handlePaymentSave = async () => {
  savingPayment.value = true;
  paymentSaved.value = false;
  paymentError.value = '';
  try {
    if (qrFile.value) {
      qrUrl.value = await settingsRepository.uploadPaymentQr(qrFile.value);
      qrFile.value = null;
    }
    await settingsStore.savePaymentInfo({
      bankName: paymentForm.bankName,
      accountName: paymentForm.accountName,
      accountNumber: paymentForm.accountNumber,
      ...(paymentForm.note.trim() ? { note: paymentForm.note.trim() } : {}),
      ...(qrUrl.value ? { qrUrl: qrUrl.value } : {}),
    });
    paymentSaved.value = true;
    setTimeout(() => { paymentSaved.value = false; }, 3000);
  } catch (err) {
    paymentError.value = getErrorMessage(err, t('settings_ui.save_error'));
  } finally {
    savingPayment.value = false;
  }
};

// ── Automatic absence ──
// Monday first, as on a school timetable; 0 = Sunday.
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];
const authStore = useAuthStore();
const canRunAutoAbsence = computed(() => hasPermission(authStore.permissions, 'attendance.manage'));
const autoAbsenceForm = reactive<AutoAbsenceSettings>({ enabled: false, cutoffTime: '09:00', schoolDays: [1, 2, 3, 4, 5], notifyParents: true });
const savingAutoAbsence = ref(false);
const autoAbsenceSaved = ref(false);
const autoAbsenceError = ref('');
const runningAutoAbsence = ref(false);
const runResult = ref('');

const handleAutoAbsenceSave = async () => {
  savingAutoAbsence.value = true;
  autoAbsenceSaved.value = false;
  autoAbsenceError.value = '';
  try {
    await settingsStore.saveAutoAbsence({ ...autoAbsenceForm, schoolDays: [...autoAbsenceForm.schoolDays].sort() });
    autoAbsenceSaved.value = true;
    setTimeout(() => { autoAbsenceSaved.value = false; }, 3000);
  } catch (err) {
    autoAbsenceError.value = getErrorMessage(err, t('settings_ui.save_error'));
  } finally {
    savingAutoAbsence.value = false;
  }
};

const handleRunAutoAbsence = async () => {
  runningAutoAbsence.value = true;
  runResult.value = '';
  autoAbsenceError.value = '';
  try {
    const result = await settingsRepository.runAutoAbsence();
    runResult.value = result.ran
      ? t('auto_absence.run_done', { marked: result.marked, notified: result.notified })
      : t(`auto_absence.run_skipped_${result.reason}`);
  } catch (err) {
    autoAbsenceError.value = getErrorMessage(err);
  } finally {
    runningAutoAbsence.value = false;
  }
};
</script>
