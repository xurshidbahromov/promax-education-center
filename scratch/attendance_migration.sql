-- ============================================================
-- PROMAX EDUCATION CENTER - Attendance & Homework Migration
-- Supabase SQL Editor'da (https://supabase.com/dashboard) ishga tushiring
-- ============================================================

-- 1. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  homework TEXT NOT NULL DEFAULT 'done' CHECK (homework IN ('done', 'not_done', 'partially', 'none')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, student_id, date)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_group_id ON public.attendance(group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);

-- 3. RLS (Row Level Security)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Allow read attendance" ON public.attendance;
CREATE POLICY "Allow read attendance" ON public.attendance
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow manage attendance" ON public.attendance;
CREATE POLICY "Allow manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'staff')
    )
  );

-- ============================================================
-- SUCCESS: Table public.attendance created!
-- ============================================================
