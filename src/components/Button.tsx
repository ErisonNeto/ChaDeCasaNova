import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-roseDeep text-white shadow-glow hover:-translate-y-0.5 hover:bg-roseDeep/95 hover:shadow-premium active:translate-y-0',
  secondary:
    'border border-gold/35 bg-white/75 text-cocoa shadow-soft hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white active:translate-y-0',
  ghost: 'bg-transparent text-cocoa/70 hover:bg-white/60 hover:text-cocoa',
  danger: 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100',
};

export function Button({ children, variant = 'primary', loading, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-4 py-3 text-center text-sm font-bold leading-none transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
