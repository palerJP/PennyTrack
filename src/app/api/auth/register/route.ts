import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, currency = 'PHP' } = await req.json();

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

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        currency: currency || 'PHP',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    // Ensure default categories exist or create a welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to PennyTrack! 🎉',
        message: 'Get started by creating your first budget or recording your daily transactions.',
        type: 'SYSTEM',
      },
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
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
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
