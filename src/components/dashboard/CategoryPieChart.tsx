'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../ui/Card';
import { useAuth } from '@/lib/context/AuthContext';
import { CategoryIcon } from '../ui/CategoryIcon';

interface CategoryItem {
  name: string;
  amount: number;
  color: string;
  icon?: string;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryItem[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { formatMoney } = useAuth();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {formatMoney(item.amount)} ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Spending by Category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Where your money goes</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-xs text-slate-400">
          No expenses recorded in this period
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-4 flex-1">
          <div className="sm:col-span-6 h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                Total
              </span>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                {formatMoney(totalAmount)}
              </span>
            </div>
          </div>

          <div className="sm:col-span-6 space-y-2 max-h-56 overflow-y-auto pr-1">
            {data.slice(0, 5).map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                    {item.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatMoney(item.amount)}
                  </span>
                  <span className="text-slate-400 text-[10px] ml-1">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
