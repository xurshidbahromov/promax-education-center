import { createClient } from '@/utils/supabase/client';
import { sendMessage } from '@/lib/telegram/bot';
import { buildPaymentReceiptMessage, buildNotificationMessage } from '@/lib/telegram/messages';

interface PaymentReceiptParams {
  studentId: string;
  groupId?: string;
  amount: number;
  paymentMethod: string;
  monthYear: string;
}

/**
 * Send instant payment receipt notification to student and all linked parents
 */
export async function sendPaymentReceiptToStudentAndParents({
  studentId,
  groupId,
  amount,
  paymentMethod,
  monthYear,
}: PaymentReceiptParams): Promise<void> {
  try {
    const supabase = createClient();

    // 1. Fetch student info
    const { data: student } = await supabase
      .from('profiles')
      .select('id, full_name, telegram_id')
      .eq('id', studentId)
      .single();

    if (!student) return;

    // 2. Fetch group name if groupId provided
    let groupName = '';
    if (groupId) {
      const { data: group } = await supabase
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();
      groupName = group?.name || '';
    }

    // 3. Fetch linked parents from parent_students table
    const { data: parentLinks } = await supabase
      .from('parent_students')
      .select('parent_telegram_id')
      .eq('student_id', studentId);

    // 4. Build receipt message
    const receiptMsg = buildPaymentReceiptMessage({
      studentName: student.full_name || "O'quvchi",
      groupName: groupName,
      amount: amount,
      method: paymentMethod,
      monthYear: monthYear,
      date: new Date().toISOString(),
      receiptNumber: Date.now().toString().slice(-6),
    });

    // 5. Send Telegram message to student if linked
    if (student.telegram_id) {
      await sendMessage(student.telegram_id, receiptMsg).catch(console.error);
    }

    // 6. Send Telegram message to all linked parents
    if (parentLinks && parentLinks.length > 0) {
      for (const parent of parentLinks) {
        if (parent.parent_telegram_id) {
          await sendMessage(parent.parent_telegram_id, receiptMsg).catch(console.error);
        }
      }
    }

    // 7. Insert notification into web app notifications table
    await supabase.from('notifications').insert({
      user_id: studentId,
      title: "To'lov Qabul Qilindi",
      message: `${monthYear} oyi uchun ${amount.toLocaleString('uz-UZ')} so'm to'lov qabul qilindi.`,
      type: 'payment',
      is_read: false,
    });
  } catch (error) {
    console.error('Error in sendPaymentReceiptToStudentAndParents:', error);
  }
}

/**
 * Send notification to user and their linked parents via Telegram & Web App
 */
export async function sendSystemNotificationToUserAndParents({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}): Promise<void> {
  try {
    const supabase = createClient();

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
  } catch (error) {
    console.error('Error sending system notification:', error);
  }
}
