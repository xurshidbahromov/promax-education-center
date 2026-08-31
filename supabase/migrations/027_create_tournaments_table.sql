-- Migration 027: Create central tournaments table for real-time cross-device sync
CREATE TABLE IF NOT EXISTS public.tournaments (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'national', -- 'national' or 'international'
    title TEXT NOT NULL,
    category TEXT,
    category_label TEXT,
    subject TEXT NOT NULL DEFAULT 'Matematika',
    description TEXT,
    badge TEXT,
    badge_bg TEXT,
    status TEXT NOT NULL DEFAULT 'upcoming', -- 'live', 'upcoming', 'finished'
    start_date TEXT,
    start_time TEXT,
    end_date TEXT,
    end_time TEXT,
    duration_minutes INTEGER DEFAULT 60,
    total_questions INTEGER DEFAULT 0,
    entry_coins INTEGER DEFAULT 0,
    prize_pool TEXT,
    top_prizes JSONB DEFAULT '[]'::jsonb,
    rules JSONB DEFAULT '[]'::jsonb,
    participants_count INTEGER DEFAULT 0,
    questions JSONB DEFAULT '[]'::jsonb,
    scoring_scale TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Admins can insert tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Admins can update tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Admins can delete tournaments" ON public.tournaments;

-- Policies
CREATE POLICY "Public can view tournaments"
ON public.tournaments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert tournaments"
ON public.tournaments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'superadmin', 'staff')
    )
);

CREATE POLICY "Admins can update tournaments"
ON public.tournaments FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'superadmin', 'staff')
    )
);

CREATE POLICY "Admins can delete tournaments"
ON public.tournaments FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'superadmin', 'staff')
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_type ON public.tournaments(type);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_created_at ON public.tournaments(created_at DESC);
