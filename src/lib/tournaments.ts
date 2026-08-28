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

export const SAMPLE_MATH_QUESTIONS: TournamentQuestion[] = [
  {
    id: "mq-1",
    question_text: "Agar $f(x) = x^2 - 4x + 3$ bo'lsa, funksiyaning eng kichik qiymatini toping.",
    question_type: "multiple_choice",
    options: { A: "-1", B: "0", C: "1", D: "3" },
    correct_answer: "A",
    explanation: "Parabola uchi $x_0 = -b/(2a) = 4/2 = 2$. $f(2) = 4 - 8 + 3 = -1$.",
    points: 3.1
  },
  {
    id: "mq-2",
    question_text: "Uchburchakning tomonlari 6, 8 va 10 ga teng. Uchburchakning yuzini hisoblang.",
    question_type: "multiple_choice",
    options: { A: "24", B: "48", C: "30", D: "40" },
    correct_answer: "A",
    explanation: "Bu to'g'ri burchakli uchburchak: $6^2 + 8^2 = 10^2$. Yuzi $S = (6 \\cdot 8)/2 = 24$.",
    points: 3.1
  },
  {
    id: "mq-3",
    question_text: "Tenglamani yeching: $\\log_2(x - 3) = 4$",
    question_type: "multiple_choice",
    options: { A: "19", B: "16", C: "11", D: "7" },
    correct_answer: "A",
    explanation: "$x - 3 = 2^4 = 16 \\Rightarrow x = 19$.",
    points: 3.1
  },
  {
    id: "mq-4",
    question_text: "Arifmetik progressiyada $a_1 = 3$ va $d = 4$ bo'lsa, $a_{10}$ ni toping.",
    question_type: "multiple_choice",
    options: { A: "39", B: "43", C: "35", D: "40" },
    correct_answer: "A",
    explanation: "$a_{10} = a_1 + 9d = 3 + 9 \\cdot 4 = 39$.",
    points: 3.1
  },
  {
    id: "mq-5",
    question_text: "Hisoblang: $\\sqrt{7 + 4\\sqrt{3}} - \\sqrt{7 - 4\\sqrt{3}}$",
    question_type: "multiple_choice",
    options: { A: "2", B: "4", C: "2\\sqrt{3}", D: "0" },
    correct_answer: "A",
    explanation: "$\\sqrt{(2+\\sqrt{3})^2} - \\sqrt{(2-\\sqrt{3})^2} = (2+\\sqrt{3}) - (2-\\sqrt{3}) = 2\\sqrt{3}$... Ayirma moduli hisoblanadi.",
    points: 3.1
  }
];

export const INITIAL_TOURNAMENTS: AdminTournament[] = [
  {
    id: "math-pro-2026",
    title: "Respublika Matematika Pro Onlayn Musobaqasi",
    subject: "Matematika",
    description: "Mantiqiy va murakkab masalalar bo'yicha eng kuchli o'quvchilar bellashuvi. G'oliblarga noutbuk va planshetlar!",
    status: "live",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    endTime: "23:59",
    durationMinutes: 60,
    totalQuestions: 5,
    entryCoins: 100,
    prizePool: "1,500,000 SO'M + Planshet",
    topPrizes: [
      "1-O'rin: 1,000,000 So'm + Oltin Medal + Planshet",
      "2-O'rin: 300,000 So'm + Kumush Medal + Premium Akkaunt",
      "3-O'rin: 200,000 So'm + Bronza Medal + Kitoblar to'plami"
    ],
    rules: [
      "Test vaqti 60 daqiqa, jami 5 ta savol.",
      "Har bir to'g'ri javob uchun 3.1 ball beriladi.",
      "Vaqt tugaganda test avtomatik yakunlanadi.",
      "Bitta akkauntdan faqat 1 marotaba qatnashish mumkin."
    ],
    participantsCount: 428,
    questions: SAMPLE_MATH_QUESTIONS
  },
  {
    id: "physics-master-2026",
    title: "Fizika Fanidan Milliy Chempionat",
    subject: "Fizika",
    description: "Mexanika, termodinamika va elektrodinamika bo'limlari bo'yicha yosh fiziklar musobaqasi.",
    status: "upcoming",
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    startTime: "16:00",
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    endTime: "18:00",
    durationMinutes: 45,
    totalQuestions: 25,
    entryCoins: 50,
    prizePool: "800,000 SO'M + Smart Watch",
    topPrizes: [
      "1-O'rin: 500,000 So'm + Smart Watch + Maxsus Sertifikat",
      "2-O'rin: 300,000 So'm + PowerBank + Sertifikat",
      "3-O'rin: Brend Noutbuk Sumkasi + Sertifikat"
    ],
    rules: [
      "Vaqt chegaralangan (45 daqiqa).",
      "G'oliblar ball va sarflangan vaqtga qarab aniqlanadi."
    ],
    participantsCount: 289,
    questions: SAMPLE_MATH_QUESTIONS
  },
  {
    id: "english-grammar-battle",
    title: "English Grammar & Vocabulary Battle",
    subject: "Ingliz tili",
    description: "Ingliz tili grammatikasi va so'z boyligi bo'yicha tekoris musobaqa!",
    status: "finished",
    startDate: "10-Avgust, 2026",
    startTime: "18:00",
    endDate: "12-Avgust, 2026",
    endTime: "20:00",
    durationMinutes: 40,
    totalQuestions: 30,
    entryCoins: 0,
    prizePool: "IELTS Kitoblar To'plami & Vafcherlar",
    topPrizes: [
      "1-O'rin: IELTS Official Cambridge Kitoblar To'plami",
      "2-O'rin: Speaking Club 1 Oylik Bepul A'zolik",
      "3-O'rin: 300 Tanga + Rasmiy Sertifikat"
    ],
    rules: [
      "Barcha foydalanuvchilar bepul qatnashishi mumkin.",
      "Eng yuqori ball to'plagan 5 kishi sertifikat oladi."
    ],
    participantsCount: 512,
    questions: SAMPLE_MATH_QUESTIONS
  }
];

export const INITIAL_LEADERBOARDS: Record<string, TournamentLeaderboardEntry[]> = {
  "math-pro-2026": [
    {
      id: "lb-1",
      tournament_id: "math-pro-2026",
      user_id: "u-1",
      student_name: "Sardorbek Mirzayev",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sardor",
      score: 15.5,
      max_score: 15.5,
      percentage: 100,
      time_spent_seconds: 1420,
      rank: 1,
      completed_at: "Bugun, 10:45",
      prize: "1,000,000 So'm + Planshet"
    },
    {
      id: "lb-2",
      tournament_id: "math-pro-2026",
      user_id: "u-2",
      student_name: "Malika Karimova",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Malika",
      score: 15.5,
      max_score: 15.5,
      percentage: 100,
      time_spent_seconds: 1850,
      rank: 2,
      completed_at: "Bugun, 11:20",
      prize: "300,000 So'm + Kumush Medal"
    },
    {
      id: "lb-3",
      tournament_id: "math-pro-2026",
      user_id: "u-3",
      student_name: "Javohir Salimov",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Javohir",
      score: 12.4,
      max_score: 15.5,
      percentage: 80,
      time_spent_seconds: 1340,
      rank: 3,
      completed_at: "Bugun, 09:50",
      prize: "200,000 So'm + Bronza Medal"
    },
    {
      id: "lb-4",
      tournament_id: "math-pro-2026",
      user_id: "u-4",
      student_name: "Nilufar Qodirova",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nilufar",
      score: 12.4,
      max_score: 15.5,
      percentage: 80,
      time_spent_seconds: 2100,
      rank: 4,
      completed_at: "Bugun, 12:10"
    },
    {
      id: "lb-5",
      tournament_id: "math-pro-2026",
      user_id: "u-5",
      student_name: "Bobur Ismoilov",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bobur",
      score: 9.3,
      max_score: 15.5,
      percentage: 60,
      time_spent_seconds: 1950,
      rank: 5,
      completed_at: "Bugun, 13:00"
    }
  ]
};

// ── GET TOURNAMENTS ──
export async function getAdminTournaments(): Promise<AdminTournament[]> {
  try {
    const res = await fetch(`/api/tournaments?type=national&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.tournaments)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('promax_tournaments', JSON.stringify(data.tournaments));
        }
        return data.tournaments;
      }
    }
  } catch (apiErr) {}

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data || data.length === 0) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('promax_tournaments');
        if (local) {
          try { return JSON.parse(local); } catch (e) {}
        }
      }
      return INITIAL_TOURNAMENTS;
    }
    return data;
  } catch (err) {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('promax_tournaments');
      if (local) {
        try { return JSON.parse(local); } catch (e) {}
      }
    }
    return INITIAL_TOURNAMENTS;
  }
}

// ── GET SINGLE TOURNAMENT ──
export async function getTournamentById(id: string): Promise<AdminTournament | null> {
  try {
    const res = await fetch(`/api/tournaments?type=national&id=${id}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
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
  try {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'national', tournament })
    });
    if (res.ok) {
      const result = await res.json();
      if (result.data) {
        saveToLocalTournaments(result.data);
        return { success: true, data: result.data };
      }
    }
  } catch (apiErr) {}

  const supabase = createClient();
  try {
    if (tournament.id && !tournament.id.startsWith('temp_') && !tournament.id.includes('-2026')) {
      const { data, error } = await supabase
        .from('tournaments')
        .update(tournament)
        .eq('id', tournament.id)
        .select()
        .single();
      if (error) {
        const saved = saveToLocalTournaments(tournament);
        return { success: true, data: saved };
      }
      return { success: true, data };
    } else {
      const { id, ...insertData } = tournament;
      const { data, error } = await supabase
        .from('tournaments')
        .insert(insertData)
        .select()
        .single();
      if (error) {
        const saved = saveToLocalTournaments(tournament);
        return { success: true, data: saved };
      }
      return { success: true, data };
    }
  } catch (err: any) {
    const saved = saveToLocalTournaments(tournament);
    return { success: true, data: saved };
  }
}

function saveToLocalTournaments(tournament: Partial<AdminTournament>): AdminTournament {
  if (typeof window === 'undefined') return tournament as AdminTournament;
  try {
    const local = localStorage.getItem('promax_tournaments');
    let list: AdminTournament[] = local ? JSON.parse(local) : [...INITIAL_TOURNAMENTS];
    
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

    const existingIndex = list.findIndex(t => t.id === id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...fullTournament };
    } else {
      list.unshift(fullTournament);
    }

    localStorage.setItem('promax_tournaments', JSON.stringify(list));
    return fullTournament;
  } catch (e) {
    return tournament as AdminTournament;
  }
}

// ── DELETE TOURNAMENT ──
export async function deleteAdminTournament(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/tournaments?type=national&id=${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('promax_tournaments');
        if (local) {
          const list: AdminTournament[] = JSON.parse(local);
          localStorage.setItem('promax_tournaments', JSON.stringify(list.filter(t => t.id !== id)));
        }
      }
      return { success: true };
    }
  } catch (apiErr) {}

  const supabase = createClient();
  try {
    await supabase.from('tournaments').delete().eq('id', id);
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('promax_tournaments');
      if (local) {
        const list: AdminTournament[] = JSON.parse(local);
        localStorage.setItem('promax_tournaments', JSON.stringify(list.filter(t => t.id !== id)));
      }
    }
    return { success: true };
  } catch (err: any) {
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('promax_tournaments');
      if (local) {
        const list: AdminTournament[] = JSON.parse(local);
        localStorage.setItem('promax_tournaments', JSON.stringify(list.filter(t => t.id !== id)));
      }
    }
    return { success: true };
  }
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
  if (typeof window !== 'undefined') {
    try {
      const key = `tournament_registrations_${user.id || 'current'}`;
      const existing = localStorage.getItem(key);
      const list: string[] = existing ? JSON.parse(existing) : [];
      if (!list.includes(tournamentId)) {
        list.push(tournamentId);
        localStorage.setItem(key, JSON.stringify(list));
      }

      // Increment participant count in tournament
      const tournament = await getTournamentById(tournamentId);
      if (tournament) {
        await saveAdminTournament({
          ...tournament,
          participantsCount: (tournament.participantsCount || 0) + 1
        });
      }
      return { success: true, message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!" };
    } catch (e) {
      return { success: true };
    }
  }
  return { success: true };
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
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(`promax_leaderboard_${tournamentId}`);
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {}
  }

  return INITIAL_LEADERBOARDS[tournamentId] || [
    {
      id: "lb-demo-1",
      tournament_id: tournamentId,
      user_id: "demo-1",
      student_name: "Javohir Toshmatov",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JavohirT",
      score: 15.5,
      max_score: 15.5,
      percentage: 100,
      time_spent_seconds: 1240,
      rank: 1,
      completed_at: "Bugun",
      prize: "🥇 1-O'rin sovrini"
    },
    {
      id: "lb-demo-2",
      tournament_id: tournamentId,
      user_id: "demo-2",
      student_name: "Sevinch Usmonova",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SevinchU",
      score: 12.4,
      max_score: 15.5,
      percentage: 80,
      time_spent_seconds: 1450,
      rank: 2,
      completed_at: "Bugun",
      prize: "🥈 2-O'rin sovrini"
    }
  ];
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
  const questions = tournament?.questions || SAMPLE_MATH_QUESTIONS;

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

  const newEntry: TournamentLeaderboardEntry = {
    id: `sub_${Date.now()}`,
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

  // Add and re-rank
  const updatedList = [...currentLeaderboard.filter(e => e.user_id !== params.userId), newEntry];
  updatedList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_spent_seconds - b.time_spent_seconds;
  });

  // Assign ranks and top prizes
  const prizes = tournament?.topPrizes || [];
  updatedList.forEach((item, index) => {
    item.rank = index + 1;
    if (index < prizes.length) {
      item.prize = prizes[index];
    } else {
      delete item.prize;
    }
  });

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`promax_leaderboard_${params.tournamentId}`, JSON.stringify(updatedList));
    } catch (e) {}
  }

  const assignedResult = updatedList.find(e => e.user_id === params.userId) || newEntry;
  return { success: true, result: assignedResult };
}
