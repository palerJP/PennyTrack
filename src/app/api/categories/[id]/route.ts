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

    const { name, icon, color } = await req.json();

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category.userId !== authUser.id && !category.isDefault) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name.trim() : category.name,
        icon: icon !== undefined ? icon : category.icon,
        color: color !== undefined ? color : category.color,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error('Category PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category.userId !== authUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete default system categories' },
        { status: 403 }
      );
    }

    // Check if category is used in transactions
    const txCount = await prisma.transaction.count({
      where: { categoryId: params.id },
    });

    if (txCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category because it is used by ${txCount} transaction(s)` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
