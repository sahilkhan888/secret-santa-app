import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { DEMO_COOKIE } from '@/app/auth/demo-login/route';
import { isDemoMode } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  if (isDemoMode) {
    cookies().delete(DEMO_COOKIE);
  } else {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
