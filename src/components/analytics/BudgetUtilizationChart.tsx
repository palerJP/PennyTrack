'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';

interface BudgetUtilizationItem {
  categoryName: string;
  limit: number;
  spent: number;
  percentage: number;
  color: string;
}

interface BudgetUtilizationChartProps {
  data: BudgetUtilizationItem[];
}

export function BudgetUtilizationChart({ data }: BudgetUtilizationChartProps) {
  const { formatMoney } = useAuth();
  const { isDark } = useTheme();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">{item.categoryName}</p>
          <p className="text-slate-500 flex justify-between gap-4">
            <span>Limit:</span> <strong>{formatMoney(item.limit)}</strong>
          </p>
          <p className="text-rose-500 flex justify-between gap-4">
            <span>Spent:</span> <strong>{formatMoney(item.spent)}</strong>
          </p>
          <p className="text-emerald-500 flex justify-between gap-4 font-bold">
            <span>Utilization:</span> <span>{item.percentage}%</span>
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
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Budget Utilization</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Comparing spending vs allocated limits</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700 inline-block" /> Limit
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Spent
          </span>
        </div>
      </div>

      <div className="w-full h-72 pt-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No category budgets created for this month
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
                dataKey="categoryName"
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
              <Bar dataKey="limit" name="Limit" fill={isDark ? '#334155' : '#e2e8f0'} radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="spent" name="Spent" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
