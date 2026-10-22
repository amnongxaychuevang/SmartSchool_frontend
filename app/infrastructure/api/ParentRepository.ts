import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';
import type { ScheduleSlot } from './AcademicsRepository';
import type { Student } from '../../domain/models/Student';
import type { Grade } from '../../domain/models/Academics';
import type { Wallet, SpendingLimit, TopUpRequest, StudentCard, Invoice } from '../../domain/models/Finance';
import type { Announcement, DailyAttendance, LeaveRequest } from '../../domain/models/School';
import type { PaymentInfo } from '../../application/stores/settings';

interface Bilingual { nameEn?: string; nameLo?: string }
export interface ChildBehavior {
  summary: { finalScore: number; totalMerits: number; totalDemerits: number; rating: 'excellent' | 'good' | 'fair' | 'needs_improvement' };
  records: {
    recordId: number; type: 'merit' | 'demerit'; titleEn: string; titleLo: string; description: string | null;
    points: number; incidentDate: string; actionTaken: string | null; category: (Bilingual & { categoryId: number }) | null;
  }[];
}
export interface BusStop { nameEn?: string; nameLo?: string; time?: string }
export interface BusVehicleInfo { plateNumber: string; model: string | null; driverName: string; driverPhone: string }
export interface ChildTransport {
  assignment: {
    pickupStop: string | null; dropoffStop: string | null; isActive: boolean;
    vehicle: BusVehicleInfo | null;
    route: { routeId?: number; routeNameEn: string; routeNameLo: string; description: string | null; stops: BusStop[] | null; vehicle: BusVehicleInfo | null };
  } | null;
  logs: {
    logId: number; logType: 'board' | 'alight'; direction: 'to_school' | 'to_home'; logTime: string; location: string | null;
    vehicle: { plateNumber: string } | null; route: { routeNameEn: string; routeNameLo: string } | null;
  }[];
}
export interface ChildLoan {
  loanId: number; borrowedDate: string; dueDate: string; returnedDate: string | null; renewCount: number;
  status: 'borrowed' | 'returned' | 'overdue' | 'lost';
  book: { titleEn: string; titleLo: string; author: string };
}

export interface ChildAssignmentSubmission {
  submissionId: number;
  assignmentId: number;
  studentId: number;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  gradedAt: string | null;
  grader?: { fullNameEn: string; fullNameLo: string } | null;
}

export interface ChildAssignment {
  assignmentId: number;
  title: string;
  description: string | null;
  dueDate: string;
  subject: { subjectNameEn: string; subjectNameLo: string } | null;
  creator: { fullNameEn: string; fullNameLo: string } | null;
  mySubmission?: ChildAssignmentSubmission | null;
}

export class ParentRepository {
  async getMyChildren() {
    return useApiClient()<ApiResponse<Student[]>>('/parents/me/children', { method: 'GET' });
  }

  async getChildAttendance(studentId: number) {
    return useApiClient()<ApiResponse<DailyAttendance[]>>(`/parents/me/children/${studentId}/attendance`, { method: 'GET' });
  }

  async getChildGrades(studentId: number) {
    return useApiClient()<ApiResponse<Grade[]>>(`/parents/me/children/${studentId}/grades`, { method: 'GET' });
  }

  async getChildWallet(studentId: number) {
    return useApiClient()<ApiResponse<Wallet | null>>(`/parents/me/children/${studentId}/wallet`, { method: 'GET' });
  }

  async getChildBehavior(studentId: number) {
    const res = await useApiClient()<ApiResponse<ChildBehavior>>(`/parents/me/children/${studentId}/behavior`, { method: 'GET' });
    return res.data;
  }

  async getChildTransport(studentId: number) {
    const res = await useApiClient()<ApiResponse<ChildTransport>>(`/parents/me/children/${studentId}/transport`, { method: 'GET' });
    return res.data;
  }

  async getChildLibrary(studentId: number) {
    const res = await useApiClient()<ApiResponse<{ loans: ChildLoan[] }>>(`/parents/me/children/${studentId}/library`, { method: 'GET' });
    return res.data.loans;
  }



  async getAnnouncements() {
    return useApiClient()<ApiResponse<Announcement[]>>('/parents/me/announcements', { method: 'GET' });
  }

  async getChildSchedule(studentId: number) {
    return useApiClient()<ApiResponse<ScheduleSlot[]>>(`/parents/me/children/${studentId}/schedule`, { method: 'GET' });
  }

  async getLeaveRequests(studentId: number) {
    return useApiClient()<ApiResponse<LeaveRequest[]>>(`/parents/me/children/${studentId}/leave-requests`, { method: 'GET' });
  }

  async createLeaveRequest(studentId: number, data: { startDate: string, endDate: string, reason?: string, documentUrl?: string }) {
    return useApiClient()<ApiResponse<LeaveRequest>>(`/parents/me/children/${studentId}/leave-requests`, { method: 'POST', body: data });
  }

  async getSpendingLimits(studentId: number) {
    return useApiClient()<ApiResponse<SpendingLimit | null>>(`/parents/me/children/${studentId}/spending-limits`, { method: 'GET' });
  }

  async updateSpendingLimits(studentId: number, data: { dailyMax: number | null, weeklyMax: number | null, perTransactionMax: number | null, alertThreshold: number | null }) {
    return useApiClient()<ApiResponse<SpendingLimit>>(`/parents/me/children/${studentId}/spending-limits`, { method: 'PUT', body: data });
  }

  /** The child's invoices (voided ones left out), each with its payments, newest due date first. */
  async getChildInvoices(studentId: number) {
    const res = await useApiClient()<ApiResponse<{ invoices: Invoice[] }>>(`/parents/me/children/${studentId}/invoices`, { method: 'GET' });
    return res.data.invoices;
  }

  async uploadSlip(file: File) {
    const formData = new FormData();
    formData.append('slip', file);
    return useApiClient()<ApiResponse<{ url: string }>>(API_ENDPOINTS.uploads.slip, { method: 'POST', body: formData });
  }

  async requestTopUp(data: { studentId: number; amount: number; method: string; slipUrl?: string }) {
    return useApiClient()<ApiResponse<{ request: TopUpRequest }>>(API_ENDPOINTS.topUps.requests, { method: 'POST', body: data });
  }

  /** The signed-in parent's own requests for one child (the server scopes it to this parent). */
  async getTopUpRequests(studentId: number) {
    const res = await useApiClient()<ApiResponse<{ requests: TopUpRequest[] }>>(
      `${API_ENDPOINTS.topUps.requests}?studentId=${studentId}&limit=10`,
      { method: 'GET' },
    );
    return res.data.requests;
  }

  async getChildCards(studentId: number) {
    const res = await useApiClient()<ApiResponse<StudentCard[]>>(`/parents/me/children/${studentId}/cards`, { method: 'GET' });
    return res.data;
  }

  /** Blocks the card at once (no taps, no purchases); only the school can issue a new one. */
  async reportCardLost(studentId: number, cardId: number) {
    const res = await useApiClient()<ApiResponse<StudentCard>>(`/parents/me/children/${studentId}/cards/${cardId}/report-lost`, { method: 'POST' });
    return res.data;
  }

  async getPaymentInfo() {
    const res = await useApiClient()<ApiResponse<PaymentInfo | null>>('/parents/me/payment-info', { method: 'GET' });
    return res.data;
  }

  async getChildAssignments(studentId: number): Promise<ChildAssignment[]> {
    const res = await useApiClient()<ApiResponse<{ assignments: ChildAssignment[] }>>(`/assignments/student/${studentId}`, { method: 'GET' });
    return res.data.assignments;
  }

  async submitAssignment(assignmentId: number, studentId: number, file: File) {
    const formData = new FormData();
    formData.append('studentId', String(studentId));
    formData.append('file', file);
    const res = await useApiClient()<ApiResponse<{ submission: ChildAssignmentSubmission }>>(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: formData,
    });
    return res.data.submission;
  }
}

export const parentRepository = new ParentRepository();
