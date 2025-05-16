import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // Log the available environment variables (keys only) in development
    if (process.env.NODE_ENV !== 'production') {
      const envKeys = Object.keys(process.env)
        .filter(key => key.includes('SUPABASE'))
        .join(', ');
      console.log(`Middleware available env keys: ${envKeys || 'none'}`);
    }
    
    // Create supabase middleware client
    const supabase = createMiddlewareClient({ req, res });

    // This refreshes the user's session and must be called for any Server Component route
    // that uses a Supabase client.
    await supabase.auth.getSession();
  } catch (error) {
    // Log the error but don't block the request
    console.error('Middleware error:', error);
    
    // Add error to response headers for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      res.headers.set('x-middleware-error', error instanceof Error ? error.message : String(error));
    }
  }
  
  return res;
}

// Exclude paths that don't need authentication
export const config = {
  matcher: [
    // Exclude static files, API routes, and other paths that don't need auth
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback).*)',
  ],
}; 