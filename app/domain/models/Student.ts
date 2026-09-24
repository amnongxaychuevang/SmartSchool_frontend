// Pure domain entity for Student
export interface Student {
  studentId: number;
  studentCode: string;
  fullNameEn: string;
  fullNameLo: string;
  dateOfBirth?: string;
  gender?: string;
  photoUrl?: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  ethnicity?: string | null;
  bloodType?: string | null;
  birthPlace?: string | null;
  village?: string | null;
  district?: string | null;
  province?: string | null;
  address?: string | null;
  previousSchool?: string | null;
  medicalNotes?: string | null;
  notes?: string | null;
  // The API returns only the current academic year's class here.
  classStudents?: { class: { classId?: number; classNameEn: string; classNameLo: string } }[];
  parentStudents?: {
    parentUserId: number;
    relationship: string;
    isPrimaryContact: boolean;
    parent: { userId: number; fullNameEn: string; fullNameLo: string; phoneNumber?: string | null };
  }[];
}

/** Body for POST/PUT /students: student fields plus current class and parent links. */
export type StudentPayload = Record<string, unknown>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
