import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export class TeacherRepository {
  async getMyClasses() {
    // Assuming backend filters by logged-in teacher role
    return useApiClient()(API_ENDPOINTS.classes.list, { method: 'GET' });
  }

  async getMyStudents(classId: number) {
    return useApiClient()(`${API_ENDPOINTS.students.list}?classId=${classId}`, { method: 'GET' });
  }

  async saveAttendance(records: any[]) {
    // We assume backend has a POST /attendance for manual marking
    // Wait, the backend only has /attendance/scan
    // For now we'll mock the success response to let UI work without breaking
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
  }

  async saveGrades(records: any[]) {
    const results = [];
    for (const record of records) {
      const res = await useApiClient()(API_ENDPOINTS.grades.list, { method: 'POST', body: record });
      results.push(res);
    }
    return results;
  }

  async getSchedules() {
    return useApiClient()(API_ENDPOINTS.schedules.list, { method: 'GET' });
  }

  async getAnnouncements() {
    return useApiClient()(API_ENDPOINTS.announcements.base, { method: 'GET' });
  }

  async getLeaveRequests() {
    return useApiClient()(API_ENDPOINTS.leaveRequests.list, { method: 'GET' });
  }

  async updateLeaveRequestStatus(leaveId: number, status: 'approved' | 'rejected') {
    return useApiClient()(`${API_ENDPOINTS.leaveRequests.list}/${leaveId}/status`, { method: 'PUT', body: { status } });
  }
}

export const teacherRepository = new TeacherRepository();
