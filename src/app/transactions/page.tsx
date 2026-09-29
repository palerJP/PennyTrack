'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionFilterBar } from '@/components/transactions/TransactionFilterBar';
import { TransactionModal } from '@/components/transactions/TransactionModal';
import { CSVImportModal } from '@/components/transactions/CSVImportModal';
import { DeleteConfirmModal } from '@/components/transactions/DeleteConfirmModal';
import { Transaction, Category } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Plus, Download, Upload } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 1,
  });

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
      });

      if (search) params.append('search', search);
      if (type !== 'all') params.append('type', type);
      if (categoryId !== 'all') params.append('categoryId', categoryId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 25, totalPages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, type, categoryId, startDate, endDate, page]);

  useEffect(() => {
    loadTransactions();

    const handleTransactionAdded = () => loadTransactions();
    window.addEventListener('pennytrack:transaction-added', handleTransactionAdded);
    return () => window.removeEventListener('pennytrack:transaction-added', handleTransactionAdded);
  }, [loadTransactions]);

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategoryId('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleExportCSV = async () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await fetch(`/api/transactions/export?${params.toString()}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pennytrack_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deletingTransaction.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== deletingTransaction.id));
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setDeletingTransaction(null);
    }
  };

  const headerActions = (
    <Button
      onClick={() => {
        setEditingTransaction(null);
        setIsModalOpen(true);
      }}
      size="sm"
      className="hidden sm:inline-flex items-center gap-1.5"
    >
      <Plus className="w-4 h-4" />
      <span>New Transaction</span>
    </Button>
  );

  return (
    <AppLayout
      title="Transactions History"
      subtitle="View, search, filter, and manage your income & expense records"
      headerActions={headerActions}
    >
      <div className="space-y-5">
        {/* Filter Controls */}
        <TransactionFilterBar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          type={type}
          onTypeChange={(v) => {
            setType(v);
            setPage(1);
          }}
          categoryId={categoryId}
          onCategoryChange={(v) => {
            setCategoryId(v);
            setPage(1);
          }}
          startDate={startDate}
          onStartDateChange={(v) => {
            setStartDate(v);
            setPage(1);
          }}
          endDate={endDate}
          onEndDateChange={(v) => {
            setEndDate(v);
            setPage(1);
          }}
          categories={categories}
          onExportCSV={handleExportCSV}
          onImportCSV={() => setIsImportOpen(true)}
          onReset={handleResetFilters}
        />

        {/* Transactions Table */}
        <TransactionTable
          transactions={transactions}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setIsModalOpen(true);
          }}
          onDelete={(tx) => setDeletingTransaction(tx)}
          pagination={pagination}
          onPageChange={(newPage) => setPage(newPage)}
          loading={loading}
        />
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
          loadTransactions();
        }}
        transactionToEdit={editingTransaction}
        categories={categories}
      />

      {/* Bulk CSV Import Modal */}
      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => {
          setIsImportOpen(false);
          loadTransactions();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to permanently delete "${deletingTransaction?.description}"?`}
        loading={isDeleting}
      />
    </AppLayout>
  );
}
