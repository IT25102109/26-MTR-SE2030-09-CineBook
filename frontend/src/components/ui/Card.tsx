import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-ink-850 rounded-2xl border border-white/5 ${hover ? 'card-hover cursor-pointer' : 'transition-shadow'} ${className}`}
    >
      {children}
    </div>
  );
}
