import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBotClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface LeaderboardEntryDTO {
  id: string;
  tournament_id: string;
  user_id: string;
  student_name: string;
  student_avatar: string;
  score: number;
  max_score: number;
  scaled_score?: string;
  percentage: number;
  time_spent_seconds: number;
  rank: number;
  completed_at: string;
  prize?: string;
}

function assignRanksAndPrizes(entries: LeaderboardEntryDTO[], topPrizes: string[] = []): LeaderboardEntryDTO[] {
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_spent_seconds - b.time_spent_seconds;
  });

  return entries.map((entry, idx) => {
    const rank = idx + 1;
    let prize: string | undefined = undefined;
    if (topPrizes && topPrizes.length >= rank && topPrizes[rank - 1]) {
      prize = topPrizes[rank - 1];
    } else if (rank === 1) {
      prize = "1-O'rin";
    } else if (rank === 2) {
      prize = "2-O'rin";
    } else if (rank === 3) {
      prize = "3-O'rin";
    } else {
      prize = undefined;
    }
    return {
      ...entry,
      rank,
      prize
    };
  });
}

// ── GET: Fetch Leaderboard ──
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tournamentId = searchParams.get('tournamentId') || 'tourn_grand_respublika_2026';
  const type = searchParams.get('type') || (tournamentId.startsWith('intl_') ? 'international' : 'national');
  const isIntl = type === 'international' || tournamentId.startsWith('intl_');

  let dbEntries: LeaderboardEntryDTO[] = [];
  let topPrizes: string[] = [];

  try {
    let supabase: any;
    try {
      supabase = await createTelegramBotClient();
    } catch {
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }

    // 1. Fetch tournament prizes & info if exists
    try {
      const { data: tourn } = await supabase
        .from('tournaments')
        .select('top_prizes')
        .eq('id', tournamentId)
        .maybeSingle();

      if (tourn && Array.isArray(tourn.top_prizes) && tourn.top_prizes.length > 0) {
        topPrizes = tourn.top_prizes;
      }
    } catch {}

    // 2. Fetch results from database
    const { data, error } = await supabase
      .from('tournament_results')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('score', { ascending: false })
      .order('time_spent_seconds', { ascending: true });

    if (!error && data && data.length > 0) {
      const studentIds = Array.from(new Set(data.map((d: any) => d.student_id).filter(Boolean)));
      let profilesMap: Record<string, { full_name: string; avatar_url: string }> = {};

      if (studentIds.length > 0) {
        try {
          const { data: profs } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', studentIds);

          if (profs) {
            profs.forEach((p: any) => {
              profilesMap[p.id] = {
                full_name: p.full_name,
                avatar_url: p.avatar_url
              };
            });
          }
        } catch {}
      }

      dbEntries = data.map((d: any) => {
        const prof = profilesMap[d.student_id];
        return {
          id: d.id,
          tournament_id: tournamentId,
          user_id: d.student_id,
          student_name: prof?.full_name || d.student_name || "O'quvchi",
          student_avatar: prof?.avatar_url || d.student_avatar || '',
          score: Number(d.score),
          max_score: Number(d.max_score),
          scaled_score: d.scaled_score,
          percentage: Number(d.percentage) || Math.round((Number(d.score) / (Number(d.max_score) || 1)) * 100),
          time_spent_seconds: Number(d.time_spent_seconds) || 0,
          rank: Number(d.rank) || 1,
          prize: d.prize || undefined,
          completed_at: d.completed_at
            ? new Date(d.completed_at).toLocaleString('uz-UZ', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'Yaqinda'
        };
      });
    }
  } catch (apiErr) {
    console.warn('[Leaderboard API] Supabase fetch skipped or errored:', apiErr);
  }

  // 3. Return only real DB submissions (strictly 0 fake benchmarks)
  const finalEntries = assignRanksAndPrizes(dbEntries, topPrizes);

  return NextResponse.json({
    success: true,
    tournamentId,
    type,
    leaderboard: finalEntries
  });
}

// ── POST: Submit Attempt & Recalculate Leaderboard ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tournamentId,
      userId,
      studentName,
      studentAvatar,
      score,
      maxScore,
      percentage,
      timeSpentSeconds,
      scaledScore,
      answers,
      type
    } = body;

    if (!tournamentId || !userId) {
      return NextResponse.json({ error: 'Missing tournamentId or userId' }, { status: 400 });
    }

    const isIntl = type === 'international' || tournamentId.startsWith('intl_');
    const attemptId = `sub_${tournamentId}_${userId}_${Date.now()}`;
    const completedAtIso = new Date().toISOString();

    const newEntry: LeaderboardEntryDTO = {
      id: attemptId,
      tournament_id: tournamentId,
      user_id: userId,
      student_name: studentName || "O'quvchi",
      student_avatar: studentAvatar || '',
      score: Number(score),
      max_score: Number(maxScore),
      scaled_score: scaledScore,
      percentage: Number(percentage) || Math.round((Number(score) / (Number(maxScore) || 1)) * 100),
      time_spent_seconds: Number(timeSpentSeconds) || 0,
      rank: 1,
      completed_at: 'Hozirginagina'
    };

    let supabase: any = null;
    try {
      try {
        supabase = await createTelegramBotClient();
      } catch {
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
      }

      // Check if userId is a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

      if (isUuid) {
        await supabase.from('tournament_results').upsert(
          {
            id: attemptId,
            tournament_id: tournamentId,
            student_id: userId,
            score: newEntry.score,
            max_score: newEntry.max_score,
            scaled_score: newEntry.scaled_score || null,
            percentage: newEntry.percentage,
            time_spent_seconds: newEntry.time_spent_seconds,
            answers: answers || {},
            completed_at: completedAtIso
          },
          { onConflict: 'id' }
        );
      }
    } catch (dbErr) {
      console.warn('[Leaderboard API] DB save skipped or errored:', dbErr);
    }

    // 2. Fetch existing real DB entries & merge with new entry (NO fake benchmarks)
    let dbEntries: LeaderboardEntryDTO[] = [];
    let topPrizes: string[] = [];
    try {
      if (supabase) {
        const { data: tourn } = await supabase
          .from('tournaments')
          .select('top_prizes')
          .eq('id', tournamentId)
          .maybeSingle();
        if (tourn && Array.isArray(tourn.top_prizes) && tourn.top_prizes.length > 0) {
          topPrizes = tourn.top_prizes;
        }

        const { data: existingData } = await supabase
          .from('tournament_results')
          .select('*')
          .eq('tournament_id', tournamentId)
          .order('score', { ascending: false })
          .order('time_spent_seconds', { ascending: true });

        if (existingData && existingData.length > 0) {
          const studentIds = Array.from(new Set(existingData.map((d: any) => d.student_id).filter(Boolean)));
          let profilesMap: Record<string, { full_name: string; avatar_url: string }> = {};
          if (studentIds.length > 0) {
            try {
              const { data: profs } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', studentIds);
              if (profs) {
                profs.forEach((p: any) => {
                  profilesMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
                });
              }
            } catch {}
          }
          dbEntries = existingData.map((d: any) => {
            const prof = profilesMap[d.student_id];
            return {
              id: d.id,
              tournament_id: tournamentId,
              user_id: d.student_id,
              student_name: prof?.full_name || d.student_name || "O'quvchi",
              student_avatar: prof?.avatar_url || d.student_avatar || '',
              score: Number(d.score),
              max_score: Number(d.max_score),
              scaled_score: d.scaled_score,
              percentage: Number(d.percentage) || Math.round((Number(d.score) / (Number(d.max_score) || 1)) * 100),
              time_spent_seconds: Number(d.time_spent_seconds) || 0,
              rank: 1,
              completed_at: d.completed_at
                ? new Date(d.completed_at).toLocaleString('uz-UZ', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Yaqinda'
            };
          });
        }
      }
    } catch (fetchErr) {
      console.warn('[Leaderboard API] DB re-fetch skipped or errored:', fetchErr);
    }

    const cleanExisting = dbEntries.filter(
      e => !e.id?.startsWith('bench_') && !e.id?.startsWith('intl_bench_') && !e.user_id?.startsWith('bench_') && e.user_id !== userId
    );
    const combined = [newEntry, ...cleanExisting];
    const rankedLeaderboard = assignRanksAndPrizes(combined, topPrizes);
    const myResult = rankedLeaderboard.find(e => e.user_id === userId) || newEntry;

    return NextResponse.json({
      success: true,
      result: myResult,
      leaderboard: rankedLeaderboard
    });
  } catch (err: any) {
    console.error('[Leaderboard API] POST error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
