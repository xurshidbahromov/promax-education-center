-- Fix RLS Recursion on Profiles Table

-- 1. Create a secure function to check admin role (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'staff', 'teacher')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. Drop the recursive and potentially duplicate policies
DROP POLICY IF EXISTS "Admins can view all profiles for dashboard" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles for dashboard" ON public.profiles; -- double check

-- 3. Create a non-recursive policy for Admins/Teachers
-- Ensure specific policy names are unique or drop before creating
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON public.profiles;

CREATE POLICY "Admins and teachers can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    public.is_admin()
);

-- 4. Ensure Users can view their own profile (Critical)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = id
);
