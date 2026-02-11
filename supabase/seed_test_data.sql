-- ============================================
-- SEED TEST DATA FOR PROMAX EDUCATION CENTER
-- ============================================
-- Run this in Supabase SQL Editor after creating tables

-- 1. INSERT SUBJECTS
INSERT INTO public.subjects (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Matematika'),
  ('22222222-2222-2222-2222-222222222222', 'Fizika'),
  ('33333333-3333-3333-3333-333333333333', 'Ona tili'),
  ('44444444-4444-4444-4444-444444444444', 'Tarix'),
  ('55555555-5555-5555-5555-555555555555', 'Ingliz tili'),
  ('66666666-6666-6666-6666-666666666666', 'Informatika')
ON CONFLICT (id) DO NOTHING;

-- 2. INSERT DIRECTIONS (Yo'nalishlar)
INSERT INTO public.directions (id, code, title, subject_1_id, subject_2_id) VALUES
  ('d1111111-1111-1111-1111-111111111111', '60610400', 'Axborot tizimlari va texnologiyalari', '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666'),
  ('d2222222-2222-2222-2222-222222222222', '60540100', 'Fizika va astronomiya', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
  ('d3333333-3333-3333-3333-333333333333', '60230100', 'Filologiya (ingliz tili)', '55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333')
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT EXAMS (Mock Tests)
INSERT INTO public.exams (id, title, date, max_score, type, status, correct_answers) VALUES
  -- Upcoming exams
  ('e1111111-1111-1111-1111-111111111111', 'DTM Mock Test #10', '2026-02-15', 189.0, 'dtm', 'upcoming', NULL),
  ('e2222222-2222-2222-2222-222222222222', 'DTM Mock Test #11', '2026-02-20', 189.0, 'dtm', 'upcoming', NULL),
  
  -- Active exam
  ('e3333333-3333-3333-3333-333333333333', 'DTM Mock Test #9', CURRENT_DATE, 189.0, 'dtm', 'active', 
   '{"1": "A", "2": "B", "3": "C", "4": "D", "5": "A", "6": "B", "7": "C", "8": "A", "9": "B", "10": "C"}'),
  
  -- Finished exams with correct answers
  ('e4444444-4444-4444-4444-444444444444', 'DTM Mock Test #8', '2026-02-08', 189.0, 'dtm', 'finished',
   '{"1": "A", "2": "B", "3": "C", "4": "D", "5": "A", "6": "B", "7": "C", "8": "A", "9": "B", "10": "C", "11": "A", "12": "B", "13": "C", "14": "D", "15": "A"}'),
  
  ('e5555555-5555-5555-5555-555555555555', 'DTM Mock Test #7', '2026-02-01', 189.0, 'dtm', 'finished',
   '{"1": "B", "2": "C", "3": "A", "4": "B", "5": "C", "6": "D", "7": "A", "8": "B", "9": "C", "10": "A"}'),
  
  ('e6666666-6666-6666-6666-666666666666', 'DTM Mock Test #6', '2026-01-25', 189.0, 'dtm', 'finished',
   '{"1": "C", "2": "A", "3": "B", "4": "C", "5": "D", "6": "A", "7": "B", "8": "C", "9": "A", "10": "B"}')
ON CONFLICT (id) DO NOTHING;

-- 4. INSERT SAMPLE RESULTS FOR A STUDENT
-- Replace 'YOUR_STUDENT_USER_ID' with actual student UUID from auth.users
-- You can get it by running: SELECT id FROM auth.users WHERE email = 'student.one.test@gmail.com';

-- Example results (update student_id after getting real UUID)
-- INSERT INTO public.results (
--   id, exam_id, student_id, direction_id,
--   total_score, 
--   compulsory_math_score, compulsory_history_score, compulsory_lang_score,
--   subject_1_score, subject_2_score,
--   student_answers
-- ) VALUES
--   -- Mock Test #8 result
--   (
--     'r1111111-1111-1111-1111-111111111111',
--     'e4444444-4444-4444-4444-444444444444',
--     'YOUR_STUDENT_USER_ID',
--     'd1111111-1111-1111-1111-111111111111',
--     165.5,
--     9.5, 10.0, 10.5,
--     82.0, 53.5,
--     '{"1": "A", "2": "B", "3": "C", "4": "A", "5": "A", "6": "B", "7": "C", "8": "A", "9": "B", "10": "C"}'
--   ),
--   
--   -- Mock Test #7 result
--   (
--     'r2222222-2222-2222-2222-222222222222',
--     'e5555555-5555-5555-5555-555555555555',
--     'YOUR_STUDENT_USER_ID',
--     'd1111111-1111-1111-1111-111111111111',
--     152.0,
--     8.0, 9.5, 10.0,
--     75.0, 49.5,
--     '{"1": "B", "2": "C", "3": "A", "4": "B", "5": "C", "6": "D", "7": "A", "8": "B", "9": "C", "10": "A"}'
--   ),
--   
--   -- Mock Test #6 result
--   (
--     'r3333333-3333-3333-3333-333333333333',
--     'e6666666-6666-6666-6666-666666666666',
--     'YOUR_STUDENT_USER_ID',
--     'd1111111-1111-1111-1111-111111111111',
--     178.5,
--     10.5, 10.0, 11.0,
--     88.0, 59.0,
--     '{"1": "C", "2": "A", "3": "B", "4": "C", "5": "D", "6": "A", "7": "B", "8": "C", "9": "A", "10": "B"}'
--   );

-- ============================================
-- HOW TO USE THIS FILE:
-- ============================================
-- 1. Copy all SQL above
-- 2. Go to Supabase Dashboard → SQL Editor
-- 3. Paste and run the SQL
-- 4. Get your student user ID:
--    SELECT id FROM auth.users WHERE email = 'student.one.test@gmail.com';
-- 5. Uncomment the results INSERT section
-- 6. Replace 'YOUR_STUDENT_USER_ID' with the actual UUID
-- 7. Run the results INSERT
-- ============================================
