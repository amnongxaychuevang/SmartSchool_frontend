// Pure domain entity for Student

/** From GET /students/meta/blood-types. `rh` is null when only the ABO group is known. */
export interface BloodTypeOption {
  code: string;
  group: string;
  rh: '+' | '-' | null;
}

/** From GET /provinces (reference data, districts nested). */
export interface District {
  districtId: number;
  nameLo: string;
  nameEn: string;
}
export interface Province {
  provinceId: number;
  nameLo: string;
  nameEn: string;
  districts: District[];
}

/** From GET /ethnicities (reference data). */
export interface Ethnicity {
  ethnicityId: number;
  code: string;
  nameLo: string;
  nameEn: string;
}

export interface Student {
  studentId: number;
  studentCode: string;
  fullNameEn: string;
  fullNameLo: string;
  dateOfBirth?: string;
  gender?: string;
  photoUrl?: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  ethnicityId?: number | null;
  bloodType?: string | null;
  birthPlace?: string | null;
  village?: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  province?: Omit<Province, 'districts'> | null;
  district?: District | null;
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
