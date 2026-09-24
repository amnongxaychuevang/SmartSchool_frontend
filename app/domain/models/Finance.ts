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
