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
  classStudents?: { class: { classNameEn: string; classNameLo: string } }[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
