import { NextRequest, NextResponse } from 'next/server';
import { createClient, createTelegramBotClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    const digits = String(phone || '').replace(/\D/g, '');

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

    const adminClient = await createTelegramBotClient();
    const { error } = await adminClient
      .from('profiles')
      .update({
        phone: normalized,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('[API /api/profile/phone] Update error:', error.message);
      return NextResponse.json({ error: 'Telefon raqamni saqlab bo\'lmadi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, phone: normalized });
  } catch (err: any) {
    console.error('[API /api/profile/phone] Exception:', err);
    return NextResponse.json({ error: err?.message || 'Server xatosi' }, { status: 500 });
  }
}
