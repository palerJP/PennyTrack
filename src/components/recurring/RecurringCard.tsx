'use client';

import React from 'react';
import { RecurringTransaction } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { Card } from '../ui/Card';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Badge } from '../ui/Badge';
import { formatDate } from '@/lib/utils';
import { Calendar, CheckCircle2, Play, Pause, Trash2, Edit2, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

interface RecurringCardProps {
  item: RecurringTransaction;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
  onToggleActive: (item: RecurringTransaction) => void;
  onProcessNow: (item: RecurringTransaction) => void;
  isProcessing?: boolean;
}

export function RecurringCard({
  item,
  onEdit,
  onDelete,
  onToggleActive,
  onProcessNow,
  isProcessing = false,
}: RecurringCardProps) {
  const { formatMoney } = useAuth();
  const isIncome = item.type === 'INCOME';

  const nextDateObj = new Date(item.nextDate);
  const now = new Date();
  const diffDays = Math.ceil((nextDateObj.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const isDueSoon = diffDays >= 0 && diffDays <= 5;
  const isOverdue = diffDays < 0;

  return (
    <Card hoverEffect className="flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${item.category?.color || '#10b981'}20`,
              color: item.category?.color || '#10b981',
            }}
          >
            <CategoryIcon name={item.category?.icon || 'Tag'} size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {item.description}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isIncome ? 'emerald' : 'slate'} size="sm">
                {item.frequency}
              </Badge>
              <span className="text-xs text-slate-400">{item.category?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Edit recurring schedule"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Delete recurring schedule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Amount & Due Date Status */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block">Amount</span>
          <span
            className={`font-extrabold text-base ${
              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatMoney(item.amount)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block">Next Execution</span>
          <div className="flex items-center gap-1.5 justify-end mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span
              className={`text-xs font-semibold ${
                isOverdue
                  ? 'text-rose-600 font-bold'
                  : isDueSoon
                  ? 'text-amber-500 font-bold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {formatDate(item.nextDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Actions: Pause/Resume + Process Now */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => onToggleActive(item)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
            item.isActive
              ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              : 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100'
          }`}
        >
          {item.isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Active (Pause)
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Paused (Resume)
            </>
          )}
        </button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onProcessNow(item)}
          isLoading={isProcessing}
          className="text-xs"
          title="Manually trigger recording right now"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Process Now</span>
        </Button>
      </div>
    </Card>
  );
}
