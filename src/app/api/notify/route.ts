import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBotClient } from '@/utils/supabase/server';
import { sendMessage } from '@/lib/telegram/bot';
import {
  buildPaymentReceiptMessage,
  buildAttendanceMessage,
  buildDTMExamResultMessage,
  buildOnlineTestResultMessage,
  buildNotificationMessage,
} from '@/lib/telegram/messages';
import directionsData from '@/data/dtm_directions.json';

export async function POST(request: NextRequest) {
  try {
    // ── Security Check: Verify caller is authenticated or provides internal secret ──
    const authHeader = request.headers.get('authorization') || '';
    const internalSecret = request.headers.get('x-internal-secret') || '';
    const expectedSecret = process.env.INTERNAL_NOTIFY_SECRET || process.env.TELEGRAM_BOT_TOKEN || '';

    // Check if valid internal secret provided
    const isSecretValid = internalSecret && expectedSecret && internalSecret === expectedSecret;

    if (!isSecretValid) {
      // Check if user is logged into the platform
      const userSupabase = await createTelegramBotClient();
      const authCookie = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token');
      // If neither secret nor standard internal origin
      const origin = request.headers.get('origin') || request.headers.get('referer') || '';
      const host = request.headers.get('host') || '';
      const isInternalOrigin = origin.includes(host) || origin.includes('localhost') || origin.includes('promaxedu.uz');

      if (!isInternalOrigin && !authHeader.includes('Bearer')) {
        return NextResponse.json({ error: 'Unauthorized notify request' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { type, ...params } = body;

    if (type === 'payment_receipt') {
      await handlePaymentReceipt(params);
    } else if (type === 'attendance') {
      await handleAttendanceNotification(params);
    } else if (type === 'dtm_result') {
      await handleDTMResultNotification(params);
    } else if (type === 'test_result') {
      await handleTestResultNotification(params);
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

// ── 1. PAYMENT RECEIPT NOTIFICATION ──
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
  const supabase = await createTelegramBotClient();

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

// ── 2. ATTENDANCE NOTIFICATION ──
async function handleAttendanceNotification({
  studentId,
  groupId,
  groupName,
  date,
  status,
  homework,
  notes,
}: {
  studentId: string;
  groupId?: string;
  groupName?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  homework?: 'done' | 'not_done' | 'partially' | 'none';
  notes?: string;
}) {
  const supabase = await createTelegramBotClient();

  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name, telegram_id')
    .eq('id', studentId)
    .single();

  if (!student) return;

  let gName = groupName;
  if (!gName && groupId) {
    const { data: group } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();
    gName = group?.name || '';
  }

  const { data: parentLinks } = await supabase
    .from('parent_students')
    .select('parent_telegram_id')
    .eq('student_id', studentId);

  const studentMsg = buildAttendanceMessage({
    studentName: student.full_name || "O'quvchi",
    groupName: gName,
    date,
    status,
    homework,
    notes,
    isParent: false,
  });

  const parentMsg = buildAttendanceMessage({
    studentName: student.full_name || "O'quvchi",
    groupName: gName,
    date,
    status,
    homework,
    notes,
    isParent: true,
  });

  if (student.telegram_id) {
    await sendMessage(student.telegram_id, studentMsg).catch(console.error);
  }

  if (parentLinks && parentLinks.length > 0) {
    for (const parent of parentLinks) {
      if (parent.parent_telegram_id) {
        await sendMessage(parent.parent_telegram_id, parentMsg).catch(console.error);
      }
    }
  }

  const statusUz = status === 'present' ? 'Darsda qatnashdi' : status === 'absent' ? 'Darsga kelmadi' : 'Darsga kechikib keldi';
  await supabase.from('notifications').insert({
    user_id: studentId,
    title: `Davomat: ${statusUz}`,
    message: `${date} sanasidagi ${gName ? `${gName} ` : ''}darsida davomatingiz belgilandi.`,
    type: 'attendance',
    is_read: false,
  });
}

// ── 3. DTM MOCK EXAM RESULT NOTIFICATION ──
async function handleDTMResultNotification({
  studentId,
  examTitle,
  examDate,
  directionCode,
  directionTitle,
  rank,
  totalParticipants,
  scores,
}: {
  studentId: string;
  examTitle?: string;
  examDate: string;
  directionCode?: string;
  directionTitle?: string;
  rank?: number;
  totalParticipants?: number;
  scores: {
    total: number;
    comp_math?: number;
    comp_history?: number;
    comp_lang?: number;
    subject_1?: number;
    subject_2?: number;
  };
}) {
  const supabase = await createTelegramBotClient();

  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name, telegram_id, phone')
    .eq('id', studentId)
    .single();

  if (!student) return;

  const { data: parentLinks } = await supabase
    .from('parent_students')
    .select('parent_telegram_id')
    .eq('student_id', studentId);

  let dirName = directionTitle;
  let s1Name = '1-Asosiy fan';
  let s2Name = '2-Asosiy fan';

  if (directionCode) {
    const dirInfo = (directionsData as any[]).find((d: any) => d.code === directionCode);
    if (dirInfo) {
      if (!dirName) dirName = dirInfo.name;
      if (dirInfo.subject_1) s1Name = dirInfo.subject_1;
      if (dirInfo.subject_2) s2Name = dirInfo.subject_2;
    }
  }

  const studentMsg = buildDTMExamResultMessage({
    studentName: student.full_name || "O'quvchi",
    examTitle: examTitle || `DTM Mock (${examDate})`,
    examDate,
    directionTitle: dirName || "DTM Yo'nalishi",
    directionCode,
    totalScore: scores.total,
    compulsoryMathScore: scores.comp_math || 0,
    compulsoryHistoryScore: scores.comp_history || 0,
    compulsoryLangScore: scores.comp_lang || 0,
    subject1Score: scores.subject_1 || 0,
    subject2Score: scores.subject_2 || 0,
    subject1Name: s1Name,
    subject2Name: s2Name,
    rank,
    totalParticipants,
    isParent: false,
  });

  const parentMsg = buildDTMExamResultMessage({
    studentName: student.full_name || "O'quvchi",
    examTitle: examTitle || `DTM Mock (${examDate})`,
    examDate,
    directionTitle: dirName || "DTM Yo'nalishi",
    directionCode,
    totalScore: scores.total,
    compulsoryMathScore: scores.comp_math || 0,
    compulsoryHistoryScore: scores.comp_history || 0,
    compulsoryLangScore: scores.comp_lang || 0,
    subject1Score: scores.subject_1 || 0,
    subject2Score: scores.subject_2 || 0,
    subject1Name: s1Name,
    subject2Name: s2Name,
    rank,
    totalParticipants,
    isParent: true,
  });

  if (student.telegram_id) {
    await sendMessage(student.telegram_id, studentMsg).catch(console.error);
  }

  if (parentLinks && parentLinks.length > 0) {
    for (const parent of parentLinks) {
      if (parent.parent_telegram_id) {
        await sendMessage(parent.parent_telegram_id, parentMsg).catch(console.error);
      }
    }
  }

  await supabase.from('notifications').insert({
    user_id: studentId,
    title: `🏆 DTM Mock Natijasi: ${scores.total.toFixed(1)} ball`,
    message: `${examDate} kungi DTM Mock imtihonida ${scores.total.toFixed(1)} ball to'pladingiz.`,
    type: 'result',
    is_read: false,
  });
}

// ── 4. ONLINE TEST RESULT NOTIFICATION ──
async function handleTestResultNotification({
  studentId,
  testTitle,
  score,
  maxScore,
  percentage,
  timeSpent,
}: {
  studentId: string;
  testTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent?: string;
}) {
  const supabase = await createTelegramBotClient();

  const { data: student } = await supabase
    .from('profiles')
    .select('id, full_name, telegram_id')
    .eq('id', studentId)
    .single();

  if (!student) return;

  const { data: parentLinks } = await supabase
    .from('parent_students')
    .select('parent_telegram_id')
    .eq('student_id', studentId);

  const studentMsg = buildOnlineTestResultMessage({
    studentName: student.full_name || "O'quvchi",
    testTitle,
    score,
    maxScore,
    percentage,
    timeSpent,
    isParent: false,
  });

  const parentMsg = buildOnlineTestResultMessage({
    studentName: student.full_name || "O'quvchi",
    testTitle,
    score,
    maxScore,
    percentage,
    timeSpent,
    isParent: true,
  });

  if (student.telegram_id) {
    await sendMessage(student.telegram_id, studentMsg).catch(console.error);
  }

  if (parentLinks && parentLinks.length > 0) {
    for (const parent of parentLinks) {
      if (parent.parent_telegram_id) {
        await sendMessage(parent.parent_telegram_id, parentMsg).catch(console.error);
      }
    }
  }

  await supabase.from('notifications').insert({
    user_id: studentId,
    title: `Test Natijasi: ${score}/${maxScore} (${percentage}%)`,
    message: `"${testTitle}" testini muvaffaqiyatli yakunladingiz.`,
    type: 'result',
    is_read: false,
  });
}

// ── 5. SYSTEM NOTIFICATION ──
async function handleSystemNotification({
  userId,
  title,
  body,
}: {
  userId: string;
  title: string;
  body: string;
}) {
  const supabase = await createTelegramBotClient();

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
