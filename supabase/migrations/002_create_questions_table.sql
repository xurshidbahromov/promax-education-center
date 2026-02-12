-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    options JSONB, -- {"A": "option1", "B": "option2", "C": "option3", "D": "option4"}
    correct_answer TEXT NOT NULL, -- "A", "B", "true", "false", or actual text for short answer
    explanation TEXT, -- explanation of correct answer
    points INTEGER DEFAULT 1 CHECK (points > 0),
    order_index INTEGER NOT NULL, -- question order in test
    image_url TEXT, -- optional image for question
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(test_id, order_index)
);

-- Enable Row Level Security
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
-- Students can view questions of published tests
CREATE POLICY "Students can view questions of published tests"
    ON public.questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tests
            WHERE tests.id = questions.test_id
            AND tests.is_published = true
        )
    );

-- Teachers can view all questions
CREATE POLICY "Teachers can view all questions"
    ON public.questions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Teachers can insert questions
CREATE POLICY "Teachers can create questions"
    ON public.questions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Teachers can update questions
CREATE POLICY "Teachers can update questions"
    ON public.questions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Teachers can delete questions
CREATE POLICY "Teachers can delete questions"
    ON public.questions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON public.questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON public.questions(test_id, order_index);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS questions_updated_at ON public.questions;
CREATE TRIGGER questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_questions_updated_at();

-- Trigger to update test's total_questions count
CREATE OR REPLACE FUNCTION public.update_test_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.tests
        SET total_questions = (
            SELECT COUNT(*) FROM public.questions WHERE test_id = NEW.test_id
        )
        WHERE id = NEW.test_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.tests
        SET total_questions = (
            SELECT COUNT(*) FROM public.questions WHERE test_id = OLD.test_id
        )
        WHERE id = OLD.test_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_test_question_count_trigger ON public.questions;
CREATE TRIGGER update_test_question_count_trigger
    AFTER INSERT OR DELETE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_test_question_count();
