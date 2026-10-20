import { defineStore } from 'pinia';
import { financeRepository } from '../../infrastructure/api/FinanceRepository';
import type { Payload } from '../../domain/models/Academics';
import type { Wallet, TopUpRequest, Shop, FeeType, FeeStructure, Invoice } from '../../domain/models/Finance';
import { getErrorMessage } from '../../utils/errors';

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    wallets: [] as Wallet[],
    walletsTotal: 0,
    walletsPage: 1,
    walletsSearch: '',
    walletsStatusFilter: '',
    walletsLoading: false,

    topUpRequests: [] as TopUpRequest[],
    topUpRequestsTotal: 0,
    topUpRequestsPage: 1,
    topUpRequestsStatusFilter: '',
    topUpRequestsLoading: false,

    shops: [] as Shop[],
    shopsTotal: 0,
    shopsPage: 1,
    shopsSearch: '',
    shopsLoading: false,

    feeTypes: [] as FeeType[],
    feeTypesLoading: false,

    feeStructures: [] as FeeStructure[],
    feeStructuresLoading: false,
    feeStructuresYear: '',

    invoices: [] as Invoice[],
    invoicesTotal: 0,
    invoicesPage: 1,
    invoicesSearch: '',
    invoicesStatus: '',
    invoicesYear: '',
    invoicesLoading: false,

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
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.walletsLoading = false;
      }
    },
    async updateWalletStatus(walletId: number, status: Wallet['status']) {
      try {
        await financeRepository.updateWalletStatus(walletId, status);
        const wallet = this.wallets.find(w => w.walletId === walletId);
        if (wallet) wallet.status = status;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async topUpWallet(walletId: number, amount: number, notes?: string) {
      try {
        const res = await financeRepository.topUpWalletAdmin(walletId, amount, notes);
        const wallet = this.wallets.find(w => w.walletId === walletId);
        if (wallet) wallet.balance = Number(wallet.balance) + amount;
        return res;
      } catch (err) {
        this.error = getErrorMessage(err);
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
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.topUpRequestsLoading = false;
      }
    },
    async approveTopUpRequest(requestId: number) {
      try {
        await financeRepository.approveTopUp(requestId);
        const request = this.topUpRequests.find(r => r.requestId === requestId);
        if (request) request.status = 'approved';
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async rejectTopUpRequest(requestId: number, reason?: string) {
      try {
        await financeRepository.rejectTopUp(requestId, reason);
        const request = this.topUpRequests.find(r => r.requestId === requestId);
        if (request) request.status = 'rejected';
      } catch (err) {
        this.error = getErrorMessage(err);
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
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.shopsLoading = false;
      }
    },
    async createShop(payload: Payload) {
      try {
        const newShop = await financeRepository.createShop(payload);
        this.shops.unshift(newShop);
        this.shopsTotal += 1;
        return newShop;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async updateShop(shopId: number, payload: Payload) {
      try {
        const updatedShop = await financeRepository.updateShop(shopId, payload);
        const idx = this.shops.findIndex(s => s.shopId === shopId);
        if (idx !== -1) {
          this.shops[idx] = updatedShop;
        }
        return updatedShop;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },
    async deleteShop(shopId: number) {
      try {
        await financeRepository.deleteShop(shopId);
        this.shops = this.shops.filter(s => s.shopId !== shopId);
        this.shopsTotal -= 1;
      } catch (err) {
        this.error = getErrorMessage(err);
        throw err;
      }
    },

    // Fee Types
    async fetchFeeTypes() {
      this.feeTypesLoading = true;
      try {
        this.feeTypes = await financeRepository.getFeeTypes();
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.feeTypesLoading = false;
      }
    },
    async createFeeType(payload: Partial<FeeType>) {
      const ft = await financeRepository.createFeeType(payload);
      this.feeTypes.unshift(ft);
      return ft;
    },
    async updateFeeType(id: number, payload: Partial<FeeType>) {
      const ft = await financeRepository.updateFeeType(id, payload);
      const idx = this.feeTypes.findIndex(t => t.feeTypeId === id);
      if (idx !== -1) this.feeTypes[idx] = ft;
      return ft;
    },
    async deleteFeeType(id: number) {
      await financeRepository.deleteFeeType(id);
      this.feeTypes = this.feeTypes.filter(t => t.feeTypeId !== id);
    },

    // Fee Structures
    async fetchFeeStructures(academicYear?: string) {
      this.feeStructuresLoading = true;
      if (academicYear !== undefined) this.feeStructuresYear = academicYear;
      try {
        this.feeStructures = await financeRepository.getFeeStructures(this.feeStructuresYear || undefined);
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.feeStructuresLoading = false;
      }
    },
    async createFeeStructure(payload: Record<string, unknown>) {
      const s = await financeRepository.createFeeStructure(payload);
      await this.fetchFeeStructures();
      return s;
    },
    async updateFeeStructure(id: number, payload: Record<string, unknown>) {
      const s = await financeRepository.updateFeeStructure(id, payload);
      await this.fetchFeeStructures();
      return s;
    },
    async deleteFeeStructure(id: number) {
      await financeRepository.deleteFeeStructure(id);
      this.feeStructures = this.feeStructures.filter(s => s.feeStructureId !== id);
    },
    async generateInvoices(feeStructureId: number) {
      const result = await financeRepository.generateInvoices(feeStructureId);
      await this.fetchFeeStructures();
      return result;
    },

    // Invoices
    async fetchInvoices(params?: { search?: string; status?: string; academicYear?: string; page?: number }) {
      this.invoicesLoading = true;
      if (params?.search !== undefined) this.invoicesSearch = params.search;
      if (params?.status !== undefined) this.invoicesStatus = params.status;
      if (params?.academicYear !== undefined) this.invoicesYear = params.academicYear;
      if (params?.page !== undefined) this.invoicesPage = params.page;
      try {
        const res = await financeRepository.getInvoices({
          search: this.invoicesSearch, status: this.invoicesStatus, academicYear: this.invoicesYear,
          page: this.invoicesPage, limit: 20,
        });
        this.invoices = res.invoices;
        this.invoicesTotal = res.total;
      } catch (err) {
        this.error = getErrorMessage(err);
      } finally {
        this.invoicesLoading = false;
      }
    },
    async voidInvoice(id: number, reason: string) {
      const inv = await financeRepository.voidInvoice(id, reason);
      const idx = this.invoices.findIndex(i => i.invoiceId === id);
      if (idx !== -1) this.invoices[idx] = inv;
      return inv;
    },
    async recordPayment(invoiceId: number, payload: { amount: number; method: 'cash' | 'bank_transfer'; referenceNo?: string; notes?: string }) {
      const { invoice } = await financeRepository.recordPayment(invoiceId, payload);
      const idx = this.invoices.findIndex(i => i.invoiceId === invoiceId);
      if (idx !== -1) this.invoices[idx] = invoice;
      return invoice;
    },
  }
});
