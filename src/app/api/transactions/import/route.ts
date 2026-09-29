import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No transaction records provided' }, { status: 400 });
    }

    // Fetch existing categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ isDefault: true }, { userId: authUser.id }],
      },
    });

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => {
      categoryMap.set(c.name.toLowerCase().trim(), c.id);
    });

    let defaultExpenseCatId = categories.find((c) => c.name === 'Others' && c.type === 'EXPENSE')?.id;
    let defaultIncomeCatId = categories.find((c) => c.name === 'Other Income' && c.type === 'INCOME')?.id;

    if (!defaultExpenseCatId && categories.length > 0) defaultExpenseCatId = categories[0].id;
    if (!defaultIncomeCatId && categories.length > 0) defaultIncomeCatId = categories[0].id;

    let createdCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const type = item.type?.toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE';
      const amount = parseFloat(item.amount);
      const description = item.description || item.desc || 'Imported Transaction';
      const date = item.date ? new Date(item.date) : new Date();

      if (isNaN(amount) || amount <= 0) {
        errors.push(`Row ${i + 1}: Invalid amount`);
        continue;
      }

      // Find or create category
      let catId: string | undefined;
      const catName = item.category?.trim();
      if (catName && categoryMap.has(catName.toLowerCase())) {
        catId = categoryMap.get(catName.toLowerCase());
      } else if (catName) {
        // Create user category
        const newCat = await prisma.category.create({
          data: {
            name: catName,
            type,
            icon: 'Tag',
            color: '#6366f1',
            userId: authUser.id,
            isDefault: false,
          },
        });
        categoryMap.set(catName.toLowerCase(), newCat.id);
        catId = newCat.id;
      } else {
        catId = type === 'INCOME' ? defaultIncomeCatId : defaultExpenseCatId;
      }

      if (!catId) continue;

      await prisma.transaction.create({
        data: {
          userId: authUser.id,
          categoryId: catId,
          amount,
          type,
          description,
          date,
          tags: item.tags || null,
          notes: item.notes || 'Imported via CSV',
        },
      });
      createdCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount: createdCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import transactions' }, { status: 500 });
  }
}
