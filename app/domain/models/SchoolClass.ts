// Pure domain entity for Class
export interface SchoolClass {
  classId: number;
  classNameEn: string;
  classNameLo: string;
  gradeLevelEn?: string;
  gradeLevelLo?: string;
  homeroomTeacherId?: number | null;
  academicYear: string;
  descriptionEn?: string | null;
  descriptionLo?: string | null;
  isActive?: boolean;
  homeroomTeacher?: { userId: number; fullNameEn: string; fullNameLo: string };
  _count?: { classStudents: number };
}
