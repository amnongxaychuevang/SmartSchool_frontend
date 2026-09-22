import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface SettingsData {
  schoolInfo?: Record<string, any>;
  academicSettings?: Record<string, any>;
  permissionsMap?: Record<string, any>;
  [key: string]: any;
}

export interface SettingsApiResponse {
  data?: SettingsData;
  success?: boolean;
  message?: string;
}

export class SettingsRepository {
  async getSettings(): Promise<SettingsApiResponse> {
    return useApiClient()(API_ENDPOINTS.settings.list, { method: 'GET' }) as Promise<SettingsApiResponse>;
  }

  async updateSettings(data: Record<string, any>): Promise<SettingsApiResponse> {
    return useApiClient()(API_ENDPOINTS.settings.list, { method: 'PUT', body: data }) as Promise<SettingsApiResponse>;
  }
}

export const settingsRepository = new SettingsRepository();
