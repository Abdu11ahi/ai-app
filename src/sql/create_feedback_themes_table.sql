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

-- Add vector index if pgvector is enabled (uncomment if pgvector is available)
-- CREATE INDEX IF NOT EXISTS idx_feedback_themes_embedding ON public.feedback_themes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

COMMENT ON TABLE public.feedback_themes IS 'Stores themes identified from feedback items using embeddings and clustering'; 