'use client';

import React from 'react';
import Link from 'next/link';
import { Transaction } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { Card } from '../ui/Card';
import { CategoryIcon } from '../ui/CategoryIcon';
import { formatDate } from '@/lib/utils';
import { ArrowRight, PlusCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  onAddClick?: () => void;
}

export function RecentTransactionsList({ transactions, onAddClick }: RecentTransactionsListProps) {
  const { formatMoney } = useAuth();

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest financial activities</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
        >
          View all <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center flex-1 flex flex-col items-center justify-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">No transactions recorded yet</p>
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition"
            >
              <PlusCircle className="w-4 h-4" />
              Add your first transaction
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pt-2 flex-1">
          {transactions.slice(0, 6).map((tx) => {
            const isIncome = tx.type === 'INCOME';
            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${tx.category?.color || '#10b981'}15`,
                      color: tx.category?.color || '#10b981',
                    }}
                  >
                    <CategoryIcon name={tx.category?.icon || 'Tag'} size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{tx.category?.name || 'Uncategorized'}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-1 ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatMoney(tx.amount)}
                  </span>
                  {tx.tags && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate max-w-[100px]">
                      #{tx.tags.split(',')[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
