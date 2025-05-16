import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use environment variables with fallback to hardcoded values for local development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uuffzatjfdfpchhopqwd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZmZ6YXRqZmRmcGNoaG9wcXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjE2NjUsImV4cCI6MjA2MjYzNzY2NX0.fXiHVPUpwpmuhhZePN1P8a-IPHeg7l3e4Bj2vS4USjg';

// Log to help with debugging - will be removed in production builds
if (process.env.NODE_ENV !== 'production') {
  console.log('Supabase URL:', supabaseUrl.substring(0, 30) + '...');
  console.log('Supabase Key:', supabaseAnonKey.substring(0, 10) + '...');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey); 