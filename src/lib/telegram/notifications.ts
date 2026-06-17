import { createClient } from '@/utils/supabase/server';
import { sendMessage } from './bot';
import { buildOpenAppKeyboard, buildNotificationMessage, buildNewResultNotification } from './messages';

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
