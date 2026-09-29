'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  CalendarClock,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onQuickAdd?: () => void;
}

export function MobileNav({ onQuickAdd }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { name: 'History', href: '/transactions', icon: ArrowLeftRight },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Recurring', href: '/recurring', icon: CalendarClock },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around safe-area-bottom">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors',
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.name}</span>
          </Link>
        );
      })}

      {onQuickAdd && (
        <button
          onClick={onQuickAdd}
          className="w-10 h-10 -mt-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition active:scale-95"
          aria-label="Add Transaction"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
