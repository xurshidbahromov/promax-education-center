-- Migration 023: Add Parent CRM System and Telegram Bot Linking

-- 1. Add parent contact fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_name TEXT;

-- 2. Create parent_students link table for Telegram parent bot accounts
CREATE TABLE IF NOT EXISTS parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_telegram_id BIGINT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_name TEXT,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_telegram_id, student_id)
);

-- Enable RLS
ALTER TABLE parent_students ENABLE ROW LEVEL SECURITY;

-- Allow read and write for authenticated users and service role
CREATE POLICY "Allow public select for parent_students" ON parent_students FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update for parent_students" ON parent_students FOR ALL USING (true);
