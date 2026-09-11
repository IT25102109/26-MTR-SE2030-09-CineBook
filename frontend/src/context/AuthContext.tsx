import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Role, User } from '@/types';
import { store, seedIfNeeded } from '@/data/store';

interface AuthContextValue {
  user: User;
  role: Role;
  setRole: (role: Role) => void;
  branchId?: string;
}

const ROLE_PROFILES: Record<Role, User> = {
  customer: { id: 'demo', name: 'Alex Carter', email: 'alex@example.com', role: 'customer' },
  manager: { id: 'u5', name: 'Manager Blake', email: 'blake@example.com', role: 'manager', branchId: 'b1' },
  admin: { id: 'u6', name: 'Admin Casey', email: 'casey@example.com', role: 'admin' },
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    seedIfNeeded();
    const saved = store.getRole() as Role | null;
    return saved ?? 'customer';
  });

  useEffect(() => {
    store.setRole(role);
  }, [role]);

  const setRole = (r: Role) => setRoleState(r);

  const user = ROLE_PROFILES[role];

  return (
    <AuthContext.Provider value={{ user, role, setRole, branchId: user.branchId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const ROLE_LABELS: Record<Role, string> = {
  customer: 'Customer',
  manager: 'Cinema Manager',
  admin: 'Admin',
};

export const ROLE_HIERARCHY: Role[] = ['customer', 'manager', 'admin'];

export function hasAccess(currentRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY.indexOf(currentRole) >= ROLE_HIERARCHY.indexOf(requiredRole);
}
