import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Role } from '@/types';
import { getCurrentUser, setCurrentUser, loginAsRole } from '@/data/store';

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const login = (role: Role) => {
    const u = loginAsRole(role);
    setUser(u);
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
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
