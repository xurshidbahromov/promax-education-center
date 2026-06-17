-- Add Telegram fields to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Index for fast lookup by telegram_id
CREATE INDEX IF NOT EXISTS profiles_telegram_id_idx ON public.profiles(telegram_id);

-- RLS: Allow update of telegram fields by authenticated users (own profile only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.profiles 
             FOR UPDATE USING (auth.uid() = id)';
  END IF;
END $$;

-- Add telegram_link_token for deep-link /start flow
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_link_token TEXT;
