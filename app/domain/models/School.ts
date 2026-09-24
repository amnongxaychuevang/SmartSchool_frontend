import type { StudentRef, UserRef } from './Academics';
import type { Money } from './Finance';

export interface Role {
  roleId: number;
  code: 'admin' | 'teacher' | 'parent' | string;
  nameEn: string;
  nameLo: string;
}

export interface AuditLog {
  auditId: number;
  userId: number | null;
  action: string;
  entityType: string;
  entityId: string | null;
  detail: unknown;
  ipAddress: string | null;
  createdAt: string;
  user?: UserRef | null;
}

export interface Announcement {
  announcementId: number;
  titleEn: string;
  titleLo: string;
  contentEn: string;
  contentLo: string;
  targetAudience: 'all' | 'teachers' | 'parents' | 'class';
  classId?: number | null;
  class?: { classNameEn: string; classNameLo: string } | null;
  publishDate: string;
  expiryDate?: string | null;
  author?: UserRef;
}

export interface LeaveRequest {
  leaveId: number;
  studentId: number;
  parentUserId: number;
  startDate: string;
  endDate: string;
  reason: string | null;
  documentUrl: string | null;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  student?: StudentRef;
  parent?: UserRef & { phoneNumber?: string | null };
  approver?: UserRef | null;
}

/** One student's attendance for one school day. */
export interface DailyAttendance {
  id: number;
  date: string; // "YYYY-MM-DDT00:00:00.000Z" — a calendar date
  status: 'present' | 'absent' | 'late' | 'excused';
  firstCheckIn: string | null;
  note: string | null;
}

export interface AttendanceLog {
  logId: number;
  studentId: number;
  logType: 'check_in' | 'check_out';
  logTime: string;
  gateLocationEn: string | null;
  gateLocationLo: string | null;
}

/** Payload of the POST /attendance/scan response and the live-feed socket event. */
export interface ScanResult {
  success: boolean;
  logType: 'check_in' | 'check_out';
  studentId: number;
  time: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  transactionsToday: { count: number; totalAmount: Money };
  attendanceTrend: { date: string; present: number; absent: number }[];
  walletTrend: { date: string; totalAmount: number }[];
}
