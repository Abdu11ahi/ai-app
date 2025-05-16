# OpenAI Integration Setup Guide

This guide will help you set up the OpenAI integration for the feedback theme clustering feature and troubleshoot common issues.

## Setting Up the OpenAI API Key

### Step 1: Get an OpenAI API Key

1. Go to [OpenAI's platform](https://platform.openai.com/signup) and sign up for an account if you don't already have one
2. Navigate to the [API keys section](https://platform.openai.com/api-keys)
3. Click "Create new secret key"
4. Give your key a name (e.g., "AI App Integration")
5. Copy the API key - you won't be able to see it again!

### Step 2: Configure Your Environment

Add your API key to the `.env.local` file in the root of your project:

```
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
```

Important notes:
- Make sure there are no spaces before or after the API key
- Ensure there are no line breaks in the API key
- Do not add quotes around the API key

### Step 3: Restart Your Development Server

After adding the API key, restart your development server:

```bash
# Stop the current server with Ctrl+C, then
npm run dev
```

## Troubleshooting Common Issues

### Authentication Issues

If you see "Authentication required" or "Unauthorized" errors:

1. Make sure you're logged in to the application
2. Check that your session is valid (try logging out and back in)
3. Verify that your Supabase authentication is working properly

### OpenAI API Key Issues

If you're encountering issues with the OpenAI API:

1. **Invalid API Key Format**: Ensure your API key starts with "sk-" and contains no line breaks or extra spaces
2. **API Key Not Found**: Verify the key is properly set in your `.env.local` file
3. **Rate Limiting**: If you're seeing rate limit errors, you might need to upgrade your OpenAI account or wait until your rate limits reset

### Database Issues

If themes aren't being saved properly:

1. Check that the `feedback_themes` table exists in your Supabase database
2. Verify that the pgvector extension is enabled if you're using vector embeddings
3. Ensure the table has the correct permissions set up

## Using the Configuration Debugging Tool

This application includes a built-in configuration debugging tool to help identify issues:

1. Navigate to `/dashboard/config` in your application
2. Click "Check OpenAI Configuration"
3. The tool will verify:
   - If you're authenticated
   - If the OpenAI API key is configured
   - If the API key is working correctly

## How Theme Clustering Works

The theme clustering feature:

1. Collects all feedback messages for a retrospective
2. Generates embeddings for each message using OpenAI's text-embedding-3-small model
3. Applies K-means clustering to group similar feedback items
4. Names each cluster based on the most representative feedback
5. Stores the themes in the database for future reference

## Cost Considerations

Using OpenAI's embedding API incurs costs:

- The text-embedding-3-small model costs approximately $0.02 per 1 million tokens
- For most retrospectives, the cost will be just a few cents
- You can monitor your usage in the [OpenAI dashboard](https://platform.openai.com/usage)

## Advanced Configuration

To customize the theme clustering behavior:

- Adjust the number of clusters in the API request (`numClusters` parameter in the ThemesSection component)
- Modify the embedding model in the `getEmbeddings` function (src/app/api/feedback-themes/route.ts)
- Change the theme naming logic in the `getClusterNames` function

If you need further assistance, please refer to the [OpenAI API documentation](https://platform.openai.com/docs/api-reference) or contact support. 