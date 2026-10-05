import { apiClient } from './client';
import type {
  User,
  Role,
  SendOtpRequest,
  VerifyOtpRequest,
  OtpResponse,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from '@/types';

function normalizeAuthUser(raw: any): User {
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
    phone: raw.phoneNumber ?? raw.phone,
    authProvider: raw.authProvider ? raw.authProvider.toLowerCase() : 'email',
    isVerified: raw.isVerified ?? true,
  };
}

export const authApi = {
  async sendOtp(req: SendOtpRequest): Promise<OtpResponse> {
    return apiClient<OtpResponse>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async verifyOtp(req: VerifyOtpRequest): Promise<OtpResponse> {
    return apiClient<OtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async register(req: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    if (res.token) {
      localStorage.setItem('cinebook_auth_token', res.token);
    }
    return {
      token: res.token,
      message: res.message,
      user: normalizeAuthUser(res.user),
    };
  },

  async login(req: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    if (res.token) {
      localStorage.setItem('cinebook_auth_token', res.token);
    }
    return {
      token: res.token,
      message: res.message,
      user: normalizeAuthUser(res.user),
    };
  },
};
