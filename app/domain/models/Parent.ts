import type { User } from './User';

export interface Parent {
  parentId: number;
  userId: number;
  occupation?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  lineId?: string | null;
  nationalId?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;

  user: User;
}
