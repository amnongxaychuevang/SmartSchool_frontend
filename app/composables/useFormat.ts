import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Every date and time is shown on the school's clock, whatever the viewer's device zone.
const SCHOOL_TIME_ZONE = 'Asia/Vientiane';

type DateInput = string | number | Date | null | undefined;

const toDate = (value: DateInput) => {
  if (value === null || value === undefined || value === '') return null;
  // "YYYY-MM-DD" is a calendar date, not an instant: pin it to noon UTC so it
  // lands on the same day in Vientiane.
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Locale-aware formatting for dates, times, numbers and Lao kip.
 * Dates follow the UI language (Lao month names in Lao); numbers use comma
 * grouping in both languages, matching the design system ("₭ 450,000").
 */
export function useFormat() {
  const { locale } = useI18n();
  const dateLocale = computed(() => (locale.value === 'lo' ? 'lo-LA' : 'en-GB'));

  const fmt = (value: DateInput, options: Intl.DateTimeFormatOptions) => {
    const date = toDate(value);
    return date ? new Intl.DateTimeFormat(dateLocale.value, { timeZone: SCHOOL_TIME_ZONE, ...options }).format(date) : '—';
  };

  const number = (value: number | string | null | undefined, maximumFractionDigits = 0) => {
    if (value === null || value === undefined || value === '') return '—';
    const n = Number(value);
    return Number.isFinite(n) ? new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(n) : '—';
  };

  return {
    /** 24 ກ.ຍ. 2026 / 24 Sept 2026 */
    date: (value: DateInput) => fmt(value, { dateStyle: 'medium' }),
    /** 24 ກ.ຍ. 2026, 14:15 */
    dateTime: (value: DateInput) => fmt(value, { dateStyle: 'medium', timeStyle: 'short' }),
    /** 14:15 */
    time: (value: DateInput) => fmt(value, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    /** 14:15:08 */
    timeWithSeconds: (value: DateInput) => fmt(value, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }),
    /** ພະຫັດ / Thu */
    weekdayShort: (value: DateInput) => fmt(value, { weekday: 'short' }),
    /** 1,520,000 */
    number,
    /** ₭ 1,520,000 */
    kip: (value: number | string | null | undefined) => (number(value) === '—' ? '—' : `₭ ${number(value)}`),
    /** 94.2% */
    percent: (value: number | null | undefined, digits = 1) =>
      value === null || value === undefined ? '—' : `${number(value, digits)}%`,
  };
}
