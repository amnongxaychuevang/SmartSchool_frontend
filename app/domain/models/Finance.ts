import type { StudentRef, UserRef } from './Academics';

// Decimal columns come back from the API as strings (e.g. "15000.00").
export type Money = number | string;

export interface Wallet {
  walletId: number;
  studentId: number;
  balance: Money;
  status: 'active' | 'frozen';
  currencyCode: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  student?: StudentRef & { spendingLimit?: { dailyMax: Money | null } | null };
  transactions?: WalletTransaction[];
}

export interface WalletTransaction {
  transactionId: number;
  walletId: number;
  shopId: number | null;
  transactionType: 'top_up' | 'purchase' | 'refund';
  amount: Money;
  balanceBefore: Money;
  balanceAfter: Money;
  descriptionEn: string | null;
  descriptionLo: string | null;
  referenceNo: string | null;
  createdAt: string;
  shop?: { shopId: number; shopNameEn: string; shopNameLo: string } | null;
  processor?: { userId: number; fullNameEn: string; fullNameLo: string } | null;
  /** Set on a purchase that has been refunded (a purchase is refunded at most once). */
  refund?: { transactionId: number; createdAt: string } | null;
  refundOfId?: number | null;
}

export interface StudentCard {
  cardId: number;
  cardUid: string;
  status: 'active' | 'lost' | 'deactivated';
  issuedDate: string;
  expiredDate: string | null;
  notes: string | null;
}

export interface TopUpRequest {
  requestId: number;
  studentId: number;
  parentUserId: number;
  amount: Money;
  method: 'cash' | 'mobile_banking' | 'admin_manual';
  methodLabelEn?: string | null;
  methodLabelLo?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason: string | null;
  slipUrl: string | null;
  requestedAt: string;
  processedAt: string | null;
  transactionId: number | null;
  student?: StudentRef;
  parentRequester?: UserRef & { phoneNumber?: string | null };
  approver?: UserRef | null;
}

export interface Shop {
  shopId: number;
  shopNameEn: string;
  shopNameLo: string;
  locationEn: string | null;
  locationLo: string | null;
  descriptionEn: string | null;
  descriptionLo: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SpendingLimit {
  limitId: number;
  studentId: number;
  dailyMax: Money | null;
  weeklyMax: Money | null;
  perTransactionMax: Money | null;
  alertThreshold: Money | null;
  blockedShops: number[];
  notes: string | null;
}

export interface FeeType {
  feeTypeId: number;
  nameEn: string;
  nameLo: string;
  descriptionEn: string | null;
  descriptionLo: string | null;
  isActive: boolean;
  _count?: { structures: number };
}

export interface FeeStructure {
  feeStructureId: number;
  feeTypeId: number;
  academicYear: string;
  termId: number | null;
  classId: number | null;
  amount: Money;
  dueDate: string;
  notes: string | null;
  createdAt: string;
  feeType?: { feeTypeId: number; nameEn: string; nameLo: string };
  term?: { termId: number; termNameEn: string; termNameLo: string } | null;
  class?: { classId: number; classNameEn: string; classNameLo: string } | null;
  invoiceCount?: number;
  billed?: number;
  collected?: number;
}

export interface Invoice {
  invoiceId: number;
  invoiceNo: string;
  studentId: number;
  feeStructureId: number;
  amount: number;
  discount: number;
  paidAmount: number;
  amountDue: number;
  outstanding: number;
  overdue: boolean;
  status: 'unpaid' | 'partial' | 'paid' | 'void';
  dueDate: string;
  voidReason: string | null;
  notes: string | null;
  issuedAt: string;
  student?: {
    studentId: number;
    studentCode: string;
    fullNameEn: string;
    fullNameLo: string;
    class?: { classId: number; classNameEn: string; classNameLo: string } | null;
  };
  feeStructure?: {
    feeStructureId: number;
    academicYear: string;
    feeType?: { feeTypeId: number; nameEn: string; nameLo: string };
    term?: { termId: number; termNameEn: string; termNameLo: string } | null;
  };
  payments?: FeePayment[];
}

export interface FeePayment {
  paymentId: number;
  receiptNo: string;
  invoiceId: number;
  amount: number;
  method: 'cash' | 'bank_transfer';
  referenceNo: string | null;
  notes: string | null;
  paidAt: string;
  receiver?: { userId: number; fullNameEn: string; fullNameLo: string };
}
