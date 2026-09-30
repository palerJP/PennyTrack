import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pennytrack_default_jwt_secret_key_change_in_prod'
);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface AuthUserPayload extends Record<string, unknown> {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export async function signToken(payload: AuthUserPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthUserPayload;
  } catch (err) {
    return null;
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<AuthUserPayload | null> {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    if (user) return user;
  }

  // Try cookie
  const cookieToken = req.cookies.get('pennytrack_token')?.value;
  if (cookieToken) {
    const user = await verifyToken(cookieToken);
    if (user) return user;
  }

  return null;
}
