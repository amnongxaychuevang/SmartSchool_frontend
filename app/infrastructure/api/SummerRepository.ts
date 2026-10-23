import { useApiClient } from './apiClient';
import type { ApiResponse } from './types';

export interface SummerCourse {
  courseId: number;
  academicYear: string;
  subjectNameEn: string;
  subjectNameLo: string;
  gradeLevel?: string | null;
  monthlyFee: number;
  teacherName?: string | null;
  roomNumber?: string | null;
  timeSlot?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface SummerStudent {
  studentId: number;
  studentCode: string;
  fullNameEn: string;
  fullNameLo: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  parentName: string;
  phoneNumber: string;
  notes?: string | null;
}

export interface SummerRegistrationItem {
  itemId: number;
  registrationId: number;
  courseId: number;
  monthNumber: number;
  courseFee: number;
  course: SummerCourse;
}

export interface SummerRegistration {
  registrationId: number;
  regNo: string;
  studentId: number;
  academicYear: string;
  monthsEnrolled: number[];
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  receiptNo: string | null;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
  student: SummerStudent;
  items: SummerRegistrationItem[];
  recorder?: {
    userId: number;
    fullNameLo: string;
    fullNameEn: string;
  } | null;
}

export interface SummerStats {
  totalStudents: number;
  totalRegistrations: number;
  totalRevenue: number;
  monthCounts: {
    month1: number;
    month2: number;
    month3: number;
  };
  monthRevenues: {
    month1: number;
    month2: number;
    month3: number;
  };
  courseStats: Array<{
    nameLo: string;
    nameEn: string;
    count: number;
    revenue: number;
  }>;
}

export const summerRepository = {
  async getCourses(params: { academicYear?: string; includeInactive?: boolean } = {}) {
    const q = new URLSearchParams();
    if (params.academicYear) q.set('academicYear', params.academicYear);
    if (params.includeInactive) q.set('includeInactive', 'true');
    const url = q.toString() ? `/summer/courses?${q}` : '/summer/courses';
    const res = await useApiClient()<ApiResponse<{ courses: SummerCourse[] }>>(url, { method: 'GET' });
    return res.data?.courses || [];
  },

  async createCourse(data: Partial<SummerCourse>) {
    const res = await useApiClient()<ApiResponse<{ course: SummerCourse }>>('/summer/courses', {
      method: 'POST',
      body: data,
    });
    return res.data?.course;
  },

  async updateCourse(id: number, data: Partial<SummerCourse>) {
    const res = await useApiClient()<ApiResponse<{ course: SummerCourse }>>(`/summer/courses/${id}`, {
      method: 'PUT',
      body: data,
    });
    return res.data?.course;
  },

  async deleteCourse(id: number) {
    return useApiClient()<ApiResponse<void>>(`/summer/courses/${id}`, {
      method: 'DELETE',
    });
  },

  async getRegistrations(params: {
    academicYear?: string;
    month?: number;
    search?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const q = new URLSearchParams();
    if (params.academicYear) q.set('academicYear', params.academicYear);
    if (params.month) q.set('month', String(params.month));
    if (params.search) q.set('search', params.search);
    if (params.paymentStatus) q.set('paymentStatus', params.paymentStatus);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));

    const url = q.toString() ? `/summer/registrations?${q}` : '/summer/registrations';
    const res = await useApiClient()<ApiResponse<{
      data: SummerRegistration[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>>(url, { method: 'GET' });

    return {
      registrations: res.data || [],
      pagination: (res as any).pagination || { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
  },

  async getRegistration(id: number) {
    const res = await useApiClient()<ApiResponse<{ registration: SummerRegistration }>>(`/summer/registrations/${id}`, {
      method: 'GET',
    });
    return res.data?.registration;
  },

  async registerStudent(data: {
    fullNameEn: string;
    fullNameLo: string;
    gender?: string;
    dateOfBirth?: string | null;
    parentName: string;
    phoneNumber: string;
    academicYear: string;
    monthsEnrolled: number[];
    courseIds: number[];
    paymentMethod: string;
    paidAmount?: number;
    notes?: string | null;
  }) {
    const res = await useApiClient()<ApiResponse<{ registration: SummerRegistration }>>('/summer/registrations', {
      method: 'POST',
      body: data,
    });
    return res.data?.registration;
  },

  async getStats(academicYear?: string) {
    const q = academicYear ? `?academicYear=${academicYear}` : '';
    const res = await useApiClient()<ApiResponse<{ stats: SummerStats }>>(`/summer/stats${q}`, {
      method: 'GET',
    });
    return res.data?.stats;
  },
};
