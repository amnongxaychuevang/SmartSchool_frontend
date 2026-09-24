import { describe, it, expect } from 'vitest';
import { schoolToday, attendanceRate } from './schoolDate';

describe('schoolToday', () => {
  it('uses the Vientiane calendar date, not UTC', () => {
    // 20:30 UTC is already 03:30 the next morning in Vientiane (UTC+7).
    expect(schoolToday(new Date('2026-09-24T20:30:00Z'))).toBe('2026-09-25');
    expect(schoolToday(new Date('2026-09-24T10:00:00Z'))).toBe('2026-09-24');
  });
});

describe('attendanceRate', () => {
  it('counts present and late as attended', () => {
    expect(attendanceRate([{ status: 'present' }, { status: 'late' }, { status: 'absent' }, { status: 'excused' }])).toBe(50);
  });

  it('returns null when nothing is recorded, instead of inventing a rate', () => {
    expect(attendanceRate([])).toBeNull();
  });
});
