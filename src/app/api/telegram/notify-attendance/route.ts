import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBotClient } from '@/utils/supabase/server';
import { sendMessage } from '@/lib/telegram/bot';
import { buildAttendanceMessage } from '@/lib/telegram/messages';

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
    const nameStr = studentName || studentProfile?.full_name || "O'quvchi";
    const gNameStr = groupName || "Guruh";

    const studentMsg = buildAttendanceMessage({
      studentName: nameStr,
      groupName: gNameStr,
      date,
      status: status || 'present',
      homework,
      notes: body.notes,
      isParent: false,
    });

    const parentMsg = buildAttendanceMessage({
      studentName: nameStr,
      groupName: gNameStr,
      date,
      status: status || 'present',
      homework,
      notes: body.notes,
      isParent: true,
    });

    // 4. Send messages
    let sentCount = 0;
    if (studentProfile?.telegram_id) {
      try {
        await sendMessage(studentProfile.telegram_id, studentMsg);
        sentCount++;
      } catch (err) {
        console.error(`Failed to send telegram notification to student ${studentProfile.telegram_id}:`, err);
      }
    }

    if (parentLinks && parentLinks.length > 0) {
      for (const p of parentLinks) {
        if (p.parent_telegram_id) {
          try {
            await sendMessage(p.parent_telegram_id, parentMsg);
            sentCount++;
          } catch (err) {
            console.error(`Failed to send telegram notification to parent ${p.parent_telegram_id}:`, err);
          }
        }
      }
    }

    return NextResponse.json({ success: true, sentCount });
  } catch (error: any) {
    console.error('Attendance notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
