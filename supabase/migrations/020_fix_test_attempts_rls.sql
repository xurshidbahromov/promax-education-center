-- Fix RLS policy for test_attempts to allow completing a test
-- The previous policy implicitly enforced status='in_progress' on the NEW row, 
-- which caused updates setting status='completed' to fail.

DROP POLICY IF EXISTS "Students can update own attempts" ON public.test_attempts;

CREATE POLICY "Students can update own attempts"
    ON public.test_attempts
    FOR UPDATE
    USING (
        student_id = auth.uid() 
        AND status = 'in_progress'
    )
    WITH CHECK (
        student_id = auth.uid() 
        AND status IN ('in_progress', 'completed')
    );
