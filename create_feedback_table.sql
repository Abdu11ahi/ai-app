-- Create the feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  retro_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('well', 'didnt', 'suggestion', 'blocker')),
  message TEXT NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)
-- First drop any existing policies
DROP POLICY IF EXISTS "Users can view feedback for their retrospectives" ON public.feedback;
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can delete own feedback" ON public.feedback;

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For viewing: Allow users to see all feedback for retrospectives they own,
-- or feedback they created for any retrospective
CREATE POLICY "Users can view feedback for their retrospectives"
  ON public.feedback
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.retrospectives WHERE id = retro_id
    )
  );

-- For inserting: Allow users to add feedback if they're authenticated
CREATE POLICY "Users can insert feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- For updating: Allow users to update only their own feedback
CREATE POLICY "Users can update own feedback"
  ON public.feedback
  FOR UPDATE
  USING (auth.uid() = user_id);

-- For deleting: Allow users to delete only their own feedback
CREATE POLICY "Users can delete own feedback"
  ON public.feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.feedback TO authenticated; 