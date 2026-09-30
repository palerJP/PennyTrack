'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { MonthlyBudgetProgress } from '@/components/dashboard/MonthlyBudgetProgress';
import { IncomeExpenseBarChart } from '@/components/dashboard/IncomeExpenseBarChart';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { RecentTransactionsList } from '@/components/dashboard/RecentTransactionsList';
import { SmartInsightsBanner } from '@/components/dashboard/SmartInsightsBanner';
import { getCurrentMonth, getMonthName } from '@/lib/utils';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [analytics, setAnalytics] = useState<any>(null);
  const [budgetsData, setBudgetsData] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [resAnalytics, resBudgets, resTx] = await Promise.all([
        fetch(`/api/analytics?month=${currentMonth}&months=6`),
        fetch(`/api/budgets?month=${currentMonth}`),
        fetch(`/api/transactions?month=${currentMonth}&limit=8`),
      ]);

      if (resAnalytics.ok) {
        const data = await resAnalytics.json();
        setAnalytics(data);
      }

      if (resBudgets.ok) {
        const data = await resBudgets.json();
        setBudgetsData(data);
      }

      if (resTx.ok) {
        const data = await resTx.json();
        setRecentTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadData();

    const handleTransactionAdded = () => loadData();
    window.addEventListener('pennytrack:transaction-added', handleTransactionAdded);
    return () => window.removeEventListener('pennytrack:transaction-added', handleTransactionAdded);
  }, [loadData]);

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

  const budgetSummary = budgetsData?.summary || {
    totalLimit: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentage: 0,
  };

  const headerActions = (
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
  );

  return (
    <AppLayout
      title="Dashboard"
      subtitle={`Overview of income, expenses, and budget progress for ${getMonthName(currentMonth)}`}
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Smart Spending Insights Banner */}
        {analytics?.insights && analytics.insights.length > 0 && (
          <SmartInsightsBanner insights={analytics.insights} />
        )}

        {/* 1. Bento Metric Summary Cards */}
        <SummaryCards
          income={summary.totalIncome}
          expense={summary.totalExpense}
          balance={summary.netSavings}
          savingsRate={summary.savingsRate}
          totalBudgetLimit={budgetSummary.totalLimit}
          totalBudgetSpent={budgetSummary.totalSpent}
        />

        {/* 2. Middle Row: Monthly Budgets & Spending by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 xl:col-span-7">
            <MonthlyBudgetProgress
              budgets={budgetsData?.budgets || []}
              totalLimit={budgetSummary.totalLimit}
              totalSpent={budgetSummary.totalSpent}
              month={currentMonth}
            />
          </div>

          <div className="lg:col-span-6 xl:col-span-5">
            <CategoryPieChart data={analytics?.categoryBreakdown || []} />
          </div>
        </div>

        {/* 3. Bottom Row: 6-Month Flow Trends & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 xl:col-span-7">
            <IncomeExpenseBarChart data={analytics?.monthlyTrends || []} />
          </div>

          <div className="lg:col-span-5 xl:col-span-5">
            <RecentTransactionsList transactions={recentTransactions} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
