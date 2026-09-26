import { apiClient } from './client';
import type { Booking } from '@/types';

function normalizeBooking(raw: any): Booking {
  let seats: string[] = [];
  if (Array.isArray(raw.seats)) {
    seats = raw.seats;
  } else if (typeof raw.seatsCsv === 'string' && raw.seatsCsv.trim()) {
    seats = raw.seatsCsv.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  return {
    id: String(raw.id || raw.bookingRef),
    bookingRef: raw.bookingRef ? String(raw.bookingRef) : undefined,
    tempId: raw.tempId ? String(raw.tempId) : undefined,
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
    seats,
    totalAmount: Number(raw.totalAmount) || 0,
    status: raw.status === 'cancelled' ? 'cancelled' : 'confirmed',
    refundStatus: raw.refundStatus === 'processed' ? 'processed' : raw.refundStatus === 'pending' ? 'pending' : 'none',
    refundAmount: raw.refundAmount != null ? Number(raw.refundAmount) : undefined,
    rescheduledFrom: raw.rescheduledFrom || undefined,
    paymentMethod: raw.paymentMethod || 'card',
    paymentStatus: raw.paymentStatus || 'paid',
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
    const { id: _, ...payload } = booking as any;
    const data = await apiClient<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeBooking(data);
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    const data = await apiClient<any>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return normalizeBooking(data);
  },

  async cancelBooking(id: string, refundAmount?: number, refundStatus?: string): Promise<Booking> {
    const params = new URLSearchParams();
    if (refundAmount != null) params.set('refundAmount', String(refundAmount));
    if (refundStatus) params.set('refundStatus', refundStatus);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const data = await apiClient<any>(`/bookings/${id}/cancel${qs}`, {
      method: 'PUT',
    });
    return normalizeBooking(data);
  },

  async rescheduleBooking(
    id: string,
    newShowtimeId: string,
    newDate: string,
    newTime: string,
    newHallName: string
  ): Promise<Booking> {
    const params = new URLSearchParams({
      newShowtimeId,
      newDate,
      newTime,
      newHallName,
    });
    const data = await apiClient<any>(`/bookings/${id}/reschedule?${params.toString()}`, {
      method: 'PUT',
    });
    return normalizeBooking(data);
  },
};
