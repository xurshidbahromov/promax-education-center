import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBotClient } from '@/utils/supabase/server';
import { notifyTournamentRegistration, sendBulkTournamentReminders } from '@/lib/telegram/notifications';
import { checkAndSendDueReminders, ensureReminderWorkerRunning } from '@/lib/telegram/reminder-worker';
import { recordReminderSent } from '@/lib/telegram/reminder-tracker';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    ensureReminderWorkerRunning();

    const body = await request.json();
    const { tournamentId, mode = '10min', studentId } = body;

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId is required' }, { status: 400 });
    }

    const supabase = await createTelegramBotClient();

    // 1. Single student registration notification
    if (mode === 'registration') {
      if (!studentId) {
        return NextResponse.json({ error: 'studentId required for registration mode' }, { status: 400 });
      }

      const { data: tournament, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error || !tournament) {
        return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
      }

      const sent = await notifyTournamentRegistration(studentId, {
        id: tournament.id,
        title: tournament.title,
        subject: tournament.subject,
        startDate: tournament.start_date,
        startTime: tournament.start_time,
        durationMinutes: Number(tournament.duration_minutes) || 60,
        prizePool: tournament.prize_pool,
        type: tournament.type,
      });

      return NextResponse.json({ success: true, sent });
    }

    // 2. Bulk reminder ('10min', '15min' or 'live')
    const normalizedMode = mode === 'live' ? 'live' : '10min';
    recordReminderSent(tournamentId, normalizedMode);

    const result = await sendBulkTournamentReminders(tournamentId, normalizedMode);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/tournaments/reminders POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    ensureReminderWorkerRunning();

    const result = await checkAndSendDueReminders();

    return NextResponse.json({
      success: true,
      serverTimeTashkent: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error('[API /api/tournaments/reminders GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
