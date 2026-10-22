export type PayrollStatus = 'draft' | 'approved' | 'paid';
export type PayrollItemStatus = 'pending' | 'paid';

export interface PayrollTeacherInfo {
  teacherId: number;
  teacherCode: string;
  fullNameEn: string;
  fullNameLo: string;
  phone: string;
  department?: string | null;
  position?: string | null;
  photoUrl?: string | null;
}

export interface PayrollItem {
  itemId: number;
  periodId: number;
  teacherId: number;
  baseSalary: number;
  teachingAllowance: number;
  attendanceBonus: number;
  otherAllowance: number;
  absenceDeduction: number;
  taxDeduction: number;
  otherDeduction: number;
  netSalary: number;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  paymentStatus: PayrollItemStatus;
  paidAt: string | null;
  slipUrl?: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  teacher?: PayrollTeacherInfo;
}

export interface PayrollPeriod {
  periodId: number;
  periodMonth: string; // YYYY-MM
  startDate: string;
  endDate: string;
  status: PayrollStatus;
  totalTeachers: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  notes: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  items?: PayrollItem[];
}
