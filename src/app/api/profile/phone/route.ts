import { NextRequest, NextResponse } from 'next/server';
import { createClient, createTelegramBotClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    let body: { phone?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Noto'g'ri so'rov formati" }, { status: 400 });
    }

    const digits = String(body?.phone || '').replace(/\D/g, '');

    if (digits.length < 9 || digits.length > 15) {
      return NextResponse.json(
        { error: "Iltimos, to'g'ri telefon raqam kiriting (masalan: +998 90 123 45 67)" },
        { status: 400 }
      );
    }

    const normalized = digits.length === 9 ? `+998${digits}` : `+${digits}`;

    const sessionClient = await createClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Avtorizatsiya talab qilinadi' }, { status: 401 });
    }

    let saved = false;
    try {
      const adminClient = await createTelegramBotClient();
      const { data: updated, error } = await adminClient
        .from('profiles')
        .update({
          phone: normalized,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('id')
        .maybeSingle();

      if (!error && updated) {
        saved = true;
      }
    } catch {}

    if (!saved) {
      const { data: updated, error } = await sessionClient
        .from('profiles')
        .update({
          phone: normalized,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('id')
        .maybeSingle();

      if (error || !updated) {
        console.error('[API /api/profile/phone] Update error:', error?.message || 'Profile row not found');
        return NextResponse.json({ error: "Telefon raqamni saqlab bo'lmadi" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, phone: normalized });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server xatosi';
    console.error('[API /api/profile/phone] Exception:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
