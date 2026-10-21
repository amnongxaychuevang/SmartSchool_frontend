import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';

export type ReceiptKind = 'fee' | 'topup';

interface ReceiptBase {
  receiptNo: string;
  date: string;
  amount: number;
  /** fee: cash | bank_transfer — top-up: cash | mobile_banking | admin_manual */
  method: string;
  referenceNo: string | null;
  receivedBy: { fullNameEn: string; fullNameLo: string } | null;
  student: {
    studentId: number; studentCode: string; fullNameEn: string; fullNameLo: string;
    class: { classNameEn: string; classNameLo: string } | null;
  };
  school: { nameEn: string; nameLo: string; addressEn: string; addressLo: string; phone: string; email: string };
}

export type Receipt =
  | (ReceiptBase & {
    kind: 'fee';
    fee: {
      invoiceNo: string; feeTypeEn: string; feeTypeLo: string; academicYear: string;
      termEn: string | null; termLo: string | null;
      amountDue: number; paidToDate: number; outstanding: number;
    };
  })
  | (ReceiptBase & { kind: 'topup'; topup: { balanceBefore: number; balanceAfter: number } });

export const receiptRepository = {
  /** `id` is the fee payment's id, or the top-up wallet transaction's id. */
  async get(kind: ReceiptKind, id: number) {
    const res = await useApiClient()<ApiResponse<{ receipt: Receipt }>>(`${API_ENDPOINTS.receipts}/${kind}/${id}`, { method: 'GET' });
    return res.data.receipt;
  },
};
