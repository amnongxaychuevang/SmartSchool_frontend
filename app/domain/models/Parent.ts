import type { User } from './User';
import type { District, Province } from './Student';

export type Relationship = 'father' | 'mother' | 'guardian' | 'grandparent' | 'sibling' | 'uncle_aunt' | 'other';

/** A student linked to this parent (links are made on the student form). */
export interface ParentChild {
  relationship: Relationship;
  isPrimaryContact: boolean;
  student: {
    studentId: number;
    studentCode: string;
    fullNameEn: string;
    fullNameLo: string;
    photoUrl?: string | null;
    status: string;
  };
}

export interface Parent {
  parentId: number;
  userId: number;
  occupation?: string | null;
  provinceId?: number | null;
  districtId?: number | null;
  province?: Province | null;
  district?: District | null;
  village?: string | null;
  /** House no. / details. Older records may hold the whole address here. */
  address?: string | null;
  emergencyContact?: string | null;
  /** Only on the single-parent API, never in the list. */
  nationalId?: string | null;
  createdAt?: string;
  updatedAt?: string;

  user: User;
  studentLinks?: ParentChild[];
}

/** Slim parent record for pickers (GET /parents/options). `userId` is what student links reference. */
export interface ParentOption {
  userId: number;
  fullNameEn: string;
  fullNameLo: string;
  phoneNumber: string | null;
}
