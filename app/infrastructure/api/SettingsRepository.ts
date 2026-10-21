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

export class SettingsRepository {
  async getSettings(): Promise<SettingsApiResponse> {
    return useApiClient()(API_ENDPOINTS.settings.list, { method: 'GET' }) as Promise<SettingsApiResponse>;
  }

  async updateSettings(data: Record<string, unknown>): Promise<SettingsApiResponse> {
    return useApiClient()(API_ENDPOINTS.settings.list, { method: 'PUT', body: data }) as Promise<SettingsApiResponse>;
  }

  async uploadPaymentQr(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('qr', file);
    const res = await useApiClient()<{ data: { url: string } }>(API_ENDPOINTS.settings.paymentQr, { method: 'POST', body: formData });
    return res.data.url;
  }
}

export const settingsRepository = new SettingsRepository();
