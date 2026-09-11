import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'gold' | 'success' | 'warning' | 'error' | 'outline';

const styles: Record<BadgeVariant, string> = {
  default: 'bg-ink-700 text-ink-200',
  accent: 'bg-accent/15 text-accent border border-accent/30',
  gold: 'bg-gold/15 text-gold border border-gold/30',
  success: 'bg-success/15 text-success border border-success/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  error: 'bg-error/15 text-error border border-error/30',
  outline: 'border border-ink-500 text-ink-200',
};

export function Badge({ children, variant = 'default', className = '' }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
