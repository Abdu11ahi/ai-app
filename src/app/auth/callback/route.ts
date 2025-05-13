import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Fallback callback handler for /auth/callback
export async function GET(request: NextRequest) {
  // Log the full URL for debugging
  const url = new URL(request.url);
  console.log('Auth fallback callback URL:', url.toString());
  console.log('Search params:', Object.fromEntries(url.searchParams.entries()));
  
  // Get the code from the URL
  const code = url.searchParams.get('code');
  console.log('Auth code exists in fallback:', !!code);
  
  return NextResponse.redirect(new URL('/dashboard', request.url));
} 