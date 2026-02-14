-- Quick diagnostic query to check announcements table
-- Run this in Supabase SQL Editor to verify table exists

-- 1. Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'announcements'
) as table_exists;

-- 2. If exists, check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'announcements';

-- 3. Check current user role
SELECT current_user, session_user;

-- 4. Try a simple insert test (will fail if table doesn't exist)
-- INSERT INTO announcements (title, message, type) 
-- VALUES ('Test', 'Test message', 'info');
