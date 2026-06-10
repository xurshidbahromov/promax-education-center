-- 1. Fix the foreign key constraints on the directions table
-- Drop the existing constraints that block deletion
ALTER TABLE public.directions
  DROP CONSTRAINT IF EXISTS directions_subject_1_id_fkey,
  DROP CONSTRAINT IF EXISTS directions_subject_2_id_fkey;

-- Re-add them with ON DELETE CASCADE (or SET NULL)
-- We use SET NULL so that if a subject is deleted, the direction still exists but the subject requirement is removed
ALTER TABLE public.directions
  ADD CONSTRAINT directions_subject_1_id_fkey 
  FOREIGN KEY (subject_1_id) 
  REFERENCES public.subjects(id) 
  ON DELETE SET NULL;

ALTER TABLE public.directions
  ADD CONSTRAINT directions_subject_2_id_fkey 
  FOREIGN KEY (subject_2_id) 
  REFERENCES public.subjects(id) 
  ON DELETE SET NULL;

-- 2. Make sure the 'subjects' table has the new columns we need
-- Since the table already existed, 'CREATE TABLE IF NOT EXISTS' in the previous file might have skipped adding these columns
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 3. If 'title' is null (for older subjects that only had 'name'), copy 'name' to 'title'
UPDATE public.subjects 
SET title = name 
WHERE title IS NULL AND name IS NOT NULL;
