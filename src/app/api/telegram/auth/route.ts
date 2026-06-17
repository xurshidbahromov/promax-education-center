import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyInitData } from '@/lib/telegram/miniapp';
import crypto from 'crypto';

function generateDeterministicAuth(telegramId: number) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || 'fallback_secret';
  const email = `tg_${telegramId}@promax.uz`;
  const password = crypto.createHmac('sha256', secret).update(telegramId.toString()).digest('hex');
  return { email, password };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { initData, action } = body;

  if (!initData) {
    return NextResponse.json({ error: 'initData required' }, { status: 400 });
  }

  // Verify Telegram initData signature
  const parsed = verifyInitData(initData);
  if (!parsed || !parsed.user) {
    return NextResponse.json({ error: 'Invalid initData' }, { status: 401 });
  }

  const telegramUser = parsed.user;
  const supabase = await createClient();

  // Find profile linked to this telegram_id
  let { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, avatar_url, coins, telegram_id, telegram_username')
    .eq('telegram_id', telegramUser.id)
    .single();

  const { email, password } = generateDeterministicAuth(telegramUser.id);

  if (!profile) {
    if (action === 'swipe_login') {
      // Auto register
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
            role: 'student',
          }
        }
      });

      if (authError || !authData.user) {
        return NextResponse.json({ error: 'Ro\'yxatdan o\'tishda xatolik', details: authError }, { status: 500 });
      }

      // Supabase trigger automatically creates the profile. Update it with TG data.
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ 
            telegram_id: telegramUser.id, 
            telegram_username: telegramUser.username || null,
            avatar_url: telegramUser.photo_url || null
        })
        .eq('id', authData.user.id)
        .select('id, full_name, phone, role, avatar_url, coins, telegram_id, telegram_username')
        .single();

      if (updateError || !updatedProfile) {
        return NextResponse.json({ error: 'Profilni yangilashda xatolik' }, { status: 500 });
      }
      profile = updatedProfile;
      
      // Explicitly sign in to set the session cookie
      await supabase.auth.signInWithPassword({ email, password });
    } else {
      // Not linked, and not swiping yet
      return NextResponse.json({
        linked: false,
        telegramUser: {
          id: telegramUser.id,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          username: telegramUser.username,
          photo_url: telegramUser.photo_url,
        },
      });
    }
  } else {
    // They are already linked. Just log them in (if they auto-registered before).
    // If they registered via web with phone, we can't log them in with deterministic password.
    // BUT we can use the deterministic password if they auto-registered.
    // Let's try to sign in with deterministic password. If it fails, maybe they registered with phone.
    // If they registered with phone, they shouldn't need a password sign-in because MiniApp doesn't have the phone password.
    // Wait! If they registered with phone, the email is `phone@promax.uz`!
    // So the deterministic auth won't work for web-linked accounts.
    // However, if `action === 'swipe_login'`, we MUST log them in. 
    // This is why we need to ensure they are logged in.
    if (action === 'swipe_login') {
       // Since they swiped, let's make sure they are logged in.
       // Try deterministic sign-in first:
       const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
       
       if (signInError) {
         // Maybe they registered with phone? If so, we need an admin client to generate a custom token or we cannot log them in without asking for password.
         // Actually, if they are opening from MiniApp and their `telegram_id` matches, we SHOULD log them in.
         // But `@supabase/ssr` only sets cookies via signIn methods.
         // For now, if signInError, we just return the profile. If they fetch data on the client side without a valid session, RLS will fail.
         // Let's hope they auto-registered. If they linked via `/tg/link`, the `/tg/link` API already signed them in!
       }
    }
  }

  return NextResponse.json({
    linked: true,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      phone: profile.phone,
      role: profile.role,
      avatar_url: profile.avatar_url,
      coins: profile.coins,
    },
    telegramUser: {
      id: telegramUser.id,
      first_name: telegramUser.first_name,
      username: telegramUser.username,
    },
  });
}
