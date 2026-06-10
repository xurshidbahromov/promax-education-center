-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_num INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Materials table
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'pdf', 'text', 'link')),
    url TEXT,
    content TEXT, -- for 'text' type materials
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Policies for Subjects
-- Everyone can read subjects
CREATE POLICY "Enable read access for all users on subjects" ON public.subjects
    FOR SELECT USING (true);

-- Only admins and teachers can insert/update/delete subjects
CREATE POLICY "Enable all access for admins and teachers on subjects" ON public.subjects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

-- Policies for Lessons
CREATE POLICY "Enable read access for all users on lessons" ON public.lessons
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for admins and teachers on lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

-- Policies for Materials
CREATE POLICY "Enable read access for all users on materials" ON public.materials
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for admins and teachers on materials" ON public.materials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );
