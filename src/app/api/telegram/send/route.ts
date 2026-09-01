import { NextRequest, NextResponse } from 'next/server';
import { createClient, createTelegramBotClient } from '@/utils/supabase/server';
import { broadcastMessage, broadcastPhoto, sendMessage, sendPhoto } from '@/lib/telegram/bot';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check internal secret or user role
    const internalSecret = request.headers.get('x-internal-secret');
    const isInternal = internalSecret && (internalSecret === process.env.INTERNAL_NOTIFY_SECRET || internalSecret === process.env.TELEGRAM_BOT_TOKEN);

    if (!isInternal) {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'teacher'].includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { chatId, text, targetAll, targetAudience = 'all', imageUrl, photoUrl } = body;

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const validPhotoUrl = (imageUrl || photoUrl || '').startsWith('http') ? (imageUrl || photoUrl) : null;

    if (targetAll) {
      const botClient = await createTelegramBotClient();

      let profilesQuery = botClient
        .from('profiles')
        .select('telegram_id, role')
        .not('telegram_id', 'is', null);

      if (targetAudience === 'students') {
        profilesQuery = profilesQuery.eq('role', 'student');
      } else if (targetAudience === 'teachers') {
        profilesQuery = profilesQuery.eq('role', 'teacher');
      }

      const { data: profiles } = await profilesQuery;

      let parentChatIds: number[] = [];
      if (targetAudience === 'all' || targetAudience === 'students') {
        const { data: parents } = await botClient
          .from('parent_students')
          .select('parent_telegram_id')
          .not('parent_telegram_id', 'is', null);
        if (parents) {
          parentChatIds = parents.map(p => Number(p.parent_telegram_id)).filter(Boolean);
        }
      }

      const allChatIds = Array.from(new Set([
        ...(profiles || []).map(p => Number(p.telegram_id)),
        ...parentChatIds
      ])).filter(id => id && !isNaN(id));

      if (allChatIds.length > 0) {
        if (validPhotoUrl) {
          await broadcastPhoto(allChatIds, validPhotoUrl, text);
        } else {
          await broadcastMessage(allChatIds, text);
        }
      }

      return NextResponse.json({
        success: true,
        sent: allChatIds.length,
        hasPhoto: !!validPhotoUrl,
      });
    }

    if (chatId) {
      if (validPhotoUrl) {
        const photoRes = await sendPhoto(chatId, validPhotoUrl, text);
        if (!photoRes?.ok) {
          await sendMessage(chatId, text);
        }
      } else {
        await sendMessage(chatId, text);
      }
      return NextResponse.json({ success: true, hasPhoto: !!validPhotoUrl });
    }

    return NextResponse.json({ error: 'chatId or targetAll required' }, { status: 400 });
  } catch (err: any) {
    console.error('[Telegram Send API] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
