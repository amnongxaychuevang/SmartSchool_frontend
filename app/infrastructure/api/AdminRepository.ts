import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, Paged } from './types';
import type { Payload } from '../../domain/models/Academics';
import type { User } from '../../domain/models/User';
import type { Teacher, TeacherAccountCandidate, TeacherDocument } from '../../domain/models/Teacher';
import type { Parent, ParentOption } from '../../domain/models/Parent';
import type { SchoolClass, SchoolClassDetail, TeacherOption } from '../../domain/models/SchoolClass';
import type { AuditLog, DashboardStats } from '../../domain/models/School';
import type { Student, StudentPayload, BloodTypeOption, Ethnicity, Province } from '../../domain/models/Student';

interface StudentsResponse {
  success: boolean;
  data: { students: Student[]; total: number; page: number; limit: number };
}

export const adminRepository = {
  async getStudents(params: { search?: string; page?: number; limit?: number; status?: string; classId?: number; gender?: string } = {}) {
    const query = new URLSearchParams();
    if (params.classId) query.set('classId', String(params.classId));
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.gender) query.set('gender', params.gender);

    const url = query.toString() ? `${API_ENDPOINTS.students.list}?${query}` : API_ENDPOINTS.students.list;
    const res = await useApiClient()<StudentsResponse>(url, { method: 'GET' });
    return res.data;
  },

  /** All provinces with their districts nested (no pagination). */
  async getProvinces() {
    const res = await useApiClient()<ApiResponse<{ provinces: Province[] }>>(API_ENDPOINTS.provinces, { method: 'GET' });
    return res.data.provinces;
  },

  async getEthnicities() {
    const res = await useApiClient()<ApiResponse<{ ethnicities: Ethnicity[] }>>(API_ENDPOINTS.ethnicities, { method: 'GET' });
    return res.data.ethnicities;
  },

  async getBloodTypes() {
    const res = await useApiClient()<ApiResponse<{ bloodTypes: BloodTypeOption[] }>>(API_ENDPOINTS.students.metaBloodTypes, { method: 'GET' });
    return res.data.bloodTypes;
  },

  async getStudentStatuses() {
    const res = await useApiClient()<{ success: boolean; data: { statuses: { code: string; labelKey: string }[] } }>(API_ENDPOINTS.students.metaStatuses, { method: 'GET' });
    return res.data.statuses;
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

  async uploadStudentPhoto(studentId: number, file: File) {
    const body = new FormData();
    body.append('photo', file);
    const res = await useApiClient()<ApiResponse<{ student: Student }>>(`${API_ENDPOINTS.students.list}/${studentId}/photo`, { method: 'POST', body });
    return res.data.student;
  },

  async deleteStudentPhoto(studentId: number) {
    const res = await useApiClient()<ApiResponse<{ student: Student }>>(`${API_ENDPOINTS.students.list}/${studentId}/photo`, { method: 'DELETE' });
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

  /** Teachers that have no login account yet. */
  async getTeacherAccountCandidates() {
    const res = await useApiClient()<ApiResponse<{ teachers: TeacherAccountCandidate[] }>>(API_ENDPOINTS.users.teacherCandidates, { method: 'GET' });
    return res.data.teachers;
  },

  /** Opens a login account for an existing teacher (their phone/email is the login name). */
  async openTeacherAccount(payload: { teacherId: number; roleId: number; password: string }) {
    const res = await useApiClient()<ApiResponse<{ user: User }>>(API_ENDPOINTS.users.teacherAccount, { method: 'POST', body: payload });
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

  async getTeachers(params: { search?: string; page?: number; limit?: number; status?: string; gender?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    if (params.gender) query.set('gender', params.gender);

    const url = query.toString() ? `${API_ENDPOINTS.teachers.list}?${query}` : API_ENDPOINTS.teachers.list;
    const res = await useApiClient()<ApiResponse<Paged<'teachers', Teacher>>>(url, { method: 'GET' });
    return res.data;
  },

  async getTeacher(teacherId: number) {
    const res = await useApiClient()<ApiResponse<{ teacher: Teacher }>>(`${API_ENDPOINTS.teachers.list}/${teacherId}`, { method: 'GET' });
    return res.data.teacher;
  },

  async getTeacherDocuments(teacherId: number) {
    const res = await useApiClient()<ApiResponse<{ documents: TeacherDocument[] }>>(`${API_ENDPOINTS.teachers.list}/${teacherId}/documents`, { method: 'GET' });
    return res.data.documents;
  },

  async uploadTeacherDocument(teacherId: number, file: File, title: string) {
    const body = new FormData();
    body.append('title', title);
    body.append('file', file);
    const res = await useApiClient()<ApiResponse<{ document: TeacherDocument }>>(`${API_ENDPOINTS.teachers.list}/${teacherId}/documents`, { method: 'POST', body });
    return res.data.document;
  },

  async deleteTeacherDocument(teacherId: number, documentId: number) {
    await useApiClient()(`${API_ENDPOINTS.teachers.list}/${teacherId}/documents/${documentId}`, { method: 'DELETE' });
  },

  /** The PDF itself: private, so it is fetched with the login token rather than linked directly. */
  async fetchTeacherDocumentFile(teacherId: number, documentId: number) {
    return useApiClient()<Blob>(`${API_ENDPOINTS.teachers.list}/${teacherId}/documents/${documentId}/file`, { method: 'GET', responseType: 'blob' });
  },

  async uploadTeacherPhoto(teacherId: number, file: File) {
    const body = new FormData();
    body.append('photo', file);
    const res = await useApiClient()<ApiResponse<{ teacher: Teacher }>>(`${API_ENDPOINTS.teachers.list}/${teacherId}/photo`, { method: 'POST', body });
    return res.data.teacher;
  },

  async deleteTeacherPhoto(teacherId: number) {
    const res = await useApiClient()<ApiResponse<{ teacher: Teacher }>>(`${API_ENDPOINTS.teachers.list}/${teacherId}/photo`, { method: 'DELETE' });
    return res.data.teacher;
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

  async getParents(params: { search?: string; page?: number; limit?: number; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);

    const url = query.toString() ? `${API_ENDPOINTS.parents.list}?${query}` : API_ENDPOINTS.parents.list;
    const res = await useApiClient()<ApiResponse<Paged<'parents', Parent>>>(url, { method: 'GET' });
    return res.data;
  },

  /** Every active parent (no pagination), for pickers. */
  async getParentOptions() {
    const res = await useApiClient()<ApiResponse<{ parents: ParentOption[] }>>(API_ENDPOINTS.parents.options, { method: 'GET' });
    return res.data.parents;
  },

  async getParent(parentId: number) {
    const res = await useApiClient()<ApiResponse<{ parent: Parent }>>(`${API_ENDPOINTS.parents.list}/${parentId}`, { method: 'GET' });
    return res.data.parent;
  },

  async uploadParentPhoto(parentId: number, file: File) {
    const body = new FormData();
    body.append('photo', file);
    const res = await useApiClient()<ApiResponse<{ parent: Parent }>>(`${API_ENDPOINTS.parents.list}/${parentId}/photo`, { method: 'POST', body });
    return res.data.parent;
  },

  async deleteParentPhoto(parentId: number) {
    const res = await useApiClient()<ApiResponse<{ parent: Parent }>>(`${API_ENDPOINTS.parents.list}/${parentId}/photo`, { method: 'DELETE' });
    return res.data.parent;
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

  async getClasses(params: { search?: string; page?: number; limit?: number; academicYear?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.academicYear) query.set('academicYear', params.academicYear);

    const url = query.toString() ? `${API_ENDPOINTS.classes.list}?${query}` : API_ENDPOINTS.classes.list;
    const res = await useApiClient()<ApiResponse<Paged<'classes', SchoolClass>>>(url, { method: 'GET' });
    return res.data;
  },

  async getAllClasses() {
    const res = await useApiClient()<ApiResponse<SchoolClass[]>>(`${API_ENDPOINTS.classes.list}/all`, { method: 'GET' });
    return res.data;
  },

  async getClass(classId: number) {
    const res = await useApiClient()<ApiResponse<{ class: SchoolClassDetail }>>(`${API_ENDPOINTS.classes.list}/${classId}`, { method: 'GET' });
    return res.data.class;
  },

  /** Every academic year used by a class or a term, newest first. */
  async getClassAcademicYears() {
    const res = await useApiClient()<ApiResponse<{ academicYears: string[] }>>(API_ENDPOINTS.classes.academicYears, { method: 'GET' });
    return res.data.academicYears;
  },

  /** Every active teacher (no pagination), for pickers. */
  async getTeacherOptions() {
    const res = await useApiClient()<ApiResponse<{ teachers: TeacherOption[] }>>(API_ENDPOINTS.teachers.options, { method: 'GET' });
    return res.data.teachers;
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

  async getFinanceOverview() {
    const res = await useApiClient()<ApiResponse<{ incomeToday: number; expensesToday: number; currentBalance: number }>>(API_ENDPOINTS.dashboard.financeOverview, { method: 'GET' });
    return res.data;
  },

  async getTopPerformers() {
    const res = await useApiClient()<ApiResponse<{ classes: any[] }>>(API_ENDPOINTS.dashboard.topPerformers, { method: 'GET' });
    return res.data;
  },

  async getAnnouncements(limit: number = 5) {
    const url = `${API_ENDPOINTS.dashboard.announcements}?limit=${limit}`;
    const res = await useApiClient()<ApiResponse<{ announcements: any[] }>>(url, { method: 'GET' });
    return res.data;
  },

  async getUpcomingEvents(limit: number = 5) {
    const url = `${API_ENDPOINTS.dashboard.upcomingEvents}?limit=${limit}`;
    const res = await useApiClient()<ApiResponse<{ events: any[] }>>(url, { method: 'GET' });
    return res.data;
  },

  async getAuditLogs(params: { search?: string; userId?: number | string; entityType?: string; action?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
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
