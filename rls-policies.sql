-- Update the profiles RLS policies for better security
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
CREATE POLICY "Users can read their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can read any profile for display purposes" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Update the retrospectives RLS policies
DROP POLICY IF EXISTS "Allow public read access to retrospectives" ON retrospectives;
CREATE POLICY "Anyone can read retrospectives" 
  ON retrospectives FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own retrospectives" 
  ON retrospectives FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retrospectives" 
  ON retrospectives FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retrospectives" 
  ON retrospectives FOR DELETE
  USING (auth.uid() = user_id);

-- Update the feedback RLS policies
DROP POLICY IF EXISTS "Allow public read access to feedback" ON feedback;
CREATE POLICY "Anyone can read feedback" 
  ON feedback FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own feedback" 
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback" 
  ON feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Update the feedback_reactions RLS policies
DROP POLICY IF EXISTS "Allow public read access to feedback_reactions" ON feedback_reactions;
CREATE POLICY "Anyone can read reactions" 
  ON feedback_reactions FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own reactions" 
  ON feedback_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
  ON feedback_reactions FOR DELETE
  USING (auth.uid() = user_id); 