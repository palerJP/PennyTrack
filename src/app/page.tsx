'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  PieChart,
  BarChart3,
  CalendarClock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Database,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [isLoggingInDemo, setIsLoggingInDemo] = React.useState(false);

  const handleDemoLogin = async () => {
    setIsLoggingInDemo(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@pennytrack.com',
          password: 'pennytrack123',
        }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.user);
      } else {
        router.push('/login');
      }
    } catch (e) {
      router.push('/login');
    } finally {
      setIsLoggingInDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-800">
      {/* Navigation Bar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Penny<span className="text-emerald-600 dark:text-emerald-400">Track</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="md">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="md">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:inline-block">
                <Button variant="primary" size="md">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Portfolio Project • Full-Stack Personal Finance Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Master your money with <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">clarity & precision.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          Track expenses in Philippine Peso (₱) and multi-currencies, set category budgets, schedule recurring subscriptions, and visualize cash flow trends with interactive analytics.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          {user ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full shadow-lg shadow-emerald-600/20">
                Open Dashboard <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={handleDemoLogin}
                isLoading={isLoggingInDemo}
                className="w-full sm:w-auto shadow-lg shadow-emerald-600/20"
              >
                <Zap className="w-4 h-4 mr-1.5" /> 1-Click Demo Explore
              </Button>
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Create Free Account
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Demo Credentials hint */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          Demo credentials: <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-emerald-600 dark:text-emerald-400">demo@pennytrack.com</code> / <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-emerald-600 dark:text-emerald-400">pennytrack123</code>
        </p>

        {/* Dashboard Preview Mockup Card */}
        <div className="mt-14 max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-emerald-950/5 relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Monthly Inflow</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">₱76,200.00</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 14% vs last month</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Total Expenses</p>
              <p className="text-2xl font-black text-rose-600 mt-1">₱36,448.50</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">47% of income allocated</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left">
              <p className="text-[11px] font-bold text-slate-400 uppercase">Net Savings</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">₱39,751.50</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">52% Healthy savings rate</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                ₱
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Active Philippine Peso Budget Tracking</p>
                <p className="text-[11px] text-slate-500">Food & Dining: ₱6,250 spent of ₱8,000 limit (78%)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
              On Track
            </span>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200/80 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Engineered for complete personal financial control
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Every feature designed to solve real money management challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              title: 'Bento Dashboard Overview',
              desc: 'Live financial summaries, net surplus calculations, monthly budget progress, and quick transaction recording.',
            },
            {
              icon: TrendingUp,
              title: 'Income & Expense Tracking',
              desc: 'Categorized records with tags, merchant notes, date ranges, multi-column search, and CSV import/export.',
            },
            {
              icon: PieChart,
              title: 'Category Budget Limits',
              desc: 'Allocate monthly spending limits per category with dynamic warning thresholds at 80% and 100% capacity.',
            },
            {
              icon: BarChart3,
              title: 'Recharts Financial Analytics',
              desc: 'Interactive cash flow bar charts, spending donut breakdowns, daily velocity trends, and downloadable PDF reports.',
            },
            {
              icon: CalendarClock,
              title: 'Recurring Bills & Subscriptions',
              desc: 'Automate recurring bills (weekly, monthly, yearly) with due date reminders and 1-click manual trigger execution.',
            },
            {
              icon: ShieldCheck,
              title: 'Privacy & Data Ownership',
              desc: 'Encrypted passwords, user data isolation, full machine-readable JSON backup export, and one-click account deletion.',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Stack Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
          Technology Stack Architecture
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" /> Next.js 14 (App Router)</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> TypeScript</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-500" /> Tailwind CSS</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Prisma ORM</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> PostgreSQL / SQLite</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Recharts Data Viz</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 PennyTrack. Personal Expense & Budget Management Portfolio System.</p>
        <p>Built with Next.js, Prisma, and Tailwind CSS.</p>
      </footer>
    </div>
  );
}
