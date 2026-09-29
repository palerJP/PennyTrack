'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { CURRENCIES } from '@/lib/currencies';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Globe, Sun, Moon, Laptop, Bell, CheckCircle2 } from 'lucide-react';

export function PreferencesSettings() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState(user?.currency || 'PHP');
  const [emailAlerts, setEmailAlerts] = useState(user?.emailAlerts ?? true);
  const [budgetAlerts, setBudgetAlerts] = useState(user?.budgetAlerts ?? true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          theme,
          emailAlerts,
          budgetAlerts,
        }),
      });

      if (res.ok) {
        await refreshUser();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">App Preferences</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Personalize currency, theme, and notification thresholds</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 pt-4">
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 text-xs rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Preferences updated!
          </div>
        )}

        {/* Currency Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-600" /> Preferred Currency
          </label>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} — {c.name}
              </option>
            ))}
          </Select>
          <p className="text-[11px] text-slate-400 mt-1">
            Used across all transaction amounts, budgets, and analytics charts.
          </p>
        </div>

        {/* Theme Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Color Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Laptop },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as any)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notification Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-emerald-600" /> In-App Notification Alerts
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Budget Limit Warnings</p>
              <p className="text-[11px] text-slate-400">Receive alerts when spending exceeds 80% or 100% of budget.</p>
            </div>
            <input
              type="checkbox"
              checked={budgetAlerts}
              onChange={(e) => setBudgetAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Scheduled Bill Reminders</p>
              <p className="text-[11px] text-slate-400">Receive reminders for upcoming recurring subscriptions.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" isLoading={loading}>
            Save Preferences
          </Button>
        </div>
      </form>
    </Card>
  );
}
