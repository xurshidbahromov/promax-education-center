import { createClient, createTelegramBotClient } from '@/utils/supabase/server';
import { sendMessage } from './bot';
import {
  buildOpenAppKeyboard,
  buildNotificationMessage,
  buildNewResultNotification,
  buildTournamentKeyboard,
  buildTournamentRegistrationMessage,
  buildTournamentReminderMessage,
  buildTournamentLiveMessage,
} from './messages';

/**
 * Notifies a student when a new test is available
 */
export async function notifyNewTest(studentId: string, testTitle: string, points?: number) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_id, full_name')
    .eq('id', studentId)
    .single();

  if (!profile?.telegram_id) return false;

  const pointsText = points ? `\nUni yechib <b>${points} Coin</b> ishlashingiz mumkin!` : '';
  const text = buildNotificationMessage(
    'Yangi test qo\'shildi!',
    `<b>${testTitle}</b> nomli yangi test mavjud.${pointsText}\n\nHoziroq Mini App orqali yechishni boshlang:`
  );

  await sendMessage(profile.telegram_id, text, { reply_markup: buildOpenAppKeyboard() });
  return true;
}

/**
 * Notifies a student of their test result
 */
export async function notifyTestResult(studentId: string, testTitle: string, score: number, maxScore: number) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_id, full_name')
    .eq('id', studentId)
    .single();

  if (!profile?.telegram_id) return false;

  const text = buildNewResultNotification(profile.full_name || 'O\'quvchi', testTitle, score, maxScore);

  await sendMessage(profile.telegram_id, text, { reply_markup: buildOpenAppKeyboard() });
  return true;
}

/**
 * Notifies a teacher when a student submits a test
 */
export async function notifyTeacherTestSubmission(teacherId: string, studentName: string, testTitle: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('telegram_id')
    .eq('id', teacherId)
    .single();

  if (!profile?.telegram_id) return false;

  const text = buildNotificationMessage(
    'Yangi test topshirildi!',
    `O'quvchi <b>${studentName}</b> <b>${testTitle}</b> imtihonini yakunladi.\n\nBatafsil ma'lumotni Mini App orqali ko'ring:`
  );

  await sendMessage(profile.telegram_id, text, { reply_markup: buildOpenAppKeyboard() });
  return true;
}

/**
 * Notifies a student when they register for a tournament
 */
export async function notifyTournamentRegistration(
  studentId: string,
  tournament: {
    id: string;
    title: string;
    subject?: string;
    startDate?: string;
    startTime?: string;
    durationMinutes?: number;
    prizePool?: string;
    type?: string;
  }
) {
  try {
    const supabase = await createTelegramBotClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_id, full_name')
      .eq('id', studentId)
      .single();

    if (!profile?.telegram_id) return false;

    const isIntl = tournament.type === 'international' || tournament.id.startsWith('intl_');
    const text = buildTournamentRegistrationMessage({
      studentName: profile.full_name || "O'quvchi",
      tournamentTitle: tournament.title,
      subject: tournament.subject,
      startDate: tournament.startDate,
      startTime: tournament.startTime,
      durationMinutes: tournament.durationMinutes,
      prizePool: tournament.prizePool,
    });

    await sendMessage(profile.telegram_id, text, {
      reply_markup: buildTournamentKeyboard(isIntl),
    });
    return true;
  } catch (err) {
    console.error('[notifyTournamentRegistration] Error:', err);
    return false;
  }
}

/**
 * Sends 10-min countdown reminder or Live alert to all registered students of a tournament
 */
export async function sendBulkTournamentReminders(
  tournamentId: string,
  mode: '10min' | '15min' | 'live' = '10min'
): Promise<{
  success: boolean;
  totalRegistered: number;
  sentCount: number;
  skippedNoTelegram: number;
  error?: string;
}> {
  try {
    const supabase = await createTelegramBotClient();

    // 1. Fetch tournament details
    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tErr || !tournament) {
      return { success: false, totalRegistered: 0, sentCount: 0, skippedNoTelegram: 0, error: 'Tournament not found' };
    }

    // 2. Fetch all registered students for this tournament
    const { data: registrations, error: rErr } = await supabase
      .from('tournament_registrations')
      .select('student_id')
      .eq('tournament_id', tournamentId);

    if (rErr || !registrations || registrations.length === 0) {
      return { success: true, totalRegistered: 0, sentCount: 0, skippedNoTelegram: 0 };
    }

    const studentIds = Array.from(new Set(registrations.map(r => r.student_id).filter(Boolean)));
    const totalRegistered = studentIds.length;

    // 3. Fetch profiles of these students
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, telegram_id')
      .in('id', studentIds);

    if (pErr || !profiles) {
      return { success: false, totalRegistered, sentCount: 0, skippedNoTelegram: 0, error: pErr?.message };
    }

    const isIntl = tournament.type === 'international' || tournament.id.startsWith('intl_');
    const keyboard = buildTournamentKeyboard(isIntl);

    let sentCount = 0;
    let skippedNoTelegram = 0;

    // 4. Send messages with small delays to respect Telegram rate limits
    for (const p of profiles) {
      if (!p.telegram_id) {
        skippedNoTelegram++;
        continue;
      }

      const studentName = p.full_name || "O'quvchi";
      const text = mode === 'live'
        ? buildTournamentLiveMessage({
            studentName,
            tournamentTitle: tournament.title,
            durationMinutes: Number(tournament.duration_minutes) || 60,
          })
        : buildTournamentReminderMessage({
            studentName,
            tournamentTitle: tournament.title,
            minutesLeft: mode === '15min' ? 15 : 10,
            startTime: tournament.start_time || '15:00',
            durationMinutes: Number(tournament.duration_minutes) || 60,
          });

      try {
        await sendMessage(p.telegram_id, text, { reply_markup: keyboard });
        sentCount++;
        await new Promise(res => setTimeout(res, 50));
      } catch (sendErr) {
        console.error(`[Telegram Reminder] Failed sending to ${p.telegram_id}:`, sendErr);
      }
    }

    return {
      success: true,
      totalRegistered,
      sentCount,
      skippedNoTelegram,
    };
  } catch (err: any) {
    console.error('[sendBulkTournamentReminders] Error:', err);
    return {
      success: false,
      totalRegistered: 0,
      sentCount: 0,
      skippedNoTelegram: 0,
      error: err.message,
    };
  }
}
