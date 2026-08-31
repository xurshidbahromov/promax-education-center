-- Migration 028: Complete Backend Real-Time Synchronization
-- Tables: tournament_results, tournament_registrations, tournament_comments, announcements columns

-- 1. Create tournament_results table
CREATE TABLE IF NOT EXISTS public.tournament_results (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score NUMERIC(6,2) NOT NULL DEFAULT 0,
    max_score NUMERIC(6,2) NOT NULL DEFAULT 0,
    scaled_score TEXT,
    percentage INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    answers JSONB DEFAULT '{}'::jsonb,
    rank INTEGER DEFAULT 1,
    prize TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create tournament_registrations table
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
    id TEXT PRIMARY KEY,
    tournament_id TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, student_id)
);

-- 3. Create tournament_comments table
CREATE TABLE IF NOT EXISTS public.tournament_comments (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'olympiad', -- 'olympiad' or 'international'
    tournament_id TEXT,
    author TEXT NOT NULL,
    avatar TEXT,
    role TEXT DEFAULT 'O''quvchi',
    time TEXT DEFAULT 'Hozirgina',
    text TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Alter announcements table to support rich featured cards
ALTER TABLE public.announcements 
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS badge TEXT;

-- 5. Enable RLS
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_comments ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Public can view tournament results" ON public.tournament_results;
DROP POLICY IF EXISTS "Authenticated can insert tournament results" ON public.tournament_results;
DROP POLICY IF EXISTS "Admins can manage tournament results" ON public.tournament_results;

DROP POLICY IF EXISTS "Public can view registrations" ON public.tournament_registrations;
DROP POLICY IF EXISTS "Authenticated can insert registrations" ON public.tournament_registrations;
DROP POLICY IF EXISTS "Admins can manage registrations" ON public.tournament_registrations;

DROP POLICY IF EXISTS "Public can view tournament comments" ON public.tournament_comments;
DROP POLICY IF EXISTS "Authenticated can insert tournament comments" ON public.tournament_comments;
DROP POLICY IF EXISTS "Admins can manage tournament comments" ON public.tournament_comments;

-- 7. Policies for tournament_results
CREATE POLICY "Public can view tournament results"
ON public.tournament_results FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert tournament results"
ON public.tournament_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin', 'staff')
));

CREATE POLICY "Admins can manage tournament results"
ON public.tournament_results FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin', 'staff')
));

-- 8. Policies for tournament_registrations
CREATE POLICY "Public can view registrations"
ON public.tournament_registrations FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert registrations"
ON public.tournament_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin', 'staff')
));

CREATE POLICY "Admins can manage registrations"
ON public.tournament_registrations FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin', 'staff')
));

-- 9. Policies for tournament_comments
CREATE POLICY "Public can view tournament comments"
ON public.tournament_comments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert tournament comments"
ON public.tournament_comments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage tournament comments"
ON public.tournament_comments FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin', 'staff')
));

-- 10. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tournament_results_tourn ON public.tournament_results(tournament_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_results_student ON public.tournament_results(student_id);
CREATE INDEX IF NOT EXISTS idx_tournament_reg_tourn ON public.tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_reg_student ON public.tournament_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_tournament_comm_cat ON public.tournament_comments(category, created_at DESC);
