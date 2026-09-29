'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RecurringCard } from '@/components/recurring/RecurringCard';
import { RecurringModal } from '@/components/recurring/RecurringModal';
import { DeleteConfirmModal } from '@/components/transactions/DeleteConfirmModal';
import { RecurringTransaction, Category } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, CalendarClock, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RecurringPage() {
  const { formatMoney } = useAuth();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'EXPENSE' | 'INCOME'>('ALL');
  const [loading, setLoading] = useState(true);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processMessage, setProcessMessage] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(null);
  const [deletingItem, setDeletingItem] = useState<RecurringTransaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const loadRecurring = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recurring');
      if (res.ok) {
        const data = await res.json();
        setItems(data.recurring || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecurring();
  }, [loadRecurring]);

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      const res = await fetch(`/api/recurring/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) {
        loadRecurring();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProcessSingle = async (item: RecurringTransaction) => {
    setProcessingId(item.id);
    try {
      const res = await fetch('/api/recurring/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      if (res.ok) {
        setProcessMessage(`"${item.description}" was successfully recorded!`);
        setTimeout(() => setProcessMessage(''), 4000);
        loadRecurring();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessAllDue = async () => {
    setIsProcessingAll(true);
    try {
      const res = await fetch('/api/recurring/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setProcessMessage(
          data.processedCount > 0
            ? `${data.processedCount} due scheduled transaction(s) were processed!`
            : 'No recurring bills are currently due today.'
        );
        setTimeout(() => setProcessMessage(''), 4000);
        loadRecurring();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingAll(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/recurring/${deletingItem.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadRecurring();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'ACTIVE') return item.isActive;
    if (filter === 'PAUSED') return !item.isActive;
    if (filter === 'EXPENSE') return item.type === 'EXPENSE';
    if (filter === 'INCOME') return item.type === 'INCOME';
    return true;
  });

  const totalMonthlyExpenses = items
    .filter((i) => i.isActive && i.type === 'EXPENSE')
    .reduce((sum, i) => {
      if (i.frequency === 'WEEKLY') return sum + i.amount * 4;
      if (i.frequency === 'YEARLY') return sum + i.amount / 12;
      return sum + i.amount;
    }, 0);

  const totalMonthlyIncome = items
    .filter((i) => i.isActive && i.type === 'INCOME')
    .reduce((sum, i) => {
      if (i.frequency === 'WEEKLY') return sum + i.amount * 4;
      if (i.frequency === 'YEARLY') return sum + i.amount / 12;
      return sum + i.amount;
    }, 0);

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleProcessAllDue}
        size="sm"
        variant="outline"
        isLoading={isProcessingAll}
        className="hidden sm:inline-flex items-center gap-1.5"
        title="Check and process due recurring transactions"
      >
        <Zap className="w-4 h-4 text-amber-500" />
        <span>Process Due</span>
      </Button>

      <Button
        onClick={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        size="sm"
        className="hidden sm:inline-flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        <span>New Schedule</span>
      </Button>
    </div>
  );

  return (
    <AppLayout
      title="Recurring Transactions & Bills"
      subtitle="Automate repeating subscriptions, utility bills, and salary deposits"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {processMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 text-xs rounded-2xl font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{processMessage}</span>
          </div>
        )}

        {/* Overview Metric Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 sm:p-5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recurring Monthly Expenses
            </span>
            <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatMoney(totalMonthlyExpenses)}/mo
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Estimated subscription & fixed overhead
            </span>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recurring Monthly Inflow
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatMoney(totalMonthlyIncome)}/mo
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Scheduled base salary & payouts
            </span>
          </Card>

          <Card className="p-4 sm:p-5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Schedules
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              {items.filter((i) => i.isActive).length} / {items.length}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Automated reminder rules configured
            </span>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Schedules' },
              { id: 'ACTIVE', label: 'Active Only' },
              { id: 'PAUSED', label: 'Paused' },
              { id: 'EXPENSE', label: 'Bills' },
              { id: 'INCOME', label: 'Income' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="sm:hidden"
          >
            <Plus className="w-4 h-4 mr-1" /> New Schedule
          </Button>
        </div>

        {/* Recurring Schedules Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <CalendarClock className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No recurring transactions found
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Set up recurring templates for Netflix, condo rent, or salary to automatically record payments without manual entry.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Repeating Schedule
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredItems.map((item) => (
              <RecurringCard
                key={item.id}
                item={item}
                onEdit={(rec) => {
                  setEditingItem(rec);
                  setIsModalOpen(true);
                }}
                onDelete={(rec) => setDeletingItem(rec)}
                onToggleActive={handleToggleActive}
                onProcessNow={handleProcessSingle}
                isProcessing={processingId === item.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Recurring Modal */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          loadRecurring();
        }}
        itemToEdit={editingItem}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Recurring Schedule"
        message={`Are you sure you want to delete the recurring schedule for "${deletingItem?.description}"?`}
        loading={isDeleting}
      />
    </AppLayout>
  );
}
