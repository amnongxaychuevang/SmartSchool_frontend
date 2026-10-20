// Pure domain entity for Class
export interface SchoolClass {
  classId: number;
  classNameEn: string;
  classNameLo: string;
  gradeLevelEn?: string | null;
  gradeLevelLo?: string | null;
  homeroomTeacherId?: number | null;
  academicYear: string;
  homeroomTeacher?: { userId: number; fullNameEn: string; fullNameLo: string; avatarUrl?: string | null } | null;
  /** classStudents = students in the class now; classSubjects = subjects in the active term. */
  _count?: { classStudents: number; classSubjects?: number };
}

/** GET /classes/:id — the class with its current students and this term's subjects. */
export interface SchoolClassDetail extends SchoolClass {
  classStudents: {
    student: {
      studentId: number;
      studentCode: string;
      fullNameEn: string;
      fullNameLo: string;
      gender?: string | null;
      photoUrl?: string | null;
      status: string;
    };
  }[];
  classSubjects: {
    id: number;
    subject: { subjectId: number; subjectNameEn: string; subjectNameLo: string; subjectCode?: string | null };
    teacher?: { userId: number; fullNameEn: string; fullNameLo: string } | null;
  }[];
}

/** Slim teacher record for pickers (GET /teachers/options). `userId` is what classes reference. */
export interface TeacherOption {
  userId: number;
  employeeCode: string;
  fullNameEn: string;
  fullNameLo: string;
  avatarUrl?: string | null;
}
