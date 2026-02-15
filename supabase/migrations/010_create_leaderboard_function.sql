-- Function to get leaderboard data securely
-- This function runs as the database owner, bypassing RLS
CREATE OR REPLACE FUNCTION get_leaderboard_data(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    coins INTEGER,
    rank BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        COALESCE(p.full_name, 'Anonymous') as full_name,
        COALESCE(p.coins, 0) as coins,
        RANK() OVER (ORDER BY COALESCE(p.coins, 0) DESC) as rank
    FROM 
        public.profiles p
    WHERE 
        p.role = 'student'
    ORDER BY 
        coins DESC
    LIMIT limit_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_leaderboard_data(INTEGER) TO authenticated;
