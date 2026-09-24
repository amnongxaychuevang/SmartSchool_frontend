import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';

export type ReportRange = 'today' | '7d' | '30d';
export type AttendanceBucket = 'present' | 'late' | 'excused' | 'absent' | 'unrecorded' | 'notArrived';

export interface ClassAttendance {
  classId: number;
  classNameEn: string;
  classNameLo: string;
  attended: number;
  expected: number;
  rate: number | null;
}

export interface AbsenceEntry {
  studentId: number;
  studentCode: string;
  fullNameEn: string;
  fullNameLo: string;
  classNameEn: string | null;
  classNameLo: string | null;
  date: string;
  status: 'excused' | 'absent' | 'unrecorded';
  leaveReason: string | null;
  /** Status of the absence notice sent to parents, or null when none was sent. */
  notification: 'pending' | 'sent' | 'failed' | null;
}

export interface AttendanceReport {
  range: ReportRange;
  schoolDays: number;
  students: number;
  attendanceRate: number | null;
  previousRate: number | null;
  breakdown: Record<AttendanceBucket, number>;
  notInClass: number;
  notArrivedToday: number;
  excusedShare: number | null;
  classes: ClassAttendance[];
  absentees: AbsenceEntry[];
}

export const reportRepository = {
  async getAttendance(range: ReportRange) {
    const res = await useApiClient()<ApiResponse<AttendanceReport>>(API_ENDPOINTS.reports.attendance, { method: 'GET', query: { range } });
    return res.data;
  },

  async notifyAbsence(studentId: number, date: string) {
    const res = await useApiClient()<ApiResponse<{ recipients: number; notification: 'pending' }>>(API_ENDPOINTS.reports.notifyAbsence, {
      method: 'POST',
      body: { studentId, date },
    });
    return res.data;
  },
};
