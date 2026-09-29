'use client';

import React from 'react';
import Link from 'next/link';
import { Budget } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MonthlyBudgetProgressProps {
  budgets: Budget[];
  totalLimit: number;
  totalSpent: number;
  month: string;
}

export function MonthlyBudgetProgress({
  budgets,
  totalLimit,
  totalSpent,
  month,
}: MonthlyBudgetProgressProps) {
  const { formatMoney } = useAuth();
  const remaining = Math.max(0, totalLimit - totalSpent);
  const percentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Budget Overview</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monthly spending limits vs reality</p>
        </div>
        <Link
          href="/budgets"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
        >
          Manage <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {totalLimit === 0 && budgets.length === 0 ? (
        <div className="py-8 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No active budgets for this month</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Set spending limits on your favorite categories like Food or Groceries to keep your finances on track.
          </p>
          <Link
            href="/budgets"
            className="mt-4 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            Create Budget
          </Link>
        </div>
      ) : (
        <div className="space-y-4 pt-4 flex-1 flex flex-col justify-between">
          {/* Overall Monthly Total Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Overall Monthly Cap</span>
              <span>{percentage}% ({formatMoney(totalSpent)} / {formatMoney(totalLimit)})</span>
            </div>
            <ProgressBar value={totalSpent} max={totalLimit || 1} />
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              <span>Remaining: {formatMoney(remaining)}</span>
              {percentage >= 100 ? (
                <span className="text-rose-500 font-bold">Over Budget!</span>
              ) : percentage >= 80 ? (
                <span className="text-amber-500 font-bold">Nearing Limit</span>
              ) : (
                <span className="text-emerald-500 font-bold">On Track</span>
              )}
            </div>
          </div>

          {/* Top Category Budgets */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Category Budgets
            </p>
            {budgets.slice(0, 4).map((b) => {
              const catSpent = b.spent || 0;
              const catPct = b.amountLimit > 0 ? Math.round((catSpent / b.amountLimit) * 100) : 0;
              const isOver = catSpent > b.amountLimit;

              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-[10px]"
                        style={{
                          backgroundColor: `${b.category?.color || '#10b981'}20`,
                          color: b.category?.color || '#10b981',
                        }}
                      >
                        <CategoryIcon name={b.category?.icon || 'Tag'} size={12} />
                      </div>
                      <span className="truncate max-w-[120px]">{b.category?.name || 'General'}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${isOver ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {formatMoney(catSpent)}
                      </span>
                      <span className="text-slate-400 text-[10px]"> / {formatMoney(b.amountLimit)}</span>
                    </div>
                  </div>
                  <ProgressBar value={catSpent} max={b.amountLimit} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
