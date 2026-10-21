import { useApiClient } from './apiClient';
import { API_ENDPOINTS } from './endpoints';
import type { ApiResponse } from './types';

export interface PromotionClass {
  classId: number;
  classNameEn: string;
  classNameLo: string;
  gradeLevelEn: string | null;
  gradeLevelLo: string | null;
}

export interface PromotionStudent {
  studentId: number;
  studentCode: string;
  fullNameEn: string;
  fullNameLo: string;
  /** Set when the student already has a class in the new year. */
  placedInClassId: number | null;
}

export interface PromotionPreview {
  fromYear: string;
  toYear: string;
  fromClasses: (PromotionClass & { students: PromotionStudent[] })[];
  toClasses: PromotionClass[];
}

export type PromotionMove =
  | { studentId: number; action: 'move'; toClassId: number }
  | { studentId: number; action: 'graduate' }
  | { studentId: number; action: 'transfer' };

export interface PromotionResult {
  moved: number;
  graduated: number;
  transferred: number;
  cardsDeactivated: number;
}

export const promotionRepository = {
  async preview(fromYear: string, toYear: string) {
    const query = new URLSearchParams({ fromYear, toYear });
    const res = await useApiClient()<ApiResponse<PromotionPreview>>(`${API_ENDPOINTS.promotion.preview}?${query}`, { method: 'GET' });
    return res.data;
  },

  /** All moves are applied together, or none is. */
  async apply(fromYear: string, toYear: string, moves: PromotionMove[]) {
    const res = await useApiClient()<ApiResponse<PromotionResult>>(API_ENDPOINTS.promotion.apply, {
      method: 'POST',
      body: { fromYear, toYear, moves },
    });
    return res.data;
  },
};
