'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IncomeExpenseBarChart } from '@/components/dashboard/IncomeExpenseBarChart';
import { SpendingTrendsChart } from '@/components/analytics/SpendingTrendsChart';
import { BudgetUtilizationChart } from '@/components/analytics/BudgetUtilizationChart';
import { ExportReportModal } from '@/components/analytics/ExportReportModal';
import { useAuth } from '@/lib/context/AuthContext';
import { getCurrentMonth, getMonthName, formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { formatMoney } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?month=${currentMonth}&months=6`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const changeMonth = (delta: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthStr);
  };

  const summary = analytics?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
  };

  const headerActions = (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="flex items-center gap-0.5 sm:gap-1.5 bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
        <button
          onClick={() => changeMonth(-1)}
          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
          title="Previous Month"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <span className="px-1.5 sm:px-2 whitespace-nowrap">{getMonthName(currentMonth)}</span>
        <button
          onClick={() => changeMonth(1)}
          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
          title="Next Month"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      <Button
        onClick={() => setIsExportOpen(true)}
        size="sm"
        variant="primary"
        className="p-1.5 sm:px-3 sm:py-1.5 flex items-center gap-1.5 text-xs"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">Export Report</span>
      </Button>
    </div>
  );

  return (
    <AppLayout
      title="Analytics"
      subtitle={`Interactive charts, category breakdowns, and performance analytics for ${getMonthName(currentMonth)}`}
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Metric Summary Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Income</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatMoney(summary.totalIncome)}
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses</span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatMoney(summary.totalExpense)}
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Savings</span>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${summary.netSavings >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
              {formatMoney(summary.netSavings)}
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Savings Rate</span>
            <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {summary.savingsRate}%
            </p>
          </Card>
        </div>

        {/* Charts Row 1: 6-Month Inflow/Outflow + Daily Spending */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 xl:col-span-6">
            <IncomeExpenseBarChart data={analytics?.monthlyTrends || []} />
          </div>
          <div className="lg:col-span-6 xl:col-span-6">
            <SpendingTrendsChart
              data={analytics?.dailySpending || []}
              monthLabel={getMonthName(currentMonth)}
            />
          </div>
        </div>

        {/* Charts Row 2: Budget Utilization + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 xl:col-span-6">
            <BudgetUtilizationChart data={analytics?.budgetUtilization || []} />
          </div>

          {/* Category Breakdown Table */}
          <div className="lg:col-span-6 xl:col-span-6">
            <Card className="flex flex-col h-full">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Spending by Category</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Detailed breakdown and share of wallet</p>
              </div>

              {(!analytics?.categoryBreakdown || analytics.categoryBreakdown.length === 0) ? (
                <div className="py-12 text-center text-xs text-slate-400 flex-1 flex items-center justify-center">
                  No expense records in {getMonthName(currentMonth)}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pt-2 flex-1 max-h-[300px] overflow-y-auto">
                  {analytics.categoryBreakdown.map((cat: any) => (
                    <div key={cat.name} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          <CategoryIcon name={cat.icon || 'Tag'} size={14} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{cat.count} transactions</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {formatMoney(cat.amount)}
                        </span>
                        <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Highest Individual Transactions */}
        {analytics?.topTransactions && analytics.topTransactions.length > 0 && (
          <Card>
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Expense Outflows</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Single largest expenditures in this cycle</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 pt-2">
              {analytics.topTransactions.map((tx: any, idx: number) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {tx.category?.name} • {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                    -{formatMoney(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        month={currentMonth}
        summary={summary}
        categoryBreakdown={analytics?.categoryBreakdown || []}
        budgetUtilization={analytics?.budgetUtilization || []}
      />
    </AppLayout>
  );
}
