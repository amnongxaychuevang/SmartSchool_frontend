import type { User } from './User';

export interface Teacher {
  teacherId: number;
  userId: number;
  employeeCode: string;
  specialization?: string | null;
  qualification?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  
  user: User;
}
