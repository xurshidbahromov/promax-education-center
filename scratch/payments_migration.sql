-- ============================================================
-- PROMAX EDUCATION CENTER - Payments Migration
-- Supabase SQL Editor'da ishga tushiring
-- ============================================================

-- 1. Add price to groups table
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0;

-- 2. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM (e.g., '2026-08')
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'partial')),
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_group_id ON public.payments(group_id);
CREATE INDEX IF NOT EXISTS idx_payments_month_year ON public.payments(month_year);

-- 4. RLS (Row Level Security)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Admin can manage payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Students can view their own payments" ON public.payments
  FOR SELECT USING (student_id = auth.uid());

-- 6. Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Check
-- ============================================================
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments';
