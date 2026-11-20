import { NextRequest, NextResponse } from 'next/server';
import { createClient, createTelegramBotClient } from '@/utils/supabase/server';
import { sendMessage, escapeTelegramHtml } from '@/lib/telegram/bot';
import {
  buildWeeklyParentDigestMessage,
  buildParentReplyKeyboard,
} from '@/lib/telegram/messages';

export const dynamic = 'force-dynamic';

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function formatShortDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}`;
}

async function authorizeRequest(request: NextRequest): Promise<boolean> {
  // 1. Check Cron / Internal secret headers
  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const cronSecret = request.headers.get('x-cron-secret') || request.headers.get('x-internal-secret') || bearerToken;

  const validSecrets = [
    process.env.CRON_SECRET,
    process.env.INTERNAL_NOTIFY_SECRET,
    process.env.TELEGRAM_WEBHOOK_SECRET,
    process.env.TELEGRAM_BOT_TOKEN,
  ].filter(Boolean);

  if (cronSecret && validSecrets.includes(cronSecret)) {
    return true;
  }

  // 2. Check authenticated Admin / Staff session
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return Boolean(profile && ['admin', 'staff', 'superadmin'].includes(profile.role));
  } catch {
    return false;
  }
}

async function runWeeklyDigest(options: { studentId?: string; dryRun?: boolean }) {
  const botClient = await createTelegramBotClient();

  // 1. Fetch parent-student links
  let linksQuery = botClient
    .from('parent_students')
    .select('parent_telegram_id, parent_name, student_id')
    .not('parent_telegram_id', 'is', null);

  if (options.studentId) {
    linksQuery = linksQuery.eq('student_id', options.studentId);
  }

  const { data: links, error: linksError } = await linksQuery;
  if (linksError) {
    throw new Error(linksError.message);
  }

  if (!links || links.length === 0) {
    return {
      success: true,
      dryRun: !!options.dryRun,
      totalLinks: 0,
      uniqueParents: 0,
      sentCount: 0,
      failedCount: 0,
      sampleMessage: null,
      message: "Telegramga ulangan ota-onalar topilmadi",
    };
  }

  const studentIds = Array.from(new Set(links.map((l: any) => l.student_id).filter(Boolean)));
  const uniqueParents = new Set(links.map((l: any) => String(l.parent_telegram_id))).size;

  // Compute 7-day window & current month in Tashkent time
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString();
  const sevenDaysAgoDate = sevenDaysAgoIso.slice(0, 10);

  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthLabel = `${UZ_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const weekRangeLabel = `${formatShortDate(sevenDaysAgo)} – ${formatShortDate(now)}.${now.getFullYear()}`;

  // 2. Fetch all metrics in parallel (zero N+1 queries)
  const [profilesRes, attendanceRes, attemptsRes, resultsRes, paymentsRes] = await Promise.all([
    botClient
      .from('profiles')
      .select('id, full_name, coins')
      .in('id', studentIds),
    botClient
      .from('attendance')
      .select('student_id, status, date')
      .in('student_id', studentIds)
      .gte('date', sevenDaysAgoDate),
    botClient
      .from('test_attempts')
      .select('student_id, score, max_score, percentage, completed_at')
      .in('student_id', studentIds)
      .eq('status', 'completed')
      .gte('completed_at', sevenDaysAgoIso),
    botClient
      .from('results')
      .select('student_id, total_score, created_at')
      .in('student_id', studentIds)
      .gte('created_at', sevenDaysAgoIso),
    botClient
      .from('payments')
      .select('student_id, amount, status, month_year')
      .in('student_id', studentIds)
      .eq('month_year', currentMonthKey),
  ]);

  // Build fast lookup maps per studentId
  const profileMap = new Map<string, any>();
  (profilesRes.data || []).forEach((p: any) => profileMap.set(p.id, p));

  const attendanceMap = new Map<string, { present: number; late: number; absent: number }>();
  (attendanceRes.data || []).forEach((a: any) => {
    const cur = attendanceMap.get(a.student_id) || { present: 0, late: 0, absent: 0 };
    if (a.status === 'present') cur.present += 1;
    else if (a.status === 'late') cur.late += 1;
    else if (a.status === 'absent') cur.absent += 1;
    attendanceMap.set(a.student_id, cur);
  });

  const testScoresMap = new Map<string, number[]>();
  (attemptsRes.data || []).forEach((t: any) => {
    const pct =
      typeof t.percentage === 'number'
        ? t.percentage
        : t.max_score > 0
        ? (Number(t.score || 0) / Number(t.max_score)) * 100
        : 0;
    const arr = testScoresMap.get(t.student_id) || [];
    arr.push(Math.round(pct));
    testScoresMap.set(t.student_id, arr);
  });

  (resultsRes.data || []).forEach((r: any) => {
    const pct = Math.min(100, Math.round((Number(r.total_score || 0) / 189) * 100));
    const arr = testScoresMap.get(r.student_id) || [];
    arr.push(pct);
    testScoresMap.set(r.student_id, arr);
  });

  const paymentMap = new Map<string, { status: 'paid' | 'partial' | 'unpaid'; amount: number }>();
  (paymentsRes.data || []).forEach((p: any) => {
    const cur = paymentMap.get(p.student_id) || { status: 'unpaid', amount: 0 };
    cur.amount += Number(p.amount || 0);
    if (p.status === 'completed') cur.status = 'paid';
    else if (cur.amount > 0 && cur.status !== 'paid') cur.status = 'partial';
    paymentMap.set(p.student_id, cur);
  });

  // Build messages for each link
  const preparedMessages: { chatId: number; text: string }[] = [];

  for (const link of links) {
    const profile = profileMap.get(link.student_id);
    const studentName = escapeTelegramHtml(profile?.full_name || "O'quvchi");
    const parentName = link.parent_name ? escapeTelegramHtml(link.parent_name) : undefined;
    const att = attendanceMap.get(link.student_id) || { present: 0, late: 0, absent: 0 };
    const scores = testScoresMap.get(link.student_id) || [];
    const avgPct = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestPct = scores.length > 0 ? Math.max(...scores) : 0;
    const pay = paymentMap.get(link.student_id) || { status: 'unpaid' as const, amount: 0 };

    const msgText = buildWeeklyParentDigestMessage({
      parentName,
      studentName,
      weekRangeLabel,
      attendance: att,
      tests: {
        count: scores.length,
        averagePercent: avgPct,
        bestPercent: bestPct,
      },
      paymentStatus: pay.status,
      paidAmountUzs: pay.amount,
      currentMonthLabel,
      coins: Number(profile?.coins || 0),
    });

    preparedMessages.push({
      chatId: Number(link.parent_telegram_id),
      text: msgText,
    });
  }

  // Dry run: return preview without sending
  if (options.dryRun) {
    return {
      success: true,
      dryRun: true,
      totalLinks: links.length,
      uniqueParents,
      sentCount: 0,
      failedCount: 0,
      sampleMessage: preparedMessages[0]?.text || null,
    };
  }

  // Send with gentle rate-limit pacing (25 msg/sec max)
  let sentCount = 0;
  let failedCount = 0;

  for (const item of preparedMessages) {
    try {
      const res = await sendMessage(item.chatId, item.text, {
        reply_markup: buildParentReplyKeyboard(),
      });
      if (res?.ok) {
        sentCount++;
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
    await new Promise((r) => setTimeout(r, 40));
  }

  return {
    success: true,
    dryRun: false,
    totalLinks: links.length,
    uniqueParents,
    sentCount,
    failedCount,
  };
}

export async function POST(request: NextRequest) {
  try {
    const authorized = await authorizeRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: "Ruxsat berilmagan (Faqat adminlar uchun)" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const result = await runWeeklyDigest({
      studentId: body?.studentId,
      dryRun: Boolean(body?.dryRun),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/telegram/weekly-digest POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Server xatosi' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authorized = await authorizeRequest(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runWeeklyDigest({ dryRun: false });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/telegram/weekly-digest GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Server xatosi' }, { status: 500 });
  }
}
