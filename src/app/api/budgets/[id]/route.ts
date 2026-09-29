import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const budget = await prisma.budget.findUnique({
      where: { id: params.id },
    });

    if (!budget || budget.userId !== authUser.id) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    await prisma.budget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Budget DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
