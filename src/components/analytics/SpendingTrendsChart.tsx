'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';

interface DailySpendingItem {
  day: number;
  date: string;
  amount: number;
}

interface SpendingTrendsChartProps {
  data: DailySpendingItem[];
  monthLabel: string;
}

export function SpendingTrendsChart({ data, monthLabel }: SpendingTrendsChartProps) {
  const { formatMoney } = useAuth();
  const { isDark } = useTheme();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">Day {label}</p>
          <p className="text-rose-600 dark:text-rose-400 font-semibold">
            Spending: {formatMoney(payload[0]?.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Daily Spending Trajectory</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Expense velocity during {monthLabel}</p>
        </div>
      </div>

      <div className="w-full h-72 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? '#334155' : '#f1f5f9'}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              name="Daily Spending"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
