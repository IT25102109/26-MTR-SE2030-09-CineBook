import { apiClient } from './client';

export const wishlistApi = {
  async getWishlist(userId: string): Promise<string[]> {
    const data = await apiClient<string[]>(`/wishlist/${userId}`);
    return data.map(String);
  },

  async toggleWishlist(userId: string, movieId: string): Promise<{ wishlisted: boolean }> {
    return apiClient<{ wishlisted: boolean }>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ userId, movieId }),
    });
  },
};

