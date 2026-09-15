import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-cinema-card hairline rounded-2xl ${hover ? 'transition-all duration-300 hover:bg-cinema-elevated hover:border-white/10 hover:shadow-soft-lg' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
