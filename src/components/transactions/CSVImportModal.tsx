'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setError('CSV must have a header row and at least one data row.');
        setParsedRows([]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV splitter handling quoted values
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const values = matches.map((v) => v.trim().replace(/^"|"$/g, ''));

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });

        // Map common header names
        const mapped = {
          date: rowObj.date || rowObj.transaction_date || new Date().toISOString().split('T')[0],
          type: (rowObj.type || (parseFloat(rowObj.amount) < 0 ? 'EXPENSE' : 'EXPENSE')).toUpperCase(),
          category: rowObj.category || rowObj.category_name || 'Others',
          description: rowObj.description || rowObj.desc || rowObj.merchant || rowObj.memo || 'Imported Entry',
          amount: Math.abs(parseFloat(rowObj.amount || '0')),
          tags: rowObj.tags || '',
          notes: rowObj.notes || '',
        };

        if (mapped.amount > 0) {
          rows.push(mapped);
        }
      }

      setParsedRows(rows);
      setError('');
    } catch (err: any) {
      setError('Failed to parse CSV format. Please ensure valid comma separation.');
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) {
      setError('No valid rows found to import.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import records');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Transactions (CSV)"
      description="Upload a CSV file or paste your spreadsheet records"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 text-xs rounded-xl font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* File Upload Zone */}
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center transition cursor-pointer relative bg-slate-50/50 dark:bg-slate-900/50">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <FileSpreadsheet className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Click to upload or drag & drop CSV file
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Expected headers: Date, Type, Category, Description, Amount
          </p>
        </div>

        {/* Or Paste CSV */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Or Paste CSV Text directly:
          </label>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              parseCSV(e.target.value);
            }}
            placeholder="Date,Type,Category,Description,Amount&#10;2026-09-15,EXPENSE,Food & Dining,Dinner,450.00&#10;2026-09-16,INCOME,Salary,Payroll,45000.00"
            className="w-full p-3 font-mono text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Preview parsed count */}
        {parsedRows.length > 0 && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {parsedRows.length} transaction records parsed & ready to import
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleImport}
            disabled={parsedRows.length === 0}
            isLoading={loading}
          >
            Import {parsedRows.length > 0 ? `(${parsedRows.length})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
