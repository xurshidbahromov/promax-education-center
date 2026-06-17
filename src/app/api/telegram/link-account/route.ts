import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyInitData } from '@/lib/telegram/miniapp';
import { sendMessage } from '@/lib/telegram/bot';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phone, password, initData, telegramId, telegramUsername } = body;

  if (!phone || !password || !telegramId) {
    return NextResponse.json({ error: 'Telefon, parol va Telegram ID talab qilinadi' }, { status: 400 });
  }

  // Verify initData signature (skip in dev with empty initData)
  if (initData) {
    const parsed = verifyInitData(initData);
    if (!parsed) {
      return NextResponse.json({ error: "Telegram ma'lumotlari noto'g'ri" }, { status: 401 });
    }
  }

  const supabase = await createClient();
  const generatedEmail = `${phone}@promax.uz`;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: generatedEmail,
    password,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: "Telefon yoki parol noto'g'ri" }, { status: 401 });
  }

  const userId = authData.user.id;

  // Check if telegram_id is already linked to another account
  const { data: existingLink } = await supabase
    .from('profiles')
    .select('id')
    .eq('telegram_id', telegramId)
    .neq('id', userId)
    .single();

  if (existingLink) {
    return NextResponse.json({ error: 'Bu Telegram hisob boshqa akkauntga ulangan' }, { status: 409 });
  }

  // Link telegram_id to profile
  const { data: profile, error: updateError } = await supabase
    .from('profiles')
    .update({ telegram_id: telegramId, telegram_username: telegramUsername || null })
    .eq('id', userId)
    .select('id, full_name, phone, role, coins')
    .single();

  if (updateError || !profile) {
    return NextResponse.json({ error: 'Profil yangilanishida xatolik' }, { status: 500 });
  }

  // Send confirmation message via bot
  try {
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://promaxedu.uz';
    await sendMessage(
      telegramId,
      `✅ <b>Muvaffaqiyatli ulandi!</b>\n\nSalom, <b>${profile.full_name || "O'quvchi"}</b>! Telegram hisobingiz Promax Education platformasiga ulandi. 🎉`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: '📱 Mini App ochish', web_app: { url: `${APP_URL}/tg` } }]],
        },
      }
    );
  } catch (e) {
    console.error('[Telegram] link confirmation failed:', e);
  }

  await supabase.auth.signOut();

  return NextResponse.json({
    success: true,
    profile: { id: profile.id, full_name: profile.full_name, role: profile.role, coins: profile.coins },
  });
}
