-- ========================================================
-- PROMAX COIN SHOP & ORDERS DATABASE MIGRATION SCRIPT
-- Copy and run this script in Supabase SQL Editor
-- ========================================================

-- 1. Create shop_items table
CREATE TABLE IF NOT EXISTS public.shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price_coins INT NOT NULL DEFAULT 100,
    stock INT NOT NULL DEFAULT 10,
    category TEXT NOT NULL DEFAULT 'merch', -- 'merch', 'exam', 'discount', 'gadget'
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create shop_orders table
CREATE TABLE IF NOT EXISTS public.shop_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.shop_items(id) ON DELETE SET NULL,
    coins_spent INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'delivered', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS (Row Level Security) and allow all access for public / authenticated users
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on shop_items" ON public.shop_items FOR SELECT USING (true);
CREATE POLICY "Allow all access on shop_items" ON public.shop_items FOR ALL USING (true);

CREATE POLICY "Allow public read access on shop_orders" ON public.shop_orders FOR SELECT USING (true);
CREATE POLICY "Allow all access on shop_orders" ON public.shop_orders FOR ALL USING (true);

-- 4. Seed default shop items
INSERT INTO public.shop_items (title, description, price_coins, stock, category, image_url)
VALUES
  ('Promax Brended Futbolka', 'Yuqori sifatli 100% paxtali maxsus Promax kiyimi', 500, 15, 'merch', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'),
  ('MOCK IELTS Imtihoni Chiptasi', 'Navbatdagi MOCK IELTS imtihonida tekin qatnashish chiptasi', 300, 25, 'exam', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80'),
  ('Oylik To''lov 20% Chegirma', 'Kelgusi oy dars to''lovi uchun 20% maxsus chegirma vaucheri', 450, 10, 'discount', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'),
  ('Promax Powerbank 10.000 mAh', 'Tezkor quvvatlovchi brendli Powerbank', 800, 5, 'gadget', 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=600&auto=format&fit=crop&q=80'),
  ('Promax Maxsus Daftari & Qalami', 'Koinot dizaynidagi premium qalin bloknot va metall qalam', 150, 50, 'merch', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80')
ON CONFLICT DO NOTHING;
