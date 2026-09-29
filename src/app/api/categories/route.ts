import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let categories = await prisma.category.findMany({
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

    // Auto-seed default categories if empty in fresh database
    if (categories.length === 0) {
      const allDefaults = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
      for (const cat of allDefaults) {
        await prisma.category.create({
          data: {
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: cat.type,
            isDefault: true,
          }
        }).catch(() => {});
      }

      categories = await prisma.category.findMany({
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
    }

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
