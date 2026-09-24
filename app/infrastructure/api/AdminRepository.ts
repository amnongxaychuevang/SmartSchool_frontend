import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { Student } from '../../domain/models/Student';

interface StudentsResponse {
  success: boolean;
  data: { students: Student[]; total: number; page: number; limit: number };
}

export const adminRepository = {
  async getStudents(params: { search?: string; page?: number; limit?: number; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);

    const url = query.toString() ? `${API_ENDPOINTS.students.list}?${query}` : API_ENDPOINTS.students.list;
    const res = await useApiClient()<StudentsResponse>(url, { method: 'GET' });
    return res.data;
  },

  async createStudent(payload: { studentCode: string; fullNameEn: string; fullNameLo: string; gender: string; status: string }) {
    const res = await useApiClient()<{ success: boolean; data: { student: Student } }>(API_ENDPOINTS.students.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create student');
    return res.data.student;
  },

  async updateStudent(studentId: number, payload: Partial<{ studentCode: string; fullNameEn: string; fullNameLo: string; gender: string; status: Student['status'] }>) {
    const res = await useApiClient()<{ success: boolean; data: { student: Student } }>(`${API_ENDPOINTS.students.list}/${studentId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update student');
    return res.data.student;
  },

  async getUsers(params: { role?: string; search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.users.list}?${query}` : API_ENDPOINTS.users.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async createUser(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { user: any } }>(API_ENDPOINTS.users.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create user');
    return res.data.user;
  },

  async updateUser(userId: number, payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { user: any } }>(`${API_ENDPOINTS.users.list}/${userId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update user');
    return res.data.user;
  },

  async getTeachers(params: { search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.teachers.list}?${query}` : API_ENDPOINTS.teachers.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async createTeacher(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { teacher: any } }>(API_ENDPOINTS.teachers.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create teacher');
    return res.data.teacher;
  },

  async updateTeacher(teacherId: number, payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { teacher: any } }>(`${API_ENDPOINTS.teachers.list}/${teacherId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update teacher');
    return res.data.teacher;
  },

  async getParents(params: { search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.parents.list}?${query}` : API_ENDPOINTS.parents.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async createParent(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { parent: any } }>(API_ENDPOINTS.parents.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create parent');
    return res.data.parent;
  },

  async updateParent(parentId: number, payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { parent: any } }>(`${API_ENDPOINTS.parents.list}/${parentId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update parent');
    return res.data.parent;
  },

  async getClasses(params: { search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.classes.list}?${query}` : API_ENDPOINTS.classes.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async createClass(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { class: any } }>(API_ENDPOINTS.classes.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create class');
    return res.data.class;
  },

  async updateClass(classId: number, payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { class: any } }>(`${API_ENDPOINTS.classes.list}/${classId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update class');
    return res.data.class;
  },

  async deleteClass(classId: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.classes.list}/${classId}`, {
      method: 'DELETE'
    });
    if (!res.success) throw new Error('Failed to delete class');
    return true;
  },

  async getDashboardStats() {
    const res = await useApiClient()<any>(API_ENDPOINTS.dashboard.stats, { method: 'GET' });
    return res.data;
  },


  async getAuditLogs(params: { userId?: number | string; entityType?: string; action?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.userId) query.set('userId', String(params.userId));
    if (params.entityType) query.set('entityType', params.entityType);
    if (params.action) query.set('action', params.action);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.auditLogs.list}?${query}` : API_ENDPOINTS.auditLogs.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },
};
