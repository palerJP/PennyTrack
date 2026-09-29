'use client';

import React from 'react';
import { Sparkles, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface SmartInsightsBannerProps {
  insights: string[];
}

export function SmartInsightsBanner({ insights }: SmartInsightsBannerProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-blue-950/40 border border-emerald-500/20 dark:border-emerald-800/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Smart Spending Insights
            </h4>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 rounded-full">
              Automated Analysis
            </span>
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-700 dark:text-slate-300 font-medium leading-tight"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
