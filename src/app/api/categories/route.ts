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

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { isDefault: true },
          { userId: authUser.id }
        ]
      },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, icon = 'Tag', color = '#10b981' } = await req.json();

    if (!name || !type || !['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json(
        { error: 'Valid name and type (INCOME or EXPENSE) are required' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type,
        icon,
        color,
        userId: authUser.id,
        isDefault: false,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('Category POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
