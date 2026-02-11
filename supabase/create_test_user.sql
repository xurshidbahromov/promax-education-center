-- Quick script to manually insert a test user
-- Run this in Supabase SQL Editor if you want to bypass auth issues

-- First, create a user in auth.users (you'll need to set this up via Supabase Dashboard Auth > Users)
-- Then run this to create their profile:

INSERT INTO public.profiles (id, full_name, phone, role, created_at)
VALUES (
  'YOUR_USER_ID_FROM_AUTH_USERS',  -- Replace with actual UUID from auth.users
  'Admin User',
  '+998901234567',
  'admin',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Or, if you want to create a test student:
INSERT INTO public.profiles (id, full_name, phone, role, created_at)
VALUES (
  'YOUR_USER_ID_FROM_AUTH_USERS',  -- Replace with actual UUID from auth.users
  'Test Student',
  '+998901234567',
  'student',
  NOW()
)
ON CONFLICT (id) DO NOTHING;
