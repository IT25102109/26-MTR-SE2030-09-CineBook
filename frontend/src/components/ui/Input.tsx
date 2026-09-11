import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-200">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-100 placeholder-ink-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = '', children, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-200">{label}</label>}
      <select
        ref={ref}
        className={`w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink-200">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-2.5 text-sm text-ink-100 placeholder-ink-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none ${className}`}
        {...props}
      />
    </div>
  )
);
Textarea.displayName = 'Textarea';
