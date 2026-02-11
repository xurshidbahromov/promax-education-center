-- Create Super Admin Account
-- IMPORTANT: Run this ONLY ONCE after creating the admin user in Supabase Dashboard

-- Step 1: Create user in Supabase Dashboard first!
-- Go to: Authentication > Users > Add User
-- Email: admin@promax.uz
-- Password: Admin123!
-- Auto Confirm: YES
-- Then copy the user ID and use it below

-- Step 2: Get the user ID from auth.users
-- SELECT id FROM auth.users WHERE email = 'admin@promax.uz';

-- Step 3: Update the profile to set role as admin
UPDATE public.profiles 
SET 
  role = 'admin',
  full_name = 'Super Admin',
  phone = '+998901234567'
WHERE email = 'admin@promax.uz';

-- Step 4: Verify the admin was created
SELECT id, email, full_name, role FROM public.profiles WHERE role = 'admin';
