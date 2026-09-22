import type { User } from './User';

export interface Parent {
  parentId: number;
  userId: number;
  occupationEn?: string | null;
  occupationLo?: string | null;
  addressEn?: string | null;
  addressLo?: string | null;
  emergencyContact?: string | null;
  lineId?: string | null;
  nationalId?: string | null;
  notesEn?: string | null;
  notesLo?: string | null;
  createdAt?: string;
  updatedAt?: string;

  user: User;
}
