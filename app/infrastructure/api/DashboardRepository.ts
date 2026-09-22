import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export class DashboardRepository {
  async getStats() {
    return useApiClient()(API_ENDPOINTS.dashboard.stats, { method: 'GET' });
  }
}

export const dashboardRepository = new DashboardRepository();
