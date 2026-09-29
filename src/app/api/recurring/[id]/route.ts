import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.recurringTransaction.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Recurring schedule not found' }, { status: 404 });
    }

    const body = await req.json();
    const { categoryId, amount, type, frequency, nextDate, description, isActive } = body;

    const updated = await prisma.recurringTransaction.update({
      where: { id: params.id },
      data: {
        categoryId: categoryId || existing.categoryId,
        amount: amount !== undefined ? parseFloat(Number(amount).toFixed(2)) : existing.amount,
        type: type || existing.type,
        frequency: frequency || existing.frequency,
        nextDate: nextDate ? new Date(nextDate) : existing.nextDate,
        description: description !== undefined ? description.trim() : existing.description,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, recurring: updated });
  } catch (error) {
    console.error('Recurring PUT error:', error);
    return NextResponse.json({ error: 'Failed to update recurring transaction' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.recurringTransaction.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Recurring schedule not found' }, { status: 404 });
    }

    await prisma.recurringTransaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recurring DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete recurring transaction' }, { status: 500 });
  }
}
