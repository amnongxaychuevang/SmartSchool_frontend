import { defineStore } from 'pinia';
import { adminRepository } from '../../infrastructure/api/AdminRepository';
import { dashboardRepository } from '../../infrastructure/api/DashboardRepository';
import { settingsRepository } from '../../infrastructure/api/SettingsRepository';
import type { Student, StudentPayload } from '../../domain/models/Student';
import type { SchoolClass } from '../../domain/models/SchoolClass';
import type { User } from '../../domain/models/User';
import type { Teacher } from '../../domain/models/Teacher';
import type { Parent } from '../../domain/models/Parent';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    // Dashboard
    stats: null as any,
    statsLoading: false,

    // Students
    students: [] as Student[],
    studentsTotal: 0,
    studentsPage: 1,
    studentsSearch: '',
    studentsLoading: false,

    // Users
    users: [] as User[],
    usersTotal: 0,
    usersPage: 1,
    usersRoleFilter: '' as string,
    usersSearch: '',
    usersLoading: false,

    // Teachers
    teachers: [] as Teacher[],
    teachersTotal: 0,
    teachersPage: 1,
    teachersSearch: '',
    teachersLoading: false,

    // Parents
    parents: [] as Parent[],
    parentsTotal: 0,
    parentsPage: 1,
    parentsSearch: '',
    parentsLoading: false,

    // Classes
    classes: [] as SchoolClass[],
    classesTotal: 0,
    classesPage: 1,
    classesSearch: '',
    classesLoading: false,

    // Genders

    // Settings
    settings: null as any,
    settingsLoading: false,

    // Audit logs
    auditLogs: [] as any[],
    auditLogsTotal: 0,
    auditLogsPage: 1,
    auditLogsFilters: { userId: '', entityType: '', action: '' } as { userId: string; entityType: string; action: string },
    auditLogsLoading: false,

    error: null as string | null,
  }),

  actions: {
    async fetchSettings() {
      this.settingsLoading = true;
      try {
        const res = await settingsRepository.getSettings();
        this.settings = res.data;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.settingsLoading = false;
      }
    },

    async updateSettings(payload: any) {
      this.settingsLoading = true;
      try {
        const res = await settingsRepository.updateSettings(payload);
        this.settings = res.data;
        return res.data;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.settingsLoading = false;
      }
    },

    async fetchStats() {
      this.statsLoading = true;
      try {
        this.stats = await adminRepository.getDashboardStats();
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.statsLoading = false;
      }
    },

    async fetchStudents(params?: { search?: string; page?: number }) {
      this.studentsLoading = true;
      if (params?.search !== undefined) this.studentsSearch = params.search;
      if (params?.page !== undefined) this.studentsPage = params.page;
      try {
        const res = await adminRepository.getStudents({ search: this.studentsSearch, page: this.studentsPage, limit: 15 });
        this.students = res.students;
        this.studentsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.studentsLoading = false;
      }
    },

    async createStudent(payload: StudentPayload) {
      try {
        const newStudent = await adminRepository.createStudent(payload);
        this.students.unshift(newStudent);
        this.studentsTotal += 1;
        return newStudent;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async updateStudent(studentId: number, payload: StudentPayload) {
      try {
        const updatedStudent = await adminRepository.updateStudent(studentId, payload);
        const idx = this.students.findIndex(s => s.studentId === studentId);
        if (idx !== -1) {
          this.students[idx] = updatedStudent;
        }
        return updatedStudent;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async fetchUsers(params?: { role?: string; search?: string; page?: number }) {
      this.usersLoading = true;
      if (params?.role !== undefined) this.usersRoleFilter = params.role;
      if (params?.search !== undefined) this.usersSearch = params.search;
      if (params?.page !== undefined) this.usersPage = params.page;
      try {
        const res = await adminRepository.getUsers({ role: this.usersRoleFilter, search: this.usersSearch, page: this.usersPage, limit: 15 });
        this.users = res.users;
        this.usersTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.usersLoading = false;
      }
    },

    async createUser(payload: any) {
      try {
        const newUser = await adminRepository.createUser(payload);
        this.users.unshift(newUser);
        this.usersTotal += 1;
        return newUser;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async updateUser(userId: number, payload: any) {
      try {
        const updatedUser = await adminRepository.updateUser(userId, payload);
        const idx = this.users.findIndex(u => u.userId === userId);
        if (idx !== -1) {
          this.users[idx] = updatedUser;
        }
        return updatedUser;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    // Teachers
    async fetchTeachers(params?: { search?: string; page?: number }) {
      this.teachersLoading = true;
      if (params?.search !== undefined) this.teachersSearch = params.search;
      if (params?.page !== undefined) this.teachersPage = params.page;
      try {
        const res = await adminRepository.getTeachers({ search: this.teachersSearch, page: this.teachersPage, limit: 15 });
        this.teachers = res.teachers;
        this.teachersTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.teachersLoading = false;
      }
    },

    async createTeacher(payload: any) {
      try {
        const newTeacher = await adminRepository.createTeacher(payload);
        this.teachers.unshift(newTeacher);
        this.teachersTotal += 1;
        return newTeacher;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async updateTeacher(teacherId: number, payload: any) {
      try {
        const updatedTeacher = await adminRepository.updateTeacher(teacherId, payload);
        const idx = this.teachers.findIndex(t => t.teacherId === teacherId);
        if (idx !== -1) {
          this.teachers[idx] = updatedTeacher;
        }
        return updatedTeacher;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    // Parents
    async fetchParents(params?: { search?: string; page?: number }) {
      this.parentsLoading = true;
      if (params?.search !== undefined) this.parentsSearch = params.search;
      if (params?.page !== undefined) this.parentsPage = params.page;
      try {
        const res = await adminRepository.getParents({ search: this.parentsSearch, page: this.parentsPage, limit: 15 });
        this.parents = res.parents;
        this.parentsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.parentsLoading = false;
      }
    },

    async createParent(payload: any) {
      try {
        const newParent = await adminRepository.createParent(payload);
        this.parents.unshift(newParent);
        this.parentsTotal += 1;
        return newParent;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async updateParent(parentId: number, payload: any) {
      try {
        const updatedParent = await adminRepository.updateParent(parentId, payload);
        const idx = this.parents.findIndex(p => p.parentId === parentId);
        if (idx !== -1) {
          this.parents[idx] = updatedParent;
        }
        return updatedParent;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async fetchClasses(params?: { search?: string; page?: number }) {
      this.classesLoading = true;
      if (params?.search !== undefined) this.classesSearch = params.search;
      if (params?.page !== undefined) this.classesPage = params.page;
      try {
        const res = await adminRepository.getClasses({ search: this.classesSearch, page: this.classesPage, limit: 15 });
        this.classes = res.classes;
        this.classesTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.classesLoading = false;
      }
    },

    async createClass(payload: any) {
      try {
        const newClass = await adminRepository.createClass(payload);
        this.classes.unshift(newClass);
        this.classesTotal += 1;
        return newClass;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async updateClass(classId: number, payload: any) {
      try {
        const updatedClass = await adminRepository.updateClass(classId, payload);
        const idx = this.classes.findIndex(c => c.classId === classId);
        if (idx !== -1) {
          this.classes[idx] = updatedClass;
        }
        return updatedClass;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async deleteClass(classId: number) {
      try {
        await adminRepository.deleteClass(classId);
        this.classes = this.classes.filter(c => c.classId !== classId);
        this.classesTotal -= 1;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },

    async fetchAuditLogs(params?: { userId?: string; entityType?: string; action?: string; page?: number }) {
      this.auditLogsLoading = true;
      if (params?.userId !== undefined) this.auditLogsFilters.userId = params.userId;
      if (params?.entityType !== undefined) this.auditLogsFilters.entityType = params.entityType;
      if (params?.action !== undefined) this.auditLogsFilters.action = params.action;
      if (params?.page !== undefined) this.auditLogsPage = params.page;
      try {
        const res = await adminRepository.getAuditLogs({
          userId: this.auditLogsFilters.userId || undefined,
          entityType: this.auditLogsFilters.entityType || undefined,
          action: this.auditLogsFilters.action || undefined,
          page: this.auditLogsPage,
          limit: 20,
        });
        this.auditLogs = res.logs;
        this.auditLogsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.auditLogsLoading = false;
      }
    },
  },
});
