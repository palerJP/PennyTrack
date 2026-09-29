'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DeleteConfirmModal } from '../transactions/DeleteConfirmModal';
import { Download, Database, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function DataManagement() {
  const { user, logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSeedData = async () => {
    if (!confirm('This will load realistic sample transactions, category budgets, and recurring bills into your account. Continue?')) {
      return;
    }
    setIsSeeding(true);
    setSeedSuccess(false);

    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await fetch('/api/profile?export=true');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PennyTrack_Backup_${user?.email}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (res.ok) {
        await logout();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Card>
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Management & Privacy</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Export your financial records or manage account lifecycle</p>
        </div>

        <div className="space-y-4 pt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {seedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sample financial data successfully populated into your account!
            </div>
          )}

          {/* Seed Demo Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 first:pt-0">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" /> Portfolio Sample Data
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Populate 40+ realistic Philippine Peso transactions, monthly category budgets, and recurring schedules.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSeedData}
              isLoading={isSeeding}
              className="shrink-0 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30"
            >
              Populate Sample Data
            </Button>
          </div>

          {/* Export JSON Data */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" /> Export Account Backup (JSON)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Download a full machine-readable JSON archive of your transactions, budgets, categories, and recurring bills.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="shrink-0 text-xs"
            >
              Export JSON
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div>
              <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Delete Account & Data
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Permanently delete your account and cascade delete all transactions, budgets, and schedules. This cannot be undone.
              </p>
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 text-xs"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete PennyTrack Account"
        message="Are you sure you want to permanently delete your account and all associated financial records? All transaction data will be erased immediately."
        loading={isDeleting}
      />
    </>
  );
}
