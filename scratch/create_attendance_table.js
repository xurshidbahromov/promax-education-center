const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAttendanceTable() {
  await supabase.auth.signInWithPassword({ email: '998955137776@promax.uz', password: 'Admin123!' });

  // Try calling exec_sql or sql endpoint
  const sql = `
    CREATE TABLE IF NOT EXISTS public.attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      status TEXT NOT NULL DEFAULT 'present',
      homework TEXT NOT NULL DEFAULT 'done',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(group_id, student_id, date)
    );

    ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Allow authenticated read attendance'
      ) THEN
        CREATE POLICY "Allow authenticated read attendance" ON public.attendance FOR SELECT USING (true);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Allow authenticated insert/update attendance'
      ) THEN
        CREATE POLICY "Allow authenticated insert/update attendance" ON public.attendance FOR ALL USING (true);
      END IF;
    END $$;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  console.log('rpc exec_sql:', data, error);
}

createAttendanceTable();
