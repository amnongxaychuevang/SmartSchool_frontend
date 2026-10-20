import type { User } from './User';
import type { District, Province } from './Student';
import type { Gender } from './Gender';

export interface Teacher {
  teacherId: number;
  userId: number;
  employeeCode: string;
  gender?: Gender | null;
  specialization?: string | null;
  qualification?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  /** Salary transfer details — only on the single-teacher API, never in the list. */
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  province?: Omit<Province, 'districts'> | null;
  district?: District | null;
  village?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  
  user: User;
  /** Whether a login account has been opened for this teacher (Users page). */
  hasAccount?: boolean;
}

/** A teacher without a login account, offered on the Users page. */
export interface TeacherAccountCandidate {
  teacherId: number;
  employeeCode: string;
  specialization?: string | null;
  user: Pick<User, 'userId' | 'fullNameEn' | 'fullNameLo' | 'phoneNumber' | 'email' | 'avatarUrl'>;
}

/** A signed document (e.g. employment contract) kept for a teacher. */
export interface TeacherDocument {
  documentId: number;
  teacherId: number;
  title: string;
  originalName: string;
  sizeBytes: number;
  createdAt: string;
}
