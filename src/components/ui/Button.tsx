'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-[0.98]',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100',
      outline: 'border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-200',
      ghost: 'hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]',
      success: 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5 font-medium',
      md: 'text-sm px-4 py-2 rounded-xl gap-2 font-medium',
      lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold',
      icon: 'p-2 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
