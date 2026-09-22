import type { User } from './User';

export interface Teacher {
  teacherId: number;
  userId: number;
  employeeCode: string;
  specialization?: string | null;
  qualificationEn?: string | null;
  qualificationLo?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  addressEn?: string | null;
  addressLo?: string | null;
  notesEn?: string | null;
  notesLo?: string | null;
  createdAt?: string;
  updatedAt?: string;
  
  user: User;
}
