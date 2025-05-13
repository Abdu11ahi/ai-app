import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple redirect to dashboard page
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
} 