import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://uuffzatjfdfpchhopqwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1ZmZ6YXRqZmRmcGNoaG9wcXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjE2NjUsImV4cCI6MjA2MjYzNzY2NX0.fXiHVPUpwpmuhhZePN1P8a-IPHeg7l3e4Bj2vS4USjg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey); 