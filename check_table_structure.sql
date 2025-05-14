-- Check if retrospectives table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'retrospectives'
);

-- Show the structure of the retrospectives table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'retrospectives'
ORDER BY ordinal_position; 