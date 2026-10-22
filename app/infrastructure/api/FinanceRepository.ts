import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse, Paged } from './types';
import type { Payload } from '../../domain/models/Academics';
import type { Wallet, WalletTransaction, TopUpRequest, Shop, ShopRentalPayment, SpendingLimit, FeeType, FeeStructure, Invoice, FeePayment, Expense, ExpenseCategory } from '../../domain/models/Finance';

export interface PosCard {
  cardUid: string;
  student: {
    studentId: number;
    studentCode: string;
    fullNameEn: string;
    fullNameLo: string;
    photoUrl: string | null;
    class: { classId: number; classNameEn: string; classNameLo: string } | null;
  };
  /** null until the student's first top-up creates a wallet. */
  wallet: { balance: number; status: 'active' | 'frozen' } | null;
}

export const financeRepository = {
  // Wallets
  async getWallets(params: { search?: string; page?: number; limit?: number; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);

    const url = query.toString() ? `${API_ENDPOINTS.wallets.list}?${query}` : API_ENDPOINTS.wallets.list;
    const res = await useApiClient()<ApiResponse<Paged<'wallets', Wallet>>>(url, { method: 'GET' });
    return res.data;
  },

  async updateWalletStatus(walletId: number, status: Wallet['status']) {
    const res = await useApiClient()<ApiResponse<{ wallet: Wallet }>>(API_ENDPOINTS.wallets.status.replace(':id', String(walletId)), {
      method: 'PUT',
      body: { status }
    });
    if (!res.success) throw new Error('Failed to update wallet status');
    return res.data;
  },

  async topUpWalletAdmin(walletId: number, amount: number, notes?: string) {
    const res = await useApiClient()<ApiResponse<{ transaction: WalletTransaction }>>(API_ENDPOINTS.wallets.topUp.replace(':id', String(walletId)), {
      method: 'POST',
      body: { amount, notes }
    });
    if (!res.success) throw new Error('Failed to top up wallet');
    return res.data;
  },

  async getWalletTransactions(walletId: number, page = 1, limit = 20) {
    const url = `${API_ENDPOINTS.wallets.transactions.replace(':id', String(walletId))}?page=${page}&limit=${limit}`;
    const res = await useApiClient()<ApiResponse<Paged<'transactions', WalletTransaction>>>(url, { method: 'GET' });
    return res.data;
  },

  /** Gives a shop purchase back to the wallet; a purchase can be refunded once. */
  async refundTransaction(transactionId: number, reason: string) {
    const res = await useApiClient()<ApiResponse<{ transaction: WalletTransaction }>>(API_ENDPOINTS.wallets.refund.replace(':id', String(transactionId)), {
      method: 'POST',
      body: { reason }
    });
    return res.data.transaction;
  },

  // Top Up Requests
  async getTopUpRequests(params: { status?: string; search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.topUps.requests}?${query}` : API_ENDPOINTS.topUps.requests;
    const res = await useApiClient()<ApiResponse<Paged<'requests', TopUpRequest>>>(url, { method: 'GET' });
    return res.data;
  },

  async approveTopUp(requestId: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.topUps.requests}/${requestId}/approve`, {
      method: 'PUT'
    });
    if (!res.success) throw new Error('Failed to approve top up request');
    return true;
  },

  async rejectTopUp(requestId: number, reason?: string) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.topUps.requests}/${requestId}/reject`, {
      method: 'PUT',
      body: { reason }
    });
    if (!res.success) throw new Error('Failed to reject top up request');
    return true;
  },

  // Spending Limits
  async getSpendingLimit(studentId: number) {
    const res = await useApiClient()<ApiResponse<{ spendingLimit: SpendingLimit | null }>>(API_ENDPOINTS.spendingLimits.student.replace(':studentId', String(studentId)), {
      method: 'GET'
    });
    return res.data;
  },

  async updateSpendingLimit(studentId: number, payload: {
    dailyMax?: number | null; weeklyMax?: number | null; perTransactionMax?: number | null; alertThreshold?: number | null;
    blockedShops?: number[]; notes?: string;
  }) {
    const res = await useApiClient()<ApiResponse<{ spendingLimit: SpendingLimit }>>(API_ENDPOINTS.spendingLimits.student.replace(':studentId', String(studentId)), {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update spending limit');
    return res.data;
  },

  // Shops
  async getShops(params: { search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.shops.list}?${query}` : API_ENDPOINTS.shops.list;
    const res = await useApiClient()<ApiResponse<Paged<'shops', Shop>>>(url, { method: 'GET' });
    return res.data;
  },

  async createShop(payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ shop: Shop }>>(API_ENDPOINTS.shops.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create shop');
    return res.data.shop;
  },

  async updateShop(shopId: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ shop: Shop }>>(`${API_ENDPOINTS.shops.list}/${shopId}`, {
      method: 'PUT',
      body: payload
    });
    if (!res.success) throw new Error('Failed to update shop');
    return res.data.shop;
  },

  async deleteShop(shopId: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.shops.list}/${shopId}`, {
      method: 'DELETE'
    });
    if (!res.success) throw new Error('Failed to delete shop');
    return true;
  },

  async getShop(shopId: number) {
    const res = await useApiClient()<ApiResponse<{ shop: Shop }>>(`${API_ENDPOINTS.shops.list}/${shopId}`, {
      method: 'GET'
    });
    return res.data.shop;
  },

  async getShopRentals(params: { shopId?: number; academicYear?: string; status?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.shopId) query.set('shopId', String(params.shopId));
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.shops.rentals}?${query}` : API_ENDPOINTS.shops.rentals;
    const res = await useApiClient()<ApiResponse<{ rentalPayments: ShopRentalPayment[]; total: number; page: number; limit: number }>>(url, { method: 'GET' });
    return res.data;
  },

  async createShopRental(shopId: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ payment: ShopRentalPayment }>>(API_ENDPOINTS.shops.shopRentals(shopId), {
      method: 'POST',
      body: payload
    });
    return res.data.payment;
  },

  async recordShopRentalPayment(rentalId: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ payment: ShopRentalPayment }>>(API_ENDPOINTS.shops.rentalPay(rentalId), {
      method: 'POST',
      body: payload
    });
    return res.data.payment;
  },

  async uploadShopRentalSlip(rentalId: number, file: File) {
    const fd = new FormData();
    fd.append('slip', file);
    const res = await useApiClient()<ApiResponse<{ payment: ShopRentalPayment }>>(API_ENDPOINTS.shops.rentalSlip(rentalId), {
      method: 'POST',
      body: fd
    });
    return res.data.payment;
  },

  async deleteShopRentalSlip(rentalId: number) {
    const res = await useApiClient()<ApiResponse<{ payment: ShopRentalPayment }>>(API_ENDPOINTS.shops.rentalSlip(rentalId), {
      method: 'DELETE'
    });
    return res.data.payment;
  },

  async deleteShopRental(rentalId: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.shops.rentals}/${rentalId}`, {
      method: 'DELETE'
    });
    return res.success;
  },

  // POS – exact card lookup, then a purchase charged to that card's student
  async lookupPosCard(cardUid: string) {
    const res = await useApiClient()<ApiResponse<PosCard>>(
      `${API_ENDPOINTS.wallets.card}/${encodeURIComponent(cardUid)}`,
      { method: 'GET' },
    );
    return res.data;
  },

  async processTransaction(payload: { cardUid: string; amount: number; shopId: number }) {
    const res = await useApiClient()<ApiResponse<{ success: boolean; transactionId: string; balanceBefore: number; balanceAfter: number; amount: number }>>(API_ENDPOINTS.wallets.process, {
      method: 'POST',
      body: payload,
    });
    if (!res.success) throw new Error('Transaction failed');
    return res.data;
  },

  // Fee Types
  async getFeeTypes() {
    const res = await useApiClient()<ApiResponse<{ feeTypes: FeeType[] }>>(API_ENDPOINTS.fees.types, { method: 'GET' });
    return res.data.feeTypes;
  },
  async createFeeType(payload: Partial<FeeType>) {
    const res = await useApiClient()<ApiResponse<{ feeType: FeeType }>>(API_ENDPOINTS.fees.types, { method: 'POST', body: payload });
    if (!res.success) throw new Error('Failed to create fee type');
    return res.data.feeType;
  },
  async updateFeeType(id: number, payload: Partial<FeeType>) {
    const res = await useApiClient()<ApiResponse<{ feeType: FeeType }>>(`${API_ENDPOINTS.fees.types}/${id}`, { method: 'PUT', body: payload });
    if (!res.success) throw new Error('Failed to update fee type');
    return res.data.feeType;
  },
  async deleteFeeType(id: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.fees.types}/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error('Failed to delete fee type');
    return true;
  },

  // Fee Structures
  async getFeeStructures(academicYear?: string) {
    const query = new URLSearchParams();
    if (academicYear) query.set('academicYear', academicYear);
    const url = query.toString() ? `${API_ENDPOINTS.fees.structures}?${query}` : API_ENDPOINTS.fees.structures;
    const res = await useApiClient()<ApiResponse<{ structures: FeeStructure[] }>>(url, { method: 'GET' });
    return res.data.structures;
  },
  async createFeeStructure(payload: Record<string, unknown>) {
    const res = await useApiClient()<ApiResponse<{ structure: FeeStructure }>>(API_ENDPOINTS.fees.structures, { method: 'POST', body: payload });
    if (!res.success) throw new Error('Failed to create fee structure');
    return res.data.structure;
  },
  async updateFeeStructure(id: number, payload: Record<string, unknown>) {
    const res = await useApiClient()<ApiResponse<{ structure: FeeStructure }>>(`${API_ENDPOINTS.fees.structures}/${id}`, { method: 'PUT', body: payload });
    if (!res.success) throw new Error('Failed to update fee structure');
    return res.data.structure;
  },
  async deleteFeeStructure(id: number) {
    const res = await useApiClient()<{ success: boolean }>(`${API_ENDPOINTS.fees.structures}/${id}`, { method: 'DELETE' });
    if (!res.success) throw new Error('Failed to delete fee structure');
    return true;
  },
  async generateInvoices(feeStructureId: number) {
    const res = await useApiClient()<ApiResponse<{ created: number; alreadyBilled: number }>>(`${API_ENDPOINTS.fees.structures}/${feeStructureId}/generate`, { method: 'POST' });
    if (!res.success) throw new Error('Failed to generate invoices');
    return res.data;
  },

  // Invoices
  async getInvoices(params: { status?: string; search?: string; academicYear?: string; classId?: number; feeStructureId?: number; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.classId) query.set('classId', String(params.classId));
    if (params.feeStructureId) query.set('feeStructureId', String(params.feeStructureId));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const url = query.toString() ? `${API_ENDPOINTS.fees.invoices}?${query}` : API_ENDPOINTS.fees.invoices;
    const res = await useApiClient()<ApiResponse<Paged<'invoices', Invoice>>>(url, { method: 'GET' });
    return res.data;
  },
  async updateInvoice(id: number, payload: { discount?: number; dueDate?: string; notes?: string }) {
    const res = await useApiClient()<ApiResponse<{ invoice: Invoice }>>(`${API_ENDPOINTS.fees.invoices}/${id}`, { method: 'PUT', body: payload });
    if (!res.success) throw new Error('Failed to update invoice');
    return res.data.invoice;
  },
  async voidInvoice(id: number, reason: string) {
    const res = await useApiClient()<ApiResponse<{ invoice: Invoice }>>(`${API_ENDPOINTS.fees.invoices}/${id}/void`, { method: 'POST', body: { reason } });
    if (!res.success) throw new Error('Failed to void invoice');
    return res.data.invoice;
  },
  async recordPayment(invoiceId: number, payload: { amount: number; method: 'cash' | 'bank_transfer'; referenceNo?: string; notes?: string }) {
    const res = await useApiClient()<ApiResponse<{ payment: FeePayment; invoice: Invoice }>>(`${API_ENDPOINTS.fees.invoices}/${invoiceId}/payments`, { method: 'POST', body: payload });
    if (!res.success) throw new Error('Failed to record payment');
    return res.data;
  },

  // Shop sales report
  async getShopSales(params: { from?: string; to?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    const url = query.toString() ? `${API_ENDPOINTS.reports.shopSales}?${query}` : API_ENDPOINTS.reports.shopSales;
    const res = await useApiClient()<ApiResponse<ShopSalesReport>>(url, { method: 'GET' });
    return res.data;
  },

  // School Cashflow (Income vs Expense) report
  async getCashflowSummary(params: { academicYear?: string; startDate?: string; endDate?: string } = {}) {
    const query = new URLSearchParams();
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    const url = query.toString() ? `${API_ENDPOINTS.reports.cashflow}?${query}` : API_ENDPOINTS.reports.cashflow;
    const res = await useApiClient()<ApiResponse<CashflowReport>>(url, { method: 'GET' });
    return res.data;
  },

  // General Expenses & Categories
  async getExpenseCategories(params: { includeInactive?: boolean } = {}) {
    const query = new URLSearchParams();
    if (params.includeInactive) query.set('includeInactive', 'true');
    const url = query.toString() ? `${API_ENDPOINTS.expenses.categories}?${query}` : API_ENDPOINTS.expenses.categories;
    const res = await useApiClient()<ApiResponse<{ categories: ExpenseCategory[] }>>(url, { method: 'GET' });
    return res.data.categories;
  },

  async createExpenseCategory(payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ category: ExpenseCategory }>>(API_ENDPOINTS.expenses.categories, {
      method: 'POST',
      body: payload,
    });
    if (!res.success) throw new Error('Failed to create expense category');
    return res.data.category;
  },

  async updateExpenseCategory(id: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ category: ExpenseCategory }>>(API_ENDPOINTS.expenses.category(id), {
      method: 'PUT',
      body: payload,
    });
    if (!res.success) throw new Error('Failed to update expense category');
    return res.data.category;
  },

  async deleteExpenseCategory(id: number) {
    const res = await useApiClient()<{ success: boolean }>(API_ENDPOINTS.expenses.category(id), {
      method: 'DELETE',
    });
    if (!res.success) throw new Error('Failed to delete expense category');
    return true;
  },

  async getExpenses(params: {
    search?: string;
    categoryId?: number;
    academicYear?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.categoryId) query.set('categoryId', String(params.categoryId));
    if (params.academicYear) query.set('academicYear', params.academicYear);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.expenses.list}?${query}` : API_ENDPOINTS.expenses.list;
    const res = await useApiClient()<ApiResponse<Paged<'expenses', Expense>>>(url, { method: 'GET' });
    return res.data;
  },

  async getExpense(id: number) {
    const res = await useApiClient()<ApiResponse<{ expense: Expense }>>(API_ENDPOINTS.expenses.detail(id), {
      method: 'GET',
    });
    return res.data.expense;
  },

  async createExpense(payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ expense: Expense }>>(API_ENDPOINTS.expenses.list, {
      method: 'POST',
      body: payload,
    });
    if (!res.success) throw new Error('Failed to record expense');
    return res.data.expense;
  },

  async updateExpense(id: number, payload: Payload) {
    const res = await useApiClient()<ApiResponse<{ expense: Expense }>>(API_ENDPOINTS.expenses.detail(id), {
      method: 'PUT',
      body: payload,
    });
    if (!res.success) throw new Error('Failed to update expense');
    return res.data.expense;
  },

  async deleteExpense(id: number) {
    const res = await useApiClient()<{ success: boolean }>(API_ENDPOINTS.expenses.detail(id), {
      method: 'DELETE',
    });
    if (!res.success) throw new Error('Failed to delete expense');
    return true;
  },

  async uploadExpenseReceipt(id: number, file: File) {
    const formData = new FormData();
    formData.append('receipt', file);
    const res = await useApiClient()<ApiResponse<{ expense: Expense }>>(API_ENDPOINTS.expenses.receipt(id), {
      method: 'POST',
      body: formData,
    });
    if (!res.success) throw new Error('Failed to upload receipt');
    return res.data.expense;
  },

  async deleteExpenseReceipt(id: number) {
    const res = await useApiClient()<ApiResponse<{ expense: Expense }>>(API_ENDPOINTS.expenses.receipt(id), {
      method: 'DELETE',
    });
    if (!res.success) throw new Error('Failed to delete receipt');
    return res.data.expense;
  },
};

export interface ShopSalesSummary {
  shopId: number;
  shop: { shopId: number; shopNameEn: string; shopNameLo: string; locationEn: string | null; locationLo: string | null } | null;
  totalAmount: number;
  transactionCount: number;
}

export interface ShopSalesReport {
  summary: ShopSalesSummary[];
  grandTotal: number;
  totalTransactions: number;
  from: string;
  to: string;
}

export interface CashflowReport {
  academicYear: string | null;
  dateRange: { startDate: string | null; endDate: string | null };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashflow: number;
    totalStudentFees: number;
    totalShopRentals: number;
    totalPayrollExpense: number;
    totalGeneralExpense?: number;
  };
  breakdown: {
    feesByType: { nameEn: string; nameLo: string; total: number; count: number }[];
    rentalsByShop: { shopNameEn: string; shopNameLo: string; total: number; count: number }[];
    expensesByCategory?: { categoryId: number; nameEn: string; nameLo: string; icon?: string | null; total: number; count: number }[];
    payroll: {
      totalBaseSalary: number;
      totalAllowances: number;
      totalDeductions: number;
      totalNetSalary: number;
      itemCount: number;
      periodCount: number;
    };
  };
}
