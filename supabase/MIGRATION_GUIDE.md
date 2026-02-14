# Supabase Migration Quick Guide

## Problem
Error when saving announcements: `{}`

This means the `announcements` table doesn't exist yet in your database.

---

## Solution: Run Migration in Supabase Dashboard

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **promax-education-center**
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **"New query"** button
2. Open the migration file: [`008_create_announcements_table.sql`](file:///Users/m1pro/Documents/Self%20Learn/promax-center/supabase/migrations/008_create_announcements_table.sql)
3. Copy **ALL** the SQL code (Cmd+A, Cmd+C)
4. Paste into Supabase SQL Editor
5. Click **"Run"** (or press Cmd+Enter)

### Step 3: Verify Success
You should see output like:
```
Success. No rows returned
```

Run this to verify:
```sql
SELECT COUNT(*) FROM announcements;
```

Should return: `3` (the sample announcements)

---

## Quick Test Script

```sql
-- Check table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'announcements'
) as table_exists;

-- Check RLS policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'announcements';

-- View sample data
SELECT id, title, type, is_active FROM announcements;
```

---

## Common Issues

### Issue 1: "relation does not exist"
**Cause:** Table not created  
**Fix:** Run the migration SQL

### Issue 2: "permission denied"
**Cause:** RLS policies blocking  
**Fix:** Make sure you're logged in as admin in the app

### Issue 3: Empty error `{}`
**Cause:** Network/connection issue  
**Fix:** Check Supabase connection, refresh page

---

## After Migration Succeeds

1. Refresh the `/admin/announcements` page
2. Click "Yangi E'lon"
3. Fill form and save
4. Should work! ✅

The error logging has been improved to show more details if issues persist.
