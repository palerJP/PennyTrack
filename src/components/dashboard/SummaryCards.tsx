'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, Wallet, PiggyBank, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card } from '../ui/Card';

interface SummaryCardsProps {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  totalBudgetLimit: number;
  totalBudgetSpent: number;
}

export function SummaryCards({
  income,
  expense,
  balance,
  savingsRate,
  totalBudgetLimit,
  totalBudgetSpent,
}: SummaryCardsProps) {
  const { formatMoney } = useAuth();

  const budgetUsagePct = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
      {/* 1. Total Income */}
      <Card hoverEffect className="relative overflow-hidden group p-3.5 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">
              Total Income
            </p>
            <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight truncate">
              {formatMoney(income)}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
          <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="truncate">Inflows recorded</span>
        </div>
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/5 rounded-full pointer-events-none group-hover:scale-125 transition duration-300" />
      </Card>

      {/* 2. Total Expenses */}
      <Card hoverEffect className="relative overflow-hidden group p-3.5 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">
              Total Expenses
            </p>
            <h3 className="text-base sm:text-2xl lg:text-3xl font-black mt-1 tracking-tight text-rose-600 dark:text-rose-400 truncate">
              {formatMoney(expense)}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          <span className="truncate">{income > 0 ? `${Math.round((expense / income) * 100)}% spent` : 'Recorded expenses'}</span>
        </div>
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-rose-500/5 rounded-full pointer-events-none group-hover:scale-125 transition duration-300" />
      </Card>

      {/* 3. Available Balance / Net Savings */}
      <Card hoverEffect className="relative overflow-hidden group p-3.5 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">
              Net Balance
            </p>
            <h3 className={`text-base sm:text-2xl lg:text-3xl font-black mt-1 tracking-tight truncate ${
              balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatMoney(balance)}
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          <span className={`font-semibold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {balance >= 0 ? 'Surplus' : 'Deficit'}
          </span>
          <span className="hidden sm:inline">available</span>
        </div>
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/5 rounded-full pointer-events-none group-hover:scale-125 transition duration-300" />
      </Card>

      {/* 4. Savings Rate & Budget Progress */}
      <Card hoverEffect className="relative overflow-hidden group p-3.5 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider truncate">
              Savings Rate
            </p>
            <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight truncate">
              {savingsRate}%
            </h3>
          </div>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <PiggyBank className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="mt-2.5 sm:mt-4 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">Budget:</span>
          <span className={`font-bold ${budgetUsagePct > 100 ? 'text-rose-600' : budgetUsagePct > 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
            {budgetUsagePct}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetUsagePct > 100 ? 'bg-rose-500' : budgetUsagePct > 80 ? 'bg-amber-500' : 'bg-purple-500'
            }`}
            style={{ width: `${Math.min(100, budgetUsagePct)}%` }}
          />
        </div>
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-purple-500/5 rounded-full pointer-events-none group-hover:scale-125 transition duration-300" />
      </Card>
    </div>
  );
}
