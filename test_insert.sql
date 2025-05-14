-- This is a test insert statement to verify the retrospectives table is working correctly
-- Replace 'your-user-id-here' with your actual auth.uid() value
-- You can get your current user ID by running: SELECT auth.uid();

INSERT INTO public.retrospectives (sprint_number, team_name, user_id)
VALUES (
  100, 
  'Test Team', 
  auth.uid() -- This will be the ID of the currently authenticated user
);

-- Verify the insert worked
SELECT * FROM public.retrospectives 
WHERE team_name = 'Test Team' 
ORDER BY created_at DESC 
LIMIT 1; 