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

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { userId: authUser.id };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        where.date.lte = e;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Tags', 'Notes'];
    const rows = transactions.map((t) => [
      t.id,
      t.date.toISOString().split('T')[0],
      t.type,
      `"${t.category?.name?.replace(/"/g, '""') || ''}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      `"${(t.tags || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pennytrack_transactions_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
