'use client';

import React from 'react';
import { Budget } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const { formatMoney } = useAuth();

  const spent = budget.spent || 0;
  const limit = budget.amountLimit;
  const remaining = Math.max(0, limit - spent);
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const isOver = spent > limit;
  const isWarning = percentage >= 80 && !isOver;

  return (
    <Card hoverEffect className="flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${budget.category?.color || '#10b981'}20`,
              color: budget.category?.color || '#10b981',
            }}
          >
            <CategoryIcon name={budget.category?.icon || 'Tag'} size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {budget.category?.name || 'Overall Monthly Budget'}
            </h4>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Monthly Limit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Edit limit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Delete budget"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Numbers */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Spent: </span>
            <span
              className={`font-extrabold text-sm ${
                isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {formatMoney(spent)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400">Limit: </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {formatMoney(limit)}
            </span>
          </div>
        </div>

        <ProgressBar value={spent} max={limit} />

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500 dark:text-slate-400">
            Remaining:{' '}
            <strong className={isOver ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
              {isOver ? `-${formatMoney(spent - limit)} (Exceeded)` : formatMoney(remaining)}
            </strong>
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isOver
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : isWarning
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
