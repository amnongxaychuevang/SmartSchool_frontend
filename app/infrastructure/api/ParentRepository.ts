import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export class ParentRepository {
  async getMyChildren() {
    return useApiClient()('/parents/me/children', { method: 'GET' });
  }

  async getChildAttendance(studentId: number) {
    return useApiClient()(`/parents/me/children/${studentId}/attendance`, { method: 'GET' });
  }

  async getChildGrades(studentId: number) {
    return useApiClient()(`/parents/me/children/${studentId}/grades`, { method: 'GET' });
  }

  async getChildWallet(studentId: number) {
    return useApiClient()(`/parents/me/children/${studentId}/wallet`, { method: 'GET' });
  }

  async getAnnouncements() {
    return useApiClient()('/parents/me/announcements', { method: 'GET' });
  }

  async getChildSchedule(studentId: number) {
    return useApiClient()(`/parents/me/children/${studentId}/schedule`, { method: 'GET' });
  }

  async getLeaveRequests(studentId: number) {
    return useApiClient()(`/parents/me/children/${studentId}/leave-requests`, { method: 'GET' });
  }

  async createLeaveRequest(studentId: number, data: { startDate: string, endDate: string, reason?: string, documentUrl?: string }) {
    return useApiClient()(`/parents/me/children/${studentId}/leave-requests`, { method: 'POST', body: data });
  }

  async getSpendingLimits(studentId: number) {
    return useApiClient()(`/parents/me/children/${studentId}/spending-limits`, { method: 'GET' });
  }

  async updateSpendingLimits(studentId: number, data: { dailyMax: number | null, weeklyMax: number | null, perTransactionMax: number | null, alertThreshold: number | null }) {
    return useApiClient()(`/parents/me/children/${studentId}/spending-limits`, { method: 'PUT', body: data });
  }

  async requestTopUp(data: { amount: number; proofOfPayment: string }) {
    return useApiClient()(API_ENDPOINTS.topUps.requests, { method: 'POST', body: data });
  }
}

export const parentRepository = new ParentRepository();
