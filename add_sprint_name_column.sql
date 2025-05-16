-- Add the sprint_name column to the retrospectives table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'retrospectives'
        AND column_name = 'sprint_name'
    ) THEN
        -- Add the missing sprint_name column
        ALTER TABLE public.retrospectives 
        ADD COLUMN sprint_name TEXT;
        
        RAISE NOTICE 'Added missing sprint_name column';
    ELSE
        RAISE NOTICE 'sprint_name column already exists';
    END IF;
END;
$$; 

-- Update database.types.ts definition as well to match the new schema
-- You'll need to manually update src/lib/database.types.ts to include:
-- sprint_name?: string | null in the retrospectives Row, Insert, and Update interfaces

-- Show updated table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'retrospectives' 
ORDER BY 
  ordinal_position; 