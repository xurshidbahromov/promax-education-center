-- Add RLS Policies for Exams and Results Tables
-- This migration adds missing INSERT, UPDATE, DELETE policies for admin and teacher roles

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Admin and teachers can insert exams" ON public.exams;
DROP POLICY IF EXISTS "Admin and teachers can update exams" ON public.exams;
DROP POLICY IF EXISTS "Admin and teachers can delete exams" ON public.exams;

DROP POLICY IF EXISTS "Admin and teachers can insert results" ON public.results;
DROP POLICY IF EXISTS "Admin and teachers can update results" ON public.results;
DROP POLICY IF EXISTS "Admin and teachers can delete results" ON public.results;
DROP POLICY IF EXISTS "Public read results" ON public.results;
DROP POLICY IF EXISTS "Students can view own results" ON public.results;

-- Drop directions policies if they exist
DROP POLICY IF EXISTS "Admin and teachers can insert directions" ON public.directions;
DROP POLICY IF EXISTS "Admin and teachers can update directions" ON public.directions;
DROP POLICY IF EXISTS "Admin and teachers can delete directions" ON public.directions;

-- Exams table policies
CREATE POLICY "Admin and teachers can insert exams"
ON public.exams
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

CREATE POLICY "Admin and teachers can update exams"
ON public.exams
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

CREATE POLICY "Admin and teachers can delete exams"
ON public.exams
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

-- Results table policies
CREATE POLICY "Students can view own results"
ON public.results
FOR SELECT
TO authenticated
USING (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

CREATE POLICY "Admin and teachers can insert results"
ON public.results
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

CREATE POLICY "Admin and teachers can update results"
ON public.results
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

CREATE POLICY "Admin and teachers can delete results"
ON public.results
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

-- Directions table policies
CREATE POLICY "Admin and teachers can insert directions"
ON public.directions
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

CREATE POLICY "Admin and teachers can update directions"
ON public.directions
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);

CREATE POLICY "Admin and teachers can delete directions"
ON public.directions
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'teacher', 'staff')
    )
);
