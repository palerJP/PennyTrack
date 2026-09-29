import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, comparePassword, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exportData = searchParams.get('export') === 'true';

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: exportData
        ? {
            categories: true,
            transactions: { include: { category: true } },
            budgets: { include: { category: true } },
            recurring: { include: { category: true } },
            notifications: true,
          }
        : undefined,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (exportData) {
      const { password, ...safeData } = user as any;
      return new NextResponse(JSON.stringify(safeData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="pennytrack_export_${user.email}_${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        avatar: user.avatar,
        theme: user.theme,
        emailAlerts: user.emailAlerts,
        budgetAlerts: user.budgetAlerts,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, currency, avatar, theme, emailAlerts, budgetAlerts, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name.trim();
    if (currency !== undefined) updateData.currency = currency;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (theme !== undefined) updateData.theme = theme;
    if (emailAlerts !== undefined) updateData.emailAlerts = Boolean(emailAlerts);
    if (budgetAlerts !== undefined) updateData.budgetAlerts = Boolean(budgetAlerts);

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      updateData.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        currency: updatedUser.currency,
        avatar: updatedUser.avatar,
        theme: updatedUser.theme,
        emailAlerts: updatedUser.emailAlerts,
        budgetAlerts: updatedUser.budgetAlerts,
      },
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete user and cascade all transactions, budgets, categories, recurring
    await prisma.user.delete({
      where: { id: authUser.id },
    });

    const response = NextResponse.json({ success: true, message: 'Account deleted successfully' });
    response.cookies.delete('pennytrack_token');
    return response;
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
