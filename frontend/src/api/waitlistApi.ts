import { apiClient } from './client';

export interface WaitlistDto {
  id: string;
  showtimeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

function normalizeWaitlist(raw: any): WaitlistDto {
  return {
    id: String(raw.id),
    showtimeId: String(raw.showtimeId),
    userId: String(raw.userId),
    userName: raw.userName || '',
    userEmail: raw.userEmail || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const waitlistApi = {
  async getWaitlist(showtimeId: string): Promise<WaitlistDto[]> {
    const data = await apiClient<any[]>(`/waitlists?showtimeId=${encodeURIComponent(showtimeId)}`);
    return data.map(normalizeWaitlist);
  },

  async joinWaitlist(entry: Omit<WaitlistDto, 'id' | 'createdAt'>): Promise<WaitlistDto> {
    const data = await apiClient<any>('/waitlists', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return normalizeWaitlist(data);
  },

  async deleteWaitlist(id: string): Promise<void> {
    await apiClient<void>(`/waitlists/${id}`, {
      method: 'DELETE',
    });
  },
};
