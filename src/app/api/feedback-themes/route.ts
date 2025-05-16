import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { kmeans } from '@thi.ng/k-means';
import { Database } from '@/lib/database.types';

// Types for our data
type Feedback = {
  id: string;
  message: string;
  type: string;
  retro_id: string;
  created_at: string;
  anonymous: boolean;
  user_id: string;
};

type Theme = {
  id?: string;
  name: string;
  retro_id: string;
  feedback_ids: string[];
  embedding?: number[];
  type: string;
  created_at?: string;
};

// Enhanced authentication check with detailed logging
async function checkAuthentication(request: Request) {
  try {
    console.log("Checking authentication status...");

    // First try to get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log("Found Authorization header, using token-based auth");
      const token = authHeader.substring(7);
      
      try {
        // Create a new cookies instance for each request
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
        
        // Set the auth token manually
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionData?.session && sessionData.session.user) {
          console.log("Authentication successful via token for user:", sessionData.session.user.id);
          return { 
            authenticated: true, 
            user: sessionData.session.user,
            session: sessionData.session,
            supabaseClient: supabase
          };
        }
        
        if (sessionError) {
          console.error("Token authentication error:", sessionError);
        } else {
          console.log("Token authentication did not produce a valid session");
        }
      } catch (tokenError) {
        console.error("Error using auth token:", tokenError);
      }
    }
    
    // Fallback to cookie-based auth if token auth failed
    console.log("Trying cookie-based authentication...");
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Cookie authentication error:", sessionError);
      return { authenticated: false, error: sessionError, errorType: 'session_error' };
    }
    
    if (!sessionData?.session) {
      console.log("No session found in cookies");
      return { authenticated: false, error: new Error('No session found'), errorType: 'no_session' };
    }
    
    if (!sessionData.session.user) {
      console.log("Session exists in cookies but no user found");
      return { authenticated: false, error: new Error('No user in session'), errorType: 'no_user' };
    }
    
    console.log("Authentication successful via cookies for user:", sessionData.session.user.id);
    return { 
      authenticated: true, 
      user: sessionData.session.user,
      session: sessionData.session,
      supabaseClient: supabase
    };
  } catch (error: any) {
    console.error("Exception during authentication check:", error);
    return { 
      authenticated: false, 
      error: new Error(`Authentication check failed: ${error.message}`), 
      errorType: 'auth_check_exception' 
    };
  }
}

// Initialize OpenAI - with better error handling for missing API key
let openai: OpenAI | null = null;
try {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    openai = new OpenAI({ apiKey });
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

// Function to get embeddings for a list of texts
async function getEmbeddings(texts: string[]) {
  try {
    // Check if OpenAI is properly initialized
    if (!openai) {
      throw new Error("OpenAI client is not initialized. Please check your API key.");
    }

    console.log(`Generating embeddings for ${texts.length} texts...`);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      dimensions: 512 // Using smaller embeddings for efficiency
    });
    
    return response.data.map(item => item.embedding);
  } catch (error: any) {
    console.error('Error getting embeddings:', error);
    // Add more detailed error information
    const errorDetail = error.response?.data || error.message || 'Unknown OpenAI error';
    throw new Error(`OpenAI API error: ${errorDetail}`);
  }
}

// Function to cluster embeddings using K-means
function clusterEmbeddings(embeddings: number[][], numClusters: number) {
  if (embeddings.length < numClusters) {
    // If we have fewer items than clusters, each item is its own cluster
    return embeddings.map((_, i) => i);
  }

  try {
    // Run kmeans clustering
    const clusters = kmeans(numClusters, embeddings);
    
    // Map each embedding to its cluster ID
    return embeddings.map((_, i) => {
      // Find which cluster contains this item index
      for (const cluster of clusters) {
        if (cluster.items.includes(i)) {
          return cluster.id;
        }
      }
      return 0; // Fallback to first cluster if not found
    });
  } catch (err) {
    console.error("K-means clustering error:", err);
    // Fallback: assign each item to a cluster in a round-robin fashion
    return embeddings.map((_, i) => i % numClusters);
  }
}

// Get a good name for each cluster based on the most central feedback
function getClusterNames(feedbacks: Feedback[], clusters: number[], embeddings: number[][]) {
  const clusterMap: { [key: number]: { items: Feedback[], centroidDistance: number[] } } = {};
  
  // Group feedbacks by cluster
  clusters.forEach((cluster, i) => {
    if (!clusterMap[cluster]) {
      clusterMap[cluster] = { items: [], centroidDistance: [] };
    }
    clusterMap[cluster].items.push(feedbacks[i]);
  });
  
  // For each cluster, find the most representative feedback (closest to centroid)
  const clusterNames: { [key: number]: string } = {};
  
  Object.entries(clusterMap).forEach(([cluster, data]) => {
    // Simple approach: use the shortest message as the theme name
    const sortedByLength = [...data.items].sort((a, b) => a.message.length - b.message.length);
    // Take first item but limit to 50 chars
    const name = sortedByLength[0].message.slice(0, 50) + (sortedByLength[0].message.length > 50 ? '...' : '');
    clusterNames[parseInt(cluster)] = name;
  });
  
  return clusterNames;
}

export async function POST(request: Request) {
  try {
    console.log("Starting feedback-themes API processing");
    
    // Check if OpenAI API key is available and client is initialized
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return NextResponse.json({ 
        error: 'OpenAI API key not configured', 
        details: 'Please add OPENAI_API_KEY to your .env.local file and restart the server' 
      }, { status: 500 });
    }
    
    if (!openai) {
      console.error("OpenAI client failed to initialize");
      return NextResponse.json({ 
        error: 'OpenAI client initialization failed', 
        details: 'The API key might be invalid or there was an error initializing the OpenAI client' 
      }, { status: 500 });
    }
    
    // Clone the request to read it multiple times
    const clonedRequest = request.clone();
    
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json({ 
        error: 'Invalid request format', 
        details: 'Could not parse JSON request body' 
      }, { status: 400 });
    }
    
    // Enhanced authentication check using auth helpers
    const authCheck = await checkAuthentication(clonedRequest);
    
    if (!authCheck.authenticated) {
      console.error("Authentication failed:", authCheck.errorType);
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authCheck.error?.message || 'Authentication required',
        errorType: authCheck.errorType
      }, { status: 401 });
    }
    
    // Use the authenticated Supabase client from the auth check
    const supabase = authCheck.supabaseClient;
    
    // Parse request data
    const { retroId, feedbackType, numClusters = 3 } = requestBody;
    
    console.log("Request params:", { retroId, feedbackType, numClusters });
    
    if (!retroId) {
      return NextResponse.json({ error: 'Missing retroId parameter' }, { status: 400 });
    }
    
    // Get feedback items for the given retro and optional type
    try {
      // Ensure supabase client is defined
      if (!supabase) {
        throw new Error("Supabase client is undefined");
      }
      
      const query = supabase
        .from('feedback')
        .select('*')
        .eq('retro_id', retroId);
        
      // Add type filter if provided
      if (feedbackType) {
        query.eq('type', feedbackType);
      }
      
      const { data: feedbackItems, error } = await query;
      
      if (error) {
        console.error("Database error getting feedback:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      console.log(`Found ${feedbackItems?.length || 0} feedback items`);
      
      if (!feedbackItems || feedbackItems.length === 0) {
        return NextResponse.json({ 
          message: 'No feedback items found to cluster',
          themes: [] 
        }, { status: 200 });
      }
      
      // Get embeddings for all feedback messages
      console.log("Getting embeddings from OpenAI...");
      const messages = feedbackItems.map(item => item.message);
      
      let embeddings;
      try {
        embeddings = await getEmbeddings(messages);
        console.log(`Generated ${embeddings.length} embeddings`);
      } catch (error: any) {
        console.error("OpenAI embeddings error:", error);
        return NextResponse.json({ 
          error: 'Failed to generate embeddings', 
          details: error.message 
        }, { status: 500 });
      }
      
      // Calculate appropriate number of clusters based on data size
      const optimalClusters = Math.min(
        numClusters,
        Math.max(1, Math.floor(feedbackItems.length / 2))  // At least 2 items per cluster
      );
      
      console.log(`Using ${optimalClusters} clusters for ${feedbackItems.length} items`);
      
      // Cluster the embeddings
      const clusters = clusterEmbeddings(embeddings, optimalClusters);
      
      // Create cluster names
      const clusterNames = getClusterNames(feedbackItems, clusters, embeddings);
      
      // Group feedback items by cluster
      const themes: Theme[] = [];
      const clusterToTheme: { [key: number]: Theme } = {};
      
      for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i];
        
        if (!clusterToTheme[cluster]) {
          clusterToTheme[cluster] = {
            name: clusterNames[cluster],
            retro_id: retroId,
            feedback_ids: [],
            type: feedbackType || 'all',
            embedding: embeddings[i], // Store representative embedding
          };
          themes.push(clusterToTheme[cluster]);
        }
        
        clusterToTheme[cluster].feedback_ids.push(feedbackItems[i].id);
      }
      
      console.log(`Created ${themes.length} themes`);
      
      // Save themes to database
      try {
        console.log("Saving themes to database...");
        if (!supabase) {
          throw new Error("Supabase client is undefined");
        }
        
        const { data: savedThemes, error: saveError } = await supabase
          .from('feedback_themes')
          .upsert(
            themes.map(theme => ({
              retro_id: theme.retro_id,
              name: theme.name,
              feedback_ids: theme.feedback_ids,
              type: theme.type,
              embedding: theme.embedding
            })),
            { onConflict: 'retro_id,name' }
          )
          .select();
          
        if (saveError) {
          console.error("Error saving themes:", saveError);
          // Continue even if save fails - we can still return themes
        } else {
          console.log(`Successfully saved ${savedThemes?.length || 0} themes`);
        }
      } catch (saveError: any) {
        console.error("Exception saving themes:", saveError);
        // Continue even if save fails with exception - we can still return themes
      }
      
      // Return the identified themes
      return NextResponse.json({
        message: `Successfully identified ${themes.length} themes from ${feedbackItems.length} feedback items`,
        themes: themes.map(theme => ({
          name: theme.name,
          type: theme.type,
          feedback_count: theme.feedback_ids.length,
          feedback_ids: theme.feedback_ids
        }))
      }, { status: 200 });
    } catch (dbError: any) {
      console.error("Database operation error:", dbError);
      return NextResponse.json({ 
        error: 'Database error', 
        details: dbError.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in feedback themes API:', error);
    return NextResponse.json({ 
      error: 'Error processing themes', 
      details: error.message 
    }, { status: 500 });
  }
} 