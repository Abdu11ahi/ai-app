-- First, check if the sentiment_score type already exists before creating it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sentiment_score') THEN
        CREATE TYPE sentiment_score AS ENUM ('positive', 'negative', 'neutral');
    END IF;
END $$;

-- Add sentiment column to the feedback table if it doesn't exist
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS sentiment sentiment_score;

-- Update existing feedback items to have a default neutral sentiment
UPDATE feedback
SET sentiment = 'neutral'
WHERE sentiment IS NULL; 