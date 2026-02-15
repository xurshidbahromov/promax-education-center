-- Add indices for frequent queries

-- 1. For Admin Dashboard Revenue Calculation
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON public.payment_transactions(payment_year, payment_month);

-- 2. For Profile Role Filtering (Admin/Student/Teacher checks)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. For Results filtering by Student (Student Dashboard)
CREATE INDEX IF NOT EXISTS idx_results_student ON public.results(student_id);

-- 4. For Exams filtering by Date (Admin Dashboard/Student Tests)
CREATE INDEX IF NOT EXISTS idx_exams_date ON public.exams(date);
