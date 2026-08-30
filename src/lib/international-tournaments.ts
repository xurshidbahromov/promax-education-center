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

export async function getInternationalTournaments(): Promise<InternationalTournament[]> {
  // 1. Read from localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
  }

  // 2. Fetch from API / Supabase
  try {
    const res = await fetch(`/api/tournaments?type=international&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tournaments)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(data.tournaments));
        }
        return data.tournaments;
      }
    }
  } catch {}

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(data));
      }
      return data as any;
    }
  } catch {}

  return [];
}

export async function getInternationalTournamentById(id: string): Promise<InternationalTournament | null> {
  const tournaments = await getInternationalTournaments();
  return tournaments.find(t => t.id === id) || null;
}

export async function getInternationalLeaderboard(tournamentId: string): Promise<InternationalLeaderboardEntry[]> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_LEADERBOARDS);
    if (stored) {
      try {
        const map = JSON.parse(stored);
        if (map[tournamentId]) return map[tournamentId];
      } catch {}
    }
  }

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
        student_name: d.profile?.full_name || 'O\'quvchi',
        student_avatar: d.profile?.avatar_url || '',
        score: d.score,
        max_score: d.max_score,
        scaled_score: d.scaled_score,
        percentage: Math.round((d.score / (d.max_score || 1)) * 100),
        time_spent_seconds: d.time_spent_seconds || 0,
        rank: idx + 1,
        completed_at: d.created_at,
        prize: idx === 0 ? "1-O'rin" : idx === 1 ? "2-O'rin" : idx === 2 ? "3-O'rin" : undefined
      }));
      return entries;
    }
  } catch {}

  return [];
}

export function registerForInternationalTournament(tournamentId: string, userId?: string): boolean {
  if (typeof window === 'undefined') return false;
  const userKey = userId || 'anonymous_user';
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

  const newEntry: InternationalLeaderboardEntry = {
    id: `intl_attempt_${Date.now()}`,
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
    completed_at: new Date().toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_LEADERBOARDS);
    let map: Record<string, InternationalLeaderboardEntry[]> = {};
    if (stored) {
      try { map = JSON.parse(stored); } catch (e) {}
    }
    map[tournamentId] = currentList;
    localStorage.setItem(STORAGE_INTERNATIONAL_LEADERBOARDS, JSON.stringify(map));
  }

  try {
    const supabase = createClient();
    await supabase.from('tournament_results').insert({
      tournament_id: tournamentId,
      student_id: userId,
      score,
      max_score: maxScore,
      scaled_score: scaledScore,
      time_spent_seconds: timeSpentSeconds
    });
  } catch {}

  const myRank = currentList.find(e => e.id === newEntry.id)?.rank || 1;
  return { success: true, rank: myRank, scaledScore };
}

// ── Admin Tournament Management ──
export async function saveInternationalTournament(
  tournament: Partial<InternationalTournament>
): Promise<InternationalTournament> {
  const currentList = await getInternationalTournaments();
  let updatedTournament: InternationalTournament;

  if (tournament.id && currentList.some(t => t.id === tournament.id)) {
    // Update existing
    const existing = currentList.find(t => t.id === tournament.id)!;
    updatedTournament = {
      ...existing,
      ...tournament,
      totalQuestions: tournament.questions ? tournament.questions.length : (tournament.totalQuestions ?? existing.totalQuestions)
    };
    const newList = currentList.map(t => t.id === tournament.id ? updatedTournament : t);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(newList));
    }
  } else {
    // Create new
    const id = tournament.id || `intl_${Date.now()}`;
    const category = tournament.category || 'sat';
    const categoryLabel = category === 'sat' ? 'SAT Digital' : category === 'amc' ? 'AMC Math' : category === 'ielts' ? 'IELTS Arena' : 'Xalqaro';
    
    updatedTournament = {
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
      created_at: new Date().toISOString()
    };

    const newList = [updatedTournament, ...currentList];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(newList));
    }
  }

  // Sync to API
  try {
    await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'international', tournament: updatedTournament })
    });
  } catch {}

  return updatedTournament;
}

export async function deleteInternationalTournament(id: string): Promise<boolean> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
    const list: InternationalTournament[] = stored ? JSON.parse(stored) : [];
    const newList = list.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(newList));
  }

  try {
    await fetch(`/api/tournaments?type=international&id=${id}`, { method: 'DELETE' });
  } catch {}

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
