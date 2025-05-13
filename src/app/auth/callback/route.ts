import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    const supabase = createServerClient(
      'https://uuffzatjfdfpchhopqwd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZmZ6YXRqZmRmcGNoaG9wcXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjE2NjUsImV4cCI6MjA2MjYzNzY2NX0.fXiHVPUpwpmuhhZePN1P8a-IPHeg7l3e4Bj2vS4USjg',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
} 