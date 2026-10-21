import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { SchoolInfo, PaymentInfo } from '../../application/stores/settings';

export interface SettingsData {
  schoolInfo?: Partial<SchoolInfo>;
  paymentInfo?: PaymentInfo;
  [key: string]: unknown;
}

export interface SettingsApiResponse {
  data?: { settings?: SettingsData };
  success?: boolean;
  message?: string;
}

export type AutoAbsenceRunResult =
  | { date: string; ran: false; reason: 'not_school_day' | 'no_active_term' }
  | { date: string; ran: true; marked: number; notified: number };

export class SettingsRepository {
  async getSettings(): Promise<SettingsApiResponse> {
    return useApiClient()(API_ENDPOINTS.settings.list, { method: 'GET' }) as Promise<SettingsApiResponse>;
  }

  async updateSettings(data: Record<string, unknown>): Promise<SettingsApiResponse> {
    return useApiClient()(API_ENDPOINTS.settings.list, { method: 'PUT', body: data }) as Promise<SettingsApiResponse>;
  }

  /** Runs today's auto-absence marking now instead of waiting for the cut-off. */
  async runAutoAbsence() {
    const res = await useApiClient()<{ data: AutoAbsenceRunResult }>(API_ENDPOINTS.attendance.autoAbsenceRun, { method: 'POST' });
    return res.data;
  }

  async uploadPaymentQr(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('qr', file);
    const res = await useApiClient()<{ data: { url: string } }>(API_ENDPOINTS.settings.paymentQr, { method: 'POST', body: formData });
    return res.data.url;
  }
}

export const settingsRepository = new SettingsRepository();
