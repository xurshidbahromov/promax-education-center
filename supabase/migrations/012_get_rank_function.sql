-- Function to get specific student's rank securely
-- This function runs as the database owner, bypassing RLS
CREATE OR REPLACE FUNCTION get_student_rank(target_student_id UUID)
RETURNS TABLE (
    rank BIGINT,
    coins INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_coins INTEGER;
BEGIN
    -- Get target user's coins
    SELECT p.coins INTO target_coins
    FROM public.profiles p
    WHERE p.id = target_student_id;

    -- Return rank (count of students with MORE coins + 1)
    RETURN QUERY
    SELECT 
        (COUNT(*) + 1) as rank,
        COALESCE(target_coins, 0) as coins
    FROM 
        public.profiles p
    WHERE 
        p.role = 'student' 
        AND COALESCE(p.coins, 0) > COALESCE(target_coins, 0);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_student_rank(UUID) TO authenticated;
