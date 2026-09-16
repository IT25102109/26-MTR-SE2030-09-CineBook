import { apiClient } from './client';
import type { Branch, CinemaHall } from '@/types';

function normalizeBranch(raw: any): Branch {
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    city: raw.city ?? '',
    address: raw.address ?? raw.location ?? '',
    halls: Array.isArray(raw.halls)
      ? raw.halls.map((h: any) => ({
          id: String(h.id),
          name: h.name ?? '',
          rows: Number(h.rows) || 8,
          seatsPerRow: Number(h.seatsPerRow) || 12,
          premiumRows: Number(h.premiumRows) || 2,
        }))
      : [],
  };
}

export const branchApi = {
  async getBranches(): Promise<Branch[]> {
    const data = await apiClient<any[]>('/branches');
    return data.map(normalizeBranch);
  },

  async getBranch(id: string): Promise<Branch> {
    const data = await apiClient<any>(`/branches/${id}`);
    return normalizeBranch(data);
  },

  async createBranch(branch: Omit<Branch, 'id'>): Promise<Branch> {
    const payload = {
      ...branch,
      location: branch.city && branch.address ? `${branch.city} - ${branch.address}` : branch.address || branch.city || branch.name,
    };
    const data = await apiClient<any>('/branches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeBranch(data);
  },

  async updateBranch(id: string, branch: Omit<Branch, 'id'>): Promise<Branch> {
    const payload = {
      ...branch,
      location: branch.city && branch.address ? `${branch.city} - ${branch.address}` : branch.address || branch.city || branch.name,
    };
    const data = await apiClient<any>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeBranch(data);
  },

  async deleteBranch(id: string): Promise<void> {
    await apiClient<void>(`/branches/${id}`, {
      method: 'DELETE',
    });
  },
};
