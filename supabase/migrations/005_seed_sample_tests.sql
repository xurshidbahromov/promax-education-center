-- Sample test data for demonstration

-- Insert sample Math test (Algebra)
INSERT INTO public.tests (
    title, 
    description, 
    subject, 
    test_type, 
    category, 
    duration_minutes, 
    difficulty_level,
    is_published
) VALUES (
    'Algebra Asoslari',
    'Tenglamalar va tengsizliklar bo''yicha asosiy bilimlarni tekshirish',
    'math',
    'subject',
    'algebra',
    30,
    'medium',
    true
) RETURNING id;

-- Get the test ID (replace with actual ID from above)
-- You'll need to run this after getting the test ID from the previous query
DO $$
DECLARE
    v_test_id UUID;
BEGIN
    -- Get the most recently created test
    SELECT id INTO v_test_id FROM public.tests ORDER BY created_at DESC LIMIT 1;
    
    -- Insert sample questions
    INSERT INTO public.questions (test_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (
        v_test_id,
        '2x + 5 = 15 tenglamaning yechimi qanday?',
        'multiple_choice',
        '{"A": "x = 3", "B": "x = 5", "C": "x = 7", "D": "x = 10"}'::jsonb,
        'B',
        '2x = 15 - 5 = 10, demak x = 5',
        1,
        1
    ),
    (
        v_test_id,
        'x² - 4 = 0 tenglamaning yechimlari sonini toping',
        'multiple_choice',
        '{"A": "1 ta", "B": "2 ta", "C": "3 ta", "D": "Yechimi yo''q"}'::jsonb,
        'B',
        'x² = 4, x = ±2, demak 2 ta yechim',
        1,
        2
    ),
    (
        v_test_id,
        '3x - 7 > 8 tengsizlikning yechimi',
        'multiple_choice',
        '{"A": "x > 5", "B": "x < 5", "C": "x > 3", "D": "x < 3"}'::jsonb,
        'A',
        '3x > 15, x > 5',
        1,
        3
    );
END $$;

-- Insert sample English test (Grammar)
INSERT INTO public.tests (
    title,
    description,
    subject,
    test_type,
    category,
    duration_minutes,
    difficulty_level,
    is_published
) VALUES (
    'English Grammar Basics',
    'Test your understanding of English tenses and sentence structure',
    'english',
    'practice',
    'grammar',
    20,
    'easy',
    true
) RETURNING id;

-- Insert English questions
DO $$
DECLARE
    v_test_id UUID;
BEGIN
    SELECT id INTO v_test_id FROM public.tests WHERE subject = 'english' ORDER BY created_at DESC LIMIT 1;
    
    INSERT INTO public.questions (test_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (
        v_test_id,
        'She ___ to school every day.',
        'multiple_choice',
        '{"A": "go", "B": "goes", "C": "going", "D": "gone"}'::jsonb,
        'B',
        'Present Simple with third person singular requires -s/-es',
        1,
        1
    ),
    (
        v_test_id,
        'I ___ my homework yesterday.',
        'multiple_choice',
        '{"A": "do", "B": "does", "C": "did", "D": "done"}'::jsonb,
        'C',
        'Past Simple tense for completed action in the past',
        1,
        2
    ),
    (
        v_test_id,
        'They ___ watching TV right now.',
        'multiple_choice',
        '{"A": "is", "B": "are", "C": "am", "D": "be"}'::jsonb,
        'B',
        'Present Continuous: They (plural) + are + verb-ing',
        1,
        3
    );
END $$;

-- Insert sample Physics test (Mechanics)
INSERT INTO public.tests (
    title,
    description,
    subject,
    test_type,
    category,
    duration_minutes,
    difficulty_level,
    is_published
) VALUES (
    'Mexanika Asoslari',
    'Harakat va kuch qonunlari bo''yicha test',
    'physics',
    'subject',
    'mechanics',
    40,
    'medium',
    true
) RETURNING id;

-- Insert Physics questions
DO $$
DECLARE
    v_test_id UUID;
BEGIN
    SELECT id INTO v_test_id FROM public.tests WHERE subject = 'physics' ORDER BY created_at DESC LIMIT 1;
    
    INSERT INTO public.questions (test_id, question_text, question_type, options, correct_answer, explanation, points, order_index) VALUES
    (
        v_test_id,
        'Tezlik formulasi qaysi?',
        'multiple_choice',
        '{"A": "v = s/t", "B": "v = s*t", "C": "v = t/s", "D": "v = s+t"}'::jsonb,
        'A',
        'Tezlik = Masofa / Vaqt',
        1,
        1
    ),
    (
        v_test_id,
        'Nyutonning ikkinchi qonuni',
        'multiple_choice',
        '{"A": "F = m/a", "B": "F = ma", "C": "F = m+a", "D": "F = a/m"}'::jsonb,
        'B',
        'Kuch = Massa * Tezlanish',
        1,
        2
    );
END $$;

-- Insert SAT Mock Exam
INSERT INTO public.tests (
    title,
    description,
    subject,
    test_type,
    category,
    duration_minutes,
    difficulty_level,
    is_published
) VALUES (
    'SAT Math Practice Test',
    'Full-length SAT Math section practice',
    'math',
    'mock',
    'sat',
    75,
    'hard',
    true
);
