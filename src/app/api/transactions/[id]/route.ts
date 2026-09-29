import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!transaction || transaction.userId !== authUser.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Transaction GET by id error:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const { amount, type, categoryId, description, date, notes, tags } = await req.json();

    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        amount: amount !== undefined ? parseFloat(Number(amount).toFixed(2)) : existing.amount,
        type: type || existing.type,
        categoryId: categoryId || existing.categoryId,
        description: description !== undefined ? description.trim() : existing.description,
        date: date ? new Date(date) : existing.date,
        notes: notes !== undefined ? (notes?.trim() || null) : existing.notes,
        tags: tags !== undefined ? (tags?.trim() || null) : existing.tags,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    console.error('Transaction PUT error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
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

    const existing = await prisma.transaction.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.userId !== authUser.id) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transaction DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
