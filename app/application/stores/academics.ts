import { defineStore } from 'pinia';
import { academicsRepository } from '../../infrastructure/api/AcademicsRepository';

export const useAcademicsStore = defineStore('academics', {
  state: () => ({
    subjects: [] as any[],
    subjectsTotal: 0,
    subjectsPage: 1,
    subjectsSearch: '',
    subjectsLoading: false,

    grades: [] as any[],
    gradesTotal: 0,
    gradesPage: 1,
    gradesLoading: false,
    gradeTypes: [] as string[],

    cards: [] as any[],
    cardsTotal: 0,
    cardsPage: 1,
    cardsSearch: '',
    cardsStatusFilter: '',
    cardsLoading: false,

    notifications: [] as any[],
    notificationsTotal: 0,
    notificationsPage: 1,
    notificationsSearch: '',
    notificationsLoading: false,

    error: null as string | null,
  }),
  actions: {
    // Subjects
    async fetchSubjects(params?: { search?: string; page?: number; limit?: number }) {
      this.subjectsLoading = true;
      if (params?.search !== undefined) this.subjectsSearch = params.search;
      if (params?.page !== undefined) this.subjectsPage = params.page;
      try {
        const res = await academicsRepository.getSubjects({ search: this.subjectsSearch, page: this.subjectsPage, limit: params?.limit || 15 });
        this.subjects = res.subjects;
        this.subjectsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.subjectsLoading = false;
      }
    },
    async createSubject(payload: any) {
      try {
        const newSubject = await academicsRepository.createSubject(payload);
        this.subjects.unshift(newSubject);
        this.subjectsTotal += 1;
        return newSubject;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async updateSubject(subjectId: number, payload: any) {
      try {
        const updated = await academicsRepository.updateSubject(subjectId, payload);
        const idx = this.subjects.findIndex(s => s.subjectId === subjectId);
        if (idx !== -1) {
          this.subjects[idx] = updated;
        }
        return updated;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async deleteSubject(subjectId: number) {
      try {
        await academicsRepository.deleteSubject(subjectId);
        this.subjects = this.subjects.filter(s => s.subjectId !== subjectId);
        this.subjectsTotal -= 1;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    // Grades
    async fetchGrades(params?: { classId?: number; subjectId?: number; studentId?: number; academicYear?: string; page?: number }) {
      this.gradesLoading = true;
      if (params?.page !== undefined) this.gradesPage = params.page;
      try {
        const res = await academicsRepository.getGrades({ ...params, limit: 50 });
        this.grades = res.grades;
        this.gradesTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.gradesLoading = false;
      }
    },
    async fetchGradeTypes() {
      try {
        const res = await academicsRepository.getGradeTypes();
        this.gradeTypes = res.types;
      } catch (err: any) {
        this.error = err.message;
      }
    },
    async createGrade(payload: any) {
      try {
        const newGrade = await academicsRepository.createGrade(payload);
        this.grades.unshift(newGrade);
        this.gradesTotal += 1;
        return newGrade;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async updateGrade(gradeId: number, payload: any) {
      try {
        const updated = await academicsRepository.updateGrade(gradeId, payload);
        const idx = this.grades.findIndex(g => g.gradeId === gradeId);
        if (idx !== -1) {
          this.grades[idx] = updated;
        }
        return updated;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async deleteGrade(gradeId: number) {
      try {
        await academicsRepository.deleteGrade(gradeId);
        this.grades = this.grades.filter(g => g.gradeId !== gradeId);
        this.gradesTotal -= 1;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    // Cards
    async fetchCards(params?: { search?: string; status?: string; page?: number }) {
      this.cardsLoading = true;
      if (params?.search !== undefined) this.cardsSearch = params.search;
      if (params?.status !== undefined) this.cardsStatusFilter = params.status;
      if (params?.page !== undefined) this.cardsPage = params.page;
      try {
        const res = await academicsRepository.getCards({ search: this.cardsSearch, status: this.cardsStatusFilter, page: this.cardsPage, limit: 15 });
        this.cards = res.cards;
        this.cardsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.cardsLoading = false;
      }
    },
    async createCard(payload: any) {
      try {
        const newCard = await academicsRepository.createCard(payload);
        this.cards.unshift(newCard);
        this.cardsTotal += 1;
        return newCard;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async updateCard(cardId: number, payload: any) {
      try {
        const updated = await academicsRepository.updateCard(cardId, payload);
        const idx = this.cards.findIndex(c => c.cardId === cardId);
        if (idx !== -1) {
          this.cards[idx] = updated;
        }
        return updated;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async deleteCard(cardId: number) {
      try {
        await academicsRepository.deleteCard(cardId);
        this.cards = this.cards.filter(c => c.cardId !== cardId);
        this.cardsTotal -= 1;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    // Notifications
    async fetchNotifications(params?: { search?: string; status?: string; page?: number }) {
      this.notificationsLoading = true;
      if (params?.search !== undefined) this.notificationsSearch = params.search;
      if (params?.page !== undefined) this.notificationsPage = params.page;
      try {
        const res = await academicsRepository.getNotifications({ search: this.notificationsSearch, status: params?.status, page: this.notificationsPage, limit: 15 });
        this.notifications = res.notifications;
        this.notificationsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.notificationsLoading = false;
      }
    },
    async createNotification(payload: any) {
      try {
        const newNotif = await academicsRepository.createNotification(payload);
        this.notifications.unshift(newNotif);
        this.notificationsTotal += 1;
        return newNotif;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    }
  }
});
