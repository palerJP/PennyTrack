'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FileText, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '@/lib/context/AuthContext';
import { getMonthName } from '@/lib/utils';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    savingsRate: number;
  };
  categoryBreakdown: any[];
  budgetUtilization: any[];
}

export function ExportReportModal({
  isOpen,
  onClose,
  month,
  summary,
  categoryBreakdown,
  budgetUtilization,
}: ExportReportModalProps) {
  const { user, formatMoney } = useAuth();
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    setDownloading(true);
    try {
      if (format === 'CSV') {
        const res = await fetch(`/api/transactions/export?month=${month}`);
        if (res.ok) {
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `PennyTrack_Report_${month}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
      } else {
        // Generate PDF
        const doc = new jsPDF();
        const monthTitle = getMonthName(month);

        // Header
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text('PennyTrack', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('Personal Expense & Budget Report', 14, 26);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 140, 20);
        doc.text(`Account: ${user?.name || user?.email}`, 140, 26);

        doc.setDrawColor(226, 232, 240);
        doc.line(14, 32, 196, 32);

        // Month Banner
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text(`Financial Statement — ${monthTitle}`, 14, 42);

        // Summary Boxes
        autoTable(doc, {
          startY: 48,
          head: [['Metric', 'Amount / Value']],
          body: [
            ['Total Monthly Income', `${formatMoney(summary.totalIncome)}`],
            ['Total Monthly Expenses', `${formatMoney(summary.totalExpense)}`],
            ['Net Monthly Savings', `${formatMoney(summary.netSavings)}`],
            ['Savings Rate', `${summary.savingsRate}%`],
            ['Currency Base', `${user?.currency || 'PHP'}`],
          ],
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] },
        });

        // Category Breakdown
        const finalY1 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text('Spending by Category', 14, finalY1);

        const categoryRows = categoryBreakdown.map((c) => [
          c.name,
          `${formatMoney(c.amount)}`,
          `${c.percentage}%`,
          `${c.count} txs`,
        ]);

        autoTable(doc, {
          startY: finalY1 + 5,
          head: [['Category', 'Amount Spent', 'Share', 'Transactions']],
          body: categoryRows.length > 0 ? categoryRows : [['No expense entries recorded', '-', '-', '-']],
          theme: 'grid',
          headStyles: { fillColor: [71, 85, 105] },
        });

        // Budget Performance
        const finalY2 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text('Budget Performance', 14, finalY2);

        const budgetRows = budgetUtilization.map((b) => [
          b.categoryName,
          `${formatMoney(b.limit)}`,
          `${formatMoney(b.spent)}`,
          `${b.percentage}%`,
          b.percentage >= 100 ? 'OVER BUDGET' : b.percentage >= 80 ? 'WARNING' : 'ON TRACK',
        ]);

        autoTable(doc, {
          startY: finalY2 + 5,
          head: [['Budget Item', 'Budget Cap', 'Actual Spent', 'Usage %', 'Status']],
          body: budgetRows.length > 0 ? budgetRows : [['No monthly budgets configured', '-', '-', '-', '-']],
          theme: 'grid',
          headStyles: { fillColor: [15, 23, 42] },
        });

        // Save PDF
        doc.save(`PennyTrack_Statement_${month}.pdf`);
      }

      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Financial Report"
      description={`Generate summary report for ${getMonthName(month)}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormat('PDF')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
              format === 'PDF'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <FileText className="w-8 h-8 text-rose-500" />
            <span className="text-xs font-bold">PDF Financial Statement</span>
            <span className="text-[10px] text-slate-400 text-center">
              Formatted document with metrics, tables & performance status
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('CSV')}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${
              format === 'CSV'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
            <span className="text-xs font-bold">CSV Spreadsheet</span>
            <span className="text-[10px] text-slate-400 text-center">
              Raw comma-separated data ready for Excel or Google Sheets
            </span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={downloading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExport} isLoading={downloading}>
            <Download className="w-4 h-4 mr-1.5" />
            Download {format}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
