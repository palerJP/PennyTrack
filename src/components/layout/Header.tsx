'use client';

import React from 'react';
import { Sun, Moon, Laptop, Plus, RefreshCw, Sparkles, Database } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onQuickAdd?: () => void;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, onQuickAdd, actions }: HeaderProps) {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const [isSeeding, setIsSeeding] = React.useState(false);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const handleQuickSeed = async () => {
    if (!confirm('This will load rich sample transactions, budgets, and recurring bills into your account. Continue?')) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Custom Actions passed from individual pages */}
        {actions}

        {/* Demo Seed Data Quick Action */}
        <button
          onClick={handleQuickSeed}
          disabled={isSeeding}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition border border-emerald-200/60 dark:border-emerald-800/60 disabled:opacity-50"
          title="Reset & Load Realistic Demo Data"
        >
          <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>Demo Data</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={cycleTheme}
          className="p-2.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          title={`Current theme: ${theme}. Click to change`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Laptop className="w-4 h-4 text-emerald-500" />
          )}
        </button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* Quick Add Button */}
        {onQuickAdd && (
          <Button
            onClick={onQuickAdd}
            size="sm"
            className="hidden sm:inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Button>
        )}
      </div>
    </header>
  );
}
