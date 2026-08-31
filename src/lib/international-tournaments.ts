import { createClient } from '@/utils/supabase/client';

export interface InternationalQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'grid_in' | 'true_false' | 'short_answer';
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  accepted_answers?: string[];
  explanation?: string;
  points: number;
  image_url?: string | null;
  category?: 'sat_math' | 'sat_reading' | 'amc_math' | 'ielts_english' | 'general';
}

export interface InternationalTournament {
  id: string;
  title: string;
  category: 'sat' | 'amc' | 'ielts' | 'stem' | 'general';
  categoryLabel: string;
  subject: string;
  description: string;
  badge: string;
  badgeBg: string;
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
  questions?: InternationalQuestion[];
  isPublished?: boolean;
  scoringScale?: string;
  created_at?: string;
}

export interface InternationalLeaderboardEntry {
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

export interface InternationalComment {
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

// ── Storage Keys (Single source of truth) ──
const STORAGE_INTERNATIONAL_TOURNAMENTS = 'promax_intl_tournaments_v3';
const STORAGE_INTERNATIONAL_LEADERBOARDS = 'promax_intl_leaderboards_v3';
const STORAGE_INTERNATIONAL_REGISTRATIONS = 'promax_intl_registrations_v3';

// ── GET CACHED INTERNATIONAL TOURNAMENTS (Instant Synchronous) ──
export function getCachedInternationalTournaments(): InternationalTournament[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }
  return [];
}

// ── GET INTERNATIONAL TOURNAMENTS (Live Network-First) ──
export async function getInternationalTournaments(): Promise<InternationalTournament[]> {
  // 1. Fetch from API first (Live cross-device source of truth)
  try {
    const res = await fetch(`/api/tournaments?type=international&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tournaments) && data.tournaments.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(data.tournaments));
        }
        return data.tournaments;
      }
    }
  } catch (apiErr) {
    console.warn('Live intl tournaments fetch failed, fallback to local storage:', apiErr);
  }

  // 2. Offline / LocalStorage fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
  }

  // 3. Database fallback if available
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(data));
      }
      return data as any;
    }
  } catch {}

  return [];
}

export async function getInternationalTournamentById(id: string): Promise<InternationalTournament | null> {
  try {
    const res = await fetch(`/api/tournaments?type=international&id=${id}&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      if (data.tournament) return data.tournament;
    }
  } catch (e) {}

  const tournaments = await getInternationalTournaments();
  return tournaments.find(t => t.id === id) || null;
}

export async function getInternationalLeaderboard(tournamentId: string): Promise<InternationalLeaderboardEntry[]> {
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
      const entries: InternationalLeaderboardEntry[] = data.map((d: any, idx: number) => ({
        id: d.id,
        tournament_id: tournamentId,
        user_id: d.student_id,
        student_name: d.profile?.full_name || "O'quvchi",
        student_avatar: d.profile?.avatar_url || '',
        score: Number(d.score),
        max_score: Number(d.max_score),
        scaled_score: d.scaled_score,
        percentage: Number(d.percentage) || Math.round((Number(d.score) / (Number(d.max_score) || 1)) * 100),
        time_spent_seconds: Number(d.time_spent_seconds) || 0,
        rank: idx + 1,
        completed_at: d.completed_at ? new Date(d.completed_at).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Yaqinda",
        prize: d.prize || (idx === 0 ? "1-O'rin" : idx === 1 ? "2-O'rin" : idx === 2 ? "3-O'rin" : undefined)
      }));

      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(STORAGE_INTERNATIONAL_LEADERBOARDS);
          let map: Record<string, InternationalLeaderboardEntry[]> = stored ? JSON.parse(stored) : {};
          map[tournamentId] = entries;
          localStorage.setItem(STORAGE_INTERNATIONAL_LEADERBOARDS, JSON.stringify(map));
        } catch {}
      }

      return entries;
    }
  } catch {}

  // 2. Offline / LocalStorage fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_LEADERBOARDS);
    if (stored) {
      try {
        const map = JSON.parse(stored);
        if (map[tournamentId]) return map[tournamentId];
      } catch {}
    }
  }

  return [];
}

export async function registerForInternationalTournament(tournamentId: string, userId?: string): Promise<boolean> {
  const userKey = userId || 'anonymous_user';

  // 1. Sync to local storage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_REGISTRATIONS);
    let regMap: Record<string, string[]> = {};
    if (stored) {
      try { regMap = JSON.parse(stored); } catch (e) {}
    }
    if (!regMap[userKey]) regMap[userKey] = [];
    if (!regMap[userKey].includes(tournamentId)) {
      regMap[userKey].push(tournamentId);
      localStorage.setItem(STORAGE_INTERNATIONAL_REGISTRATIONS, JSON.stringify(regMap));
    }
  }

  // 2. Persist to Supabase
  if (userId) {
    try {
      const supabase = createClient();
      await supabase
        .from('tournament_registrations')
        .upsert({
          id: `reg_intl_${tournamentId}_${userId}`,
          tournament_id: tournamentId,
          student_id: userId,
          created_at: new Date().toISOString()
        }, { onConflict: 'tournament_id,student_id' });
    } catch (e) {}
  }

  return true;
}

export function getInternationalRegistrations(userId?: string): string[] {
  if (typeof window === 'undefined') return [];
  const userKey = userId || 'anonymous_user';
  const stored = localStorage.getItem(STORAGE_INTERNATIONAL_REGISTRATIONS);
  if (stored) {
    try {
      const map = JSON.parse(stored);
      return map[userKey] || [];
    } catch (e) {}
  }
  return [];
}

export async function submitInternationalAttempt(
  tournamentId: string,
  userId: string,
  userName: string,
  userAvatar: string,
  score: number,
  maxScore: number,
  timeSpentSeconds: number
): Promise<{ success: boolean; rank: number; scaledScore: string }> {
  const percentage = Math.round((score / (maxScore || 1)) * 100);
  const scaledScoreNum = 400 + Math.round((score / (maxScore || 1)) * 1200);
  const scaledScore = `${scaledScoreNum} / 1600`;
  const attemptId = `intl_attempt_${tournamentId}_${userId}_${Date.now()}`;

  const newEntry: InternationalLeaderboardEntry = {
    id: attemptId,
    tournament_id: tournamentId,
    user_id: userId,
    student_name: userName || "O'quvchi",
    student_avatar: userAvatar || "",
    score,
    max_score: maxScore,
    scaled_score: scaledScore,
    percentage,
    time_spent_seconds: timeSpentSeconds,
    rank: 1,
    completed_at: "Hozirginagina"
  };

  let currentList = await getInternationalLeaderboard(tournamentId);
  currentList = currentList.filter(e => e.user_id !== userId);
  currentList.push(newEntry);

  currentList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_spent_seconds - b.time_spent_seconds;
  });

  currentList.forEach((entry, idx) => {
    entry.rank = idx + 1;
    if (entry.rank === 1) entry.prize = "1-O'rin";
    else if (entry.rank === 2) entry.prize = "2-O'rin";
    else if (entry.rank === 3) entry.prize = "3-O'rin";
  });

  const myRank = currentList.find(e => e.user_id === userId)?.rank || 1;
  const myPrize = myRank === 1 ? "1-O'rin" : myRank === 2 ? "2-O'rin" : myRank === 3 ? "3-O'rin" : null;

  // 1. Save to Supabase tournament_results table
  try {
    const supabase = createClient();
    await supabase.from('tournament_results').upsert({
      id: attemptId,
      tournament_id: tournamentId,
      student_id: userId,
      score,
      max_score: maxScore,
      scaled_score: scaledScore,
      percentage,
      time_spent_seconds: timeSpentSeconds,
      rank: myRank,
      prize: myPrize,
      completed_at: new Date().toISOString()
    });
  } catch (dbErr) {
    console.warn('[International] DB attempt save error:', dbErr);
  }

  // 2. Keep local storage synced
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_LEADERBOARDS);
    let map: Record<string, InternationalLeaderboardEntry[]> = {};
    if (stored) {
      try { map = JSON.parse(stored); } catch (e) {}
    }
    map[tournamentId] = currentList;
    localStorage.setItem(STORAGE_INTERNATIONAL_LEADERBOARDS, JSON.stringify(map));

    const localKey = `promax_completed_intl_tournaments_${userId || 'current'}`;
    try {
      const raw = localStorage.getItem(localKey);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(tournamentId)) {
        list.push(tournamentId);
        localStorage.setItem(localKey, JSON.stringify(list));
      }
    } catch (e) {}
  }

  return { success: true, rank: myRank, scaledScore };
}

/**
 * Get all international tournament IDs that the current user has completed.
 */
export async function getUserCompletedInternationalTournamentIds(userId?: string): Promise<string[]> {
  if (!userId && typeof window === 'undefined') return [];

  const localKey = `promax_completed_intl_tournaments_${userId || 'current'}`;
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

// ── Admin Tournament Management ──
export async function saveInternationalTournament(
  tournament: Partial<InternationalTournament>
): Promise<InternationalTournament> {
  const id = tournament.id || `intl_${Date.now()}`;
  const category = tournament.category || 'sat';
  const categoryLabel = category === 'sat' ? 'SAT Digital' : category === 'amc' ? 'AMC Math' : category === 'ielts' ? 'IELTS Arena' : 'Xalqaro';
  
  const fullTournament: InternationalTournament = {
    id,
    title: tournament.title || "Yangi Xalqaro Musobaqa",
    category,
    categoryLabel,
    subject: tournament.subject || "SAT Math & Reading",
    description: tournament.description || "",
    badge: tournament.badge || "🔥 XALQARO ARENA",
    badgeBg: tournament.badgeBg || "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white",
    status: tournament.status || "upcoming",
    startDate: tournament.startDate || new Date().toISOString().split("T")[0],
    startTime: tournament.startTime || "15:00",
    endDate: tournament.endDate,
    endTime: tournament.endTime,
    durationMinutes: tournament.durationMinutes ?? 60,
    totalQuestions: tournament.questions?.length ?? tournament.totalQuestions ?? 0,
    entryCoins: tournament.entryCoins ?? 0,
    prizePool: tournament.prizePool || "Top o'rinlar uchun mukofotlar",
    topPrizes: tournament.topPrizes || [
      "1-O'rin: Xalqaro Grant & Sertifikat",
      "2-O'rin: 500,000 So'm Vafcher",
      "3-O'rin: 300,000 So'm Vafcher"
    ],
    rules: tournament.rules || [
      "Test davomiyligi belgilangan vaqtda yakunlanadi.",
      "Yopiq savollarda faqat son yoki kasr kiritilishi lozim.",
      "Natijalar xalqaro shkala bo'yicha hisoblanadi."
    ],
    participantsCount: tournament.participantsCount ?? 0,
    questions: tournament.questions || [],
    scoringScale: tournament.scoringScale || (category === 'sat' ? '1600 Ballik SAT Shkalasi' : '100 Ballik Shkala'),
    created_at: tournament.created_at || new Date().toISOString()
  };

  // 1. Sync to API
  try {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'international', tournament: fullTournament })
    });
    if (res.ok) {
      const resJson = await res.json();
      if (resJson.data) {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
          let list: InternationalTournament[] = [];
          try { if (stored) list = JSON.parse(stored); } catch (e) {}
          const existingIndex = list.findIndex(t => t.id === id);
          if (existingIndex >= 0) {
            list[existingIndex] = resJson.data;
          } else {
            list = [resJson.data, ...list];
          }
          localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(list));
        }
        return resJson.data;
      }
    }
  } catch (err) {
    console.error('Save international tournament error:', err);
  }

  // 2. Local fallback
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
    let list: InternationalTournament[] = [];
    try { if (stored) list = JSON.parse(stored); } catch (e) {}
    const existingIndex = list.findIndex(t => t.id === id);
    if (existingIndex >= 0) {
      list[existingIndex] = fullTournament;
    } else {
      list = [fullTournament, ...list];
    }
    localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(list));
  }

  return fullTournament;
}

export async function deleteInternationalTournament(id: string): Promise<boolean> {
  try {
    await fetch(`/api/tournaments?type=international&id=${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error('Delete intl tournament error:', e);
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
    if (stored) {
      try {
        const list: InternationalTournament[] = JSON.parse(stored);
        const newList = list.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(newList));
      } catch (e) {}
    }
  }

  try {
    const supabase = createClient();
    await supabase.from('tournaments').delete().eq('id', id);
  } catch (e) {}

  return true;
}

export async function duplicateInternationalTournament(id: string): Promise<InternationalTournament | null> {
  const tournament = await getInternationalTournamentById(id);
  if (!tournament) return null;

  const duplicated: Partial<InternationalTournament> = {
    ...tournament,
    id: `intl_copy_${Date.now()}`,
    title: `${tournament.title} (Nusxa)`,
    status: 'upcoming',
    participantsCount: 0,
    created_at: new Date().toISOString()
  };

  return await saveInternationalTournament(duplicated);
}

export async function getAdminInternationalComments(): Promise<InternationalComment[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tournament_comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch {}

  return [];
}

export async function deleteAdminInternationalComment(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    await supabase.from('tournament_comments').delete().eq('id', id);
    return true;
  } catch {}
  return false;
}
