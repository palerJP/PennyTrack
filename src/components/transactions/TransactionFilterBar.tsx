'use client';

import React from 'react';
import { Search, Filter, Calendar, X, Download, Upload } from 'lucide-react';
import { Category, TransactionType } from '@/lib/types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface TransactionFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  categories: Category[];
  onExportCSV: () => void;
  onImportCSV: () => void;
  onReset: () => void;
}

export function TransactionFilterBar({
  search,
  onSearchChange,
  type,
  onTypeChange,
  categoryId,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  categories,
  onExportCSV,
  onImportCSV,
  onReset,
}: TransactionFilterBarProps) {
  const hasActiveFilters = search || type !== 'all' || categoryId !== 'all' || startDate || endDate;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <Input
          placeholder="Search descriptions, notes, tags..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        {/* Type Filter */}
        <Select value={type} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="all">All Types (Income & Expenses)</option>
          <option value="EXPENSE">Expenses Only</option>
          <option value="INCOME">Income Only</option>
        </Select>

        {/* Category Filter */}
        <Select value={categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.type === 'INCOME' ? '🟢' : '🔴'} {cat.name}
            </option>
          ))}
        </Select>

        {/* Actions Button Group */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onExportCSV}
            className="flex-1"
            title="Download CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xl:inline">Export</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onImportCSV}
            className="flex-1"
            title="Import CSV"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden xl:inline">Import</span>
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="text-slate-400 hover:text-rose-500"
              title="Reset all filters"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Date Range Inputs */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Date Range:
        </span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </div>
  );
}
