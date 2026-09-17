import { apiClient } from './client';
import type { Promotion } from '@/types';

function normalizePromotion(raw: any): Promotion {
  return {
    id: String(raw.id),
    code: raw.code ?? '',
    description: raw.description ?? '',
    discountType: raw.discountType === 'flat' ? 'flat' : 'percentage',
    discountValue: Number(raw.discountValue) || 0,
    minSpend: Number(raw.minSpend) || 0,
    validUntil: raw.validUntil ?? '',
    active: Boolean(raw.active),
  };
}

export const promotionApi = {
  async getPromotions(): Promise<Promotion[]> {
    const data = await apiClient<any[]>('/promotions');
    return data.map(normalizePromotion);
  },

  async createPromotion(promo: Omit<Promotion, 'id'>): Promise<Promotion> {
    const data = await apiClient<any>('/promotions', {
      method: 'POST',
      body: JSON.stringify(promo),
    });
    return normalizePromotion(data);
  },

  async updatePromotion(id: string, promo: Omit<Promotion, 'id'>): Promise<Promotion> {
    const data = await apiClient<any>(`/promotions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promo),
    });
    return normalizePromotion(data);
  },

  async deletePromotion(id: string): Promise<void> {
    await apiClient<void>(`/promotions/${id}`, {
      method: 'DELETE',
    });
  },

  async validatePromotion(code: string, subtotal: number): Promise<{ valid: boolean; discount: number; finalAmount: number; message?: string }> {
    return await apiClient<any>('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },
};
