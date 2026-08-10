import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBotClient } from '@/utils/supabase/server';
import { sendMessage } from '@/lib/telegram/bot';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createTelegramBotClient();
    const body = await request.json();
    const { groupId, groupName, studentId, studentName, date, status, homework } = body;

    if (!groupId || !studentId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Find linked parent telegram ID(s)
    const { data: parentLinks } = await supabase
      .from('parent_students')
      .select('parent_telegram_id, parent_name')
      .eq('student_id', studentId);

    // 2. Find student telegram ID
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('telegram_id, full_name')
      .eq('id', studentId)
      .single();

    const recipientTelegramIds: number[] = [];

    if (parentLinks && parentLinks.length > 0) {
      parentLinks.forEach(p => {
        if (p.parent_telegram_id) recipientTelegramIds.push(p.parent_telegram_id);
      });
    }

    if (studentProfile?.telegram_id && !recipientTelegramIds.includes(studentProfile.telegram_id)) {
      recipientTelegramIds.push(studentProfile.telegram_id);
    }

    if (recipientTelegramIds.length === 0) {
      return NextResponse.json({ success: false, message: 'No linked Telegram account found for parent/student' });
    }

    // 3. Formulate message text
    let messageText = '';
    const formattedDate = new Date(date).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
    const nameStr = studentName || studentProfile?.full_name || "O'quvchi";
    const gNameStr = groupName || "Guruh";

    if (status === 'absent') {
      messageText = `⚠️ <b>DAVOMAT OGOHLANTIRISHI</b>\n\n` +
        `Hurmatli ota-ona!\n` +
        `Farzandingiz <b>${nameStr}</b> bugun (<b>${formattedDate}</b>) <b>${gNameStr}</b> darsiga ❌ <b>KELMADI</b>.\n\n` +
        `<i>Iltimos, darsni o'tkazib yubormasligi uchun e'tiborli bo'ling.</i>`;
    } else if (status === 'late') {
      messageText = `🟡 <b>DAVOMAT OGOHLANTIRISHI</b>\n\n` +
        `Hurmatli ota-ona!\n` +
        `Farzandingiz <b>${nameStr}</b> bugun (<b>${formattedDate}</b>) <b>${gNameStr}</b> darsiga ⏱️ <b>KECHIKIB KELDI</b>.`;
    } else if (homework === 'not_done') {
      messageText = `❌ <b>UY VAZIFASI OGOHLANTIRISHI</b>\n\n` +
        `Hurmatli ota-ona!\n` +
        `Farzandingiz <b>${nameStr}</b> bugun (<b>${formattedDate}</b>) <b>${gNameStr}</b> darsida uy vazifasini 🔴 <b>BAJARMADI</b>.\n\n` +
        `<i>Farzandingiz bilimi pasayib ketmasligi uchun uy vazifalarini nazorat qilishingizni so'raymiz.</i>`;
    }

    if (!messageText) {
      return NextResponse.json({ success: true, message: 'No notification needed for present/done' });
    }

    // 4. Send messages
    let sentCount = 0;
    for (const tgId of recipientTelegramIds) {
      try {
        await sendMessage(tgId, messageText);
        sentCount++;
      } catch (err) {
        console.error(`Failed to send telegram notification to ${tgId}:`, err);
      }
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    console.error('Attendance notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
