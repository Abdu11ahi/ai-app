import { supabase } from './supabase';

// Tests basic database connectivity
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log("Testing direct database connection...");
    
    // Try a simple query that should always work if connected
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Connection test error:", error);
      return false;
    }
    
    console.log("Connection successful, received data:", data);
    return true;
  } catch (error) {
    console.error("Connection test exception:", error);
    return false;
  }
};

// Checks if the profiles table exists and has data
export const checkDatabaseSetup = async (): Promise<boolean> => {
  try {
    console.log("Checking database setup...");
    
    // Check if the profiles table exists and has rows
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Error checking profiles table:", error);
      return false;
    }
    
    console.log(`Profiles table exists with ${count} rows`);
    
    return count !== null && count > 0;
  } catch (error) {
    console.error("Error checking database setup:", error);
    return false;
  }
};

// Creates a test profile if none exists
export const createTestProfile = async (): Promise<string | null> => {
  try {
    console.log("Creating test profile...");
    
    // Generate a test UUID
    const testUserId = '4251d1b4-08d3-424f-ac20-11d416f68b43';
    
    // Check if this profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', testUserId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "Not found"
      console.error("Error checking for existing profile:", checkError);
      return null;
    }
    
    if (existingProfile) {
      console.log("Test profile already exists, skipping creation");
      return testUserId;
    }
    
    // Create a test profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: 'test1@example.com',
        full_name: 'Test User 1',
        avatar_url: 'https://i.pravatar.cc/150?u=test1@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (error) {
      console.error("Error creating test profile:", error);
      return null;
    }
    
    console.log("Created test profile", data);
    return testUserId;
  } catch (error) {
    console.error("Error in createTestProfile:", error);
    return null;
  }
} 