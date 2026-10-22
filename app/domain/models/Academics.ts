// Shapes returned by the academics endpoints (subjects, grades, cards, notifications).

export interface StudentRef {
  studentId: number;
  studentCode: string;
  fullNameEn: string;
  fullNameLo: string;
  photoUrl?: string | null;
  bloodType?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  classStudents?: Array<{
    class?: {
      classId?: number;
      classNameEn?: string;
      classNameLo?: string;
    } | null;
  }>;
  parentStudents?: Array<{
    parent?: {
      phoneNumber?: string | null;
      user?: {
        fullNameEn?: string;
        fullNameLo?: string;
        phoneNumber?: string | null;
      } | null;
    } | null;
  }>;
}

/** Minimal user reference (teacher, approver, author, ...). */
export interface UserRef {
  userId?: number;
  fullNameEn: string;
  fullNameLo: string;
}

export interface Subject {
  subjectId: number;
  subjectCode: string | null;
  subjectNameEn: string;
  subjectNameLo: string;
  descriptionEn?: string | null;
  descriptionLo?: string | null;
  credits: number | string;
  isActive: boolean;
}

export interface GradeType {
  typeId: number;
  typeNameEn: string;
  typeNameLo: string;
  weightPercent?: number | string;
}

export interface Grade {
  gradeId: number;
  studentId: number;
  classSubjectId: number;
  classId: number;
  subjectId: number;
  teacherId: number;
  gradeTypeId: number | null;
  score: number | string | null;
  maxScore: number | string;
  gradeMonth: string | null;
  remarks: string | null;
  isPublished: boolean;
  recordedAt: string;
  student?: StudentRef;
  subject?: Pick<Subject, 'subjectId' | 'subjectNameEn' | 'subjectNameLo'>;
  class?: { classId: number; classNameEn: string; classNameLo: string };
  term?: { termId: number; termNameEn: string; termNameLo: string; academicYear: string };
  teacher?: UserRef;
  gradeType?: GradeType | null;
}

export interface Card {
  cardId: number;
  cardUid: string;
  studentId: number;
  issuedDate: string;
  expiredDate: string | null;
  status: 'active' | 'lost' | 'deactivated';
  notes: string | null;
  student?: StudentRef;
}

export interface AppNotification {
  notificationId: number;
  recipientUserId: number;
  studentId: number | null;
  type: 'check_in' | 'check_out' | 'absence' | 'grade' | 'transaction' | 'general' | 'fee';
  channel: 'whatsapp' | 'app_push' | 'email';
  messageEn: string;
  messageLo: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  recipient?: UserRef;
  student?: StudentRef | null;
}

/** Body for create/update calls: the fields of the form being saved. */
export type Payload = Record<string, unknown>;
