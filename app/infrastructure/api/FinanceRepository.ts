import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export const financeRepository = {
  // Wallets
  async getWallets(params: { search?: string; page?: number; limit?: number; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);

    const url = query.toString() ? `${API_ENDPOINTS.wallets.list}?${query}` : API_ENDPOINTS.wallets.list;
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async updateWalletStatus(walletId: number, status: string) {
    const res = await useApiClient()<{ success: boolean; data: any }>(API_ENDPOINTS.wallets.status.replace(':id', String(walletId)), {
      method: 'PUT',
      body: { status }
    });
    if (!res.success) throw new Error('Failed to update wallet status');
    return res.data;
  },

  async topUpWalletAdmin(walletId: number, amount: number, notes?: string) {
    const res = await useApiClient()<{ success: boolean; data: any }>(API_ENDPOINTS.wallets.topUp.replace(':id', String(walletId)), {
      method: 'POST',
      body: { amount, notes }
    });
    if (!res.success) throw new Error('Failed to top up wallet');
    return res.data;
  },

  // Top Up Requests
  async getTopUpRequests(params: { status?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = query.toString() ? `${API_ENDPOINTS.topUps.requests}?${query}` : API_ENDPOINTS.topUps.requests;
    const res = await useApiClient()<any>(url, { method: 'GET' });
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
    const res = await useApiClient()<{ success: boolean; data: any }>(API_ENDPOINTS.spendingLimits.student.replace(':studentId', String(studentId)), {
      method: 'GET'
    });
    return res.data;
  },

  async updateSpendingLimit(studentId: number, payload: { dailyLimit?: number; weeklyLimit?: number }) {
    const res = await useApiClient()<{ success: boolean; data: any }>(API_ENDPOINTS.spendingLimits.student.replace(':studentId', String(studentId)), {
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
    const res = await useApiClient()<any>(url, { method: 'GET' });
    return res.data;
  },

  async createShop(payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { shop: any } }>(API_ENDPOINTS.shops.list, {
      method: 'POST',
      body: payload
    });
    if (!res.success) throw new Error('Failed to create shop');
    return res.data.shop;
  },

  async updateShop(shopId: number, payload: any) {
    const res = await useApiClient()<{ success: boolean; data: { shop: any } }>(`${API_ENDPOINTS.shops.list}/${shopId}`, {
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
  }
};
