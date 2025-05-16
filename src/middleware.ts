import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create supabase middleware client using environment variables from .env.local
  const supabase = createMiddlewareClient({ req, res });

  // This refreshes the user's session and must be called for any Server Component route
  // that uses a Supabase client.
  await supabase.auth.getSession();
  
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 