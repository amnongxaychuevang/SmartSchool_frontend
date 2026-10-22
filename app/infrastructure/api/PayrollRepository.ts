import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';
import type { PayrollPeriod, PayrollItem, PayrollStatus } from '../../domain/models/Payroll';

export class PayrollRepository {
  async listPeriods(params: { page?: number; limit?: number } = {}) {
    return useApiClient()<ApiResponse<{
      periods: PayrollPeriod[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>>(API_ENDPOINTS.payroll.periods, {
      method: 'GET',
      query: params,
    });
  }

  async generatePeriod(periodMonth: string, notes?: string) {
    return useApiClient()<ApiResponse<{ period: PayrollPeriod }>>(API_ENDPOINTS.payroll.generate, {
      method: 'POST',
      body: { periodMonth, notes },
    });
  }

  async getPeriod(periodId: number) {
    return useApiClient()<ApiResponse<{ period: PayrollPeriod }>>(API_ENDPOINTS.payroll.period(periodId), {
      method: 'GET',
    });
  }

  async updateItem(itemId: number, data: {
    baseSalary?: number;
    teachingAllowance?: number;
    attendanceBonus?: number;
    otherAllowance?: number;
    absenceDeduction?: number;
    taxDeduction?: number;
    otherDeduction?: number;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    notes?: string;
  }) {
    return useApiClient()<ApiResponse<{ item: PayrollItem }>>(API_ENDPOINTS.payroll.item(itemId), {
      method: 'PUT',
      body: data,
    });
  }

  async updatePeriodStatus(periodId: number, status: PayrollStatus) {
    return useApiClient()<ApiResponse<{ period: PayrollPeriod }>>(API_ENDPOINTS.payroll.periodStatus(periodId), {
      method: 'PATCH',
      body: { status },
    });
  }

  async deletePeriod(periodId: number) {
    return useApiClient()<ApiResponse<{ success: boolean }>>(API_ENDPOINTS.payroll.period(periodId), {
      method: 'DELETE',
    });
  }

  async uploadSlip(itemId: number, file: File) {
    const body = new FormData();
    body.append('slip', file);
    return useApiClient()<ApiResponse<{ item: PayrollItem }>>(API_ENDPOINTS.payroll.itemSlip(itemId), {
      method: 'POST',
      body,
    });
  }

  async deleteSlip(itemId: number) {
    return useApiClient()<ApiResponse<{ item: PayrollItem }>>(API_ENDPOINTS.payroll.itemSlip(itemId), {
      method: 'DELETE',
    });
  }

  getExportUrl(periodId: number, lang: 'lo' | 'en' = 'lo') {
    const config = useRuntimeConfig();
    const token = useCookie('auth_token').value || '';
    return `${config.public.apiBaseUrl}${API_ENDPOINTS.payroll.export(periodId)}?lang=${lang}&token=${encodeURIComponent(token)}`;
  }

  async downloadExport(periodId: number, lang: 'lo' | 'en' = 'lo') {
    const config = useRuntimeConfig();
    const token = useCookie('auth_token').value;
    const res = await fetch(`${config.public.apiBaseUrl}${API_ENDPOINTS.payroll.export(periodId)}?lang=${lang}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to export payroll excel');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${periodId}-${lang}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  // Teacher portal
  async getMyPayslips(params: { page?: number; limit?: number } = {}) {
    return useApiClient()<ApiResponse<{
      payslips: (PayrollItem & { period: PayrollPeriod })[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>>(API_ENDPOINTS.payroll.myPayslips, {
      method: 'GET',
      query: params,
    });
  }

  async getMyPayslip(periodId: number) {
    return useApiClient()<ApiResponse<{
      payslip: PayrollItem & { period: PayrollPeriod };
    }>>(API_ENDPOINTS.payroll.myPayslip(periodId), {
      method: 'GET',
    });
  }
}

export const payrollRepository = new PayrollRepository();
