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
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';

interface SidebarProps {
  onQuickAdd?: () => void;
}

export function Sidebar({ onQuickAdd }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Recurring', href: '/recurring', icon: CalendarClock },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-30 select-none relative',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                Penny<span className="text-emerald-600 dark:text-emerald-400">Track</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                Expense & Budget
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Add Button */}
      {onQuickAdd && (
        <div className="p-3">
          <button
            onClick={onQuickAdd}
            className={cn(
              'w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-all py-2.5 active:scale-[0.98]',
              collapsed ? 'px-0' : 'px-4'
            )}
            title="Quick Add Transaction"
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm">Record Money</span>}
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/50 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                )}
              />
              {!collapsed && <span>{item.name}</span>}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800',
            collapsed ? 'justify-center' : ''
          )}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover bg-emerald-100 shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {user?.currency || 'PHP'} Currency
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => logout()}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
