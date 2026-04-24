import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { isDemoMode } from '@/lib/env';

export const DEMO_COOKIE = 'santa_demo_email';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  if (!isDemoMode) {
    return NextResponse.redirect(`${origin}/?auth=disabled`);
  }

  const email = searchParams.get('email')?.trim().toLowerCase();
  const next = searchParams.get('next') ?? '/';
  if (!email) return NextResponse.redirect(`${origin}/?auth=failed`);

  cookies().set(DEMO_COOKIE, email, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.redirect(`${origin}${next}`);
}
