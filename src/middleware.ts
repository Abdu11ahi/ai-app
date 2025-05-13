import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const { data } = await supabase.auth.getSession();
  const isAuthenticated = data.session !== null;
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
  const isProtectedRoute = !request.nextUrl.pathname.startsWith('/auth') && 
                           !request.nextUrl.pathname.startsWith('/api') && 
                           request.nextUrl.pathname !== '/';

  // Skip api routes except auth routes
  if (request.nextUrl.pathname.startsWith('/api') && !isApiAuthRoute) {
    return res;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 