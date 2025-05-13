# Google OAuth Setup Guide for Supabase

This guide will help you set up Google OAuth for your Supabase project to fix the error:
```
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and create a new project
3. Give your project a name (e.g., "My AI App") and click "Create"

## Step 2: Configure the OAuth Consent Screen

1. In your Google Cloud Project, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type if you're not part of a Google Workspace organization
3. Click "Create"
4. Fill in the required information:
   - App name
   - User support email
   - Developer contact information
5. Click "Save and Continue"
6. Skip adding scopes for now by clicking "Save and Continue"
7. Add test users if you're in testing mode, then click "Save and Continue"
8. Review your settings and click "Back to Dashboard"

## Step 3: Create OAuth Credentials

1. In the left sidebar, click on "Credentials"
2. Click "Create Credentials" at the top and select "OAuth client ID"
3. For Application type, select "Web application"
4. Enter a name for your client (e.g., "AI App Web Client")
5. Add the following in the "Authorized JavaScript origins" section:
   - `https://uuffzatjfdfpchhopqwd.supabase.co` (Your Supabase project URL)
   - `http://localhost:3000` (Your local development URL)
   - `http://localhost:3001`
   - `http://localhost:3002`
   - `http://localhost:3003`
6. Add the following in the "Authorized redirect URIs" section:
   - `https://uuffzatjfdfpchhopqwd.supabase.co/auth/v1/callback`
   - `http://localhost:3000/api/auth/callback`
   - `http://localhost:3001/api/auth/callback`
   - `http://localhost:3002/api/auth/callback`
   - `http://localhost:3003/api/auth/callback`
7. Click "Create"
8. A popup will show your Client ID and Client Secret. Keep this window open or copy these values somewhere safe.

## Step 4: Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to "Authentication" in the left sidebar
4. Click on "Providers"
5. Find "Google" in the list and click on it
6. Toggle the switch to enable it
7. Enter the Client ID and Client Secret from Google Cloud Console
8. Check "Enable Email Domains" only if you want to restrict sign-in to specific email domains
9. Click "Save"

## Step 5: Test the Integration

1. Run your application locally (e.g., `npm run dev`)
2. Go to the login page
3. Try logging in with Google
4. You should now be redirected to Google's authentication page

## Common Issues and Solutions

1. **"Provider is not enabled" error:**
   - Make sure you've enabled the Google provider in Supabase
   - Double-check that you've saved the configuration

2. **Redirect URI Mismatch:**
   - Make sure the redirect URI in Google Cloud Console exactly matches what Supabase expects
   - For local development, add multiple localhost ports (3000, 3001, 3002, 3003)

3. **API Restrictions:**
   - Make sure you've enabled the necessary Google APIs (usually, the Google+ API)
   - Go to "APIs & Services" > "Library" and search for "Google+" or "Google People API"

4. **Google Cloud Console Console Permissions:**
   - Ensure your Google Cloud project has the necessary APIs enabled
   - Go to "APIs & Services" > "Enabled APIs & services" and check if the Google+ API or People API is enabled 