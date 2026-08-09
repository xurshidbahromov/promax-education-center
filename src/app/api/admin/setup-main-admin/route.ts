import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export async function GET(request: NextRequest) {
  return handleSetup();
}

export async function POST(request: NextRequest) {
  return handleSetup();
}

async function handleSetup() {
  const supabase = createClient();
  const targetPhone = '+998955137776';
  const targetEmail = '998955137776@promax.uz';
  const targetPassword = 'Admin123!';
  const targetName = 'Bosh Admin';

  try {
    // 1. Try signing in first
    let userId: string | null = null;
    const signInRes = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });

    if (signInRes.data.user) {
      userId = signInRes.data.user.id;
    } else {
      // 2. Try creating the user if not exists
      const signUpRes = await supabase.auth.signUp({
        email: targetEmail,
        password: targetPassword,
        options: {
          data: {
            full_name: targetName,
            role: 'admin',
          },
        },
      });

      if (signUpRes.data.user) {
        userId = signUpRes.data.user.id;
      }
    }

    if (!userId) {
      // Get current user session if already signed in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    }

    // 3. Upsert admin profile
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: targetName,
        phone: targetPhone,
        role: 'admin',
        coins: 1000,
      });

      // 4. Delete all other profiles except this admin
      const { error: deleteErr } = await supabase
        .from('profiles')
        .delete()
        .neq('id', userId);

      // 5. Clean linked tables
      await supabase.from('parent_students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('group_students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('test_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      return NextResponse.json({
        success: true,
        message: "Bosh Admin hisobi muvaffaqiyatli o'rnatildi va test ma'lumotlari tozalandi!",
        admin: {
          phone: "+998 95 513 77 76",
          email: targetEmail,
          password: targetPassword,
          role: "admin",
          id: userId
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: "Bosh Admin hisobini yaratib bo'lmadi",
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
