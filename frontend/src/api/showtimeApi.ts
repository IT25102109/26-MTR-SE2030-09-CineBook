import { apiClient } from './client';
import type { Showtime } from '@/types';

function normalizeShowtime(raw: any): Showtime {
  return {
    id: String(raw.id),
    movieId: String(raw.movieId),
    branchId: String(raw.branchId),
    hallId: String(raw.hallId ?? 'h1'),
    date: raw.date ?? '',
    time: raw.time ?? '',
    basePrice: Number(raw.basePrice) || 12,
    premiumPrice: Number(raw.premiumPrice) || 18,
    bookedSeats: Array.isArray(raw.bookedSeats) ? raw.bookedSeats : [],
  };
}

export const showtimeApi = {
  async getShowtimes(movieId?: string, branchId?: string): Promise<Showtime[]> {
    const params: Record<string, string> = {};
    if (movieId) params.movieId = movieId;
    if (branchId) params.branchId = branchId;
    const data = await apiClient<any[]>('/showtimes', { params });
    return data.map(normalizeShowtime);
  },

  async getShowtimesByMovie(movieId: string): Promise<Showtime[]> {
    const data = await apiClient<any[]>(`/showtimes/movie/${movieId}`);
    return data.map(normalizeShowtime);
  },

  async getShowtime(id: string): Promise<Showtime> {
    const data = await apiClient<any>(`/showtimes/${id}`);
    return normalizeShowtime(data);
  },

  async createShowtime(showtime: Omit<Showtime, 'id'>): Promise<Showtime> {
    const data = await apiClient<any>('/showtimes', {
      method: 'POST',
      body: JSON.stringify(showtime),
    });
    return normalizeShowtime(data);
  },

  async updateShowtime(id: string, showtime: Omit<Showtime, 'id'>): Promise<Showtime> {
    const data = await apiClient<any>(`/showtimes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(showtime),
    });
    return normalizeShowtime(data);
  },

  async addBookedSeats(showtimeId: string, seats: string[]): Promise<Showtime> {
    const data = await apiClient<any>(`/showtimes/${showtimeId}/seats`, {
      method: 'POST',
      body: JSON.stringify(seats),
    });
    return normalizeShowtime(data);
  },

  async deleteShowtime(id: string): Promise<void> {
    await apiClient<void>(`/showtimes/${id}`, {
      method: 'DELETE',
    });
  },
};
