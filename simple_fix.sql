-- Check if the user_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'retrospectives'
        AND column_name = 'user_id'
    ) THEN
        -- Add the missing user_id column
        ALTER TABLE public.retrospectives 
        ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added missing user_id column';
    ELSE
        RAISE NOTICE 'user_id column already exists';
    END IF;
END;
$$; 

-- Quick fix script for feedback table issues
-- First, drop the table if it exists
DROP TABLE IF EXISTS public.feedback;

-- Recreate the table with all required columns
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

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all operations for authenticated users
-- This is the simplest approach for testing - you can refine policies later
CREATE POLICY "Allow all for authenticated users"
  ON public.feedback
  USING (auth.role() = 'authenticated');

-- Grant access to authenticated users
GRANT ALL ON public.feedback TO authenticated;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'feedback' 
ORDER BY 
  ordinal_position; 