<template>
  <div class="flex flex-col gap-4">
    <!-- Tabs: Calendar vs Agenda -->
    <div class="flex items-center gap-2 p-1 bg-surface-2 rounded-xl border border-line w-fit">
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        :class="activeTab === 'calendar' ? 'bg-primary !text-white shadow-sm' : 'text-ink-muted hover:text-ink'"
        @click="activeTab = 'calendar'"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ $t('calendar.tab_calendar') }}</span>
      </button>

      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
        :class="activeTab === 'agenda' ? 'bg-primary !text-white shadow-sm' : 'text-ink-muted hover:text-ink'"
        @click="activeTab = 'agenda'"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span>{{ $t('calendar.tab_agenda') }}</span>
        <span v-if="monthEvents.length" class="ml-1 px-1.5 py-0.5 text-xs rounded-md" :class="activeTab === 'agenda' ? 'bg-white/20 text-white' : 'bg-surface text-ink-muted'">{{ monthEvents.length }}</span>
      </button>
    </div>

    <!-- Month navigation & Actions -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button type="button" class="btn-secondary min-h-9 px-2.5" :aria-label="$t('calendar.prev')" @click="shiftMonth(-1)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 class="text-lg font-bold min-w-44 text-center">{{ monthTitle }}</h2>
        <button type="button" class="btn-secondary min-h-9 px-2.5" :aria-label="$t('calendar.next')" @click="shiftMonth(1)">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
        <button type="button" class="btn-secondary min-h-9" @click="goToday">{{ $t('calendar.today') }}</button>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span v-for="type in TYPES" :key="type" class="flex items-center gap-1.5 text-xs text-ink-muted">
          <span :class="['legend-dot', `type-${type}`]" aria-hidden="true" />{{ $t(`calendar.types.${type}`) }}
        </span>
        <button v-if="editable" type="button" class="btn-primary" @click="openNew(today)">+ {{ $t('calendar.add') }}</button>
      </div>
    </div>

    <p v-if="error" role="alert" class="panel border-danger-line bg-danger-soft text-danger px-4 py-3 text-sm">{{ error }}</p>

    <!-- TAB 1: Month grid -->
    <div v-if="activeTab === 'calendar'" class="panel overflow-hidden">
      <div class="grid grid-cols-7 border-b border-line bg-surface-2">
        <div v-for="w in weekdayNames" :key="w" class="px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted text-center">{{ w }}</div>
      </div>
      <div class="grid grid-cols-7">
        <div
          v-for="cell in cells"
          :key="cell.ymd"
          :class="['day-cell', { 'other-month': !cell.inMonth, closed: closedOn(cell.ymd), clickable: editable }]"
          @click="editable && openNew(cell.ymd)"
        >
          <span :class="['day-no', { today: cell.ymd === today }]">{{ cell.day }}</span>
          <button
            v-for="e in eventsOn(cell.ymd).slice(0, 3)"
            :key="e.eventId"
            type="button"
            :class="['chip', `type-${e.type}`]"
            :title="title(e)"
            @click.stop="openEvent(e)"
          >{{ title(e) }}</button>
          <span v-if="eventsOn(cell.ymd).length > 3" class="text-[11px] text-ink-subtle px-1">+{{ eventsOn(cell.ymd).length - 3 }}</span>
        </div>
      </div>
    </div>

    <!-- TAB 2: Agenda: the month's events as a list -->
    <section v-else class="panel overflow-hidden">
      <div class="px-5 py-3.5 flex items-center justify-between border-b border-line bg-surface-2">
        <h3 class="text-sm font-semibold uppercase tracking-wider text-ink-muted">{{ $t('calendar.this_month') }} ({{ monthTitle }})</h3>
        <span class="text-xs text-ink-muted">{{ monthEvents.length }} {{ $t('common.items') || 'events' }}</span>
      </div>
      <LoadingSpinner v-if="loading" />
      <p v-else-if="!monthEvents.length" class="py-12 text-center text-sm text-ink-subtle">{{ $t('calendar.empty') }}</p>
      <ul v-else class="divide-y divide-line">
        <li v-for="e in monthEvents" :key="e.eventId">
          <button type="button" class="w-full text-left px-5 py-3.5 flex items-start gap-4 hover:bg-surface-2 transition-colors" @click="openEvent(e)">
            <span :class="['legend-dot mt-1.5', `type-${e.type}`]" aria-hidden="true" />
            <span class="min-w-0 flex-1">
              <span class="flex flex-wrap items-center gap-2">
                <span class="font-semibold text-sm">{{ title(e) }}</span>
                <span v-if="e.schoolClosed" class="badge-danger">{{ $t('calendar.closed') }}</span>
              </span>
              <span class="block text-xs text-ink-subtle tnum mt-0.5">{{ rangeText(e) }} · {{ $t(`calendar.types.${e.type}`) }}</span>
              <span v-if="description(e)" class="block text-sm text-ink-muted mt-1 line-clamp-2">{{ description(e) }}</span>
            </span>
          </button>
        </li>
      </ul>
    </section>

    <!-- View (read-only portals) -->
    <AppModal v-if="!editable" :open="!!viewing" :title="viewing ? title(viewing) : ''" :subtitle="viewing ? rangeText(viewing) : ''" size="sm" @update:open="viewing = null">
      <div v-if="viewing" class="flex flex-col gap-3">
        <div class="flex flex-wrap gap-2">
          <span :class="['chip-static', `type-${viewing.type}`]">{{ $t(`calendar.types.${viewing.type}`) }}</span>
          <span v-if="viewing.schoolClosed" class="badge-danger">{{ $t('calendar.closed') }}</span>
        </div>
        <p v-if="description(viewing)" class="text-sm whitespace-pre-line">{{ description(viewing) }}</p>
      </div>
    </AppModal>

    <!-- Add / edit (admin) -->
    <AppModal v-if="editable" v-model:open="form.open" :title="form.eventId ? $t('calendar.edit') : $t('calendar.add')" size="md">
      <form id="event-form" class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="save">
        <div class="flex flex-col gap-1.5">
          <label for="ev-title-lo" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('calendar.title_lo') }}</label>
          <input id="ev-title-lo" v-model.trim="form.titleLo" required maxlength="150" class="input-field">
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="ev-title-en" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('calendar.title_en') }}</label>
          <input id="ev-title-en" v-model.trim="form.titleEn" required maxlength="150" class="input-field">
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="ev-type" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('calendar.type') }}</label>
          <select id="ev-type" v-model="form.type" class="input-field" @change="form.schoolClosed = form.type === 'holiday'">
            <option v-for="type in TYPES" :key="type" :value="type">{{ $t(`calendar.types.${type}`) }}</option>
          </select>
        </div>
        <label class="flex items-start gap-3 cursor-pointer sm:pt-6">
          <input v-model="form.schoolClosed" type="checkbox" class="mt-0.5 h-4 w-4 accent-primary">
          <span class="text-sm">{{ $t('calendar.school_closed') }}<span class="block text-xs text-ink-subtle">{{ $t('calendar.school_closed_hint') }}</span></span>
        </label>
        <div class="flex flex-col gap-1.5">
          <label for="ev-start" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('calendar.start') }}</label>
          <input id="ev-start" v-model="form.startDate" type="date" required class="input-field tnum" @change="keepEndAfterStart">
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="ev-end" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('calendar.end') }}</label>
          <input id="ev-end" v-model="form.endDate" type="date" required :min="form.startDate" class="input-field tnum">
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="ev-desc-lo" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('calendar.description_lo') }}</label>
          <textarea id="ev-desc-lo" v-model.trim="form.descriptionLo" rows="3" maxlength="2000" class="input-field" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="ev-desc-en" class="text-xs font-semibold text-ink-muted uppercase tracking-wider">{{ $t('calendar.description_en') }}</label>
          <textarea id="ev-desc-en" v-model.trim="form.descriptionEn" rows="3" maxlength="2000" class="input-field" />
        </div>
        <p v-if="form.error" role="alert" class="sm:col-span-2 text-sm text-danger">{{ form.error }}</p>
      </form>
      <template #footer>
        <button v-if="form.eventId" type="button" class="btn-danger mr-auto" :disabled="form.saving" @click="remove">{{ $t('common.delete') }}</button>
        <button type="button" class="btn-secondary" :disabled="form.saving" @click="form.open = false">{{ $t('common.cancel') }}</button>
        <button type="submit" form="event-form" class="btn-primary" :disabled="form.saving">{{ form.saving ? $t('common.saving') : $t('settings.save') }}</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import AppModal from './AppModal.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import { calendarRepository, type SchoolEvent, type SchoolEventType } from '../infrastructure/api/CalendarRepository';
import { schoolToday } from '../utils/schoolDate';

const props = withDefaults(defineProps<{ editable?: boolean }>(), { editable: false });

const { t, locale } = useI18n();
const dialog = useDialog();

const activeTab = ref<'calendar' | 'agenda'>('calendar');
const TYPES: SchoolEventType[] = ['holiday', 'exam', 'activity', 'meeting', 'other'];
const today = schoolToday();

// Dates are handled as "YYYY-MM-DD" on the school calendar, computed in UTC so no device time zone shifts them.
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const utc = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00Z`);
const addDays = (s: string, n: number) => ymd(new Date(utc(s).getTime() + n * 86400000));

const month = ref(today.slice(0, 7)); // "YYYY-MM"
const events = ref<SchoolEvent[]>([]);
const loading = ref(false);
const error = ref('');

// Month and weekday names come from the translations, not Intl: browsers without
// Lao locale data would print English on the client while the server printed Lao.
const monthName = (m: number) => t(`calendar.month_${m}`);
const monthTitle = computed(() => `${monthName(Number(month.value.slice(5)))} ${month.value.slice(0, 4)}`);
const formatDay = (day: string) => `${Number(day.slice(8))} ${monthName(Number(day.slice(5, 7)))} ${day.slice(0, 4)}`;
// Monday first, as on a school timetable (day_0 is Sunday).
const weekdayNames = computed(() => [1, 2, 3, 4, 5, 6, 0].map((d) => t(`auto_absence.day_${d}`)));

/** Six full weeks around the month, starting on a Monday. */
const cells = computed(() => {
  const first = `${month.value}-01`;
  const start = addDays(first, -((utc(first).getUTCDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(start, i);
    return { ymd: d, day: Number(d.slice(8)), inMonth: d.startsWith(month.value) };
  });
});
const gridFrom = computed(() => cells.value[0]!.ymd);
const gridTo = computed(() => cells.value[41]!.ymd);

const startOf = (e: SchoolEvent) => e.startDate.slice(0, 10);
const endOf = (e: SchoolEvent) => e.endDate.slice(0, 10);
const eventsOn = (day: string) => events.value.filter((e) => startOf(e) <= day && endOf(e) >= day);
const closedOn = (day: string) => eventsOn(day).some((e) => e.schoolClosed);
const monthEvents = computed(() => {
  const from = `${month.value}-01`;
  const to = addDays(ymd(new Date(Date.UTC(Number(month.value.slice(0, 4)), Number(month.value.slice(5)), 1))), -1);
  return events.value.filter((e) => startOf(e) <= to && endOf(e) >= from);
});

const title = (e: SchoolEvent) => (locale.value === 'lo' ? e.titleLo : e.titleEn) || e.titleLo || e.titleEn;
const description = (e: SchoolEvent) => (locale.value === 'lo' ? e.descriptionLo : e.descriptionEn) || e.descriptionLo || e.descriptionEn || '';
const rangeText = (e: SchoolEvent) => (startOf(e) === endOf(e) ? formatDay(startOf(e)) : `${formatDay(startOf(e))} – ${formatDay(endOf(e))}`);

async function load() {
  loading.value = true;
  error.value = '';
  try {
    events.value = await calendarRepository.list(gridFrom.value, gridTo.value);
  } catch (err) {
    error.value = getErrorMessage(err, t('common.error'));
  } finally {
    loading.value = false;
  }
}
onMounted(load);

const shiftMonth = (n: number) => {
  const d = utc(`${month.value}-01`);
  month.value = ymd(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))).slice(0, 7);
  load();
};
const goToday = () => {
  month.value = today.slice(0, 7);
  load();
};

// ── Viewing / editing ──
const viewing = ref<SchoolEvent | null>(null);
const form = reactive({
  open: false, saving: false, error: '', eventId: null as number | null,
  titleLo: '', titleEn: '', type: 'activity' as SchoolEventType, schoolClosed: false,
  startDate: today, endDate: today, descriptionLo: '', descriptionEn: '',
});

const openNew = (day: string) => {
  Object.assign(form, {
    open: true, saving: false, error: '', eventId: null, titleLo: '', titleEn: '', type: 'activity', schoolClosed: false,
    startDate: day, endDate: day, descriptionLo: '', descriptionEn: '',
  });
};
const openEvent = (e: SchoolEvent) => {
  if (!props.editable) {
    viewing.value = e;
    return;
  }
  Object.assign(form, {
    open: true, saving: false, error: '', eventId: e.eventId, titleLo: e.titleLo, titleEn: e.titleEn, type: e.type,
    schoolClosed: e.schoolClosed, startDate: startOf(e), endDate: endOf(e),
    descriptionLo: e.descriptionLo ?? '', descriptionEn: e.descriptionEn ?? '',
  });
};
const keepEndAfterStart = () => {
  if (form.endDate < form.startDate) form.endDate = form.startDate;
};

async function save() {
  form.saving = true;
  form.error = '';
  try {
    await calendarRepository.save(form.eventId, {
      titleLo: form.titleLo, titleEn: form.titleEn, type: form.type, schoolClosed: form.schoolClosed,
      startDate: form.startDate, endDate: form.endDate,
      descriptionLo: form.descriptionLo || null, descriptionEn: form.descriptionEn || null,
    });
    form.open = false;
    await load();
  } catch (err) {
    form.error = getErrorMessage(err, t('common.error'));
  } finally {
    form.saving = false;
  }
}

async function remove() {
  const eventId = form.eventId;
  if (!eventId) return;
  form.open = false;
  const ok = await dialog.confirm({
    title: t('calendar.delete_title'),
    message: t('calendar.delete_msg', { title: form.titleLo || form.titleEn }),
    confirmLabel: t('common.delete'),
    tone: 'danger',
    onConfirm: () => calendarRepository.remove(eventId),
  });
  if (ok) await load();
}
</script>

<style scoped>
.day-cell {
  min-height: 4.5rem;
  padding: 0.25rem 0.375rem;
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
  border-right: 1px solid rgb(var(--line));
  border-bottom: 1px solid rgb(var(--line));
}
.day-cell:nth-child(7n) { border-right: 0; }
.day-cell.clickable { cursor: pointer; }
.day-cell.clickable:hover { background-color: rgb(var(--surface-2)); }
.day-cell.other-month { background-color: rgb(var(--surface-2) / 0.6); }
.day-cell.other-month .day-no { color: rgb(var(--ink-subtle)); }
.day-cell.closed { background-color: rgb(var(--danger-soft) / 0.6); }
.day-no {
  font-size: 0.7rem;
  font-weight: 600;
  width: 1.375rem;
  height: 1.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
}
.day-no.today { background-color: rgb(var(--primary)); color: white; }
.chip, .chip-static {
  display: block;
  max-width: 100%;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chip-static { display: inline-block; }
.legend-dot { width: 0.625rem; height: 0.625rem; border-radius: 9999px; flex-shrink: 0; display: inline-block; }
/* One colour per type, from the theme tokens so dark mode follows. */
.type-holiday { background-color: rgb(var(--danger-soft)); color: rgb(var(--danger)); }
.type-exam { background-color: rgb(var(--warning-soft)); color: rgb(var(--warning)); }
.type-activity { background-color: rgb(var(--primary-soft)); color: rgb(var(--primary-ink)); }
.type-meeting { background-color: rgb(var(--success-soft)); color: rgb(var(--success)); }
.type-other { background-color: rgb(var(--surface-2)); color: rgb(var(--ink-muted)); border: 1px solid rgb(var(--line)); }
.legend-dot.type-holiday { background-color: rgb(var(--danger)); }
.legend-dot.type-exam { background-color: rgb(var(--warning)); }
.legend-dot.type-activity { background-color: rgb(var(--primary)); }
.legend-dot.type-meeting { background-color: rgb(var(--success)); }
.legend-dot.type-other { background-color: rgb(var(--ink-subtle)); }
</style>
