import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, Paged } from './types';
import type { ScheduleSlot } from './AcademicsRepository';
import type { Student } from '../../domain/models/Student';
import type { SchoolClass } from '../../domain/models/SchoolClass';
import type { Payload } from '../../domain/models/Academics';
import type { Announcement, LeaveRequest } from '../../domain/models/School';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export interface DailyAttendanceRecord {
  studentId: number;
  status: AttendanceStatus;
  source: 'card' | 'teacher' | 'leave';
  firstCheckIn: string | null;
  note: string | null;
}

export class TeacherRepository {
  async getMyClasses() {
    // Assuming backend filters by logged-in teacher role
    return useApiClient()<ApiResponse<Paged<'classes', SchoolClass>>>(API_ENDPOINTS.classes.list, { method: 'GET' });
  }

  async getMyStudents(classId: number) {
    return useApiClient()<ApiResponse<Paged<'students', Student>>>(`${API_ENDPOINTS.students.list}?classId=${classId}`, { method: 'GET' });
  }

  async getDailyAttendance(classId: number, date: string) {
    return useApiClient()<{ success: boolean; data: { records: DailyAttendanceRecord[] } }>(
      `${API_ENDPOINTS.attendance.daily}?classId=${classId}&date=${date}`, { method: 'GET' });
  }

  async saveAttendance(classId: number, date: string, records: { studentId: number; status: AttendanceStatus; note?: string }[]) {
    return useApiClient()(API_ENDPOINTS.attendance.daily, { method: 'PUT', body: { classId, date, records } });
  }

  async saveGrades(records: Payload[]) {
    const results = [];
    for (const record of records) {
      const res = await useApiClient()(API_ENDPOINTS.grades.list, { method: 'POST', body: record });
      results.push(res);
    }
    return results;
  }

  async getSchedules() {
    return useApiClient()<ApiResponse<ScheduleSlot[]>>(API_ENDPOINTS.schedules.list, { method: 'GET' });
  }

  async getAnnouncements() {
    return useApiClient()<ApiResponse<Announcement[]>>(API_ENDPOINTS.announcements.base, { method: 'GET' });
  }

  async getLeaveRequests(params: { status?: LeaveRequest['status']; page?: number; limit?: number } = {}) {
    return useApiClient()<ApiResponse<Paged<'requests', LeaveRequest>>>(API_ENDPOINTS.leaveRequests.list, { method: 'GET', query: params });
  }

  async updateLeaveRequestStatus(leaveId: number, status: 'approved' | 'rejected') {
    return useApiClient()<ApiResponse<{ request: LeaveRequest }>>(`${API_ENDPOINTS.leaveRequests.list}/${leaveId}/status`, { method: 'PUT', body: { status } });
  }
}

export const teacherRepository = new TeacherRepository();
