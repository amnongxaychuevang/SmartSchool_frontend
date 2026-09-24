import { defineStore } from 'pinia';
import { academicsRepository } from '../../infrastructure/api/AcademicsRepository';
import type { Subject, Grade, GradeType, Card, AppNotification, Payload } from '../../domain/models/Academics';
import { getErrorMessage } from '../../utils/errors';

export const useAcademicsStore = defineStore('academics', {
  state: () => ({
    subjects: [] as Subject[],
    subjectsTotal: 0,
    subjectsPage: 1,
    subjectsSearch: '',
    subjectsLoading: false,

    grades: [] as Grade[],
    gradesTotal: 0,
    gradesPage: 1,
    gradesLoading: false,
    gradeTypes: [] as GradeType[],

    cards: [] as Card[],
    cardsTotal: 0,
    cardsPage: 1,
    cardsSearch: '',
    cardsStatusFilter: '',
    cardsLoading: false,

    notifications: [] as AppNotification[],
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
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.subjectsLoading = false;
      }
    },
    async createSubject(payload: Payload) {
      try {
        const newSubject = await academicsRepository.createSubject(payload);
        this.subjects.unshift(newSubject);
        this.subjectsTotal += 1;
        return newSubject;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async updateSubject(subjectId: number, payload: Payload) {
      try {
        const updated = await academicsRepository.updateSubject(subjectId, payload);
        const idx = this.subjects.findIndex(s => s.subjectId === subjectId);
        if (idx !== -1) {
          this.subjects[idx] = updated;
        }
        return updated;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async deleteSubject(subjectId: number) {
      try {
        await academicsRepository.deleteSubject(subjectId);
        this.subjects = this.subjects.filter(s => s.subjectId !== subjectId);
        this.subjectsTotal -= 1;
      } catch (err) {
        this.error = getErrorMessage(err);
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
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.gradesLoading = false;
      }
    },
    async fetchGradeTypes() {
      try {
        const res = await academicsRepository.getGradeTypes();
        // The API returns { gradeTypes } (reading res.types left the list always empty).
        this.gradeTypes = res.gradeTypes ?? [];
      } catch (err) {
        this.error = getErrorMessage(err);
      }
    },
    async createGrade(payload: Payload) {
      try {
        const newGrade = await academicsRepository.createGrade(payload);
        this.grades.unshift(newGrade);
        this.gradesTotal += 1;
        return newGrade;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async updateGrade(gradeId: number, payload: Payload) {
      try {
        const updated = await academicsRepository.updateGrade(gradeId, payload);
        const idx = this.grades.findIndex(g => g.gradeId === gradeId);
        if (idx !== -1) {
          this.grades[idx] = updated;
        }
        return updated;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async deleteGrade(gradeId: number) {
      try {
        await academicsRepository.deleteGrade(gradeId);
        this.grades = this.grades.filter(g => g.gradeId !== gradeId);
        this.gradesTotal -= 1;
      } catch (err) {
        this.error = getErrorMessage(err);
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
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.cardsLoading = false;
      }
    },
    async createCard(payload: Payload) {
      try {
        const newCard = await academicsRepository.createCard(payload);
        this.cards.unshift(newCard);
        this.cardsTotal += 1;
        return newCard;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async updateCard(cardId: number, payload: Payload) {
      try {
        const updated = await academicsRepository.updateCard(cardId, payload);
        const idx = this.cards.findIndex(c => c.cardId === cardId);
        if (idx !== -1) {
          this.cards[idx] = updated;
        }
        return updated;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async deleteCard(cardId: number) {
      try {
        await academicsRepository.deleteCard(cardId);
        this.cards = this.cards.filter(c => c.cardId !== cardId);
        this.cardsTotal -= 1;
      } catch (err) {
        this.error = getErrorMessage(err);
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
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.notificationsLoading = false;
      }
    },
    async createNotification(payload: Payload) {
      try {
        const newNotif = await academicsRepository.createNotification(payload);
        this.notifications.unshift(newNotif);
        this.notificationsTotal += 1;
        return newNotif;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    }
  }
});
