import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Check if the retrospectives table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'retrospectives');
    
    if (tableError) {
      return NextResponse.json({ error: tableError.message }, { status: 500 });
    }

    const tableExists = tables && tables.length > 0;
    
    if (!tableExists) {
      return NextResponse.json({ 
        error: 'Table retrospectives does not exist',
        action: 'Please run the SQL script to create the table'
      }, { status: 404 });
    }
    
    // 2. Check if the columns exist
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'retrospectives');
    
    if (columnsError) {
      return NextResponse.json({ error: columnsError.message }, { status: 500 });
    }
    
    // 3. Test inserting a record (with transaction/rollback so we don't actually insert)
    let insertTest;
    
    try {
      // Start a transaction
      await supabase.rpc('begin');
      
      // Try to insert (this will tell us if we have permission issues)
      insertTest = await supabase
        .from('retrospectives')
        .insert({
          sprint_number: 999,
          team_name: 'Test Team (will be rolled back)',
          user_id: '00000000-0000-0000-0000-000000000000' // Fake UUID
        });
      
      // Roll back transaction so we don't actually insert anything
      await supabase.rpc('rollback');
    } catch (err: any) {
      insertTest = { error: err.message };
    }
    
    return NextResponse.json({ 
      tableExists,
      columns: columns || [],
      insertTest: insertTest?.error ? { error: insertTest.error } : 'Insert would succeed (rolled back)',
      hint: 'If columns show correctly but inserts fail, check RLS policies'
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 