import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { ensureDefaultAccountsAndCategories } from '@/lib/ensureSeed';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAccountsAndCategories();

    const body = await req.json();
    const name = body.name ? String(body.name).trim() : '';
    const email = body.email ? String(body.email).toLowerCase().trim() : '';
    const password = body.password ? String(body.password) : '';
    const currency = body.currency || 'PHP';

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const role = (email === 'admin@pennytrack.com' || email === 'palerjaphet@gmail.com') ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        currency,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to PennyTrack! 🎉',
        message: 'Your account is permanently created. Start tracking your budget and expenses right away.',
        type: 'SYSTEM',
      },
    }).catch(() => {});

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          currency: user.currency,
          avatar: user.avatar,
          theme: user.theme,
        },
      },
      { status: 201 }
    );

    response.cookies.set('pennytrack_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
