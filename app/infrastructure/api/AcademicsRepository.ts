import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

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
  }
};
