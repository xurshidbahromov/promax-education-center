import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

function generateDeterministicAuth(telegramId: number) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || 'fallback_secret';
  const email = `tg_${telegramId}@promax.uz`;
  const password = crypto.createHmac('sha256', secret).update(telegramId.toString()).digest('hex');
  return { email, password };
}

function verifyTelegramWebAppData(telegramInitData: string, botToken: string): boolean {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get('hash');
  let dataToCheck: string[] = [];

  const entries = Array.from(initData.entries());
  entries.sort(([a], [b]) => a.localeCompare(b));
  
  for (const [key, val] of entries) {
    if (key !== 'hash') {
      dataToCheck.push(`${key}=${val}`);
    }
  }

  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const _hash = crypto.createHmac('sha256', secret).update(dataToCheck.join('\n')).digest('hex');

  return hash === _hash;
}

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!initData || !verifyTelegramWebAppData(initData, botToken)) {
      return NextResponse.json({ error: 'Invalid Telegram WebApp data' }, { status: 401 });
    }

    // Parse user data from initData
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) {
      return NextResponse.json({ error: 'No user data in initData' }, { status: 400 });
    }

    const tgUserRaw = JSON.parse(userStr);
    const telegramId = parseInt(tgUserRaw.id);

    const supabase = await createClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    // 1. Check if they already have an active session
    const { data: { session } } = await supabase.auth.getSession();
    if (session && profile && session.user.id === profile.id) {
      // They are already logged in perfectly!
      return NextResponse.json({ linked: true, profile, method: 'session' });
    }

    if (profile) {
      // They are linked but don't have an active session (or session belongs to another user)
      const { email: detEmail, password: detPassword } = generateDeterministicAuth(telegramId);
      
      // Attempt to sign in with deterministic credentials (works if they registered via Telegram)
      let signInAttempt = await supabase.auth.signInWithPassword({ email: detEmail, password: detPassword });

      if (!signInAttempt.error && signInAttempt.data.user) {
        return NextResponse.json({ linked: true, profile, method: 'deterministic' });
      }

      // If deterministic auth fails, it means they registered via the website and have a custom password.
      // We must ask them to log in ONCE.
      const tgUser = {
        id: telegramId,
        first_name: tgUserRaw.first_name || 'Telegram User',
        username: tgUserRaw.username,
        photo_url: tgUserRaw.photo_url,
      };

      return NextResponse.json({ 
        linked: true, 
        needsPassword: true, 
        phone: profile.phone,
        telegramUser: tgUser
      });

    } else {
      // 3. AUTO-REGISTER NEW USERS
      const { email: detEmail, password: detPassword } = generateDeterministicAuth(telegramId);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: detEmail,
        password: detPassword,
        options: {
          data: {
            full_name: tgUserRaw.first_name + (tgUserRaw.last_name ? ` ${tgUserRaw.last_name}` : ''),
            role: 'student',
          }
        }
      });

      if (authData.user) {
        // Update profile with Telegram info
        await supabase.from('profiles').update({
          telegram_id: telegramId,
          telegram_username: tgUserRaw.username || null,
          avatar_url: tgUserRaw.photo_url || null
        }).eq('id', authData.user.id);

        // Sign them in
        await supabase.auth.signInWithPassword({ email: detEmail, password: detPassword });

        return NextResponse.json({ linked: true, autoCreated: true, method: 'auto-register' });
      }

      // Fallback if auto-register fails
      const tgUser = {
        id: telegramId,
        first_name: tgUserRaw.first_name || 'Telegram User',
        username: tgUserRaw.username,
        photo_url: tgUserRaw.photo_url,
      };
      
      return NextResponse.json({ linked: false, telegramUser: tgUser });
    }
  } catch (error: any) {
    console.error('WebApp Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
