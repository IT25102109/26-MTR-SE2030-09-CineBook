import { apiClient } from './client';
import type { LoyaltyVoucher } from '@/types';

function normalizeVoucher(raw: any): LoyaltyVoucher {
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    code: raw.code || '',
    title: raw.title || '',
    pointsCost: typeof raw.pointsCost === 'number' ? raw.pointsCost : 100,
    redeemedAt: raw.redeemedAt || new Date().toISOString(),
    expiresAt: raw.expiresAt || new Date(Date.now() + 60 * 86400000).toISOString(),
  };
}

export const loyaltyVoucherApi = {
  async getUserVouchers(userId: string): Promise<LoyaltyVoucher[]> {
    const data = await apiClient<any[]>(`/loyalty-vouchers?userId=${encodeURIComponent(userId)}`);
    return data.map(normalizeVoucher);
  },

  async redeemVoucher(voucher: Omit<LoyaltyVoucher, 'id'>): Promise<LoyaltyVoucher> {
    const data = await apiClient<any>('/loyalty-vouchers', {
      method: 'POST',
      body: JSON.stringify(voucher),
    });
    return normalizeVoucher(data);
  },
};
