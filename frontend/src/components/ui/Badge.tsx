import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'amber' | 'red' | 'green' | 'blue' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-cinema-elevated text-text-secondary border border-cinema-border',
  amber: 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20',
  red: 'bg-accent-destructive/15 text-accent-destructive border border-accent-destructive/20',
  green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  outline: 'border border-cinema-border text-text-secondary',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
