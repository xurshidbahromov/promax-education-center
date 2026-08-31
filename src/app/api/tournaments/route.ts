import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { AdminTournament } from '@/lib/tournaments';
import type { InternationalTournament } from '@/lib/international-tournaments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Global memory cache for cross-user and cross-request synchronization
declare global {
  var __national_tournaments_cache: AdminTournament[] | undefined;
  var __intl_tournaments_cache: InternationalTournament[] | undefined;
}

const NATIONAL_FILE = path.join(process.cwd(), 'src/data/national_tournaments.json');
const INTL_FILE = path.join(process.cwd(), 'src/data/international_tournaments.json');

function ensureDataFiles() {
  const dir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getDefaultNationalTournaments(): AdminTournament[] {
  return [
    {
      id: "tourn_grand_respublika_2026",
      title: "Respublika Aniq Fanlar Olimpiadasi 2026",
      subject: "Matematika",
      description: "Promax Education o'quvchilari va barcha iqtidorli yoshlar o'rtasida matematika va mantiq bo'yicha katta olimpiada. G'oliblarga qimmatbaho sovg'alar va sertifikatlar topshiriladi.",
      status: "live",
      startDate: new Date().toISOString().split("T")[0],
      startTime: "10:00",
      endDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      endTime: "22:00",
      durationMinutes: 60,
      totalQuestions: 5,
      entryCoins: 0,
      prizePool: "1,500,000 SO'M + Diplom",
      topPrizes: [
        "🥇 1-O'rin: 1,000,000 So'm + Oltin Medal & Diplom",
        "🥈 2-O'rin: 300,000 So'm + Kumush Medal",
        "🥉 3-O'rin: 200,000 So'm + Bronza Medal"
      ],
      rules: [
        "Test davomiyligi 60 daqiqa.",
        "Har bir to'g'ri javob uchun ball beriladi.",
        "G'oliblar eng yuqori ball va eng kam sarflangan vaqtga qarab aniqlanadi."
      ],
      participantsCount: 42,
      questions: [
        {
          id: "q_nat_1",
          question_text: "Tenglamani yeching: $2^{x+2} + 2^x = 40$. $x$ ning qiymatini toping.",
          options: { A: "3", B: "4", C: "2", D: "5" },
          correct_answer: "A",
          explanation: "2^x * 4 + 2^x = 40 => 5 * 2^x = 40 => 2^x = 8 => x = 3",
          points: 3.1
        },
        {
          id: "q_nat_2",
          question_text: "Ketma-ket 5 ta butun sonning yig'indisi 105 ga teng. Bu sonlarning eng kattasi nechiga teng?",
          options: { A: "21", B: "22", C: "23", D: "24" },
          correct_answer: "C",
          explanation: "O'rtadagi son: 105 / 5 = 21. Sonlar: 19, 20, 21, 22, 23. Eng kattasi 23.",
          points: 3.1
        },
        {
          id: "q_nat_3",
          question_text: "To'g'ri to'rtburchakning perimetri 36 sm, tomonlarining nisbati esa 4:5 ga teng. Uning yuzini toping ($sm^2$).",
          options: { A: "80", B: "72", C: "90", D: "88" },
          correct_answer: "A",
          explanation: "2*(4x+5x) = 36 => 18x = 36 => x = 2. Tomonlar: 8 va 10 sm. Yuza: 8*10 = 80 sm^2.",
          points: 3.1
        },
        {
          id: "q_nat_4",
          question_text: "Agar $f(x) = 3x^2 - 4x + 5$ bo'lsa, $f'(2)$ hosilasining qiymatini hisoblang.",
          options: { A: "8", B: "10", C: "12", D: "14" },
          correct_answer: "A",
          explanation: "f'(x) = 6x - 4. f'(2) = 6*2 - 4 = 8.",
          points: 3.1
        },
        {
          id: "q_nat_5",
          question_text: "Savatda 4 ta oq va 6 ta qora shar bor. Tasodifan olingan 2 ta sharning ikkalasi ham qora bo'lish ehtimolini toping.",
          options: { A: "1/3", B: "2/5", C: "3/8", D: "5/12" },
          correct_answer: "A",
          explanation: "P = (C(6,2)) / (C(10,2)) = 15 / 45 = 1/3.",
          points: 3.1
        }
      ],
      created_at: new Date().toISOString()
    }
  ];
}

function getDefaultIntlTournaments(): InternationalTournament[] {
  return [
    {
      id: "intl_sat_championship_2026",
      title: "Digital SAT Full-Length Championship",
      category: "sat",
      categoryLabel: "SAT Digital",
      subject: "SAT Math & Reading",
      description: "Xalqaro Digital SAT standarti bo'yicha tuzilgan rasmiy sinov musobaqasi. Xalqaro 1600 ballik shkalada hisoblanadi va eng sara o'rinlar taqdirlanadi.",
      badge: "🔥 XALQARO SAT ARENA",
      badgeBg: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white",
      status: "live",
      startDate: new Date().toISOString().split("T")[0],
      startTime: "12:00",
      endDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      endTime: "23:00",
      durationMinutes: 70,
      totalQuestions: 5,
      entryCoins: 0,
      prizePool: "Xalqaro Grant & Sertifikat",
      topPrizes: [
        "🥇 1-O'rin: 100% Kurs Granti + Rasmiy Sertifikat",
        "🥈 2-O'rin: 500,000 So'm Chegirma Vafcheri",
        "🥉 3-O'rin: 300,000 So'm Chegirma Vafcheri"
      ],
      rules: [
        "Vaqt davomiyligi: 70 daqiqa.",
        "Savollarda formulalar va xalqaro SAT uslubi qo'llanilgan.",
        "Natijalar rasmiy 1600 shkala bo'yicha e'lon qilinadi."
      ],
      participantsCount: 38,
      scoringScale: "1600 Ballik SAT Shkalasi",
      questions: [
        {
          id: "intl_q_1",
          question_text: "If $f(x) = 2x + 7$ and $g(x) = x^2 - 3$, what is the value of $f(g(3))$?",
          question_type: "multiple_choice",
          options: { A: "19", B: "21", C: "23", D: "25" },
          correct_answer: "A",
          explanation: "g(3) = 3^2 - 3 = 6. f(6) = 2(6) + 7 = 19.",
          points: 10,
          category: "sat_math"
        },
        {
          id: "intl_q_2",
          question_text: "In the xy-plane, the graph of $y = 3x^2 - 12x + 7$ has its vertex at $(h, k)$. What is the value of $h$?",
          question_type: "grid_in",
          correct_answer: "2",
          accepted_answers: ["2", "2.0"],
          explanation: "h = -b / (2a) = 12 / (2 * 3) = 2.",
          points: 10,
          category: "sat_math"
        },
        {
          id: "intl_q_3",
          question_text: "A circle in the xy-plane has equation $(x - 3)^2 + (y + 5)^2 = 49$. What is the radius of the circle?",
          question_type: "multiple_choice",
          options: { A: "7", B: "14", C: "49", D: "3.5" },
          correct_answer: "A",
          explanation: "r^2 = 49 => r = 7.",
          points: 10,
          category: "sat_math"
        },
        {
          id: "intl_q_4",
          question_text: "The function $p(t) = 500(1.08)^t$ models the population of a species after $t$ years. By what percentage does the population increase each year?",
          question_type: "multiple_choice",
          options: { A: "8%", B: "80%", C: "1.08%", D: "0.08%" },
          correct_answer: "A",
          explanation: "Growth factor is 1 + r = 1.08 => r = 0.08 = 8%.",
          points: 10,
          category: "sat_math"
        },
        {
          id: "intl_q_5",
          question_text: "If $4x - 3y = 12$ and $x = 3$, what is the value of $y$?",
          question_type: "grid_in",
          correct_answer: "0",
          accepted_answers: ["0", "0.0"],
          explanation: "4(3) - 3y = 12 => 12 - 3y = 12 => -3y = 0 => y = 0.",
          points: 10,
          category: "sat_math"
        }
      ],
      created_at: new Date().toISOString()
    }
  ];
}

function loadNationalTournaments(): AdminTournament[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(NATIONAL_FILE)) {
      const content = fs.readFileSync(NATIONAL_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__national_tournaments_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading national tournaments file:', err);
  }

  // Load defaults if empty
  const defaults = getDefaultNationalTournaments();
  saveNationalTournaments(defaults);
  return defaults;
}

function saveNationalTournaments(list: AdminTournament[]) {
  globalThis.__national_tournaments_cache = list;
  try {
    ensureDataFiles();
    fs.writeFileSync(NATIONAL_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing national tournaments file:', err);
  }
}

function loadIntlTournaments(): InternationalTournament[] {
  try {
    ensureDataFiles();
    if (fs.existsSync(INTL_FILE)) {
      const content = fs.readFileSync(INTL_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__intl_tournaments_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading international tournaments file:', err);
  }

  // Load defaults if empty
  const defaults = getDefaultIntlTournaments();
  saveIntlTournaments(defaults);
  return defaults;
}

function saveIntlTournaments(list: InternationalTournament[]) {
  globalThis.__intl_tournaments_cache = list;
  try {
    ensureDataFiles();
    fs.writeFileSync(INTL_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing international tournaments file:', err);
  }
}

// ── GET /api/tournaments?type=national|international&id=... ──
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'national';
  const id = searchParams.get('id');

  if (type === 'international') {
    const list = loadIntlTournaments();
    if (id) {
      const item = list.find((t) => t.id === id);
      return NextResponse.json({ tournament: item || null });
    }
    return NextResponse.json(
      { tournaments: list },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }

  const list = loadNationalTournaments();
  if (id) {
    const item = list.find((t) => t.id === id);
    return NextResponse.json({ tournament: item || null });
  }

  return NextResponse.json(
    { tournaments: list },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

// ── POST /api/tournaments ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type || (body.tournament?.category ? 'international' : 'national');
    const tournament = body.tournament || body;

    if (!tournament) {
      return NextResponse.json({ error: 'Missing tournament payload' }, { status: 400 });
    }

    if (type === 'international') {
      const list = loadIntlTournaments();
      const id = tournament.id || `intl_${Date.now()}`;
      const category = tournament.category || 'sat';
      const categoryLabel =
        category === 'sat'
          ? 'SAT Digital'
          : category === 'amc'
          ? 'AMC Math'
          : category === 'ielts'
          ? 'IELTS Arena'
          : 'Xalqaro';

      const fullIntl: InternationalTournament = {
        id,
        title: tournament.title || 'Yangi Xalqaro Musobaqa',
        category,
        categoryLabel,
        subject: tournament.subject || 'SAT Math & Reading',
        description: tournament.description || '',
        badge: tournament.badge || '🔥 XALQARO ARENA',
        badgeBg: tournament.badgeBg || 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white',
        status: tournament.status || 'upcoming',
        startDate: tournament.startDate || new Date().toISOString().split('T')[0],
        startTime: tournament.startTime || '15:00',
        endDate: tournament.endDate,
        endTime: tournament.endTime,
        durationMinutes: Number(tournament.durationMinutes) || 60,
        totalQuestions: tournament.questions?.length ?? tournament.totalQuestions ?? 0,
        entryCoins: Number(tournament.entryCoins) || 0,
        prizePool: tournament.prizePool || "Top o'rinlar uchun mukofotlar",
        topPrizes: tournament.topPrizes || [
          "🥇 1-O'rin: Xalqaro Grant & Sertifikat",
          "🥈 2-O'rin: 500,000 So'm Vafcher",
          "🥉 3-O'rin: 300,000 So'm Vafcher",
        ],
        rules: tournament.rules || [
          'Test davomiyligi belgilangan vaqtda yakunlanadi.',
          'Yopiq savollarda faqat son yoki kasr kiritilishi lozim.',
          "Natijalar xalqaro shkala bo'yicha hisoblanadi.",
        ],
        participantsCount: Number(tournament.participantsCount) || 0,
        questions: tournament.questions || [],
        scoringScale:
          tournament.scoringScale ||
          (category === 'sat' ? '1600 Ballik SAT Shkalasi' : '100 Ballik Shkala'),
        created_at: tournament.created_at || new Date().toISOString(),
      };

      const existingIndex = list.findIndex((t) => t.id === id);
      let updatedList: InternationalTournament[];
      if (existingIndex >= 0) {
        updatedList = [...list];
        updatedList[existingIndex] = { ...updatedList[existingIndex], ...fullIntl };
      } else {
        updatedList = [fullIntl, ...list];
      }

      saveIntlTournaments(updatedList);
      return NextResponse.json({ success: true, data: fullIntl });
    }

    // National Tournament
    const list = loadNationalTournaments();
    const id = tournament.id || `tourn_${Date.now()}`;
    const fullNational: AdminTournament = {
      id,
      title: tournament.title || 'Yangi Musobaqa',
      subject: tournament.subject || 'Matematika',
      description: tournament.description || '',
      status: tournament.status || 'upcoming',
      startDate: tournament.startDate || new Date().toISOString().split('T')[0],
      startTime: tournament.startTime || '12:00',
      endDate: tournament.endDate || new Date().toISOString().split('T')[0],
      endTime: tournament.endTime || '18:00',
      durationMinutes: Number(tournament.durationMinutes) || 60,
      totalQuestions: tournament.questions?.length ?? tournament.totalQuestions ?? 0,
      entryCoins: Number(tournament.entryCoins) || 0,
      prizePool: tournament.prizePool || "1,000,000 SO'M",
      topPrizes: tournament.topPrizes || [
        "1-O'rin: 1,000,000 So'm + Oltin Medal",
        "2-O'rin: 300,000 So'm + Kumush Medal",
        "3-O'rin: 200,000 So'm + Bronza Medal",
      ],
      rules: tournament.rules || [
        'Vaqt chegaralangan.',
        "G'oliblar ball va sarflangan vaqtga qarab aniqlanadi.",
      ],
      participantsCount: Number(tournament.participantsCount) || 0,
      questions: tournament.questions || [],
      created_at: tournament.created_at || new Date().toISOString(),
    };

    const existingIndex = list.findIndex((t) => t.id === id);
    let updatedList: AdminTournament[];
    if (existingIndex >= 0) {
      updatedList = [...list];
      updatedList[existingIndex] = { ...updatedList[existingIndex], ...fullNational };
    } else {
      updatedList = [fullNational, ...list];
    }

    saveNationalTournaments(updatedList);
    return NextResponse.json({ success: true, data: fullNational });
  } catch (error: any) {
    console.error('Error saving tournament:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// ── DELETE /api/tournaments?id=...&type=national|international ──
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'national';

    if (!id) {
      return NextResponse.json({ error: 'Missing tournament id' }, { status: 400 });
    }

    if (type === 'international') {
      const list = loadIntlTournaments();
      const updatedList = list.filter((t) => t.id !== id);
      saveIntlTournaments(updatedList);
      return NextResponse.json({ success: true });
    }

    const list = loadNationalTournaments();
    const updatedList = list.filter((t) => t.id !== id);
    saveNationalTournaments(updatedList);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
