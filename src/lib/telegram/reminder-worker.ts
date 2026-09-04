import { createTelegramBotClient } from '@/utils/supabase/server';
import { sendBulkTournamentReminders } from './notifications';
import { hasReminderBeenSent, recordReminderSent } from './reminder-tracker';

export async function checkAndSendDueReminders() {
  try {
    const supabase = await createTelegramBotClient();

    // Find all active/upcoming tournaments
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .neq('status', 'finished');

    if (error || !tournaments) {
      return { processedCount: 0, sentTournaments: [] };
    }

    const now = new Date();
    const sentTournaments: any[] = [];

    for (const t of tournaments) {
      if (!t.start_time) continue;

      // Determine target start time in Tashkent timezone (UTC+5)
      let year: number, month: number, day: number;
      if (t.start_date && t.start_date.includes('-')) {
        const parts = t.start_date.split('-').map(Number);
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        const tashkentDate = new Date(now.getTime() + 5 * 3600 * 1000);
        year = tashkentDate.getUTCFullYear();
        month = tashkentDate.getUTCMonth() + 1;
        day = tashkentDate.getUTCDate();
      }

      const [hours, minutes] = t.start_time.split(':').map((v: string) => parseInt(v, 10) || 0);

      // In Tashkent (UTC+5), target UTC epoch is:
      const targetUtcMs = Date.UTC(year, month - 1, day, hours - 5, minutes, 0);
      const diffMinutes = (targetUtcMs - now.getTime()) / 60000;

      // Check if tournament starts within 10 minutes:
      // Window: between 10 minutes before and up to 5 minutes after start
      const isDue = diffMinutes <= 10 && diffMinutes >= -5;

      if (isDue && !hasReminderBeenSent(t.id, '10min')) {
        console.log(`[ReminderWorker] Tournament ${t.id} ("${t.title}") is due for 10-min reminder (diff: ${diffMinutes.toFixed(1)}m)! Sending...`);
        
        // Record immediately to prevent race conditions
        recordReminderSent(t.id, '10min');

        const res = await sendBulkTournamentReminders(t.id, '10min');
        sentTournaments.push({
          id: t.id,
          title: t.title,
          diffMinutes,
          ...res
        });
      }
    }

    return {
      processedCount: tournaments.length,
      sentTournaments
    };
  } catch (err) {
    console.error('[ReminderWorker] checkAndSendDueReminders error:', err);
    return { processedCount: 0, sentTournaments: [] };
  }
}

let isWorkerRunning = false;

export function ensureReminderWorkerRunning() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  console.log('[ReminderWorker] Background worker initialized (30s interval)');

  // Run immediately once
  checkAndSendDueReminders().catch(err => console.error('[ReminderWorker] Initial run error:', err));

  // Run every 30 seconds
  setInterval(() => {
    checkAndSendDueReminders().catch(err => console.error('[ReminderWorker] Interval error:', err));
  }, 30 * 1000);
}
