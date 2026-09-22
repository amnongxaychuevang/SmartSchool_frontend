// Pure domain entity — no UI state, no HTTP, no framework dependencies.
export interface User {
  userId: number;
  fullNameEn: string;
  fullNameLo: string;
  role: 'admin' | 'teacher' | 'parent';
  langPref: 'en' | 'lo';
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  lastLogin?: string | null;
  isActive?: boolean;
}
