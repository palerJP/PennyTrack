'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Category, TransactionType } from '@/lib/types';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useAuth } from '@/lib/context/AuthContext';
import { PlusCircle, Tag, FileText, Calendar, DollarSign } from 'lucide-react';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickTransactionModal({ isOpen, onClose, onSuccess }: QuickTransactionModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setTags('');
      setNotes('');
      setError('');

      // Fetch categories
      fetch('/api/categories')
        .then((r) => r.json())
        .then((data) => {
          const cats: Category[] = data.categories || [];
          setCategories(cats);
          const defaultCat = cats.find((c) => c.type === type);
          if (defaultCat) setCategoryId(defaultCat.id);
        })
        .catch(console.error);
    }
  }, [isOpen, type]);

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
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type,
          categoryId,
          description,
          date: new Date(date).toISOString(),
          tags: tags.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create transaction');
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
      title="Record Transaction"
      description="Add a new income or expense record to your tracker"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Type Toggle: Expense vs Income */}
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
            Expense
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
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Amount ({user?.currency || 'PHP'})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
              {user?.currency === 'PHP' ? '₱' : '$'}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-300"
              autoFocus
            />
          </div>
        </div>

        {/* Description */}
        <Input
          label="Description / Merchant"
          placeholder={type === 'EXPENSE' ? 'e.g. Grocery Shopping, Dinner at Ramen Nagi' : 'e.g. Monthly Salary, Freelance project'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Category Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
            {filteredCategories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left transition border ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 shadow-xs'
                      : 'border-transparent bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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

        {/* Date and Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="date"
            label="Transaction Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Tags (Optional)"
            placeholder="e.g. food, social, essential"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            leftIcon={<Tag className="w-4 h-4" />}
          />
        </div>

        {/* Notes */}
        <Input
          label="Notes / Receipt reference (Optional)"
          placeholder="Add any extra notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          leftIcon={<FileText className="w-4 h-4" />}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant={type === 'EXPENSE' ? 'danger' : 'primary'} isLoading={loading}>
            {type === 'EXPENSE' ? 'Add Expense' : 'Add Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
