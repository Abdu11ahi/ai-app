-- First drop the existing table if it exists (careful with this in production!)
DROP TABLE IF EXISTS public.retrospectives;

-- Create retrospectives table with the correct structure
CREATE TABLE public.retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  sprint_number INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Set up Row Level Security (RLS)
-- First drop any existing policies
DROP POLICY IF EXISTS "Users can view their own retrospectives" ON public.retrospectives;
DROP POLICY IF EXISTS "Users can insert their own retrospectives" ON public.retrospectives;
DROP POLICY IF EXISTS "Users can update their own retrospectives" ON public.retrospectives;
DROP POLICY IF EXISTS "Users can delete their own retrospectives" ON public.retrospectives;

-- Enable Row Level Security
ALTER TABLE public.retrospectives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own retrospectives"
  ON public.retrospectives
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own retrospectives"
  ON public.retrospectives
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retrospectives"
  ON public.retrospectives
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retrospectives"
  ON public.retrospectives
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.retrospectives TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 