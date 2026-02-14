-- Add settings column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
    "theme": "system",
    "language": "UZ",
    "notifications": {
        "email": true,
        "push": true
    }
}'::jsonb;
