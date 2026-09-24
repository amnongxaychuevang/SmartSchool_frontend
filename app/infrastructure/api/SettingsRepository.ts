import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { SchoolInfo, AcademicSettings, PermissionsMap } from '../../application/stores/settings';

export interface SettingsData {
  schoolInfo?: SchoolInfo;
  academicSettings?: AcademicSettings;
  permissionsMap?: PermissionsMap;
  [key: string]: unknown;
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

  async updateSettings(data: Record<string, unknown>): Promise<SettingsApiResponse> {
    return useApiClient()(API_ENDPOINTS.settings.list, { method: 'PUT', body: data }) as Promise<SettingsApiResponse>;
  }
}

export const settingsRepository = new SettingsRepository();
