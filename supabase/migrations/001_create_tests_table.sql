-- Create tests table
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL CHECK (subject IN ('math', 'english', 'physics', 'chemistry', 'biology', 'general')),
    test_type TEXT NOT NULL CHECK (test_type IN ('subject', 'practice', 'progress', 'mock')),
    category TEXT, -- specific topic or exam type (e.g., 'algebra', 'grammar', 'sat')
    duration_minutes INTEGER, -- NULL for untimed tests
    total_questions INTEGER NOT NULL DEFAULT 0,
    difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    passing_score INTEGER DEFAULT 60, -- percentage required to pass
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tests
-- Students can only view published tests
CREATE POLICY "Students can view published tests"
    ON public.tests
    FOR SELECT
    USING (is_published = true);

-- Teachers/admins can view all tests
CREATE POLICY "Teachers can view all tests"
    ON public.tests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Teachers/admins can insert tests
CREATE POLICY "Teachers can create tests"
    ON public.tests
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Teachers/admins can update their own tests
CREATE POLICY "Teachers can update tests"
    ON public.tests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Teachers/admins can delete their own tests
CREATE POLICY "Teachers can delete tests"
    ON public.tests
    FOR DELETE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tests_subject ON public.tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_type ON public.tests(test_type);
CREATE INDEX IF NOT EXISTS idx_tests_published ON public.tests(is_published);
CREATE INDEX IF NOT EXISTS idx_tests_created_by ON public.tests(created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tests_updated_at ON public.tests;
CREATE TRIGGER tests_updated_at
    BEFORE UPDATE ON public.tests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tests_updated_at();
