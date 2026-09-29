'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Category, Budget } from '@/lib/types';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useAuth } from '@/lib/context/AuthContext';
import { DollarSign } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budgetToEdit?: Budget | null;
  categories: Category[];
  currentMonth: string;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  budgetToEdit,
  categories,
  currentMonth,
}: BudgetModalProps) {
  const { user } = useAuth();
  const [categoryId, setCategoryId] = useState('');
  const [amountLimit, setAmountLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only expense categories can have spending budgets
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.categoryId || '');
        setAmountLimit(budgetToEdit.amountLimit.toString());
      } else {
        setCategoryId(expenseCategories[0]?.id || '');
        setAmountLimit('');
      }
      setError('');
    }
  }, [isOpen, budgetToEdit, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountLimit || isNaN(Number(amountLimit)) || Number(amountLimit) <= 0) {
      setError('Please enter a valid positive budget limit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: categoryId || null,
          amountLimit: parseFloat(amountLimit),
          month: currentMonth,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save budget');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Edit Budget Limit' : 'Set Category Budget'}
      description={`Allocate a monthly spending cap for ${currentMonth}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Category Selection */}
        {!budgetToEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Category
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
              {expenseCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left transition border ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'border-transparent bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={13} color={cat.color} />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Limit Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Monthly Spending Limit ({user?.currency || 'PHP'})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
              {user?.currency === 'PHP' ? '₱' : '$'}
            </span>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="e.g. 5000.00"
              value={amountLimit}
              onChange={(e) => setAmountLimit(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-300"
              autoFocus
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {budgetToEdit ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
