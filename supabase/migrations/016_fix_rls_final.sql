-- 016_fix_rls_final.sql

-- 1. Reset: Drop ALL existing policies on profiles to ensure a clean slate
-- We list every possible name we might have used
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles for dashboard" ON public.profiles;
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.profiles;

-- 2. Define Secure Admin Check Function (Update to be robust)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public -- Critical for security to prevent search_path hijacking
AS $$
  -- This runs as database owner, bypassing RLS
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'staff', 'teacher')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Re-create Essential Policies

-- A. Everyone can see their OWN profile (Basic Access)
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = id
);

-- B. Admins/Teachers can see ALL profiles (for Management)
-- Uses the secure function to avoid recursion
CREATE POLICY "Admins and teachers can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    is_admin()
);

-- C. Update Policies
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ( auth.uid() = id );

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING ( is_admin() );

-- D. Insert Policy
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ( auth.uid() = id );
