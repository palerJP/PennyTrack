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
    const type = searchParams.get('type'); // "INCOME", "EXPENSE", or all
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month'); // e.g. "2026-09"
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      userId: authUser.id,
    };

    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      where.type = type;
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { notes: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (month) {
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, m - 1, 1);
      const end = new Date(year, m, 0, 23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        where.date.lte = eDate;
      }
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip: skip,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, type, categoryId, description, date, notes, tags } = await req.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid positive amount is required' }, { status: 400 });
    }

    if (!type || !['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json({ error: 'Valid type (INCOME or EXPENSE) is required' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const txDate = date ? new Date(date) : new Date();

    const transaction = await prisma.transaction.create({
      data: {
        userId: authUser.id,
        categoryId,
        amount: parseFloat(Number(amount).toFixed(2)),
        type,
        description: description.trim(),
        date: txDate,
        notes: notes?.trim() || null,
        tags: tags?.trim() || null,
      },
      include: {
        category: true,
      },
    });

    // Check budget alert if this is an expense
    if (type === 'EXPENSE') {
      const monthStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      
      const budget = await prisma.budget.findFirst({
        where: {
          userId: authUser.id,
          categoryId: categoryId,
          month: monthStr,
        },
        include: { category: true }
      });

      if (budget) {
        // Calculate total spent for this category this month
        const startOfMonth = new Date(txDate.getFullYear(), txDate.getMonth(), 1);
        const endOfMonth = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0, 23, 59, 59, 999);

        const spentAgg = await prisma.transaction.aggregate({
          where: {
            userId: authUser.id,
            categoryId: categoryId,
            type: 'EXPENSE',
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        });

        const totalSpent = spentAgg._sum.amount || 0;
        const ratio = totalSpent / budget.amountLimit;

        if (ratio >= 1.0) {
          await prisma.notification.create({
            data: {
              userId: authUser.id,
              title: `Budget Exceeded: ${budget.category?.name || 'Category'}`,
              message: `You have spent ${totalSpent.toFixed(2)}, which exceeds your budget limit of ${budget.amountLimit.toFixed(2)}.`,
              type: 'BUDGET_ALERT',
            },
          });
        } else if (ratio >= 0.85) {
          await prisma.notification.create({
            data: {
              userId: authUser.id,
              title: `Budget Warning: ${budget.category?.name || 'Category'}`,
              message: `You have reached ${Math.round(ratio * 100)}% of your monthly budget limit (${totalSpent.toFixed(2)} / ${budget.amountLimit.toFixed(2)}).`,
              type: 'BUDGET_ALERT',
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error) {
    console.error('Transaction POST error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
