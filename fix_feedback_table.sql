-- This script fixes the feedback table by recreating it if needed
-- First check if the table exists
DO $$
DECLARE
  table_exists BOOLEAN;
  anonymous_exists BOOLEAN;
BEGIN
  -- Check if the feedback table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'feedback'
  ) INTO table_exists;
  
  -- If the table doesn't exist, create it
  IF NOT table_exists THEN
    RAISE NOTICE 'Creating feedback table from scratch...';
    
    CREATE TABLE public.feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      retro_id UUID NOT NULL REFERENCES public.retrospectives(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('well', 'didnt', 'suggestion', 'blocker')),
      message TEXT NOT NULL,
      anonymous BOOLEAN NOT NULL DEFAULT false,
      meta JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );
    
  ELSE
    -- Table exists, check if anonymous column exists
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'feedback'
      AND column_name = 'anonymous'
    ) INTO anonymous_exists;
    
    -- If anonymous column doesn't exist, add it
    IF NOT anonymous_exists THEN
      RAISE NOTICE 'Adding anonymous column to feedback table...';
      ALTER TABLE public.feedback ADD COLUMN anonymous BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    -- Check if meta column exists (for our fallback approach)
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'feedback'
      AND column_name = 'meta'
    ) INTO anonymous_exists;
    
    -- If meta column doesn't exist, add it
    IF NOT anonymous_exists THEN
      RAISE NOTICE 'Adding meta column to feedback table...';
      ALTER TABLE public.feedback ADD COLUMN meta JSONB;
    END IF;
  END IF;
  
  -- Set up Row Level Security regardless
  -- First drop any existing policies
  DROP POLICY IF EXISTS "Users can view feedback for their retrospectives" ON public.feedback;
  DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
  DROP POLICY IF EXISTS "Users can update own feedback" ON public.feedback;
  DROP POLICY IF EXISTS "Users can delete own feedback" ON public.feedback;
  
  -- Enable Row Level Security
  ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
  
  -- Create policies
  CREATE POLICY "Users can view feedback for their retrospectives"
    ON public.feedback
    FOR SELECT
    USING (
      auth.uid() = user_id OR 
      auth.uid() IN (
        SELECT user_id FROM public.retrospectives WHERE id = retro_id
      )
    );
  
  CREATE POLICY "Users can insert feedback"
    ON public.feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update own feedback"
    ON public.feedback
    FOR UPDATE
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete own feedback"
    ON public.feedback
    FOR DELETE
    USING (auth.uid() = user_id);
  
  -- Grant access to authenticated users
  GRANT ALL ON public.feedback TO authenticated;
  
  RAISE NOTICE 'Feedback table setup complete!';
END;
$$; 