'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetModal } from '@/components/budgets/BudgetModal';
import { DeleteConfirmModal } from '@/components/transactions/DeleteConfirmModal';
import { Budget, Category } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { getCurrentMonth, getMonthName } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Plus, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, PieChart } from 'lucide-react';

export default function BudgetsPage() {
  const { formatMoney } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState({
    totalLimit: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/budgets?month=${currentMonth}`);
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.budgets || []);
        setSummary(
          data.summary || {
            totalLimit: 0,
            totalSpent: 0,
            totalRemaining: 0,
            overallPercentage: 0,
          }
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const changeMonth = (delta: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthStr);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBudget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/budgets/${deletingBudget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadBudgets();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setDeletingBudget(null);
    }
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
        onClick={() => {
          setEditingBudget(null);
          setIsModalOpen(true);
        }}
        size="sm"
        className="hidden sm:inline-flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        <span>Set Budget</span>
      </Button>
    </div>
  );

  const overBudgets = budgets.filter((b) => (b.spent || 0) > b.amountLimit);
  const warningBudgets = budgets.filter((b) => {
    const p = b.amountLimit > 0 ? ((b.spent || 0) / b.amountLimit) * 100 : 0;
    return p >= 80 && p <= 100;
  });

  return (
    <AppLayout
      title="Budgets"
      subtitle={`Configure monthly limits and monitor spending thresholds for ${getMonthName(currentMonth)}`}
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Alerts if any budgets are exceeded or warning */}
        {overBudgets.length > 0 && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                Budget Limit Exceeded!
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                You have exceeded spending limits on {overBudgets.map((b) => b.category?.name).join(', ')}. Consider adjusting allocations.
              </p>
            </div>
          </div>
        )}

        {/* Overall Monthly Total Banner */}
        <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border-0 shadow-lg p-6 sm:p-8 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Monthly Spending Budget
              </p>
              <h2 className="text-3xl sm:text-4xl font-black mt-1 tracking-tight">
                {formatMoney(summary.totalLimit)}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Allocated across {budgets.length} category limit{budgets.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="space-y-2 md:border-l md:border-r border-slate-700/60 md:px-6">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total Spent</span>
                <span className="font-bold text-white">{formatMoney(summary.totalSpent)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    summary.overallPercentage > 100
                      ? 'bg-rose-500'
                      : summary.overallPercentage > 80
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Remaining: {formatMoney(summary.totalRemaining)}</span>
                <span className="font-bold text-emerald-300">{summary.overallPercentage}% Used</span>
              </div>
            </div>

            <div className="flex md:justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingBudget(null);
                  setIsModalOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Set Category Limit
              </Button>
            </div>
          </div>
        </Card>

        {/* Category Budget Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Spending Limits</h3>
            <span className="text-xs text-slate-400 font-medium">{budgets.length} active budgets</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <PieChart className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No category budgets set for {getMonthName(currentMonth)}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Setting monthly limits gives you clear visibility into where to cut back and keeps your savings on track.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Create First Budget
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {budgets.map((b) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  onEdit={(item) => {
                    setEditingBudget(item);
                    setIsModalOpen(true);
                  }}
                  onDelete={(item) => setDeletingBudget(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Set / Edit Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
          loadBudgets();
        }}
        budgetToEdit={editingBudget}
        categories={categories}
        currentMonth={currentMonth}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget Limit"
        message={`Are you sure you want to delete the budget limit for "${deletingBudget?.category?.name || 'General'}"?`}
        loading={isDeleting}
      />
    </AppLayout>
  );
}
