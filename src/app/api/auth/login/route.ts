import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, hashPassword, signToken } from '@/lib/auth';
import { ensureDefaultAccountsAndCategories } from '@/lib/ensureSeed';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAccountsAndCategories();

    const body = await req.json();
    const email = body.email ? String(body.email).toLowerCase().trim() : '';
    const password = body.password ? String(body.password) : '';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If default admin or demo user wasn't in DB yet, trigger seed
    if (!user && (email === 'admin@pennytrack.com' || email === 'palerjaphet@gmail.com' || email === 'demo@pennytrack.com')) {
      await ensureDefaultAccountsAndCategories();
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please register or check your spelling.' },
        { status: 401 }
      );
    }

    let isMatch = await comparePassword(password, user.password);

    // Fallback convenience for Japhet / Admin: if standard admin password is used, sync and accept
    if (!isMatch && (email === 'admin@pennytrack.com' || email === 'palerjaphet@gmail.com') && password === 'admin123456') {
      const newHash = await hashPassword('admin123456');
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash, role: 'ADMIN' },
      });
      isMatch = true;
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password. Please check your password and try again.' },
        { status: 401 }
      );
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
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
    });

    // Set secure cookie
    response.cookies.set('pennytrack_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred during login.' },
      { status: 500 }
    );
  }
}
