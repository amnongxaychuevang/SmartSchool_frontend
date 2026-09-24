import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface AcademicTerm {
  termId: number;
  academicYear: string;
  termNameEn: string;
  termNameLo: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
}

type Named = { fullNameEn: string; fullNameLo: string };
export interface ClassSubject {
  id: number;
  classId: number;
  subjectId: number;
  teacherId: number | null;
  termId: number;
  class: { classId: number; classNameEn: string; classNameLo: string; academicYear: string };
  subject: { subjectId: number; subjectCode: string | null; subjectNameEn: string; subjectNameLo: string };
  teacher: (Named & { userId: number }) | null;
  term: Pick<AcademicTerm, 'termId' | 'termNameEn' | 'termNameLo' | 'academicYear' | 'status'>;
}

export const academicsRepository = {
  // Subjects
  async getSubjects(params: { search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.subjects.list}?${query}` : API_ENDPOINTS.subjects.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async createSubject(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { subject: any } }>(API_ENDPOINTS.subjects.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create subject');
    return res.data.subject;
  },

  async updateSubject(subjectId: number, payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { subject: any } }>(`${API_ENDPOINTS.subjects.list}/${subjectId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update subject');
    return res.data.subject;
  },

  async deleteSubject(subjectId: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.subjects.list}/${subjectId}`, {
      method: 'DELETE'
    });
    if (!res.success) throw new Error('Failed to delete subject');
    return true;
  },

  // Grades
  async getGrades(params: { classId?: number; subjectId?: number; studentId?: number; academicYear?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.classId) query.set('classId', String(params.classId));
    if (params.subjectId) query.set('subjectId', String(params.subjectId));
    if (params.studentId) query.set('studentId', String(params.studentId));
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.grades.list}?${query}` : API_ENDPOINTS.grades.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async getGradeTypes() {
    const res = await useApiClient()<any>(API_ENDPOINTS.grades.types, { method: 'GET' });
    return res.data;
  },

  async createGrade(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { grade: any } }>(API_ENDPOINTS.grades.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create grade');
    return res.data.grade;
  },

  async updateGrade(gradeId: number, payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { grade: any } }>(`${API_ENDPOINTS.grades.list}/${gradeId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update grade');
    return res.data.grade;
  },

  async deleteGrade(gradeId: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.grades.list}/${gradeId}`, {
      method: 'DELETE'
    });
    if (!res.success) throw new Error('Failed to delete grade');
    return true;
  },

  // Cards
  async getCards(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.cards.list}?${query}` : API_ENDPOINTS.cards.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async createCard(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { card: any } }>(API_ENDPOINTS.cards.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create card');
    return res.data.card;
  },

  async updateCard(cardId: number, payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { card: any } }>(`${API_ENDPOINTS.cards.list}/${cardId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update card');
    return res.data.card;
  },

  async deleteCard(cardId: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.cards.list}/${cardId}`, {
      method: 'DELETE'
    });
    if (!res.success) throw new Error('Failed to delete card');
    return true;
  },

  // Notifications
  async getNotifications(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.notifications.list}?${query}` : API_ENDPOINTS.notifications.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async createNotification(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { notification: any } }>(API_ENDPOINTS.notifications.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to send notification');
    return res.data.notification;
  },

  // Academic terms
  async getTerms() {
    const res = await useApiClient()<{ success: boolean; data: { terms: AcademicTerm[] } }>(API_ENDPOINTS.academicTerms.list, { method: 'GET' });
    return res.data.terms;
  },
  async saveTerm(termId: number | null, payload: Omit<AcademicTerm, 'termId'>) {
    const url = termId ? `${API_ENDPOINTS.academicTerms.list}/${termId}` : API_ENDPOINTS.academicTerms.list;
    const res = await useApiClient()<{ success: boolean; data: { term: AcademicTerm } }>(url, { method: termId ? 'PUT' : 'POST', body: payload });
    return res.data.term;
  },
  async deleteTerm(termId: number) {
    await useApiClient()(`${API_ENDPOINTS.academicTerms.list}/${termId}`, { method: 'DELETE' });
  },

  // Class subjects: which subject is taught to which class, by whom, in which term
  async getClassSubjects(params: { classId?: number; subjectId?: number; termId?: number } = {}) {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) query.set(k, String(v));
    const res = await useApiClient()<{ success: boolean; data: { classSubjects: ClassSubject[] } }>(
      `${API_ENDPOINTS.classSubjects.list}?${query}`, { method: 'GET' });
    return res.data.classSubjects;
  },
  async createClassSubject(payload: { classId: number; subjectId: number; termId?: number; teacherId?: number | null }) {
    const res = await useApiClient()<{ success: boolean; data: { classSubject: ClassSubject } }>(API_ENDPOINTS.classSubjects.list, { method: 'POST', body: payload });
    return res.data.classSubject;
  },
  async setClassSubjectTeacher(id: number, teacherId: number | null) {
    const res = await useApiClient()<{ success: boolean; data: { classSubject: ClassSubject } }>(`${API_ENDPOINTS.classSubjects.list}/${id}`, { method: 'PUT', body: { teacherId } });
    return res.data.classSubject;
  },
  async deleteClassSubject(id: number) {
    await useApiClient()(`${API_ENDPOINTS.classSubjects.list}/${id}`, { method: 'DELETE' });
  },
};
