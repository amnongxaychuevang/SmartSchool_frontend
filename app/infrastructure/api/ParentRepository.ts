import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';
import type { ScheduleSlot } from './AcademicsRepository';
import type { Student } from '../../domain/models/Student';
import type { Grade } from '../../domain/models/Academics';
import type { Wallet, SpendingLimit, TopUpRequest } from '../../domain/models/Finance';
import type { Announcement, DailyAttendance, LeaveRequest } from '../../domain/models/School';

export class ParentRepository {
  async getMyChildren() {
    return useApiClient()<ApiResponse<Student[]>>('/parents/me/children', { method: 'GET' });
  }

  async getChildAttendance(studentId: number) {
    return useApiClient()<ApiResponse<DailyAttendance[]>>(`/parents/me/children/${studentId}/attendance`, { method: 'GET' });
  }

  async getChildGrades(studentId: number) {
    return useApiClient()<ApiResponse<Grade[]>>(`/parents/me/children/${studentId}/grades`, { method: 'GET' });
  }

  async getChildWallet(studentId: number) {
    return useApiClient()<ApiResponse<Wallet | null>>(`/parents/me/children/${studentId}/wallet`, { method: 'GET' });
  }

  async getAnnouncements() {
    return useApiClient()<ApiResponse<Announcement[]>>('/parents/me/announcements', { method: 'GET' });
  }

  async getChildSchedule(studentId: number) {
    return useApiClient()<ApiResponse<ScheduleSlot[]>>(`/parents/me/children/${studentId}/schedule`, { method: 'GET' });
  }

  async getLeaveRequests(studentId: number) {
    return useApiClient()<ApiResponse<LeaveRequest[]>>(`/parents/me/children/${studentId}/leave-requests`, { method: 'GET' });
  }

  async createLeaveRequest(studentId: number, data: { startDate: string, endDate: string, reason?: string, documentUrl?: string }) {
    return useApiClient()<ApiResponse<LeaveRequest>>(`/parents/me/children/${studentId}/leave-requests`, { method: 'POST', body: data });
  }

  async getSpendingLimits(studentId: number) {
    return useApiClient()<ApiResponse<SpendingLimit | null>>(`/parents/me/children/${studentId}/spending-limits`, { method: 'GET' });
  }

  async updateSpendingLimits(studentId: number, data: { dailyMax: number | null, weeklyMax: number | null, perTransactionMax: number | null, alertThreshold: number | null }) {
    return useApiClient()<ApiResponse<SpendingLimit>>(`/parents/me/children/${studentId}/spending-limits`, { method: 'PUT', body: data });
  }

  async requestTopUp(data: { amount: number; proofOfPayment: string }) {
    return useApiClient()<ApiResponse<{ request: TopUpRequest }>>(API_ENDPOINTS.topUps.requests, { method: 'POST', body: data });
  }
}

export const parentRepository = new ParentRepository();
