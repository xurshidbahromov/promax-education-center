-- Add coins column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

-- Update existing profiles to have 0 coins if null (though default handles new ones)
UPDATE public.profiles SET coins = 0 WHERE coins IS NULL;
