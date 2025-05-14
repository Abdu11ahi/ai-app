import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Try a direct SQL approach to get table information
    const { data: tableInfo, error: tableError } = await supabase.rpc(
      'debug_feedback_table',
      {},
      { count: 'exact' }
    ).catch(() => {
      // Create the function if it doesn't exist
      return supabase.rpc('create_debug_function').catch(() => {
        // If we can't create the function, use direct SQL
        return supabase.rpc(
          'exec',
          { 
            query: `
              SELECT column_name, data_type, column_default, is_nullable 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'feedback'
            `
          }
        );
      });
    });

    // Try to refresh schema cache
    await supabase.from('feedback').select('id').limit(1).maybeSingle();
    
    // Check table existence with a simple query
    const { error: tableExistsError } = await supabase
      .from('feedback')
      .select('id')
      .limit(1);

    // Get current session for troubleshooting
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    // Try a test insert with a simpler approach
    let testInsertResult = { success: false, error: 'Not attempted (no user)' };
    
    if (userId) {
      try {
        // First try with meta field as fallback
        const { error: insertError } = await supabase
          .from('feedback')
          .insert({
            user_id: userId,
            retro_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
            message: 'Test message (will be deleted)',
            type: 'well',
            meta: { isAnonymous: false }
          });
        
        testInsertResult = {
          success: !insertError,
          error: insertError ? insertError.message : null,
          approach: 'Used meta field'
        };
        
        // If that failed, try again without anonymous
        if (insertError) {
          const { error: insertError2 } = await supabase
            .from('feedback')
            .insert({
              user_id: userId,
              retro_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
              message: 'Test message (will be deleted)',
              type: 'well'
            });
            
          testInsertResult = {
            success: !insertError2,
            error: insertError2 ? insertError2.message : null,
            approach: 'Used basic fields only'
          };
        }
      } catch (e: any) {
        testInsertResult = {
          success: false,
          error: e.message,
          approach: 'Error during attempt'
        };
      }
    }
    
    // Return a simplified diagnosis
    return NextResponse.json({
      diagnosis: {
        tableExists: !tableExistsError,
        tableData: tableInfo || [],
        testInsertResult,
        userId: userId ? 'Found user ID' : 'No user ID (not logged in)',
      },
      possibleIssues: {
        schema: 'Your table schema in Supabase may not match what the app expects',
        permissions: 'You might have RLS issues preventing table access',
        supabaseConnection: 'Your Supabase connection could be misconfigured'
      },
      fixes: [
        'Run the fix_feedback_table.sql script in Supabase SQL Editor',
        'Make sure you are logged in (userId is required)',
        'Try clearing your browser cache and restarting the app',
        'Check your Supabase project settings for correct URLs and API keys'
      ],
      quickFixSql: `
        -- Run this SQL in Supabase to recreate the feedback table:
        DROP TABLE IF EXISTS public.feedback;
        
        CREATE TABLE public.feedback (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          retro_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('well', 'didnt', 'suggestion', 'blocker')),
          message TEXT NOT NULL,
          anonymous BOOLEAN NOT NULL DEFAULT false,
          meta JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        
        -- Enable RLS
        ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
        
        -- Allow all for authenticated users (simplest policy for testing)
        CREATE POLICY "Allow all for authenticated users"
          ON public.feedback
          USING (auth.role() = 'authenticated');
          
        -- Grant access
        GRANT ALL ON public.feedback TO authenticated;
      `
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'An unknown error occurred',
      hint: 'Try running the SQL script in Supabase directly'
    }, { status: 500 });
  }
} 