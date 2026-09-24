import type { Role } from './School';

// Pure domain entity — no UI state, no HTTP, no framework dependencies.
export interface User {
  userId: number;
  fullNameEn: string;
  fullNameLo: string;
  // Just the code for the logged-in user; the full role record in admin user lists.
  role: 'admin' | 'teacher' | 'parent' | Role;
  langPref: 'en' | 'lo';
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  lastLogin?: string | null;
  isActive?: boolean;
}
