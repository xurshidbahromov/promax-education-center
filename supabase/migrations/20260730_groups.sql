-- ============================================================
-- PROMAX EDUCATION CENTER - Groups Migration
-- Supabase SQL Editor'da ishga tushiring
-- ============================================================

-- 1. Guruhlar jadvali
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  description TEXT,
  max_students INTEGER DEFAULT 20,
  schedule TEXT,                    -- "Dush, Chor, Juma 14:00-16:00"
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. O'quvchi-Guruh bog'liq jadvali (ko'p-ko'pga)
CREATE TABLE IF NOT EXISTS public.group_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, student_id)
);

-- 3. Indekslar (tezlik uchun)
CREATE INDEX IF NOT EXISTS idx_groups_subject_id ON public.groups(subject_id);
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON public.groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_group_students_group_id ON public.group_students(group_id);
CREATE INDEX IF NOT EXISTS idx_group_students_student_id ON public.group_students(student_id);

-- 4. RLS (Row Level Security) yoqish
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_students ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies - Admin va Teacher ko'ra oladi/o'zgartira oladi
CREATE POLICY "Admin can manage groups" ON public.groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'staff')
    )
  );

CREATE POLICY "Students can view their own groups" ON public.groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_students
      WHERE group_id = groups.id AND student_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage group_students" ON public.group_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'staff')
    )
  );

CREATE POLICY "Students can view own group membership" ON public.group_students
  FOR SELECT USING (student_id = auth.uid());

-- 6. updated_at avtomatik yangilanishi uchun trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TEKSHIRISH: jadvallar to'g'ri yaratilganini tasdiqlash
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('groups', 'group_students');
