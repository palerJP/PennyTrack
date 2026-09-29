'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';

interface MonthlyData {
  month: string;
  label: string;
  income: number;
  expense: number;
}

interface IncomeExpenseBarChartProps {
  data: MonthlyData[];
}

export function IncomeExpenseBarChart({ data }: IncomeExpenseBarChartProps) {
  const { formatMoney } = useAuth();
  const { isDark } = useTheme();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1 mb-1">
            {label}
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between gap-4">
            <span>Income:</span>
            <span>{formatMoney(payload[0]?.value)}</span>
          </p>
          <p className="text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between gap-4">
            <span>Expenses:</span>
            <span>{formatMoney(payload[1]?.value)}</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300 font-bold flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Net:</span>
            <span>{formatMoney((payload[0]?.value || 0) - (payload[1]?.value || 0))}</span>
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
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Income vs Expenses</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monthly cash flow dynamics</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Income
          </span>
          <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Expenses
          </span>
        </div>
      </div>

      <div className="w-full h-72 pt-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No transaction records in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? '#334155' : '#f1f5f9'}
              />
              <XAxis
                dataKey="label"
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
              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
