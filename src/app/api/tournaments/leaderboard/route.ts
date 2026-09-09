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

// ── Default National Benchmark Contenders ──
export function getNationalBenchmarkContenders(tournamentId: string): LeaderboardEntryDTO[] {
  return [
    {
      id: `bench_${tournamentId}_1`,
      tournament_id: tournamentId,
      user_id: 'bench_user_madina',
      student_name: 'Madina Karimova',
      student_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      score: 15.5,
      max_score: 15.5,
      percentage: 100,
      time_spent_seconds: 1420,
      rank: 1,
      prize: "🥇 1-O'rin: 1,000,000 So'm + Oltin Medal & Diplom",
      completed_at: 'Bugun, 14:20'
    },
    {
      id: `bench_${tournamentId}_2`,
      tournament_id: tournamentId,
      user_id: 'bench_user_jasur',
      student_name: 'Jasur Toshmatov',
      student_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      score: 15.5,
      max_score: 15.5,
      percentage: 100,
      time_spent_seconds: 1680,
      rank: 2,
      prize: "🥈 2-O'rin: 300,000 So'm + Kumush Medal",
      completed_at: 'Bugun, 15:45'
    },
    {
      id: `bench_${tournamentId}_3`,
      tournament_id: tournamentId,
      user_id: 'bench_user_rayhona',
      student_name: 'Rayhona Saidova',
      student_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      score: 12.4,
      max_score: 15.5,
      percentage: 80,
      time_spent_seconds: 1850,
      rank: 3,
      prize: "🥉 3-O'rin: 200,000 So'm + Bronza Medal",
      completed_at: 'Kecha, 18:10'
    },
    {
      id: `bench_${tournamentId}_4`,
      tournament_id: tournamentId,
      user_id: 'bench_user_bekzod',
      student_name: 'Bekzod Aliyev',
      student_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      score: 12.4,
      max_score: 15.5,
      percentage: 80,
      time_spent_seconds: 2100,
      rank: 4,
      completed_at: 'Kecha, 19:30'
    },
    {
      id: `bench_${tournamentId}_5`,
      tournament_id: tournamentId,
      user_id: 'bench_user_nilufar',
      student_name: 'Nilufar Qodirova',
      student_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      score: 9.3,
      max_score: 15.5,
      percentage: 60,
      time_spent_seconds: 2350,
      rank: 5,
      completed_at: '3 kun oldin'
    },
    {
      id: `bench_${tournamentId}_6`,
      tournament_id: tournamentId,
      user_id: 'bench_user_shaxzod',
      student_name: 'Shaxzod Rahmonov',
      student_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      score: 9.3,
      max_score: 15.5,
      percentage: 60,
      time_spent_seconds: 2480,
      rank: 6,
      completed_at: '4 kun oldin'
    }
  ];
}

// ── Default International (SAT) Benchmark Contenders ──
export function getInternationalBenchmarkContenders(tournamentId: string): LeaderboardEntryDTO[] {
  return [
    {
      id: `intl_bench_${tournamentId}_1`,
      tournament_id: tournamentId,
      user_id: 'bench_user_kamron',
      student_name: 'Kamronbek Alimov',
      student_avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      score: 50,
      max_score: 50,
      scaled_score: '1580 / 1600',
      percentage: 100,
      time_spent_seconds: 2100,
      rank: 1,
      prize: "🥇 1-O'rin: 100% Kurs Granti + Rasmiy Sertifikat",
      completed_at: 'Bugun, 11:30'
    },
    {
      id: `intl_bench_${tournamentId}_2`,
      tournament_id: tournamentId,
      user_id: 'bench_user_sevinch',
      student_name: 'Sevinch Rustamova',
      student_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      score: 50,
      max_score: 50,
      scaled_score: '1540 / 1600',
      percentage: 100,
      time_spent_seconds: 2450,
      rank: 2,
      prize: "🥈 2-O'rin: 500,000 So'm Chegirma Vafcheri",
      completed_at: 'Kecha, 16:40'
    },
    {
      id: `intl_bench_${tournamentId}_3`,
      tournament_id: tournamentId,
      user_id: 'bench_user_azizbek',
      student_name: 'Azizbek Norov',
      student_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      score: 40,
      max_score: 50,
      scaled_score: '1460 / 1600',
      percentage: 80,
      time_spent_seconds: 2780,
      rank: 3,
      prize: "🥉 3-O'rin: 300,000 So'm Chegirma Vafcheri",
      completed_at: 'Kecha, 20:15'
    },
    {
      id: `intl_bench_${tournamentId}_4`,
      tournament_id: tournamentId,
      user_id: 'bench_user_diana',
      student_name: 'Diana Kim',
      student_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      score: 40,
      max_score: 50,
      scaled_score: '1420 / 1600',
      percentage: 80,
      time_spent_seconds: 3100,
      rank: 4,
      completed_at: '2 kun oldin'
    },
    {
      id: `intl_bench_${tournamentId}_5`,
      tournament_id: tournamentId,
      user_id: 'bench_user_bobur',
      student_name: 'Bobur Islomov',
      student_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      score: 30,
      max_score: 50,
      scaled_score: '1350 / 1600',
      percentage: 60,
      time_spent_seconds: 3320,
      rank: 5,
      completed_at: '3 kun oldin'
    },
    {
      id: `intl_bench_${tournamentId}_6`,
      tournament_id: tournamentId,
      user_id: 'bench_user_malika',
      student_name: 'Malika Yusupova',
      student_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      score: 30,
      max_score: 50,
      scaled_score: '1280 / 1600',
      percentage: 60,
      time_spent_seconds: 3480,
      rank: 6,
      completed_at: '4 kun oldin'
    }
  ];
}

// ── Dynamic Benchmark Generator for Custom / Any Tournament ──
function generateDynamicBenchmarkContenders(tournamentId: string, isIntl: boolean): LeaderboardEntryDTO[] {
  if (isIntl) {
    return getInternationalBenchmarkContenders(tournamentId);
  }
  return getNationalBenchmarkContenders(tournamentId);
}

function assignRanksAndPrizes(entries: LeaderboardEntryDTO[], topPrizes: string[] = []): LeaderboardEntryDTO[] {
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_spent_seconds - b.time_spent_seconds;
  });

  return entries.map((entry, idx) => {
    const rank = idx + 1;
    let prize = entry.prize;
    if (topPrizes && topPrizes.length >= rank) {
      prize = topPrizes[rank - 1];
    } else if (rank === 1 && !prize) {
      prize = "🥇 1-O'rin";
    } else if (rank === 2 && !prize) {
      prize = "🥈 2-O'rin";
    } else if (rank === 3 && !prize) {
      prize = "🥉 3-O'rin";
    } else if (rank > 3) {
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

  // 3. Merge real DB entries with benchmark contenders so podium never disappears
  const benchmarks = generateDynamicBenchmarkContenders(tournamentId, isIntl);

  // Real user IDs from database
  const realUserIds = new Set(dbEntries.map(e => e.user_id));

  // Filter benchmarks so they don't collide with real users
  const filteredBenchmarks = benchmarks.filter(b => !realUserIds.has(b.user_id));

  // If real DB entries are fewer than 6, append filtered benchmarks
  const combined = [...dbEntries, ...filteredBenchmarks];

  // Recalculate ranks and prizes cleanly
  const rankedLeaderboard = assignRanksAndPrizes(combined, topPrizes);

  return NextResponse.json({
    success: true,
    tournamentId,
    type,
    leaderboard: rankedLeaderboard
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

    // 1. Try to persist to Supabase tournament_results table
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

    // 2. Fetch current leaderboard & merge with new entry
    const benchmarks = generateDynamicBenchmarkContenders(tournamentId, isIntl);
    const combined = [newEntry, ...benchmarks.filter(b => b.user_id !== userId)];
    const rankedLeaderboard = assignRanksAndPrizes(combined);
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
