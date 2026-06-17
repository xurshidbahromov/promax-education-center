import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
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
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneEmail = `${cleanPhone}@promax.uz`;

    // Check if phone exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

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
        return NextResponse.json({ error: 'Noto\'g\'ri parol', wrongPassword: true }, { status: 401 });
      }

      // Link Telegram to this profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telegram_id: telegramUser.id,
          telegram_username: telegramUser.username || null,
        })
        .eq('id', authData.user.id);

      if (updateError) {
        return NextResponse.json({ error: 'Profilni ulashda xatolik yuz berdi' }, { status: 500 });
      }

      return NextResponse.json({ success: true, linked: true });

    } else {
      // CREATE NEW ACCOUNT LINKED TO TELEGRAM
      const { email: detEmail, password: detPassword } = generateDeterministicAuth(telegramUser.id);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: detEmail,
        password: detPassword,
        options: {
          data: {
            full_name: telegramUser.first_name + (telegramUser.last_name ? ` ${telegramUser.last_name}` : ''),
            role: 'student',
            phone: cleanPhone
          }
        }
      });

      if (authError || !authData.user) {
        return NextResponse.json({ error: 'Ro\'yxatdan o\'tishda xatolik', details: authError }, { status: 500 });
      }

      // Supabase trigger created profile. Update additional details.
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          telegram_id: telegramUser.id, 
          telegram_username: telegramUser.username || null,
          avatar_url: telegramUser.photo_url || null,
          phone: cleanPhone
        })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Update error:', updateError);
      }

      // Explicitly sign in to set the session cookie
      await supabase.auth.signInWithPassword({ email: detEmail, password: detPassword });

      return NextResponse.json({ success: true, created: true });
    }
  } catch (error: any) {
    console.error('Link Account Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
