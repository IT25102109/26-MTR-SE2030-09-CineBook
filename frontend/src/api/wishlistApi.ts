import { apiClient } from './client';
import type { Movie } from '@/types';

export const wishlistApi = {
  async getWishlist(userId: string): Promise<string[]> {
    const data = await apiClient<string[]>(`/wishlist/${userId}`);
    return data.map(String);
  },

  async getWishlistMovies(userId: string): Promise<Movie[]> {
    return apiClient<Movie[]>(`/wishlist/${userId}/movies`);
  },

  async checkWishlist(userId: string, movieId: string): Promise<{ wishlisted: boolean }> {
    return apiClient<{ wishlisted: boolean }>(`/wishlist/${userId}/check/${movieId}`);
  },

  async toggleWishlist(userId: string, movieId: string): Promise<{ wishlisted: boolean; message?: string }> {
    return apiClient<{ wishlisted: boolean; message?: string }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, movieId }),
    });
  },

  async addToWishlist(userId: string, movieId: string): Promise<{ wishlisted: boolean; message?: string }> {
    return apiClient<{ wishlisted: boolean; message?: string }>(`/wishlist/${userId}/add/${movieId}`, {
      method: 'POST',
    });
  },

  async removeFromWishlist(userId: string, movieId: string): Promise<{ wishlisted: boolean; message?: string }> {
    return apiClient<{ wishlisted: boolean; message?: string }>(`/wishlist/${userId}/remove/${movieId}`, {
      method: 'DELETE',
    });
  },
};
