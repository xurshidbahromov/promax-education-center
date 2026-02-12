-- Create question_responses table
CREATE TABLE IF NOT EXISTS public.question_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES public.test_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    student_answer TEXT, -- answer given by student
    is_correct BOOLEAN, -- whether answer is correct
    points_earned INTEGER DEFAULT 0, -- points awarded for this answer
    time_spent_seconds INTEGER, -- time spent on this question
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(attempt_id, question_id)
);

-- Enable Row Level Security
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_responses
-- Students can view responses for their own attempts
CREATE POLICY "Students can view own responses"
    ON public.question_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.test_attempts
            WHERE test_attempts.id = question_responses.attempt_id
            AND test_attempts.student_id = auth.uid()
        )
    );

-- Students can insert responses for their own attempts
CREATE POLICY "Students can create responses"
    ON public.question_responses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.test_attempts
            WHERE test_attempts.id = question_responses.attempt_id
            AND test_attempts.student_id = auth.uid()
            AND test_attempts.status = 'in_progress'
        )
    );

-- Students can update responses for in-progress attempts
CREATE POLICY "Students can update own responses"
    ON public.question_responses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.test_attempts
            WHERE test_attempts.id = question_responses.attempt_id
            AND test_attempts.student_id = auth.uid()
            AND test_attempts.status = 'in_progress'
        )
    );

-- Teachers can view all responses
CREATE POLICY "Teachers can view all responses"
    ON public.question_responses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('teacher', 'staff', 'admin')
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON public.question_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_responses_question ON public.question_responses(question_id);

-- Function to check answer correctness and award points
CREATE OR REPLACE FUNCTION public.check_answer_correctness()
RETURNS TRIGGER AS $$
DECLARE
    v_correct_answer TEXT;
    v_points INTEGER;
BEGIN
    -- Get correct answer and points from question
    SELECT correct_answer, points
    INTO v_correct_answer, v_points
    FROM public.questions
    WHERE id = NEW.question_id;
    
    -- Check if answer is correct (case-insensitive for text answers)
    IF LOWER(TRIM(NEW.student_answer)) = LOWER(TRIM(v_correct_answer)) THEN
        NEW.is_correct = true;
        NEW.points_earned = v_points;
    ELSE
        NEW.is_correct = false;
        NEW.points_earned = 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_answer_trigger ON public.question_responses;
CREATE TRIGGER check_answer_trigger
    BEFORE INSERT OR UPDATE ON public.question_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.check_answer_correctness();

-- Function to update attempt score when responses are added/updated
CREATE OR REPLACE FUNCTION public.update_attempt_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.test_attempts
    SET score = (
        SELECT COALESCE(SUM(points_earned), 0)
        FROM public.question_responses
        WHERE attempt_id = NEW.attempt_id
    )
    WHERE id = NEW.attempt_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_score_trigger ON public.question_responses;
CREATE TRIGGER update_score_trigger
    AFTER INSERT OR UPDATE ON public.question_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_attempt_score();
