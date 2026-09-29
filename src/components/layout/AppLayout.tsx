'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { QuickTransactionModal } from '../dashboard/QuickTransactionModal';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

export function AppLayout({ children, title, subtitle, headerActions }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && !user && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 tracking-wider uppercase">
          Loading PennyTrack...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Sidebar */}
      <Sidebar onQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header
          title={title}
          subtitle={subtitle}
          onQuickAdd={() => setIsQuickAddOpen(true)}
          actions={headerActions}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Global Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          setIsQuickAddOpen(false);
          // Dispatch custom event to tell pages to reload data
          window.dispatchEvent(new CustomEvent('pennytrack:transaction-added'));
        }}
      />
    </div>
  );
}
