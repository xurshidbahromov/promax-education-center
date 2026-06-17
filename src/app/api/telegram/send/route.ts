import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { broadcastMessage, sendMessage } from '@/lib/telegram/bot';

export async function POST(request: NextRequest) {
  // Internal-only endpoint — verify admin session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'teacher'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { mode, chatId, text, targetAll } = body;

  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  if (targetAll) {
    // Broadcast to all linked users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('telegram_id')
      .not('telegram_id', 'is', null);

    const chatIds = (profiles || [])
      .map(p => p.telegram_id)
      .filter(Boolean);

    await broadcastMessage(chatIds, text);

    return NextResponse.json({
      success: true,
      sent: chatIds.length,
    });
  }

  if (chatId) {
    await sendMessage(chatId, text);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'chatId or targetAll required' }, { status: 400 });
}
