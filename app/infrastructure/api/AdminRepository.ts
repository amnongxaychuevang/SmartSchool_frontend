import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, Paged } from './types';
import type { Payload } from '../../domain/models/Academics';
import type { User } from '../../domain/models/User';
import type { Teacher } from '../../domain/models/Teacher';
import type { Parent } from '../../domain/models/Parent';
import type { SchoolClass } from '../../domain/models/SchoolClass';
import type { AuditLog, DashboardStats } from '../../domain/models/School';
import type { Student, StudentPayload } from '../../domain/models/Student';

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

  async getStudent(studentId: number) {
    const res = await useApiClient()<{ success: boolean; data: { student: Student } }>(`${API_ENDPOINTS.students.list}/${studentId}`, { method: 'GET' });
    return res.data.student;
  },

  async createStudent(payload: StudentPayload) {
    const res = await useApiClient()<{ success: boolean; data: { student: Student } }>(API_ENDPOINTS.students.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create student');
    return res.data.student;
  },

  async updateStudent(studentId: number, payload: StudentPayload) {
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
    const res = await useApiClient()<ApiResponse<Paged<'users', User>>>(url, { method: 'GET' });
    return res.data;
  },

  async createUser(payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ user: User }>>(API_ENDPOINTS.users.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create user');
    return res.data.user;
  },

  async updateUser(userId: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ user: User }>>(`${API_ENDPOINTS.users.list}/${userId}`, {
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
    const res = await useApiClient()<ApiResponse<Paged<'teachers', Teacher>>>(url, { method: 'GET' });
    return res.data;
  },

  async createTeacher(payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ teacher: Teacher }>>(API_ENDPOINTS.teachers.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create teacher');
    return res.data.teacher;
  },

  async updateTeacher(teacherId: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ teacher: Teacher }>>(`${API_ENDPOINTS.teachers.list}/${teacherId}`, {
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
    const res = await useApiClient()<ApiResponse<Paged<'parents', Parent>>>(url, { method: 'GET' });
    return res.data;
  },

  async createParent(payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ parent: Parent }>>(API_ENDPOINTS.parents.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create parent');
    return res.data.parent;
  },

  async updateParent(parentId: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ parent: Parent }>>(`${API_ENDPOINTS.parents.list}/${parentId}`, {
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
    const res = await useApiClient()<ApiResponse<Paged<'classes', SchoolClass>>>(url, { method: 'GET' });
    return res.data;
  },

  async createClass(payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ class: SchoolClass }>>(API_ENDPOINTS.classes.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create class');
    return res.data.class;
  },

  async updateClass(classId: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ class: SchoolClass }>>(`${API_ENDPOINTS.classes.list}/${classId}`, {
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
    const res = await useApiClient()<ApiResponse<DashboardStats>>(API_ENDPOINTS.dashboard.stats, { method: 'GET' });
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
    const res = await useApiClient()<ApiResponse<Paged<'logs', AuditLog>>>(url, { method: 'GET' });
    return res.data;
  },
};
