import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBotClient } from '@/utils/supabase/server';
import { notifyTournamentRegistration, sendBulkTournamentReminders } from '@/lib/telegram/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tournamentId, mode = '15min', studentId } = body;

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

    // 2. Bulk reminder (15min or live)
    const result = await sendBulkTournamentReminders(tournamentId, mode as '15min' | 'live');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/tournaments/reminders] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createTelegramBotClient();

    // Find all upcoming tournaments
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'upcoming');

    if (error || !tournaments) {
      return NextResponse.json({ processed: 0, tournaments: [] });
    }

    const now = new Date();
    // Tashkent time is UTC+5
    const tashkentOffsetMs = 5 * 60 * 60 * 1000;
    const localNow = new Date(now.getTime() + tashkentOffsetMs);
    const todayStr = localNow.toISOString().split('T')[0];
    const currentHours = localNow.getUTCHours();
    const currentMinutes = localNow.getUTCMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    const processed: any[] = [];

    for (const t of tournaments) {
      if (!t.start_time) continue;
      // If tournament has start_date, check if it is today
      if (t.start_date && t.start_date !== todayStr) continue;

      const [hStr, mStr] = t.start_time.split(':');
      const startH = parseInt(hStr, 10) || 0;
      const startM = parseInt(mStr, 10) || 0;
      const tournamentStartMinutes = startH * 60 + startM;

      // Check if tournament starts within 10 to 20 minutes (approx 15 min reminder window)
      const diff = tournamentStartMinutes - currentTotalMinutes;
      if (diff >= 0 && diff <= 20) {
        const res = await sendBulkTournamentReminders(t.id, '15min');
        processed.push({ id: t.id, title: t.title, diffMinutes: diff, ...res });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: processed.length,
      tournaments: processed,
    });
  } catch (error: any) {
    console.error('[API /api/tournaments/reminders GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
