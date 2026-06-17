import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';
import { jwtVerify, createRemoteJWKSet } from 'jose';

function generateDeterministicAuth(telegramId: number) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET || 'fallback_secret';
  const email = `tg_${telegramId}@promax.uz`;
  const password = crypto.createHmac('sha256', secret).update(telegramId.toString()).digest('hex');
  return { email, password };
}

// Telegram JWKS endpoint
const JWKS = createRemoteJWKSet(new URL('https://oauth.telegram.org/.well-known/jwks.json'));

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const clientId = process.env.TELEGRAM_CLIENT_ID || '8736423754';

    if (!payload.id_token) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    // Validate the OIDC JWT token
    let jwtPayload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(payload.id_token, JWKS, {
        issuer: 'https://oauth.telegram.org',
        audience: clientId,
      });
      jwtPayload = verifiedPayload;
    } catch (err) {
      console.error("JWT Verification failed:", err);
      return NextResponse.json({ error: 'Invalid ID token signature or audience' }, { status: 401 });
    }

    // Extract user ID from the verified JWT sub claim
    const telegramId = parseInt(jwtPayload.sub as string);

    if (isNaN(telegramId)) {
      return NextResponse.json({ error: 'Invalid user ID in token' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if telegram_id exists in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('telegram_id', telegramId)
      .single();

    if (profile) {
      // User is linked.
      // 1. Try deterministic sign-in (works if they registered via Telegram initially)
      const { email: detEmail, password: detPassword } = generateDeterministicAuth(telegramId);
      let signInAttempt = await supabase.auth.signInWithPassword({ email: detEmail, password: detPassword });

      if (!signInAttempt.error && signInAttempt.data.user) {
        return NextResponse.json({ linked: true, profile, method: 'deterministic' });
      }

      // 2. If deterministic fails, it means they registered via Phone originally and linked later.
      // We cannot auto-login without their password or Service Role Key.
      // Return a status indicating we need their password to complete login.
      return NextResponse.json({ 
        linked: true, 
        needsPassword: true, 
        phone: profile.phone 
      });

    } else {
      // User not linked
      // Format the new TelegramOIDCUser payload into the format expected by the frontend
      // Telegram OIDC User has: { id: number, name: string, preferred_username?: string, picture?: string, phone_number?: string }
      const tgUser = {
        id: telegramId,
        first_name: payload.user?.name || 'Telegram User',
        username: payload.user?.preferred_username,
        photo_url: payload.user?.picture,
      };
      
      return NextResponse.json({ linked: false, telegramUser: tgUser });
    }
  } catch (error: any) {
    console.error('Widget Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
