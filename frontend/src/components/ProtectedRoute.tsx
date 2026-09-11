import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, hasAccess } from '@/context/AuthContext';
import type { Role } from '@/types';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  requiredRole: Role;
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const { role } = useAuth();
  if (!hasAccess(role, requiredRole)) {
    return (
      <div className="container-app py-20 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="w-16 h-16 text-accent mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-ink-400 max-w-sm">This area requires {requiredRole === 'admin' ? 'Admin' : 'Cinema Manager'} access. Switch your role from the top-right menu to continue.</p>
      </div>
    );
  }
  return <>{children}</>;
}
