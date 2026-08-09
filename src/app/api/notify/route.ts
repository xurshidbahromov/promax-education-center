import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendMessage } from '@/lib/telegram/bot';
import { buildPaymentReceiptMessage, buildNotificationMessage } from '@/lib/telegram/messages';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    if (type === 'payment_receipt') {
      await handlePaymentReceipt(params);
    } else if (type === 'system_notification') {
      await handleSystemNotification(params);
    } else {
      return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Notify API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handlePaymentReceipt({
  studentId,
  groupId,
  amount,
  paymentMethod,
  monthYear,
}: {
  studentId: string;
  groupId?: string;
  amount: number;
  paymentMethod: string;
  monthYear: string;
}) {
  const supabase = await createClient();

  // 1. Fetch student info
  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name, telegram_id')
    .eq('id', studentId)
    .single();

  if (!student) return;

  // 2. Fetch group name
  let groupName = '';
  if (groupId) {
    const { data: group } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();
    groupName = group?.name || '';
  }

  // 3. Fetch linked parents
  const { data: parentLinks } = await supabase
    .from('parent_students')
    .select('parent_telegram_id')
    .eq('student_id', studentId);

  // 4. Build receipt message
  const receiptMsg = buildPaymentReceiptMessage({
    studentName: student.full_name || "O'quvchi",
    groupName,
    amount,
    method: paymentMethod,
    monthYear,
    date: new Date().toISOString(),
    receiptNumber: Date.now().toString().slice(-6),
  });

  // 5. Send to student
  if (student.telegram_id) {
    await sendMessage(student.telegram_id, receiptMsg).catch(console.error);
  }

  // 6. Send to parents
  if (parentLinks && parentLinks.length > 0) {
    for (const parent of parentLinks) {
      if (parent.parent_telegram_id) {
        await sendMessage(parent.parent_telegram_id, receiptMsg).catch(console.error);
      }
    }
  }

  // 7. Save web notification
  await supabase.from('notifications').insert({
    user_id: studentId,
    title: "To'lov Qabul Qilindi",
    message: `${monthYear} oyi uchun ${amount.toLocaleString('uz-UZ')} so'm to'lov qabul qilindi.`,
    type: 'payment',
    is_read: false,
  });
}

async function handleSystemNotification({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}) {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from('profiles')
    .select('telegram_id')
    .eq('id', userId)
    .single();

  const { data: parentLinks } = await supabase
    .from('parent_students')
    .select('parent_telegram_id')
    .eq('student_id', userId);

  const formattedMsg = buildNotificationMessage(title, body);

  if (user?.telegram_id) {
    await sendMessage(user.telegram_id, formattedMsg).catch(console.error);
  }

  if (parentLinks && parentLinks.length > 0) {
    for (const parent of parentLinks) {
      if (parent.parent_telegram_id) {
        await sendMessage(parent.parent_telegram_id, formattedMsg).catch(console.error);
      }
    }
  }

  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message: body,
    type: 'system',
    is_read: false,
  });
}
