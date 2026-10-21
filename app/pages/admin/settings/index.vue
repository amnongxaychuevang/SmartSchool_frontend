<template>
  <div class="flex flex-col gap-6 page-enter">
    <PageHeader
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
      <div role="tablist" class="flex self-start max-w-full overflow-x-auto gap-6">
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

        <!-- Low balance alert: the default for parents who set none -->
        <form class="flex flex-col gap-3 border-t border-line pt-5" @submit.prevent="handleLowBalanceSave">
          <div>
            <h3 class="text-sm font-semibold">{{ $t('low_balance.title') }}</h3>
            <p class="text-xs text-ink-muted mt-0.5">{{ $t('low_balance.subtitle') }}</p>
          </div>
          <div class="flex flex-wrap items-end gap-3">
            <div class="flex flex-col gap-1.5">
              <label for="low-balance" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('low_balance.threshold') }}</label>
              <input id="low-balance" v-model.number="lowBalanceInput" type="number" min="0" step="1000" class="input-field tnum w-48" :placeholder="$t('low_balance.off')">
            </div>
            <button type="submit" :disabled="savingLowBalance" class="btn-primary">
              {{ savingLowBalance ? $t('common.saving') : $t('settings.save') }}
            </button>
            <span v-if="lowBalanceSaved" class="text-xs text-success">{{ $t('payment_info.saved') }}</span>
          </div>
          <p v-if="lowBalanceError" role="alert" class="text-sm text-danger">{{ lowBalanceError }}</p>
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

      <!-- Automatic fee reminders -->
      <section v-show="activeTab === 'fees'" id="panel-fees" role="tabpanel" aria-labelledby="tab-fees" class="panel p-6 max-w-3xl flex flex-col gap-5">
        <p class="text-sm text-ink-muted">{{ $t('fee_reminders.subtitle') }}</p>

        <form class="flex flex-col gap-5" @submit.prevent="handleFeeRemindersSave">
          <label class="flex items-center gap-3 cursor-pointer self-start">
            <input v-model="feeForm.enabled" type="checkbox" class="h-4 w-4 accent-primary">
            <span class="text-sm font-semibold">{{ $t('fee_reminders.enabled') }}</span>
          </label>

          <fieldset class="grid grid-cols-1 sm:grid-cols-2 gap-4" :disabled="!feeForm.enabled">
            <div class="flex flex-col gap-1.5">
              <label for="fr-before" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('fee_reminders.days_before') }}</label>
              <input id="fr-before" v-model.number="feeForm.daysBefore" type="number" min="0" max="60" required class="input-field tnum w-32">
              <p class="text-xs text-ink-subtle">{{ $t('fee_reminders.days_before_hint') }}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="fr-time" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('fee_reminders.send_time') }}</label>
              <input id="fr-time" v-model="feeForm.sendTime" type="time" required class="input-field tnum w-40">
              <p class="text-xs text-ink-subtle">{{ $t('auto_absence.cutoff_hint') }}</p>
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="fr-repeat" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('fee_reminders.repeat_every') }}</label>
              <input id="fr-repeat" v-model.number="feeForm.repeatEveryDays" type="number" min="1" max="60" required class="input-field tnum w-32">
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="fr-max" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('fee_reminders.max_overdue') }}</label>
              <input id="fr-max" v-model.number="feeForm.maxOverdue" type="number" min="0" max="12" required class="input-field tnum w-32">
              <p class="text-xs text-ink-subtle">{{ $t('fee_reminders.max_overdue_hint') }}</p>
            </div>
          </fieldset>

          <p class="rounded-lg border border-line bg-surface-2 px-4 py-3 text-xs text-ink-muted">{{ $t('fee_reminders.rules') }}</p>

          <p v-if="feeError" role="alert" class="text-sm text-danger">{{ feeError }}</p>

          <div class="flex flex-wrap items-center justify-end gap-3">
            <span v-if="feeSaved" class="text-xs text-success">{{ $t('auto_absence.saved') }}</span>
            <span v-if="feeRunResult" class="text-xs text-ink-muted">{{ feeRunResult }}</span>
            <button v-if="canRunFeeReminders" type="button" class="btn-secondary" :disabled="runningFeeReminders || !feeRemindersOn" :title="feeRemindersOn ? undefined : $t('fee_reminders.save_first')" @click="handleRunFeeReminders">
              {{ runningFeeReminders ? $t('common.saving') : $t('auto_absence.run_now') }}
            </button>
            <button type="submit" :disabled="savingFee" class="btn-primary">
              {{ savingFee ? $t('common.saving') : $t('settings.save') }}
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
import { useSettingsStore, type AutoAbsenceSettings, type FeeReminderSettings } from '../../../application/stores/settings';
import { useAuthStore } from '../../../application/stores/auth';
import { hasPermission } from '../../../components/layout/adminNav';
import { settingsRepository } from '../../../infrastructure/api/SettingsRepository';
import { academicsRepository, type AcademicTerm } from '../../../infrastructure/api/AcademicsRepository';

type TabId = 'school' | 'payment' | 'attendance' | 'fees' | 'term';
const TAB_IDS: TabId[] = ['school', 'payment', 'attendance', 'fees', 'term'];

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

const tabs = computed(() => [
  {
    id: 'school' as const,
    label: t('settings.school_info'),
  },
  {
    id: 'payment' as const,
    label: t('payment_info.title'),
  },
  {
    id: 'attendance' as const,
    label: t('auto_absence.title'),
  },
  {
    id: 'fees' as const,
    label: t('fee_reminders.title'),
  },
  {
    id: 'term' as const,
    label: t('settings.academic_settings'),
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
    lowBalanceInput.value = settingsStore.lowBalanceDefault ?? '';
    Object.assign(feeForm, settingsStore.feeReminders ?? FEE_DEFAULTS);
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

// ── Fee reminders ──
const FEE_DEFAULTS: FeeReminderSettings = { enabled: false, daysBefore: 3, repeatEveryDays: 7, maxOverdue: 3, sendTime: '08:00' };
const feeForm = reactive<FeeReminderSettings>({ ...FEE_DEFAULTS });
const feeRemindersOn = computed(() => Boolean(settingsStore.feeReminders && settingsStore.feeReminders.enabled));
const canRunFeeReminders = computed(() => hasPermission(authStore.permissions, 'fees.manage'));
const savingFee = ref(false);
const feeSaved = ref(false);
const feeError = ref('');
const runningFeeReminders = ref(false);
const feeRunResult = ref('');

const handleFeeRemindersSave = async () => {
  savingFee.value = true;
  feeSaved.value = false;
  feeError.value = '';
  try {
    await settingsStore.saveFeeReminders({ ...feeForm });
    feeSaved.value = true;
    setTimeout(() => { feeSaved.value = false; }, 3000);
  } catch (err) {
    feeError.value = getErrorMessage(err, t('settings_ui.save_error'));
  } finally {
    savingFee.value = false;
  }
};

const handleRunFeeReminders = async () => {
  runningFeeReminders.value = true;
  feeRunResult.value = '';
  feeError.value = '';
  try {
    const result = await settingsRepository.runFeeReminders();
    feeRunResult.value = t('fee_reminders.run_done', { before: result.before, overdue: result.overdue });
  } catch (err) {
    feeError.value = getErrorMessage(err);
  } finally {
    runningFeeReminders.value = false;
  }
};

// ── Low balance alert default ──
const lowBalanceInput = ref<number | ''>('');
const savingLowBalance = ref(false);
const lowBalanceSaved = ref(false);
const lowBalanceError = ref('');

const handleLowBalanceSave = async () => {
  savingLowBalance.value = true;
  lowBalanceSaved.value = false;
  lowBalanceError.value = '';
  try {
    const value = typeof lowBalanceInput.value === 'number' && lowBalanceInput.value > 0 ? Math.round(lowBalanceInput.value) : null;
    await settingsStore.saveLowBalanceDefault(value);
    lowBalanceSaved.value = true;
    setTimeout(() => { lowBalanceSaved.value = false; }, 3000);
  } catch (err) {
    lowBalanceError.value = getErrorMessage(err, t('settings_ui.save_error'));
  } finally {
    savingLowBalance.value = false;
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
