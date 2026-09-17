import { apiClient } from './client';
import type { User, Role } from '@/types';

function normalizeUser(raw: any): User {
  const roleMap: Record<string, Role> = {
    ADMIN: 'admin',
    CINEMA_MANAGER: 'cinemaManager',
    CUSTOMER: 'customer',
    admin: 'admin',
    cinemaManager: 'cinemaManager',
    customer: 'customer',
  };

  return {
    id: String(raw.id),
    name: raw.fullName ?? raw.name ?? '',
    email: raw.email ?? '',
    role: roleMap[raw.role] ?? 'customer',
    avatarColor: raw.avatarColor ?? '#F5C518',
    assignedBranchId: raw.branchId ? String(raw.branchId) : raw.assignedBranchId,
    loyaltyPoints: typeof raw.loyaltyPoints === 'number' ? raw.loyaltyPoints : 0,
    loyaltyTier: raw.membershipTier ?? raw.loyaltyTier ?? 'Bronze',
  };
}

export const userApi = {
  async getUsers(): Promise<User[]> {
    const data = await apiClient<any[]>('/users');
    return data.map(normalizeUser);
  },

  async getUser(id: string): Promise<User> {
    const data = await apiClient<any>(`/users/${id}`);
    return normalizeUser(data);
  },

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const payload = {
      fullName: user.name,
      email: user.email,
      role: user.role === 'admin' ? 'ADMIN' : user.role === 'cinemaManager' ? 'CINEMA_MANAGER' : 'CUSTOMER',
      branchId: user.assignedBranchId ? Number(user.assignedBranchId) : null,
      password: 'password123',
    };
    const data = await apiClient<any>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeUser(data);
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const payload: any = {};
    if (user.name) payload.fullName = user.name;
    if (user.email) payload.email = user.email;
    if (user.role) {
      payload.role = user.role === 'admin' ? 'ADMIN' : user.role === 'cinemaManager' ? 'CINEMA_MANAGER' : 'CUSTOMER';
    }
    if (user.assignedBranchId !== undefined) {
      payload.branchId = user.assignedBranchId ? Number(user.assignedBranchId) : null;
    }
    const data = await apiClient<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return normalizeUser(data);
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

