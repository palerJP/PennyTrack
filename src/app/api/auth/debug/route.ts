import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rawClientId = process.env.GOOGLE_CLIENT_ID || '';
  const rawSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  return NextResponse.json({
    status: 'ok',
    google_client_id: {
      is_set: rawClientId.length > 0,
      length: rawClientId.length,
      prefix: rawClientId.length > 8 ? rawClientId.substring(0, 8) + '...' : 'empty',
      suffix: rawClientId.length > 10 ? '...' + rawClientId.slice(-15) : 'empty',
    },
    google_client_secret: {
      is_set: rawSecret.length > 0,
      length: rawSecret.length,
      suffix: rawSecret.length > 4 ? '...' + rawSecret.slice(-4) : 'empty',
    },
    app_url: appUrl,
    timestamp: new Date().toISOString(),
  });
}
