import { NextRequest, NextResponse } from 'next/server';
import { createClient, createTelegramBotClient } from '@/utils/supabase/server';
import crypto from 'crypto';

function generateDeterministicAuth(telegramId: number) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || 'fallback_secret';
  const email = `tg_${telegramId}@promax.uz`;
  const password = crypto.createHmac('sha256', secret).update(telegramId.toString()).digest('hex');
  return { email, password };
}

export async function POST(request: NextRequest) {
  try {
    const { phone, password, telegramUser } = await request.json();

    if (!phone || !telegramUser || !telegramUser.id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const botClient = await createTelegramBotClient();

    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithPlus = '+' + cleanPhone;
    const phoneEmail = `${cleanPhone}@promax.uz`;

    // Check if phone exists in profiles (check both with and without '+')
    const { data: existingProfiles } = await botClient
      .from('profiles')
      .select('id, full_name, phone, telegram_id')
      .or(`phone.eq.${cleanPhone},phone.eq.${phoneWithPlus},phone.ilike.%${cleanPhone}%`)
      .limit(1);

    const existingProfile = existingProfiles?.[0];

    if (existingProfile) {
      // LINK EXISTING ACCOUNT
      if (!password) {
        return NextResponse.json({ error: 'Password required to link existing account', needsPassword: true }, { status: 400 });
      }

      // Verify ownership by logging in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: phoneEmail,
        password,
      });

      if (authError || !authData.user) {
        return NextResponse.json({ error: "Noto'g'ri parol", wrongPassword: true }, { status: 401 });
      }

      // Link Telegram and ensure clean phone is saved to this profile
      const { error: updateError } = await botClient
        .from('profiles')
        .update({
          telegram_id: telegramUser.id,
          telegram_username: telegramUser.username || null,
          phone: phoneWithPlus,
          avatar_url: telegramUser.photo_url || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('[Link Account] Update error on existing profile:', updateError);
        return NextResponse.json({ error: 'Profilni ulashda xatolik yuz berdi' }, { status: 500 });
      }

      return NextResponse.json({ success: true, linked: true });

    } else {
      // CREATE NEW ACCOUNT LINKED TO TELEGRAM
      const { email: detEmail, password: detPassword } = generateDeterministicAuth(telegramUser.id);
      const fullName = telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : '');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: detEmail,
        password: detPassword,
        options: {
          data: {
            full_name: fullName,
            role: 'student',
            phone: phoneWithPlus
          }
        }
      });

      if (authError || !authData.user) {
        // If user already exists in auth with this email, sign in instead
        if (authError?.message?.includes('already registered') || authError?.status === 422) {
          await supabase.auth.signInWithPassword({ email: detEmail, password: detPassword });
        } else {
          return NextResponse.json({ error: "Ro'yxatdan o'tishda xatolik", details: authError }, { status: 500 });
        }
      }

      const targetUserId = authData.user?.id;

      // Update / Upsert profile using botClient to ensure phone and telegram data are saved
      if (targetUserId) {
        const { error: upsertError } = await botClient
          .from('profiles')
          .upsert({ 
            id: targetUserId,
            telegram_id: telegramUser.id, 
            telegram_username: telegramUser.username || null,
            avatar_url: telegramUser.photo_url || null,
            phone: phoneWithPlus,
            full_name: fullName,
            role: 'student',
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (upsertError) {
          console.error('[Link Account] Upsert error on new profile:', upsertError);
        }
      }

      // Explicitly sign in to set the user session cookie
      await supabase.auth.signInWithPassword({ email: detEmail, password: detPassword });

      return NextResponse.json({ success: true, created: true });
    }
  } catch (error: any) {
    console.error('Link Account Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
