-- Create a function to broadcast notifications to all/specific users
-- This function runs with SECURITY DEFINER to bypass RLS for inserting notifications to other users

CREATE OR REPLACE FUNCTION broadcast_announcement(
  title TEXT,
  message TEXT,
  type TEXT,
  audience TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_role TEXT;
  user_limit INT;
  inserted_count INT;
BEGIN
  -- 1. Check if caller is admin (optional but good practice)
  -- For now, we trust the RLS on the 'announcements' table which only admins can write to.
  -- But since this is a public function (initially), we should restrict it.
  
  IF auth.role() = 'authenticated' THEN
    -- Check if user is admin in profiles
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;
  END IF;

  -- 2. Insert notifications based on audience
  WITH target_users AS (
    SELECT id FROM profiles
    WHERE 
      CASE 
        WHEN audience = 'students' THEN role = 'student'
        WHEN audience = 'teachers' THEN role = 'teacher'
        WHEN audience = 'admin' THEN role = 'admin'
        ELSE true -- 'all'
      END
  ),
  inserted AS (
    INSERT INTO notifications (user_id, title, message, type)
    SELECT id, title, message, type FROM target_users
    RETURNING id
  )
  SELECT count(*) INTO inserted_count FROM inserted;

  RETURN jsonb_build_object('success', true, 'count', inserted_count);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execution to authenticated users (logic inside checks for admin role)
GRANT EXECUTE ON FUNCTION broadcast_announcement TO authenticated;
