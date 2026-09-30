'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  CalendarClock,
  Plus,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  LogOut,
  X,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';

interface MobileNavProps {
  onQuickAdd?: () => void;
}

export function MobileNav({ onQuickAdd }: MobileNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'History', href: '/transactions', icon: ArrowLeftRight },
  ];

  const secondaryItems = [
    { name: 'Budgets', href: '/budgets', icon: PieChart },
  ];

  const moreItems = [
    { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3, desc: 'Visual cash flow and spending trends' },
    { name: 'Recurring Subscriptions', href: '/recurring', icon: CalendarClock, desc: 'Monthly bills and recurring services' },
    { name: 'Settings & Profile', href: '/settings', icon: Settings, desc: 'Currencies, themes, and preferences' },
    ...(user?.role === 'ADMIN' ? [{ name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck, desc: 'User accounts and platform oversight' }] : []),
  ];

  const isMoreActive = moreItems.some((item) => pathname === item.href);

  return (
    <>
      {/* Slide-up "More" Menu Modal */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto z-10 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">PennyTrack Menu</h3>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links List */}
            <div className="space-y-1.5">
              {moreItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={cn(
                      'flex items-center gap-3.5 p-3 rounded-2xl transition',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Logout Action */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200/60 dark:border-rose-900/60 transition active:scale-98"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of PennyTrack</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        {/* 1. Home */}
        {mainItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-all',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* 2. Center Raised Quick-Add Button (+) */}
        {onQuickAdd && (
          <div className="flex-1 flex justify-center -mt-6">
            <button
              onClick={onQuickAdd}
              className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl shadow-lg shadow-emerald-500/40 flex items-center justify-center transition-all duration-200 active:scale-90 border-2 border-white dark:border-slate-900"
              aria-label="Add Transaction"
              title="Quick Add Transaction"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* 3. Budgets */}
        {secondaryItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-all',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* 4. More Button */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-semibold transition-all',
            isMoreActive || isMoreOpen
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
