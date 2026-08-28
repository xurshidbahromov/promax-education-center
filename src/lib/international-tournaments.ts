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
  correct_answer: string; // "A" | "B" | "C" | "D" for multiple choice, or exact string/number like "24", "3/4", "0.75", "12" for grid_in
  accepted_answers?: string[]; // Optional alternative formats e.g. ["0.75", "3/4", ".75"]
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
  scoringScale?: string; // e.g. "1600 SAT Shkalasi", "150 AMC Shkalasi", "9.0 IELTS Shkalasi"
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
  scaled_score?: string; // e.g. "1540 / 1600" or "132 / 150"
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

// ── Sample International Questions (with Multiple Choice & Closed Grid-in) ──
export const SAMPLE_INTERNATIONAL_QUESTIONS: InternationalQuestion[] = [
  {
    id: "sat-math-1",
    question_text: "In the $xy$-plane, the line with equation $y = 3x - 5$ intersects the parabola with equation $y = x^2 - 2x + 1$ at points $(x_1, y_1)$ and $(x_2, y_2)$. What is the value of $x_1 + x_2$?",
    question_type: "grid_in",
    correct_answer: "5",
    accepted_answers: ["5", "5.0"],
    explanation: "Set equations equal: $x^2 - 2x + 1 = 3x - 5 \\Rightarrow x^2 - 5x + 6 = 0$. By Vieta's formulas, $x_1 + x_2 = -(-5)/1 = 5$.",
    points: 10,
    category: "sat_math"
  },
  {
    id: "sat-math-2",
    question_text: "A circle in the $xy$-plane has its center at $(3, -4)$ and passes through the origin $(0, 0)$. What is the area of the circle in terms of $\\pi$?",
    question_type: "multiple_choice",
    options: {
      A: "25\\pi",
      B: "16\\pi",
      C: "9\\pi",
      D: "50\\pi"
    },
    correct_answer: "A",
    explanation: "Radius $r = \\sqrt{(3-0)^2 + (-4-0)^2} = \\sqrt{9 + 16} = 5$. Area $A = \\pi r^2 = 25\\pi$.",
    points: 10,
    category: "sat_math"
  },
  {
    id: "sat-math-3",
    question_text: "If $\\frac{4x + 12}{x + 3} + \\frac{2x - 6}{x - 3} = k$ for all $x \\neq \\pm 3$, what is the integer value of $k$?",
    question_type: "grid_in",
    correct_answer: "6",
    accepted_answers: ["6", "6.0"],
    explanation: "$\\frac{4(x+3)}{x+3} + \\frac{2(x-3)}{x-3} = 4 + 2 = 6$. So $k = 6$.",
    points: 10,
    category: "sat_math"
  },
  {
    id: "sat-ebrw-1",
    question_text: "Which choice completes the text with the most logical and precise word or phrase? 'The researcher argued that while the initial results were promising, further empirical investigation was necessary to ______ the preliminary hypothesis.'",
    question_type: "multiple_choice",
    options: {
      A: "substantiate",
      B: "undermine",
      C: "obfuscate",
      D: "preclude"
    },
    correct_answer: "A",
    explanation: "'Substantiate' means to provide evidence to support or prove the truth of something, which perfectly matches 'promising initial results' needing further verification.",
    points: 10,
    category: "sat_reading"
  },
  {
    id: "amc-math-1",
    question_text: "How many positive integers $n \\le 100$ have the property that $n$ is divisible by both $3$ and $4$, but not by $5$?",
    question_type: "grid_in",
    correct_answer: "7",
    accepted_answers: ["7", "7.0"],
    explanation: "$n$ is a multiple of $\\text{lcm}(3,4) = 12$. Multiples of 12 up to 100 are $12, 24, 36, 48, 60, 72, 84, 96$ (8 total). The only multiple of 5 among them is $60$. Hence $8 - 1 = 7$.",
    points: 10,
    category: "amc_math"
  }
];

export const INITIAL_INTERNATIONAL_TOURNAMENTS: InternationalTournament[] = [
  {
    id: "sat-digital-grand-2026",
    title: "Digital SAT Grand League (Math & EBRW 1600)",
    category: "sat",
    categoryLabel: "SAT Digital",
    subject: "SAT Math & Reading",
    description: "Xalqaro Digital SAT standarti bo'yicha to'liq formatli onlayn bellashuv. Ochiq va yopiq (Grid-in) savollar bilan o'z ballingizni 1600 shkalasida sinang!",
    badge: "🔥 XALQARO GRAND ARENA",
    badgeBg: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white",
    status: "live",
    startDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    endTime: "23:59",
    durationMinutes: 70,
    totalQuestions: 5,
    entryCoins: 150,
    prizePool: "2,000,000 SO'M + Ivy League SAT Kursi",
    scoringScale: "1600 Ballik SAT Shkalasi",
    topPrizes: [
      "🥇 1-O'rin: 1,200,000 So'm + Rasmiy Xalqaro Sertifikat + SAT Full Masterclass",
      "🥈 2-O'rin: 500,000 So'm + 1,000 Tanga + 1 oylik Speaking & Essay Review",
      "🥉 3-O'rin: 300,000 So'm + 500 Tanga + Official SAT Prep Kit"
    ],
    rules: [
      "Test Digital SAT formatida: Multiple Choice va Yopiq (Grid-in) savollardan iborat.",
      "Grid-in savollarga javobni butun son yoki o'nli kasr (masalan, 5 yoki 0.75) shaklida kiritish lozim.",
      "Vaqt chegarasi: 70 daqiqa. Natija avtomatik 1600 ballik shkalaga konvertatsiya qilinadi."
    ],
    participantsCount: 654,
    questions: SAMPLE_INTERNATIONAL_QUESTIONS
  },
  {
    id: "amc-math-challenge-2026",
    title: "American Mathematics Competitions (AMC 10/12)",
    category: "amc",
    categoryLabel: "AMC Matematika",
    subject: "Xalqaro Matematika",
    description: "AQSh va dunyo miqyosidagi eng nufuzli maktab matematik musobaqasi. Mantiqiy chuqurlik va murakkab kombinatorika masalalari.",
    badge: "⚡ AMC OFFICIAL PREP",
    badgeBg: "bg-purple-600/90 text-white",
    status: "upcoming",
    startDate: "24-Avgust, 2026",
    startTime: "16:00",
    durationMinutes: 75,
    totalQuestions: 25,
    entryCoins: 100,
    prizePool: "Xalqaro Diplom + 1,000,000 So'm",
    scoringScale: "150 Ballik AMC Shkalasi",
    topPrizes: [
      "🥇 1-O'rin: 1,000,000 So'm + AMC Gold Medal + Xalqaro Diplom",
      "🥈 2-O'rin: 500,000 So'm + AMC Silver Medal + Kitoblar",
      "🥉 3-O'rin: 300,000 So'm + 500 Tanga"
    ],
    rules: [
      "75 daqiqa davomida 25 ta masala.",
      "Har bir to'g'ri javob uchun 6 ball, belgilanmagan savol uchun 1.5 ball beriladi."
    ],
    participantsCount: 382
  },
  {
    id: "ielts-global-battle-2026",
    title: "Global IELTS Band 9.0 Speed Arena",
    category: "ielts",
    categoryLabel: "IELTS Arena",
    subject: "Ingliz tili (C1-C2)",
    description: "Xalqaro til bilish darajasi (C1-C2 Advanced) bo'yicha eng ilg'or leksika va Reading intellektual bellashuvi.",
    badge: "🌟 GLOBAL LEAGUE",
    badgeBg: "bg-emerald-600/90 text-white",
    status: "upcoming",
    startDate: "28-Avgust, 2026",
    startTime: "17:30",
    durationMinutes: 50,
    totalQuestions: 35,
    entryCoins: 50,
    prizePool: "Official IELTS Test Vafcheri + Kitoblar",
    scoringScale: "Band 9.0 Shkalasi",
    topPrizes: [
      "🥇 1-O'rin: IELTS Exam To'lovi Vafcheri + Band 9 Sertifikat",
      "🥈 2-O'rin: Cambridge 1-19 Original Books To'plami",
      "🥉 3-O'rin: 3 oylik Speaking Club + 500 Tanga"
    ],
    rules: [
      "Barcha ishtirokchilar uchun ochiq.",
      "Tezkorlik va aniqlik eng yuqori baholanadi."
    ],
    participantsCount: 890
  }
];

export const INITIAL_INTERNATIONAL_LEADERBOARD: Record<string, InternationalLeaderboardEntry[]> = {
  "sat-digital-grand-2026": [
    {
      id: "intl-lb-1",
      tournament_id: "sat-digital-grand-2026",
      user_id: "user-1",
      student_name: "Azizbek Karimov",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AzizbekK",
      score: 50,
      max_score: 50,
      scaled_score: "1580 / 1600",
      percentage: 100,
      time_spent_seconds: 1840,
      rank: 1,
      completed_at: "2026-08-22 14:30",
      prize: "🥇 1-O'rin (1,200,000 So'm + Masterclass)"
    },
    {
      id: "intl-lb-2",
      tournament_id: "sat-digital-grand-2026",
      user_id: "user-2",
      student_name: "Nilufar Xolmatova",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NilufarX",
      score: 40,
      max_score: 50,
      scaled_score: "1520 / 1600",
      percentage: 80,
      time_spent_seconds: 2150,
      rank: 2,
      completed_at: "2026-08-22 15:10",
      prize: "🥈 2-O'rin (500,000 So'm)"
    },
    {
      id: "intl-lb-3",
      tournament_id: "sat-digital-grand-2026",
      user_id: "user-3",
      student_name: "Diyorbek Rahimov",
      student_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DiyorbekR",
      score: 40,
      max_score: 50,
      scaled_score: "1480 / 1600",
      percentage: 80,
      time_spent_seconds: 2420,
      rank: 3,
      completed_at: "2026-08-22 16:00",
      prize: "🥉 3-O'rin (300,000 So'm)"
    }
  ]
};

// ── Storage Keys ──
const STORAGE_INTERNATIONAL_TOURNAMENTS = 'promax_intl_tournaments_v1';
const STORAGE_INTERNATIONAL_LEADERBOARDS = 'promax_intl_leaderboards_v1';
const STORAGE_INTERNATIONAL_REGISTRATIONS = 'promax_intl_registrations_v1';

export async function getInternationalTournaments(): Promise<InternationalTournament[]> {
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
  } catch (apiErr) {}

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch (e) {}
        }
      }
      return INITIAL_INTERNATIONAL_TOURNAMENTS;
    }

    return data as any;
  } catch (e) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (err) {}
      }
    }
    return INITIAL_INTERNATIONAL_TOURNAMENTS;
  }
}

export async function getInternationalTournamentById(id: string): Promise<InternationalTournament | null> {
  try {
    const res = await fetch(`/api/tournaments?type=international&id=${id}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
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
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_INTERNATIONAL_LEADERBOARDS);
      if (stored) {
        const map = JSON.parse(stored);
        if (map[tournamentId]) return map[tournamentId];
      }
    }
    return INITIAL_INTERNATIONAL_LEADERBOARD[tournamentId] || [];
  } catch (e) {
    return INITIAL_INTERNATIONAL_LEADERBOARD[tournamentId] || [];
  }
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
  const percentage = Math.round((score / maxScore) * 100);
  
  // Calculate scaled score for SAT (out of 1600)
  const scaledScoreNum = 400 + Math.round((score / (maxScore || 1)) * 1200);
  const scaledScore = `${scaledScoreNum} / 1600`;

  const newEntry: InternationalLeaderboardEntry = {
    id: `intl_attempt_${Date.now()}`,
    tournament_id: tournamentId,
    user_id: userId,
    student_name: userName || "Student",
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

  // Sort by score desc, then by timeSpentSeconds asc
  currentList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_spent_seconds - b.time_spent_seconds;
  });

  // Re-rank
  currentList.forEach((entry, idx) => {
    entry.rank = idx + 1;
    if (entry.rank === 1) entry.prize = "🥇 1-O'rin";
    else if (entry.rank === 2) entry.prize = "🥈 2-O'rin";
    else if (entry.rank === 3) entry.prize = "🥉 3-O'rin";
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

  const myRank = currentList.find(e => e.id === newEntry.id)?.rank || 1;
  return { success: true, rank: myRank, scaledScore };
}

// ── Admin Tournament Management ──
export async function saveInternationalTournament(
  tournament: Partial<InternationalTournament>
): Promise<InternationalTournament> {
  try {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'international', tournament })
    });
    if (res.ok) {
      const result = await res.json();
      if (result.data) {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
          let list: InternationalTournament[] = stored ? JSON.parse(stored) : [...INITIAL_INTERNATIONAL_TOURNAMENTS];
          const idx = list.findIndex(t => t.id === result.data.id);
          if (idx >= 0) list[idx] = result.data;
          else list = [result.data, ...list];
          localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(list));
        }
        return result.data;
      }
    }
  } catch (apiErr) {}

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
        "🥇 1-O'rin: Xalqaro Grant & Sertifikat",
        "🥈 2-O'rin: 500,000 So'm Vafcher",
        "🥉 3-O'rin: 300,000 So'm Vafcher"
      ],
      rules: tournament.rules || [
        "Test davomiyligi belgilangan vaqtda yakunlanadi.",
        "Yopiq savollarda faqat son yoki kasr kiritilishi lozim.",
        "Natijalar xalqaro shkala bo'yicha hisoblanadi."
      ],
      participantsCount: tournament.participantsCount ?? 0,
      questions: tournament.questions || SAMPLE_INTERNATIONAL_QUESTIONS,
      scoringScale: tournament.scoringScale || (category === 'sat' ? '1600 Ballik SAT Shkalasi' : '100 Ballik Shkala'),
      created_at: new Date().toISOString()
    };

    const newList = [updatedTournament, ...currentList];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(newList));
    }
  }

  return updatedTournament;
}

export async function deleteInternationalTournament(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/tournaments?type=international&id=${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_INTERNATIONAL_TOURNAMENTS);
        if (stored) {
          const list: InternationalTournament[] = JSON.parse(stored);
          localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(list.filter(t => t.id !== id)));
        }
      }
      return true;
    }
  } catch (apiErr) {}

  const currentList = await getInternationalTournaments();
  const newList = currentList.filter(t => t.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_INTERNATIONAL_TOURNAMENTS, JSON.stringify(newList));
  }
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
  return [
    {
      id: "ic1",
      author: "Shaxzod Tursunov",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shaxzod",
      role: "O'quvchi",
      time: "15 daqiqa avval",
      text: "Digital SAT Math dagi yopiq (grid-in) savollar qanchalik qiyin bo'ladi? Tayyorgarlik uchun testlar bormi?",
      likes: 12,
      created_at: "2026-08-23 10:00"
    },
    {
      id: "ic2",
      author: "Kamila Karimova",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kamila",
      role: "O'quvchi",
      time: "Kecha",
      text: "AMC va SAT musobaqasi sertifikatlari va sovg'alari qachon topshiriladi?",
      likes: 9,
      created_at: "2026-08-22 18:30"
    }
  ];
}

export async function deleteAdminInternationalComment(id: string): Promise<boolean> {
  return true;
}

