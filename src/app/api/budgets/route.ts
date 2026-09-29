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
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = searchParams.get('month') || currentMonthStr;

    // Fetch user budgets for the selected month
    const budgets = await prisma.budget.findMany({
      where: {
        userId: authUser.id,
        month: month,
      },
      include: {
        category: true,
      },
      orderBy: {
        amountLimit: 'desc',
      },
    });

    // Parse month date range for expense calculations
    const [year, m] = month.split('-').map(Number);
    const startOfMonth = new Date(year, m - 1, 1);
    const endOfMonth = new Date(year, m, 0, 23, 59, 59, 999);

    // Get aggregated spending per category for this month
    const expenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: authUser.id,
        type: 'EXPENSE',
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: {
        amount: true,
      },
    });

    const expenseMap = new Map<string, number>();
    let totalSpentMonth = 0;
    expenses.forEach((e) => {
      const amt = e._sum.amount || 0;
      expenseMap.set(e.categoryId, amt);
      totalSpentMonth += amt;
    });

    const enrichedBudgets = budgets.map((b) => {
      const spent = b.categoryId ? expenseMap.get(b.categoryId) || 0 : totalSpentMonth;
      const remaining = Math.max(0, b.amountLimit - spent);
      const percentage = b.amountLimit > 0 ? Math.min(100, (spent / b.amountLimit) * 100) : 0;
      const rawPercentage = b.amountLimit > 0 ? (spent / b.amountLimit) * 100 : 0;
      const isOverBudget = spent > b.amountLimit;

      return {
        ...b,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
        rawPercentage: parseFloat(rawPercentage.toFixed(1)),
        isOverBudget,
      };
    });

    const totalLimit = enrichedBudgets.reduce((acc, b) => acc + b.amountLimit, 0);
    const totalSpentInBudgets = enrichedBudgets.reduce((acc, b) => acc + b.spent, 0);

    return NextResponse.json({
      month,
      budgets: enrichedBudgets,
      summary: {
        totalLimit: parseFloat(totalLimit.toFixed(2)),
        totalSpent: parseFloat(totalSpentInBudgets.toFixed(2)),
        totalRemaining: parseFloat(Math.max(0, totalLimit - totalSpentInBudgets).toFixed(2)),
        overallPercentage: totalLimit > 0 ? parseFloat(((totalSpentInBudgets / totalLimit) * 100).toFixed(1)) : 0,
      },
    });
  } catch (error) {
    console.error('Budgets GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId, amountLimit, month } = await req.json();

    if (!amountLimit || isNaN(Number(amountLimit)) || Number(amountLimit) <= 0) {
      return NextResponse.json({ error: 'Valid budget limit is required' }, { status: 400 });
    }

    const targetMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // Upsert budget
    const existing = await prisma.budget.findFirst({
      where: {
        userId: authUser.id,
        categoryId: categoryId || null,
        month: targetMonth,
      },
    });

    let budget;
    if (existing) {
      budget = await prisma.budget.update({
        where: { id: existing.id },
        data: {
          amountLimit: parseFloat(Number(amountLimit).toFixed(2)),
        },
        include: { category: true },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId: authUser.id,
          categoryId: categoryId || null,
          amountLimit: parseFloat(Number(amountLimit).toFixed(2)),
          month: targetMonth,
        },
        include: { category: true },
      });
    }

    return NextResponse.json({ success: true, budget }, { status: 200 });
  } catch (error) {
    console.error('Budget POST error:', error);
    return NextResponse.json({ error: 'Failed to set budget' }, { status: 500 });
  }
}
