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

    const items = await prisma.recurringTransaction.findMany({
      where: { userId: authUser.id },
      include: { category: true },
      orderBy: { nextDate: 'asc' },
    });

    return NextResponse.json({ recurring: items });
  } catch (error) {
    console.error('Recurring GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring transactions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { categoryId, amount, type, frequency, startDate, nextDate, description } = await req.json();

    if (!categoryId || !amount || !type || !frequency || !description) {
      return NextResponse.json(
        { error: 'Category, amount, type, frequency, and description are required' },
        { status: 400 }
      );
    }

    if (!['WEEKLY', 'MONTHLY', 'YEARLY'].includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const next = nextDate ? new Date(nextDate) : start;

    const recurring = await prisma.recurringTransaction.create({
      data: {
        userId: authUser.id,
        categoryId,
        amount: parseFloat(Number(amount).toFixed(2)),
        type,
        frequency,
        startDate: start,
        nextDate: next,
        description: description.trim(),
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, recurring }, { status: 201 });
  } catch (error) {
    console.error('Recurring POST error:', error);
    return NextResponse.json({ error: 'Failed to create recurring transaction' }, { status: 500 });
  }
}
