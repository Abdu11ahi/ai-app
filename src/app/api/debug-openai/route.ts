import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { Database } from '@/lib/database.types';

// Helper function to check auth via cookies or token
async function checkAuth(request: Request) {
  // First try to get token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    console.log("Using token-based auth for debug-openai");
    
    // Continue with cookie-based auth anyway (token is mostly for logging)
  }
  
  // Use cookie-based auth
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  const { data, error } = await supabase.auth.getSession();
  return { data, error, supabase };
}

export async function GET(request: Request) {
  try {
    // Check authentication using auth helpers
    const { data: sessionData, error: sessionError } = await checkAuth(request);
    
    if (sessionError || !sessionData?.session?.user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        authenticated: false
      }, { status: 401 });
    }
    
    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'OpenAI API key is not configured',
        configuredKey: false,
        authenticated: true,
        user: sessionData.session.user.id
      }, { status: 200 });
    }
    
    // Test OpenAI connection (without revealing the full API key)
    try {
      const openai = new OpenAI({
        apiKey: apiKey.trim()
      });
      
      // Try a minimal API call to verify the key works
      await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: "Test connection",
        dimensions: 512
      });
      
      return NextResponse.json({
        success: true,
        message: 'OpenAI API connection successful',
        keyConfigured: true,
        keyFirstChars: apiKey.substring(0, 3) + '...',
        keyLength: apiKey.length,
        authenticated: true,
        user: sessionData.session.user.id
      }, { status: 200 });
    } catch (openaiError: any) {
      return NextResponse.json({
        error: 'OpenAI API connection failed',
        details: openaiError.message,
        keyConfigured: true,
        keyFirstChars: apiKey.substring(0, 3) + '...',
        keyLength: apiKey.length,
        authenticated: true,
        user: sessionData.session.user.id
      }, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({
      error: 'Error checking OpenAI configuration',
      details: error.message
    }, { status: 500 });
  }
} 