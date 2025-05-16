# Setting Up OpenAI Embeddings and Feedback Theme Clustering

This guide will help you set up the feedback theme clustering feature that uses OpenAI embeddings and machine learning to automatically identify themes from retrospective feedback.

## Prerequisites

- A Supabase project with the existing retrospective and feedback tables
- An OpenAI API key (from [platform.openai.com](https://platform.openai.com))
- Node.js and npm

## Step 1: Install Required Dependencies

```bash
# Install the OpenAI API client and k-means clustering library
npm install openai@^4.28.0 kmeans-ts@^1.0.4
```

## Step 2: Configure Environment Variables

Create or update your `.env.local` file in the project root with your OpenAI API key:

```
# Add this to your .env.local file
OPENAI_API_KEY=your_openai_api_key_here
```

## Step 3: Set Up the Database Table

Run the following SQL in your Supabase SQL Editor to create the necessary table for storing themes:

```sql
-- Create the feedback_themes table to store identified themes from feedback
CREATE TABLE IF NOT EXISTS public.feedback_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retro_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  feedback_ids UUID[] NOT NULL,
  type TEXT NOT NULL,
  embedding VECTOR(512), -- Use VECTOR type for embeddings if pgvector is enabled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add a unique constraint on retro_id and name to prevent duplicates
ALTER TABLE public.feedback_themes 
  ADD CONSTRAINT unique_retro_theme 
  UNIQUE (retro_id, name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback_themes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view themes
CREATE POLICY "Allow authenticated users to view themes"
  ON public.feedback_themes
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert/update themes
CREATE POLICY "Allow authenticated users to modify themes"
  ON public.feedback_themes
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Grant access to authenticated users
GRANT ALL ON public.feedback_themes TO authenticated;

-- Add index on retro_id for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_themes_retro_id ON public.feedback_themes(retro_id);
```

### Optional: Enable pgvector for vector embeddings storage

For better performance and functionality, enable the pgvector extension in your Supabase project:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector index
CREATE INDEX IF NOT EXISTS idx_feedback_themes_embedding ON public.feedback_themes 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## Step 4: Verify the API and Components

1. Make sure the following files exist in your project:
   - `/src/app/api/feedback-themes/route.ts` - API route for theme clustering
   - `/src/components/retrospectives/ThemesSection.tsx` - UI component for displaying themes

2. Make sure you've imported and added the ThemesSection component to your retrospective page:

```tsx
// In your retrospective detail page
import { ThemesSection } from "@/components/retrospectives/ThemesSection";

// Then in your JSX:
<ThemesSection retroId={id} />
```

## Step 5: Test the Feature

1. Navigate to a retrospective page that has several feedback items
2. Click the "Analyze Themes" button in the Themes section
3. Wait for the analysis to complete (it may take a few seconds)
4. You should see identified themes grouped by similar content

## How It Works

1. The system collects all feedback messages for a retrospective
2. It generates embeddings for each message using OpenAI's text-embedding-3-small model
3. It applies K-means clustering to group similar feedback items together
4. Each cluster becomes a "theme" with a representative name
5. Themes are stored in the database for future reference

## Troubleshooting

If you encounter issues:

1. **Check your OpenAI API key**: Make sure your API key is valid and has sufficient credits
2. **Check the network tab**: Look for API errors in your browser's developer tools
3. **Database errors**: Verify the feedback_themes table was created successfully
4. **Minimum feedback required**: You need at least a few feedback items to generate meaningful themes

## Customization

You can customize the clustering behavior by modifying:

- The number of clusters in the API request (`numClusters` parameter)
- The embedding model and dimensions in the `getEmbeddings` function
- The theme naming logic in the `getClusterNames` function

## Usage Costs

Note that using OpenAI's embedding API incurs costs:

- text-embedding-3-small: $0.02 per 1M tokens (very cost-effective)
- Processing typical retrospective feedback should cost just a few cents

You can monitor usage in your OpenAI dashboard. 