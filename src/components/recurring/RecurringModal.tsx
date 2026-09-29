'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Category, RecurringTransaction, TransactionType } from '@/lib/types';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useAuth } from '@/lib/context/AuthContext';
import { Calendar } from 'lucide-react';

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemToEdit?: RecurringTransaction | null;
  categories: Category[];
}

export function RecurringModal({
  isOpen,
  onClose,
  onSuccess,
  itemToEdit,
  categories,
}: RecurringModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [nextDate, setNextDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setType(itemToEdit.type);
        setAmount(itemToEdit.amount.toString());
        setCategoryId(itemToEdit.categoryId);
        setDescription(itemToEdit.description);
        setFrequency(itemToEdit.frequency);
        setStartDate(new Date(itemToEdit.startDate).toISOString().split('T')[0]);
        setNextDate(new Date(itemToEdit.nextDate).toISOString().split('T')[0]);
      } else {
        setType('EXPENSE');
        setAmount('');
        setDescription('');
        setFrequency('MONTHLY');
        setStartDate(new Date().toISOString().split('T')[0]);
        setNextDate(new Date().toISOString().split('T')[0]);
        const defaultCat = categories.find((c) => c.type === 'EXPENSE');
        if (defaultCat) setCategoryId(defaultCat.id);
      }
      setError('');
    }
  }, [isOpen, itemToEdit, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = itemToEdit ? `/api/recurring/${itemToEdit.id}` : '/api/recurring';
      const method = itemToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          categoryId,
          frequency,
          description,
          startDate: new Date(startDate).toISOString(),
          nextDate: new Date(nextDate).toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save recurring schedule');
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
      title={itemToEdit ? 'Edit Scheduled Recurring' : 'New Recurring Schedule'}
      description="Set up automatic repeating payments or income allowances"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              const firstExp = categories.find((c) => c.type === 'EXPENSE');
              if (firstExp) setCategoryId(firstExp.id);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Recurring Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              const firstInc = categories.find((c) => c.type === 'INCOME');
              if (firstInc) setCategoryId(firstInc.id);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition ${
              type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Recurring Income
          </button>
        </div>

        {/* Frequency & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Repeating Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
          >
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </Select>

          <Input
            label={`Amount (${user?.currency || 'PHP'})`}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <Input
          label="Schedule Name / Subscription"
          placeholder="e.g. Netflix Subscription, Apartment Rent, Gym Membership"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Category Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
            {filteredCategories.map((cat) => {
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

        {/* Next Execution Date */}
        <Input
          type="date"
          label="Next Due Date"
          value={nextDate}
          onChange={(e) => setNextDate(e.target.value)}
          required
          leftIcon={<Calendar className="w-4 h-4" />}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {itemToEdit ? 'Save Changes' : 'Create Schedule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
