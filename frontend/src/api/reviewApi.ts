import { apiClient } from './client';
import type { MovieReview } from '@/types';

function normalizeReview(raw: any): MovieReview {
  let status: 'approved' | 'pending' | 'rejected' = 'approved';
  const rawStatus = (raw.status || raw.moderationStatus || '').toLowerCase();
  if (rawStatus === 'pending') status = 'pending';
  else if (rawStatus === 'rejected') status = 'rejected';

  return {
    id: String(raw.id),
    movieId: String(raw.movieId),
    userId: raw.userId != null ? String(raw.userId) : '',
    userName: raw.userName || 'Anonymous',
    rating: typeof raw.rating === 'number' ? raw.rating : 5,
    comment: raw.comment || '',
    createdAt: raw.createdAt || raw.reviewDate || new Date().toISOString(),
    status,
  };
}

export const reviewApi = {
  async getReviews(params?: { movieId?: string; status?: string }): Promise<MovieReview[]> {
    const query = new URLSearchParams();
    if (params?.movieId) query.append('movieId', params.movieId);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const data = await apiClient<any[]>(`/reviews${qs}`);
    return data.map(normalizeReview);
  },

  async createReview(review: Omit<MovieReview, 'id'>): Promise<MovieReview> {
    const data = await apiClient<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        movieId: review.movieId,
        userId: review.userId,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
        status: review.status || 'pending',
      }),
    });
    return normalizeReview(data);
  },

  async updateReviewStatus(id: string, status: 'approved' | 'pending' | 'rejected'): Promise<MovieReview> {
    const data = await apiClient<any>(`/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return normalizeReview(data);
  },

  async deleteReview(id: string): Promise<void> {
    await apiClient<void>(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};
