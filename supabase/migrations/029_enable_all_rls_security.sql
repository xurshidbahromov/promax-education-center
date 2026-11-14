-- Migration: 029_enable_all_rls_security.sql
-- Description: Ensures all public tables have Row Level Security (RLS) enabled
-- to resolve Supabase security advisor alerts (rls_disabled_in_public) and block bot scraping.

-- 1. Core Profile & System Tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Educational & Course Content Tables
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.directions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.group_students ENABLE ROW LEVEL SECURITY;

-- 3. Tests & Examinations Tables
ALTER TABLE IF EXISTS public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.results ENABLE ROW LEVEL SECURITY;

-- 4. Tournaments & Competitions Tables
ALTER TABLE IF EXISTS public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tournament_comments ENABLE ROW LEVEL SECURITY;

-- 5. Finance, Payments & Shop Tables (Crucial - was flagged in audit)
ALTER TABLE IF EXISTS public.student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.monthly_payment_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shop_orders ENABLE ROW LEVEL SECURITY;

-- 6. Attendance & CRM/Parent System
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parent_students ENABLE ROW LEVEL SECURITY;

-- Default Policies for student_courses, payment_transactions, monthly_payment_status if not already defined:
DO $$
BEGIN
    -- student_courses: Admins full access, Students read own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_courses' AND policyname = 'Admins manage student_courses') THEN
        CREATE POLICY "Admins manage student_courses" ON public.student_courses
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'superadmin', 'teacher'))
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'student_courses' AND policyname = 'Students read own courses') THEN
        CREATE POLICY "Students read own courses" ON public.student_courses
            FOR SELECT USING (student_id = auth.uid());
    END IF;

    -- payment_transactions: Admins full access, Students read own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Admins manage payment_transactions') THEN
        CREATE POLICY "Admins manage payment_transactions" ON public.payment_transactions
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'superadmin'))
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_transactions' AND policyname = 'Students read own transactions') THEN
        CREATE POLICY "Students read own transactions" ON public.payment_transactions
            FOR SELECT USING (student_id = auth.uid());
    END IF;

    -- monthly_payment_status: Admins full access, Students read own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'monthly_payment_status' AND policyname = 'Admins manage monthly_payment_status') THEN
        CREATE POLICY "Admins manage monthly_payment_status" ON public.monthly_payment_status
            FOR ALL USING (
                EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff', 'superadmin'))
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'monthly_payment_status' AND policyname = 'Students read own monthly_status') THEN
        CREATE POLICY "Students read own monthly_status" ON public.monthly_payment_status
            FOR SELECT USING (student_id = auth.uid());
    END IF;
END $$;
