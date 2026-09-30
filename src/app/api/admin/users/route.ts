import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function checkAdmin(req: NextRequest) {
  const authUser = await getUserFromRequest(req);
  if (!authUser) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, role: true, email: true },
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    return null;
  }

  return dbUser;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [users, totalTransactions, totalBudgets, transactionAggregates] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          currency: true,
          avatar: true,
          createdAt: true,
          _count: {
            select: {
              transactions: true,
              budgets: true,
              recurring: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count(),
      prisma.budget.count(),
      prisma.transaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
      }),
    ]);

    let totalIncomeVolume = 0;
    let totalExpenseVolume = 0;

    for (const agg of transactionAggregates) {
      if (agg.type === 'INCOME') totalIncomeVolume = agg._sum.amount || 0;
      if (agg.type === 'EXPENSE') totalExpenseVolume = agg._sum.amount || 0;
    }

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalTransactions,
        totalBudgets,
        totalIncomeVolume,
        totalExpenseVolume,
      },
      users,
    });
  } catch (error: any) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid user ID or role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Admin users DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
