-- Create test_attempts table
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER, -- actual time taken
    score INTEGER DEFAULT 0, -- points earned
    max_score INTEGER NOT NULL, -- total possible points
    percentage DECIMAL(5,2), -- calculated percentage
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_attempts
-- Students can only view their own attempts
CREATE POLICY "Students can view own attempts"
    ON public.test_attempts
    FOR SELECT
    USING (student_id = auth.uid());

-- Students can insert their own attempts
CREATE POLICY "Students can create attempts"
    ON public.test_attempts
    FOR INSERT
    WITH CHECK (student_id = auth.uid());

-- Students can update their own in-progress attempts
CREATE POLICY "Students can update own attempts"
    ON public.test_attempts
    FOR UPDATE
    USING (student_id = auth.uid() AND status = 'in_progress');

-- Teachers can view all attempts
CREATE POLICY "Teachers can view all attempts"
    ON public.test_attempts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attempts_student ON public.test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.test_attempts(status);
CREATE INDEX IF NOT EXISTS idx_attempts_completed ON public.test_attempts(completed_at);

-- Function to calculate percentage
CREATE OR REPLACE FUNCTION public.calculate_attempt_percentage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.max_score > 0 THEN
        NEW.percentage = ROUND((NEW.score::DECIMAL / NEW.max_score::DECIMAL * 100), 2);
    ELSE
        NEW.percentage = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_percentage_trigger ON public.test_attempts;
CREATE TRIGGER calculate_percentage_trigger
    BEFORE INSERT OR UPDATE ON public.test_attempts
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_attempt_percentage();
