import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test database connection
    const { data: tablesData, error: tablesError } = await supabase
      .from('retrospectives')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      return NextResponse.json({ 
        success: false, 
        error: tablesError.message,
        details: tablesError 
      }, { status: 500 });
    }

    // Test table schema
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_ddl', { table_name: 'retrospectives' })
      .limit(1);

    if (schemaError && schemaError.message !== 'function get_table_ddl(text) does not exist') {
      return NextResponse.json({ 
        success: false, 
        error: schemaError.message,
        details: schemaError 
      }, { status: 500 });
    }

    // Return successful response
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful',
      tablesData,
      schema: schemaData || 'Schema information not available'
    });
  } catch (error: any) {
    console.error('Error in Supabase test:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 