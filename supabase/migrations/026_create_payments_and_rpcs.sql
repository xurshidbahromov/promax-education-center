-- ============================================================
-- PROMAX EDUCATION CENTER - Migration 026 (Safe & Idempotent)
-- Payments table, Performance Indexes, and Atomic Coin RPCs
-- ============================================================

-- 1. Payments Table (Group-based multi-month payment ledger)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    month_year TEXT NOT NULL, -- e.g. "2026-08"
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'partial')),
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(student_id, group_id, month_year)
);

-- 2. Performance & Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_group_id ON public.payments(group_id);
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON public.payments(month_year);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON public.parent_students(parent_telegram_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student ON public.parent_students(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;

-- 3. Row Level Security for Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Safely drop old policies before creating them
DROP POLICY IF EXISTS "Admin and staff can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Teachers can view payments of their groups" ON public.payments;
DROP POLICY IF EXISTS "Students can view their own payments" ON public.payments;

CREATE POLICY "Admin and staff can manage all payments" ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff', 'superadmin')
        )
    );

CREATE POLICY "Teachers can view payments of their groups" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.groups
            WHERE groups.id = payments.group_id AND groups.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their own payments" ON public.payments
    FOR SELECT USING (student_id = auth.uid());

-- 4. Atomic RPC: Increment Student Coins (Eliminates Race Conditions)
CREATE OR REPLACE FUNCTION public.increment_student_coins(
    p_student_id UUID,
    p_amount INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance INT;
BEGIN
    UPDATE public.profiles
    SET 
        coins = COALESCE(coins, 0) + p_amount,
        updated_at = now()
    WHERE id = p_student_id
    RETURNING coins INTO v_new_balance;

    RETURN v_new_balance;
END;
$$;

-- 5. Atomic RPC: Deduct Student Coins (For Shop Purchases)
CREATE OR REPLACE FUNCTION public.deduct_student_coins(
    p_student_id UUID,
    p_amount INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_coins INT;
BEGIN
    SELECT coins INTO v_current_coins
    FROM public.profiles
    WHERE id = p_student_id
    FOR UPDATE;

    IF v_current_coins IS NULL OR v_current_coins < p_amount THEN
        RETURN FALSE;
    END IF;

    UPDATE public.profiles
    SET 
        coins = coins - p_amount,
        updated_at = now()
    WHERE id = p_student_id;

    RETURN TRUE;
END;
$$;
