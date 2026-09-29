import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json().catch(() => ({ id: undefined }));

    const now = new Date();
    const where: any = {
      userId: authUser.id,
      isActive: true,
    };

    if (id) {
      where.id = id;
    } else {
      where.nextDate = { lte: now };
    }

    const dueRecurring = await prisma.recurringTransaction.findMany({
      where,
      include: { category: true },
    });

    let processedCount = 0;

    for (const rec of dueRecurring) {
      // Create transaction
      await prisma.transaction.create({
        data: {
          userId: authUser.id,
          categoryId: rec.categoryId,
          amount: rec.amount,
          type: rec.type,
          description: rec.description,
          date: new Date(),
          tags: 'recurring,automated',
          notes: `Auto-generated from scheduled ${rec.frequency.toLowerCase()} transaction`,
        },
      });

      // Calculate next date
      const next = new Date(rec.nextDate);
      if (rec.frequency === 'WEEKLY') {
        next.setDate(next.getDate() + 7);
      } else if (rec.frequency === 'MONTHLY') {
        next.setMonth(next.getMonth() + 1);
      } else if (rec.frequency === 'YEARLY') {
        next.setFullYear(next.getFullYear() + 1);
      }

      await prisma.recurringTransaction.update({
        where: { id: rec.id },
        data: {
          nextDate: next,
          lastProcessed: now,
        },
      });

      // Create confirmation notification
      await prisma.notification.create({
        data: {
          userId: authUser.id,
          title: `Scheduled Payment Processed`,
          message: `${rec.description} (${rec.amount.toFixed(2)}) was successfully recorded.`,
          type: 'RECURRING_DUE',
        },
      });

      processedCount++;
    }

    return NextResponse.json({ success: true, processedCount });
  } catch (error) {
    console.error('Process recurring error:', error);
    return NextResponse.json({ error: 'Failed to process recurring transactions' }, { status: 500 });
  }
}
