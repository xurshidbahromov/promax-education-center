## ✅ Migration Fix - Idempotent Version

### Problem Solved:
Error: **"policy already exists"** - means migration was partially run.

### Solution Created:
**File:** [`008_fix_announcements_policies.sql`](file:///Users/m1pro/Documents/Self%20Learn/promax-center/supabase/migrations/008_fix_announcements_policies.sql)

This version:
- ✅ Drops existing policies first (`DROP POLICY IF EXISTS`)
- ✅ Recreates them fresh
- ✅ Uses `CREATE OR REPLACE` for functions
- ✅ Drops and recreates trigger
- ✅ Conditional inserts (only if data doesn't exist)
- ✅ **Can be run multiple times safely!**

---

## 🎯 Next Steps:

### Option 1: Run the Fix Script (RECOMMENDED)
Run [`008_fix_announcements_policies.sql`](file:///Users/m1pro/Documents/Self%20Learn/promax-center/supabase/migrations/008_fix_announcements_policies.sql) in Supabase SQL Editor

**Why?** It will:
- Drop and recreate policies cleanly
- Add sample data if missing
- Fix any permission issues

### Option 2: Test Current State
Maybe the table is already working! Let's test by:
1. Going to `/admin/announcements`
2. Trying to create an announcement
3. Checking if proper error message appears

---

## Debug Next

If still getting errors, let's check:
```sql
-- Check if admin user exists in profiles with correct role
SELECT id, email, role FROM profiles WHERE role IN ('admin', 'staff');

-- Check current user
SELECT auth.uid();

-- Try manual insert as current user
INSERT INTO announcements (title, message, type) 
VALUES ('Test', 'Testing insert', 'info');
```

The issue might be:
- ❌ User logged in is not 'admin' role
- ❌ RLS policy blocking insert
- ❌ Missing permissions

Let me know what happens when you try to save an announcement now!
