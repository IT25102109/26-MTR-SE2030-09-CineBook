import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-accent-primary text-black font-semibold hover:bg-accent-primary-hover hover:shadow-glow-amber hover:-translate-y-0.5',
  secondary: 'bg-cinema-elevated text-text-primary border border-white/10 hover:bg-cinema-border hover:border-white/20',
  destructive: 'bg-accent-destructive text-white font-semibold hover:bg-accent-destructive-hover hover:shadow-glow-red',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
  outline: 'border border-accent-primary/40 text-accent-primary hover:bg-accent-primary/10 hover:border-accent-primary',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
