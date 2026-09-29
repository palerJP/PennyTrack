'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Password</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage account authentication and credential protection</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 text-xs rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Password changed successfully!
          </div>
        )}

        <Input
          type="password"
          label="Current Password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="password"
            label="New Password"
            placeholder="Min. 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Re-type new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" isLoading={loading}>
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
}
