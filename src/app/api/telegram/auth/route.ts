import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyInitData } from '@/lib/telegram/miniapp';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { initData } = body;

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
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role, avatar_url, coins, telegram_id, telegram_username')
    .eq('telegram_id', telegramUser.id)
    .single();

  if (!profile) {
    // Not linked yet
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
