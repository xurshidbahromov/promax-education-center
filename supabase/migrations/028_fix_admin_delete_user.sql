-- ============================================================
-- 028_fix_admin_delete_user.sql
-- Fix: Enable Admins to Delete Users & Profiles cleanly
-- ============================================================

-- 1. Add DELETE policy on public.profiles for Admins
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- 2. Create Security Definer RPC to completely delete a user 
--    (from child tables, public.profiles, and auth.users)
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_role TEXT;
  v_target_phone TEXT;
  v_target_telegram_id BIGINT;
  v_target_name TEXT;
BEGIN
  -- Security check: Caller must be an admin
  SELECT role INTO v_caller_role 
  FROM public.profiles 
  WHERE id = auth.uid();

  IF v_caller_role NOT IN ('admin', 'superadmin', 'staff') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Faqat adminlar foydalanuvchini o''chirish huquqiga ega');
  END IF;

  -- Prevent deleting oneself
  IF auth.uid() = target_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'O''z akkauntingizni o''chira olmaysiz');
  END IF;

  -- Fetch target info
  SELECT full_name, phone, telegram_id INTO v_target_name, v_target_phone, v_target_telegram_id
  FROM public.profiles
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Foydalanuvchi topilmadi');
  END IF;

  -- Protect superadmin
  IF v_target_phone LIKE '%955137776%' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bosh admin akkauntini o''chirib bo''lmaydi');
  END IF;

  -- 1. Nullify references in parent records
  UPDATE public.tests SET created_by = NULL WHERE created_by = target_user_id;
  UPDATE public.announcements SET created_by = NULL WHERE created_by = target_user_id;
  UPDATE public.groups SET teacher_id = NULL WHERE teacher_id = target_user_id;

  -- 2. Delete student records
  DELETE FROM public.parent_students WHERE student_id = target_user_id;
  IF v_target_telegram_id IS NOT NULL THEN
    DELETE FROM public.parent_students WHERE parent_telegram_id = v_target_telegram_id;
  END IF;
  DELETE FROM public.group_students WHERE student_id = target_user_id;
  DELETE FROM public.attendance WHERE student_id = target_user_id;
  DELETE FROM public.payments WHERE student_id = target_user_id;
  DELETE FROM public.shop_orders WHERE student_id = target_user_id;
  DELETE FROM public.notifications WHERE user_id = target_user_id;
  DELETE FROM public.results WHERE student_id = target_user_id;
  DELETE FROM public.tournament_results WHERE student_id = target_user_id;
  DELETE FROM public.tournament_registrations WHERE student_id = target_user_id;
  UPDATE public.tournament_comments SET user_id = NULL WHERE user_id = target_user_id;

  -- Delete question responses and test attempts
  DELETE FROM public.question_responses WHERE attempt_id IN (
    SELECT id FROM public.test_attempts WHERE student_id = target_user_id
  );
  DELETE FROM public.test_attempts WHERE student_id = target_user_id;

  -- 3. Delete from public.profiles
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- 4. Delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN jsonb_build_object(
    'success', true, 
    'message', COALESCE(v_target_name, 'Foydalanuvchi') || ' muvaffaqiyatli o''chirildi'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(UUID) TO authenticated;
