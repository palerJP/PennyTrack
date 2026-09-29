'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0 to 100+
  max?: number;
  className?: string;
  showThresholds?: boolean;
}

export function ProgressBar({ value, max = 100, className, showThresholds = true }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let colorClass = 'bg-emerald-500';
  if (showThresholds) {
    if (percentage >= 100) {
      colorClass = 'bg-rose-500';
    } else if (percentage >= 80) {
      colorClass = 'bg-amber-500';
    } else {
      colorClass = 'bg-emerald-500';
    }
  }

  return (
    <div className={cn('w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden', className)}>
      <div
        className={cn('h-full transition-all duration-500 rounded-full', colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
