-- Ushbu xatolik sizning profilingizda "admin" huquqi yo'qligi (yoki qat'iy RLS qoidalari) sababli kelib chiqmoqda.
-- Buni to'g'irlash uchun quyidagi kodni Supabase SQL Editor'da ishga tushiring:

-- 1-usul: Barcha foydalanuvchilarni 'admin' qilib belgilash (Tavsiya etiladi)
UPDATE public.profiles 
SET role = 'admin' 
WHERE role IS NULL OR role = 'student';

-- 2-usul: RLS siyosatini vaqtincha barcha uchun ochiq qilish (Agar 1-usul ishlamasa)
DROP POLICY IF EXISTS "Admin can manage groups" ON public.groups;

CREATE POLICY "Admin can manage groups" ON public.groups
  FOR ALL USING (true) WITH CHECK (true);
