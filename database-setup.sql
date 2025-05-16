-- Create custom types
CREATE TYPE feedback_type AS ENUM ('well', 'didnt', 'suggestion', 'blocker');
CREATE TYPE reaction_type AS ENUM ('thumbsup', 'thumbsdown');
CREATE TYPE sentiment_score AS ENUM ('positive', 'negative', 'neutral');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create retrospectives table
CREATE TABLE IF NOT EXISTS retrospectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sprint_number INTEGER NOT NULL,
  sprint_name TEXT,
  team_name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id)
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  retro_id UUID NOT NULL REFERENCES retrospectives(id),
  type feedback_type NOT NULL,
  message TEXT NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sentiment sentiment_score
);

-- Create feedback_reactions table
CREATE TABLE IF NOT EXISTS feedback_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID NOT NULL REFERENCES feedback(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  reaction_type reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_id, user_id) -- Prevent duplicate reactions from the same user
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_retro_id ON feedback(retro_id);
CREATE INDEX IF NOT EXISTS idx_retrospectives_user_id ON retrospectives(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reactions_feedback_id ON feedback_reactions(feedback_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reactions_user_id ON feedback_reactions(user_id);

-- Insert some sample profiles for testing
INSERT INTO profiles (id, email, full_name, avatar_url, created_at, updated_at)
VALUES 
  ('4251d1b4-08d3-424f-ac20-11d416f68b43', 'test1@example.com', 'Test User 1', 'https://i.pravatar.cc/150?u=test1@example.com', NOW(), NOW()),
  ('e9a7d5c6-7b3a-42f8-91d0-3d678e97f03e', 'test2@example.com', 'Test User 2', 'https://i.pravatar.cc/150?u=test2@example.com', NOW(), NOW()),
  ('a2b8c9d0-1e2f-4a5b-91d0-7c8d9e0f1a2b', 'test3@example.com', 'Test User 3', 'https://i.pravatar.cc/150?u=test3@example.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrospectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_reactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to profiles" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to retrospectives" 
  ON retrospectives FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to feedback" 
  ON feedback FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to feedback_reactions" 
  ON feedback_reactions FOR SELECT 
  USING (true); 