import { defineStore } from 'pinia';
import { financeRepository } from '../../infrastructure/api/FinanceRepository';

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    wallets: [] as any[],
    walletsTotal: 0,
    walletsPage: 1,
    walletsSearch: '',
    walletsStatusFilter: '',
    walletsLoading: false,

    topUpRequests: [] as any[],
    topUpRequestsTotal: 0,
    topUpRequestsPage: 1,
    topUpRequestsStatusFilter: '',
    topUpRequestsLoading: false,

    shops: [] as any[],
    shopsTotal: 0,
    shopsPage: 1,
    shopsSearch: '',
    shopsLoading: false,

    error: null as string | null,
  }),
  actions: {
    async fetchWallets(params?: { search?: string; status?: string; page?: number }) {
      this.walletsLoading = true;
      if (params?.search !== undefined) this.walletsSearch = params.search;
      if (params?.status !== undefined) this.walletsStatusFilter = params.status;
      if (params?.page !== undefined) this.walletsPage = params.page;
      try {
        const res = await financeRepository.getWallets({ search: this.walletsSearch, status: this.walletsStatusFilter, page: this.walletsPage, limit: 15 });
        this.wallets = res.wallets;
        this.walletsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.walletsLoading = false;
      }
    },
    async updateWalletStatus(walletId: number, status: string) {
      try {
        await financeRepository.updateWalletStatus(walletId, status);
        const idx = this.wallets.findIndex(w => w.walletId === walletId);
        if (idx !== -1) {
          this.wallets[idx].status = status;
        }
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async topUpWallet(walletId: number, amount: number, notes?: string) {
      try {
        const res = await financeRepository.topUpWalletAdmin(walletId, amount, notes);
        const idx = this.wallets.findIndex(w => w.walletId === walletId);
        if (idx !== -1) {
          this.wallets[idx].balance = parseFloat(this.wallets[idx].balance) + amount;
        }
        return res;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async fetchTopUpRequests(params?: { status?: string; page?: number }) {
      this.topUpRequestsLoading = true;
      if (params?.status !== undefined) this.topUpRequestsStatusFilter = params.status;
      if (params?.page !== undefined) this.topUpRequestsPage = params.page;
      try {
        const res = await financeRepository.getTopUpRequests({ status: this.topUpRequestsStatusFilter, page: this.topUpRequestsPage, limit: 15 });
        this.topUpRequests = res.requests;
        this.topUpRequestsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.topUpRequestsLoading = false;
      }
    },
    async approveTopUpRequest(requestId: number) {
      try {
        await financeRepository.approveTopUp(requestId);
        const idx = this.topUpRequests.findIndex(r => r.requestId === requestId);
        if (idx !== -1) {
          this.topUpRequests[idx].status = 'approved';
        }
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async rejectTopUpRequest(requestId: number, reason?: string) {
      try {
        await financeRepository.rejectTopUp(requestId, reason);
        const idx = this.topUpRequests.findIndex(r => r.requestId === requestId);
        if (idx !== -1) {
          this.topUpRequests[idx].status = 'rejected';
        }
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async fetchShops(params?: { search?: string; page?: number }) {
      this.shopsLoading = true;
      if (params?.search !== undefined) this.shopsSearch = params.search;
      if (params?.page !== undefined) this.shopsPage = params.page;
      try {
        const res = await financeRepository.getShops({ search: this.shopsSearch, page: this.shopsPage, limit: 15 });
        this.shops = res.shops;
        this.shopsTotal = res.total;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.shopsLoading = false;
      }
    },
    async createShop(payload: any) {
      try {
        const newShop = await financeRepository.createShop(payload);
        this.shops.unshift(newShop);
        this.shopsTotal += 1;
        return newShop;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async updateShop(shopId: number, payload: any) {
      try {
        const updatedShop = await financeRepository.updateShop(shopId, payload);
        const idx = this.shops.findIndex(s => s.shopId === shopId);
        if (idx !== -1) {
          this.shops[idx] = updatedShop;
        }
        return updatedShop;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    },
    async deleteShop(shopId: number) {
      try {
        await financeRepository.deleteShop(shopId);
        this.shops = this.shops.filter(s => s.shopId !== shopId);
        this.shopsTotal -= 1;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      }
    }
  }
});
