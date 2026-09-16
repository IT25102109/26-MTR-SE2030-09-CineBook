import { apiClient } from './client';

export interface AnalyticsOverview {
  totalRevenue: number;
  totalBookings: number;
  activeMovies: number;
  totalBranches: number;
}

export const analyticsApi = {
  async getOverview(): Promise<AnalyticsOverview> {
    return apiClient<AnalyticsOverview>('/analytics/overview');
  },
};
