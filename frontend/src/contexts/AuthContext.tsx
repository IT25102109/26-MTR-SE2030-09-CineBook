import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Role, SendOtpRequest, VerifyOtpRequest, OtpResponse, RegisterRequest, LoginRequest } from '@/types';
import {
  getCurrentUser,
  setCurrentUser,
  loginAsRole,
  sendOtpInStore,
  verifyOtpInStore,
  registerUserInStore,
  loginUserInStore,
  loginGoogleInStore,
  STORE_EVENTS,
} from '@/data/store';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  loginWithEmail: (email: string, password?: string) => Promise<User>;
  loginWithSocial: (provider: 'google' | 'microsoft', email: string, name?: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  sendOtp: (target: string, type: 'email' | 'phone') => Promise<OtpResponse>;
  verifyOtp: (target: string, code: string) => Promise<boolean>;
  registerUser: (req: RegisterRequest) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = () => {
    setUser(getCurrentUser());
  };

  useEffect(() => {
    refreshUser();

    const handleUpdate = () => refreshUser();
    window.addEventListener(STORE_EVENTS.users, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(STORE_EVENTS.users, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const login = (role: Role) => {
    const u = loginAsRole(role);
    setUser(u);
  };

  const loginWithEmail = async (email: string, password?: string): Promise<User> => {
    const req: LoginRequest = { email, password, authProvider: 'email' };
    const loggedIn = await loginUserInStore(req);
    setUser(loggedIn);
    return loggedIn;
  };

  const loginWithSocial = async (provider: 'google' | 'microsoft', email: string, name?: string): Promise<User> => {
    const req: LoginRequest = { email, authProvider: provider, name };
    const loggedIn = await loginUserInStore(req);
    setUser(loggedIn);
    return loggedIn;
  };

  const loginWithGoogle = async (idToken: string): Promise<User> => {
    const loggedIn = await loginGoogleInStore(idToken);
    setUser(loggedIn);
    return loggedIn;
  };

  const sendOtp = async (target: string, type: 'email' | 'phone'): Promise<OtpResponse> => {
    return await sendOtpInStore({ target, type });
  };

  const verifyOtp = async (target: string, code: string): Promise<boolean> => {
    return await verifyOtpInStore({ target, code });
  };

  const registerUser = async (req: RegisterRequest): Promise<User> => {
    const created = await registerUserInStore(req);
    // User is created and saved to DB, but they must sign in explicitly
    return created;
  };

  const logout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithEmail,
        loginWithSocial,
        loginWithGoogle,
        sendOtp,
        verifyOtp,
        registerUser,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
