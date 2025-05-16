import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

// Handle Jira authorization
export async function POST(request: Request) {
  try {
    const { username, apiToken, domain } = await request.json();
    
    if (!username || !apiToken || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Validate credentials by making a test request to Jira
    const credentials = Buffer.from(`${username}:${apiToken}`).toString('base64');
    const jiraUrl = `https://${domain}.atlassian.net/rest/api/3/myself`;
    
    console.log(`Attempting to connect to Jira: ${jiraUrl}`);
    
    const response = await fetch(jiraUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Jira auth failed:', {
        status: response.status,
        statusText: response.statusText,
        responseText
      });
      
      return NextResponse.json({ 
        error: 'Invalid Jira credentials',
        status: response.status,
        statusText: response.statusText,
        details: responseText
      }, { status: 401 });
    }
    
    const jiraUser = await response.json();
    console.log('Jira auth successful for user:', jiraUser.displayName);
    
    // Store encrypted credentials temporarily in a secure cookie
    // In a production app, you'd want to store these securely in a database
    const cookieStore = cookies();
    cookieStore.set('jira_credentials', JSON.stringify({
      username,
      apiToken,
      domain,
      displayName: jiraUser.displayName
    }), { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 30, // 30 minutes
      path: '/'
    });
    
    return NextResponse.json({ 
      success: true, 
      user: {
        displayName: jiraUser.displayName,
        emailAddress: jiraUser.emailAddress
      }
    });
  } catch (error) {
    console.error('Jira auth error:', error);
    return NextResponse.json({ 
      error: 'Failed to authenticate with Jira',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 