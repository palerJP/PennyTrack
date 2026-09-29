import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthsBack = parseInt(searchParams.get('months') || '6', 10);
    const selectedMonth = searchParams.get('month'); // e.g. "2026-09"

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Build date ranges for monthly historical trends
    const monthSeries: { monthKey: string; label: string; start: Date; end: Date }[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const monthKey = `${y}-${String(m).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      monthSeries.push({ monthKey, label, start, end });
    }

    const overallStart = monthSeries[0].start;
    const overallEnd = monthSeries[monthSeries.length - 1].end;

    // Fetch all transactions in the analytical window
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: authUser.id,
        date: { gte: overallStart, lte: overallEnd },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Monthly trends
    const monthlyData = monthSeries.map(({ monthKey, label, start, end }) => {
      const txsInMonth = allTransactions.filter(
        (t) => t.date >= start && t.date <= end
      );

      const income = txsInMonth
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = txsInMonth
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0);

      const net = income - expense;
      const savingsRate = income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;

      return {
        month: monthKey,
        label,
        income: parseFloat(income.toFixed(2)),
        expense: parseFloat(expense.toFixed(2)),
        net: parseFloat(net.toFixed(2)),
        savingsRate,
      };
    });

    // Target month analysis (or current month if none specified)
    const targetMonthKey = selectedMonth || `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const [tYear, tMonth] = targetMonthKey.split('-').map(Number);
    const targetStart = new Date(tYear, tMonth - 1, 1);
    const targetEnd = new Date(tYear, tMonth, 0, 23, 59, 59, 999);

    const targetTxs = allTransactions.filter(
      (t) => t.date >= targetStart && t.date <= targetEnd
    );

    const currentMonthExpenses = targetTxs.filter((t) => t.type === 'EXPENSE');
    const totalCurrentExpense = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const totalCurrentIncome = targetTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    // Category breakdown
    const categoryAgg: Record<
      string,
      { name: string; amount: number; color: string; icon: string; count: number }
    > = {};

    currentMonthExpenses.forEach((t) => {
      const catName = t.category?.name || 'Uncategorized';
      const catColor = t.category?.color || '#6366f1';
      const catIcon = t.category?.icon || 'Tag';

      if (!categoryAgg[catName]) {
        categoryAgg[catName] = {
          name: catName,
          amount: 0,
          color: catColor,
          icon: catIcon,
          count: 0,
        };
      }
      categoryAgg[catName].amount += t.amount;
      categoryAgg[catName].count += 1;
    });

    const categoryBreakdown = Object.values(categoryAgg)
      .map((c) => ({
        ...c,
        amount: parseFloat(c.amount.toFixed(2)),
        percentage: totalCurrentExpense > 0 ? parseFloat(((c.amount / totalCurrentExpense) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Daily spending trends in the target month
    const daysInMonth = targetEnd.getDate();
    const dailySpending: { day: number; date: string; amount: number }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dStart = new Date(tYear, tMonth - 1, day, 0, 0, 0);
      const dEnd = new Date(tYear, tMonth - 1, day, 23, 59, 59, 999);
      const dayTxs = currentMonthExpenses.filter(
        (t) => t.date >= dStart && t.date <= dEnd
      );
      const dayAmount = dayTxs.reduce((sum, t) => sum + t.amount, 0);
      dailySpending.push({
        day,
        date: `${targetMonthKey}-${String(day).padStart(2, '0')}`,
        amount: parseFloat(dayAmount.toFixed(2)),
      });
    }

    // Highest individual transactions
    const topTransactions = [...currentMonthExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Fetch Budgets for target month to compare utilization
    const budgets = await prisma.budget.findMany({
      where: { userId: authUser.id, month: targetMonthKey },
      include: { category: true },
    });

    const budgetUtilization = budgets.map((b) => {
      const catSpent = b.categoryId
        ? categoryBreakdown.find((c) => c.name === b.category?.name)?.amount || 0
        : totalCurrentExpense;
      const pct = b.amountLimit > 0 ? Math.min(100, Math.round((catSpent / b.amountLimit) * 100)) : 0;
      return {
        categoryName: b.category?.name || 'Overall Budget',
        limit: b.amountLimit,
        spent: catSpent,
        remaining: Math.max(0, b.amountLimit - catSpent),
        percentage: pct,
        color: b.category?.color || '#10b981',
      };
    });

    // Previous month comparison for descriptive smart insights
    const prevMonthIdx = monthSeries.findIndex((m) => m.monthKey === targetMonthKey) - 1;
    let smartInsights: string[] = [];

    if (prevMonthIdx >= 0) {
      const prevData = monthlyData[prevMonthIdx];
      const curData = monthlyData[prevMonthIdx + 1];

      if (curData && prevData) {
        if (curData.expense > prevData.expense) {
          const diffPct = prevData.expense > 0 ? Math.round(((curData.expense - prevData.expense) / prevData.expense) * 100) : 0;
          smartInsights.push(`Your spending increased by ${diffPct}% compared to last month.`);
        } else if (curData.expense < prevData.expense) {
          const diffPct = prevData.expense > 0 ? Math.round(((prevData.expense - curData.expense) / prevData.expense) * 100) : 0;
          smartInsights.push(`Great discipline! Spending is ${diffPct}% lower than last month.`);
        }

        if (curData.savingsRate >= 30) {
          smartInsights.push(`Healthy savings rate: You retained ${curData.savingsRate}% of your total earnings this period.`);
        }
      }
    }

    if (categoryBreakdown.length > 0) {
      const topCat = categoryBreakdown[0];
      smartInsights.push(`Top expense driver: ${topCat.name} accounts for ${topCat.percentage}% of your monthly expenses.`);
    }

    if (smartInsights.length === 0) {
      smartInsights.push('Record more transactions to unlock deeper spending analytics and trend comparisons.');
    }

    return NextResponse.json({
      targetMonth: targetMonthKey,
      summary: {
        totalIncome: parseFloat(totalCurrentIncome.toFixed(2)),
        totalExpense: parseFloat(totalCurrentExpense.toFixed(2)),
        netSavings: parseFloat((totalCurrentIncome - totalCurrentExpense).toFixed(2)),
        savingsRate: totalCurrentIncome > 0 ? Math.max(0, Math.round(((totalCurrentIncome - totalCurrentExpense) / totalCurrentIncome) * 100)) : 0,
      },
      monthlyTrends: monthlyData,
      categoryBreakdown,
      dailySpending,
      topTransactions,
      budgetUtilization,
      insights: smartInsights,
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
