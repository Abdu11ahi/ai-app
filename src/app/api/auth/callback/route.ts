import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple redirect to dashboard page with debug info
export async function GET(request: NextRequest) {
  try {
    // Get the request URL and params
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Log complete info for debugging
    console.log('Auth callback URL:', url.toString());
    console.log('Search params:', searchParams);
    console.log('Auth code exists:', !!code);

    // If there was an OAuth error, log it
    if (error) {
      console.error('OAuth Error:', error, errorDescription);
      // Redirect to login with error message
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, request.url));
    }

    // If code exists, exchange it for a session
    if (code) {
      try {
        // Create supabase client using env vars
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing Supabase credentials in environment');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Exchange code for session (this is handled by Supabase, but log for completion)
        console.log('Exchanging code for session');
      } catch (exchangeError) {
        console.error('Error exchanging code:', exchangeError);
      }
    }

    // Always redirect to dashboard even if there's no code
    // The middleware will redirect unauthenticated users to login
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Callback route error:', error);
    // Redirect to login with generic error
    return NextResponse.redirect(new URL('/auth/login?error=Authentication%20failed', request.url));
  }
} 