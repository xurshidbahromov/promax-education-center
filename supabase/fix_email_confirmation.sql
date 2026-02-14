-- Fix email confirmation issue
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- Confirm all existing unconfirmed users
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Also update confirmed_at if it exists
UPDATE auth.users
SET confirmed_at = NOW()
WHERE confirmed_at IS NULL;
