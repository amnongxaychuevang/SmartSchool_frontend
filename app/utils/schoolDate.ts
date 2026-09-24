// Today's date on the school's clock (Asia/Vientiane) as "YYYY-MM-DD" — the
// same calendar the backend uses for daily attendance, whatever the device zone.
export function schoolToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Vientiane', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Share of attended days (present or late) among recorded days, in percent with one decimal; null when nothing is recorded. */
export function attendanceRate(records: { status: string }[]): number | null {
  if (!records.length) return null;
  const attended = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  return Math.round((attended / records.length) * 1000) / 10;
}
