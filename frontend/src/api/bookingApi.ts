import { apiClient } from './client';
import type { Booking } from '@/types';

function normalizeBooking(raw: any): Booking {
  return {
    id: String(raw.id || raw.bookingRef),
    userId: String(raw.userId ?? 'demo'),
    movieId: String(raw.movieId),
    movieTitle: raw.movieTitle ?? '',
    moviePoster: raw.moviePoster ?? '',
    branchId: String(raw.branchId),
    branchName: raw.branchName ?? '',
    hallName: raw.hallName ?? '',
    showtimeId: String(raw.showtimeId),
    date: raw.date ?? '',
    time: raw.time ?? '',
    seats: Array.isArray(raw.seats) ? raw.seats : [],
    totalAmount: Number(raw.totalAmount) || 0,
    status: raw.status === 'cancelled' ? 'cancelled' : 'confirmed',
    refundStatus: raw.refundStatus === 'processed' ? 'processed' : raw.refundStatus === 'pending' ? 'pending' : 'none',
    bookingDate: raw.bookingDate || raw.createdAt || new Date().toISOString(),
  };
}

export const bookingApi = {
  async getBookings(): Promise<Booking[]> {
    const data = await apiClient<any[]>('/bookings');
    return data.map(normalizeBooking);
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const data = await apiClient<any[]>(`/bookings/user/${userId}`);
    return data.map(normalizeBooking);
  },

  async getBooking(id: string): Promise<Booking> {
    const data = await apiClient<any>(`/bookings/${id}`);
    return normalizeBooking(data);
  },

  async createBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const data = await apiClient<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
    return normalizeBooking(data);
  },

  async cancelBooking(id: string): Promise<Booking> {
    const data = await apiClient<any>(`/bookings/${id}/cancel`, {
      method: 'PUT',
    });
    return normalizeBooking(data);
  },
};
