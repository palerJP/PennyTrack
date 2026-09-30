'use client';

import React from 'react';
import { Transaction } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Badge } from '../ui/Badge';
import { formatDate } from '@/lib/utils';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  loading?: boolean;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  loading = false,
}: TransactionTableProps) {
  const { formatMoney } = useAuth();

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
        <p className="text-xs font-semibold text-slate-400 animate-pulse">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No transactions found</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or record a new transaction.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
      {/* 1. Mobile Cards View (< sm) */}
      <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';
          return (
            <div key={tx.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: `${tx.category?.color || '#10b981'}20`,
                      color: tx.category?.color || '#10b981',
                    }}
                  >
                    <CategoryIcon name={tx.category?.icon || 'Tag'} size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{tx.category?.name || 'General'}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-black text-xs block ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatMoney(tx.amount)}
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {(tx.notes || tx.tags) && (
                <div className="mt-2 pl-13 flex flex-wrap items-center gap-1.5 text-[10px]">
                  {tx.notes && (
                    <span className="text-slate-500 dark:text-slate-400 italic">
                      "{tx.notes}"
                    </span>
                  )}
                  {tx.tags &&
                    tx.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-mono text-[9px]"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Desktop Full Table View (>= sm) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4 sm:px-6">Type & Date</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Description / Notes</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group"
                >
                  {/* Type & Date */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                          {formatDate(tx.date)}
                        </span>
                        <Badge
                          variant={isIncome ? 'emerald' : 'rose'}
                          size="sm"
                          className="mt-0.5 text-[10px]"
                        >
                          {tx.type}
                        </Badge>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs"
                        style={{
                          backgroundColor: `${tx.category?.color || '#10b981'}20`,
                          color: tx.category?.color || '#10b981',
                        }}
                      >
                        <CategoryIcon name={tx.category?.icon || 'Tag'} size={13} />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                        {tx.category?.name || 'General'}
                      </span>
                    </div>
                  </td>

                  {/* Description & Tags */}
                  <td className="py-3.5 px-4">
                    <div className="max-w-xs sm:max-w-md">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {tx.description}
                      </p>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {tx.notes}
                        </p>
                      )}
                      {tx.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tx.tags.split(',').map((tag, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded font-mono"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span
                      className={`font-extrabold text-sm sm:text-base ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="truncate mr-2">
            <span className="font-semibold">{pagination.total}</span> records
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-[11px] sm:text-xs">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
