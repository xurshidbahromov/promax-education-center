import { createClient } from '@/utils/supabase/client';

export interface TournamentQuestion {
  id: string;
  question_text: string;
  question_type?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  points: number;
  image_url?: string | null;
}

export interface AdminTournament {
  id: string;
  title: string;
  subject: string;
  description: string;
  status: 'live' | 'upcoming' | 'finished';
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  durationMinutes: number;
  totalQuestions: number;
  entryCoins: number;
  prizePool: string;
  topPrizes: string[];
  rules: string[];
  participantsCount: number;
  questions?: TournamentQuestion[];
  isPublished?: boolean;
  created_at?: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  student_name: string;
  student_avatar?: string;
  registered_at: string;
  status: 'registered' | 'in_progress' | 'completed';
  score?: number;
  max_score?: number;
  percentage?: number;
  time_spent_seconds?: number;
  completed_at?: string;
}

export interface TournamentLeaderboardEntry {
  id: string;
  tournament_id: string;
  user_id: string;
  student_name: string;
  student_avatar: string;
  score: number;
  max_score: number;
  percentage: number;
  time_spent_seconds: number;
  rank: number;
  completed_at: string;
  prize?: string;
}

export interface AdminTournamentComment {
  id: string;
  tournament_id?: string;
  author: string;
  avatar: string;
  role: string;
  time: string;
  text: string;
  likes: number;
  created_at?: string;
}

// ── GET CACHED TOURNAMENTS (Instant Synchronous) ──
export function getCachedAdminTournaments(): AdminTournament[] {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('promax_tournaments_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }
  return [];
}

// ── GET TOURNAMENTS (Live Network-First) ──
export async function getAdminTournaments(): Promise<AdminTournament[]> {
  // 1. Fetch from API first (Live cross-device source of truth)
  try {
    const res = await fetch(`/api/tournaments?type=national&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tournaments) && data.tournaments.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('promax_tournaments_v3', JSON.stringify(data.tournaments));
        }
        return data.tournaments;
      }
    }
  } catch (apiErr) {
    console.warn('Live tournaments fetch failed, fallback to local storage:', apiErr);
  }

  // 2. Offline / LocalStorage fallback
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('promax_tournaments_v3');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  // 3. Database fallback if available
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('promax_tournaments_v3', JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {}

  return [];
}

// ── GET SINGLE TOURNAMENT ──
export async function getTournamentById(id: string): Promise<AdminTournament | null> {
  try {
    const res = await fetch(`/api/tournaments?type=national&id=${id}&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tournament) return data.tournament;
    }
  } catch (e) {}

  const tournaments = await getAdminTournaments();
  return tournaments.find((t) => t.id === id) || null;
}

// ── SAVE TOURNAMENT ──
export async function saveAdminTournament(
  tournament: Partial<AdminTournament>
): Promise<{ success: boolean; data?: any; error?: string }> {
  const id = tournament.id || `tourn_${Date.now()}`;
  const fullTournament: AdminTournament = {
    id,
    title: tournament.title || "Yangi Musobaqa",
    subject: tournament.subject || "Matematika",
    description: tournament.description || "",
    status: tournament.status || "upcoming",
    startDate: tournament.startDate || new Date().toISOString().split("T")[0],
    startTime: tournament.startTime || "12:00",
    endDate: tournament.endDate || new Date().toISOString().split("T")[0],
    endTime: tournament.endTime || "18:00",
    durationMinutes: tournament.durationMinutes || 60,
    totalQuestions: tournament.questions?.length || tournament.totalQuestions || 0,
    entryCoins: tournament.entryCoins || 0,
    prizePool: tournament.prizePool || "Diplom",
    topPrizes: tournament.topPrizes || [],
    rules: tournament.rules || [],
    participantsCount: tournament.participantsCount || 0,
    questions: tournament.questions || [],
    created_at: tournament.created_at || new Date().toISOString()
  };

  // 1. Sync to API (server-side persistence)
  try {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'national', tournament: fullTournament })
    });
    if (res.ok) {
      const resJson = await res.json();
      if (resJson.data) {
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('promax_tournaments_v3');
          let list: AdminTournament[] = [];
          try { if (local) list = JSON.parse(local); } catch (e) {}
          const existingIndex = list.findIndex(t => t.id === id);
          if (existingIndex >= 0) {
            list[existingIndex] = resJson.data;
          } else {
            list = [resJson.data, ...list];
          }
          localStorage.setItem('promax_tournaments_v3', JSON.stringify(list));
        }
        return { success: true, data: resJson.data };
      }
    }
  } catch (apiErr) {
    console.error('Save tournament API error:', apiErr);
  }

  // 2. Local fallback
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('promax_tournaments_v3');
    let list: AdminTournament[] = [];
    try { if (local) list = JSON.parse(local); } catch (e) {}
    const existingIndex = list.findIndex(t => t.id === id);
    if (existingIndex >= 0) {
      list[existingIndex] = fullTournament;
    } else {
      list = [fullTournament, ...list];
    }
    localStorage.setItem('promax_tournaments_v3', JSON.stringify(list));
  }

  return { success: true, data: fullTournament };
}

// ── DELETE TOURNAMENT ──
export async function deleteAdminTournament(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await fetch(`/api/tournaments?type=national&id=${id}`, { method: 'DELETE' });
  } catch (apiErr) {
    console.error('Delete tournament API error:', apiErr);
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('promax_tournaments_v3');
    if (local) {
      try {
        const list: AdminTournament[] = JSON.parse(local);
        localStorage.setItem('promax_tournaments_v3', JSON.stringify(list.filter(t => t.id !== id)));
      } catch (e) {}
    }
  }

  try {
    const supabase = createClient();
    await supabase.from('tournaments').delete().eq('id', id);
  } catch (err) {}

  return { success: true };
}

// ── DUPLICATE TOURNAMENT ──
export async function duplicateAdminTournament(id: string): Promise<AdminTournament | null> {
  const original = await getTournamentById(id);
  if (!original) return null;

  const duplicated: AdminTournament = {
    ...original,
    id: `tournament_${Date.now()}`,
    title: `${original.title} (Nusxa)`,
    status: 'upcoming',
    participantsCount: 0,
    created_at: new Date().toISOString()
  };

  await saveAdminTournament(duplicated);
  return duplicated;
}

// ── REGISTRATION MANAGEMENT ──
export async function registerForTournament(
  tournamentId: string,
  user: { id: string; name: string; avatar?: string }
): Promise<{ success: boolean; message?: string }> {
  // 1. Sync to local storage
  if (typeof window !== 'undefined') {
    try {
      const key = `tournament_registrations_${user.id || 'current'}`;
      const existing = localStorage.getItem(key);
      const list: string[] = existing ? JSON.parse(existing) : [];
      if (!list.includes(tournamentId)) {
        list.push(tournamentId);
        localStorage.setItem(key, JSON.stringify(list));
      }
    } catch (e) {}
  }

  // 2. Persist to Supabase tournament_registrations table
  if (user.id) {
    try {
      const supabase = createClient();
      await supabase
        .from('tournament_registrations')
        .upsert({
          id: `reg_${tournamentId}_${user.id}`,
          tournament_id: tournamentId,
          student_id: user.id,
          created_at: new Date().toISOString()
        }, { onConflict: 'tournament_id,student_id' });
    } catch (dbErr) {
      console.warn('[Tournaments] Registration DB insert skipped:', dbErr);
    }
  }

  // 3. Increment participant count
  try {
    const tournament = await getTournamentById(tournamentId);
    if (tournament) {
      await saveAdminTournament({
        ...tournament,
        participantsCount: (tournament.participantsCount || 0) + 1
      });
    }
  } catch (e) {}

  return { success: true, message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!" };
}

export function getTournamentRegistrations(userId?: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `tournament_registrations_${userId || 'current'}`;
    const existing = localStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  } catch (e) {
    return [];
  }
}

// ── LEADERBOARD & SUBMISSION ──
export async function getTournamentLeaderboard(tournamentId: string): Promise<TournamentLeaderboardEntry[]> {
  // 1. Query live Supabase database
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tournament_results')
      .select('*, profile:profiles(full_name, avatar_url)')
      .eq('tournament_id', tournamentId)
      .order('score', { ascending: false })
      .order('time_spent_seconds', { ascending: true });

    if (!error && data && data.length > 0) {
      const mapped = data.map((d: any, idx: number) => ({
        id: d.id,
        tournament_id: tournamentId,
        user_id: d.student_id,
        student_name: d.profile?.full_name || "O'quvchi",
        student_avatar: d.profile?.avatar_url || "",
        score: Number(d.score),
        max_score: Number(d.max_score),
        percentage: Number(d.percentage) || Math.round((Number(d.score) / (Number(d.max_score) || 1)) * 100),
        time_spent_seconds: Number(d.time_spent_seconds) || 0,
        rank: idx + 1,
        prize: d.prize || undefined,
        completed_at: d.completed_at ? new Date(d.completed_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Yaqinda"
      }));

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`promax_leaderboard_${tournamentId}`, JSON.stringify(mapped));
        } catch (e) {}
      }

      return mapped;
    }
  } catch (e) {}

  // 2. Offline / LocalStorage fallback
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(`promax_leaderboard_${tournamentId}`);
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {}
  }

  return [];
}

export async function submitTournamentAttempt(params: {
  tournamentId: string;
  userId: string;
  studentName: string;
  studentAvatar?: string;
  answers: Record<string, string>;
  timeSpentSeconds: number;
}): Promise<{ success: boolean; result: TournamentLeaderboardEntry }> {
  const tournament = await getTournamentById(params.tournamentId);
  const questions = tournament?.questions || [];

  let totalScore = 0;
  let maxScore = 0;

  questions.forEach((q) => {
    const pts = q.points || 3.1;
    maxScore += pts;
    if (params.answers[q.id] === q.correct_answer) {
      totalScore += pts;
    }
  });

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const currentLeaderboard = await getTournamentLeaderboard(params.tournamentId);

  const attemptId = `sub_${params.tournamentId}_${params.userId}_${Date.now()}`;
  const newEntry: TournamentLeaderboardEntry = {
    id: attemptId,
    tournament_id: params.tournamentId,
    user_id: params.userId,
    student_name: params.studentName || "O'quvchi",
    student_avatar: params.studentAvatar || "",
    score: Number(totalScore.toFixed(1)),
    max_score: Number(maxScore.toFixed(1)),
    percentage,
    time_spent_seconds: params.timeSpentSeconds,
    rank: 1,
    completed_at: "Hozirginagina"
  };

  const updatedList = [...currentLeaderboard.filter(e => e.user_id !== params.userId), newEntry];
  updatedList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_spent_seconds - b.time_spent_seconds;
  });

  const prizes = tournament?.topPrizes || [];
  updatedList.forEach((item, index) => {
    item.rank = index + 1;
    if (index < prizes.length) {
      item.prize = prizes[index];
    } else {
      delete item.prize;
    }
  });

  const assignedResult = updatedList.find(e => e.user_id === params.userId) || newEntry;

  // 1. Save to Supabase tournament_results table
  try {
    const supabase = createClient();
    await supabase.from('tournament_results').upsert({
      id: attemptId,
      tournament_id: params.tournamentId,
      student_id: params.userId,
      score: assignedResult.score,
      max_score: assignedResult.max_score,
      percentage: assignedResult.percentage,
      time_spent_seconds: assignedResult.time_spent_seconds,
      answers: params.answers,
      rank: assignedResult.rank,
      prize: assignedResult.prize || null,
      completed_at: new Date().toISOString()
    });
  } catch (dbErr) {
    console.warn('[Tournaments] DB attempt save error:', dbErr);
  }

  // 2. Keep local cache synced
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`promax_leaderboard_${params.tournamentId}`, JSON.stringify(updatedList));
      const localKey = `promax_completed_tournaments_${params.userId || 'current'}`;
      const existing = localStorage.getItem(localKey);
      const list: string[] = existing ? JSON.parse(existing) : [];
      if (!list.includes(params.tournamentId)) {
        list.push(params.tournamentId);
        localStorage.setItem(localKey, JSON.stringify(list));
      }
    } catch (e) {}
  }

  return { success: true, result: assignedResult };
}

/**
 * Get all tournament IDs that the current user has already submitted/completed.
 */
export async function getUserCompletedTournamentIds(userId?: string): Promise<string[]> {
  if (!userId && typeof window === 'undefined') return [];

  const localKey = `promax_completed_tournaments_${userId || 'current'}`;
  let localList: string[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(localKey);
      if (raw) localList = JSON.parse(raw);
    } catch {}
  }

  if (userId) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('tournament_results')
        .select('tournament_id')
        .eq('student_id', userId);

      if (!error && data) {
        const dbIds = Array.from(new Set(data.map((d: any) => d.tournament_id as string)));
        const merged = Array.from(new Set([...localList, ...dbIds]));
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(localKey, JSON.stringify(merged));
          } catch {}
        }
        return merged;
      }
    } catch (e) {}
  }

  return localList;
}
