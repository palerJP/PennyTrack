'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
