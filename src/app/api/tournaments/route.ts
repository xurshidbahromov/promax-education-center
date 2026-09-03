import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBotClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';
import type { AdminTournament } from '@/lib/tournaments';
import type { InternationalTournament } from '@/lib/international-tournaments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to convert Supabase row to frontend AdminTournament
function mapDbToTournament(row: any, liveCount?: number): AdminTournament {
  const storedCount = Number(row.participants_count) || 0;
  const count = liveCount !== undefined ? Math.max(storedCount, liveCount) : storedCount;
  return {
    id: row.id,
    title: row.title || 'Musobaqa',
    subject: row.subject || 'Matematika',
    description: row.description || '',
    status: row.status || 'upcoming',
    startDate: row.start_date || '',
    startTime: row.start_time || '10:00',
    endDate: row.end_date || '',
    endTime: row.end_time || '20:00',
    durationMinutes: Number(row.duration_minutes) || 60,
    totalQuestions: Number(row.total_questions) || (Array.isArray(row.questions) ? row.questions.length : 0),
    entryCoins: Number(row.entry_coins) || 0,
    prizePool: row.prize_pool || '',
    topPrizes: Array.isArray(row.top_prizes) ? row.top_prizes : [],
    rules: Array.isArray(row.rules) ? row.rules : [],
    participantsCount: count,
    questions: Array.isArray(row.questions) ? row.questions : [],
    isPublished: row.is_published ?? true,
    created_at: row.created_at || new Date().toISOString()
  };
}

// Helper to convert Supabase row to frontend InternationalTournament
function mapDbToIntlTournament(row: any, liveCount?: number): InternationalTournament {
  const storedCount = Number(row.participants_count) || 0;
  const count = liveCount !== undefined ? Math.max(storedCount, liveCount) : storedCount;
  return {
    id: row.id,
    title: row.title || 'Xalqaro Musobaqa',
    category: row.category || 'sat',
    categoryLabel: row.category_label || (row.category === 'sat' ? 'SAT Digital' : 'Xalqaro'),
    subject: row.subject || 'SAT Math & Reading',
    description: row.description || '',
    badge: row.badge || '🔥 XALQARO ARENA',
    badgeBg: row.badge_bg || 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white',
    status: row.status || 'upcoming',
    startDate: row.start_date || '',
    startTime: row.start_time || '10:00',
    endDate: row.end_date || '',
    endTime: row.end_time || '20:00',
    durationMinutes: Number(row.duration_minutes) || 60,
    totalQuestions: Number(row.total_questions) || (Array.isArray(row.questions) ? row.questions.length : 0),
    entryCoins: Number(row.entry_coins) || 0,
    prizePool: row.prize_pool || '',
    topPrizes: Array.isArray(row.top_prizes) ? row.top_prizes : [],
    rules: Array.isArray(row.rules) ? row.rules : [],
    participantsCount: count,
    questions: Array.isArray(row.questions) ? row.questions : [],
    scoringScale: row.scoring_scale || (row.category === 'sat' ? '1600 Ballik SAT Shkalasi' : '100 Ballik Shkala'),
    isPublished: row.is_published ?? true,
    created_at: row.created_at || new Date().toISOString()
  };
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

// ── GET /api/tournaments?type=national|international&id=... ──
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'national';
  const id = searchParams.get('id');

  try {
    const supabase = await createTelegramBotClient();
    let query = supabase
      .from('tournaments')
      .select('*')
      .eq('type', type);

    // Fetch live participants count from registrations and results
    const [regRes, resultsRes] = await Promise.all([
      supabase.from('tournament_registrations').select('tournament_id, student_id'),
      supabase.from('tournament_results').select('tournament_id, student_id')
    ]);

    const participantMap = new Map<string, Set<string>>();

    if (regRes.data) {
      for (const r of regRes.data) {
        if (r.tournament_id && r.student_id) {
          if (!participantMap.has(r.tournament_id)) {
            participantMap.set(r.tournament_id, new Set());
          }
          participantMap.get(r.tournament_id)!.add(r.student_id);
        }
      }
    }

    if (resultsRes.data) {
      for (const res of resultsRes.data) {
        if (res.tournament_id && res.student_id) {
          if (!participantMap.has(res.tournament_id)) {
            participantMap.set(res.tournament_id, new Set());
          }
          participantMap.get(res.tournament_id)!.add(res.student_id);
        }
      }
    }

    if (id) {
      query = query.eq('id', id);
      const { data, error } = await query.single();
      if (!error && data) {
        const liveCount = participantMap.get(data.id)?.size || 0;
        const stored = Number(data.participants_count) || 0;
        if (liveCount > stored) {
          supabase.from('tournaments').update({ participants_count: liveCount }).eq('id', data.id).then(() => {}, () => {});
        }
        const mapped = (data.type === 'international' || type === 'international') 
          ? mapDbToIntlTournament(data, liveCount) 
          : mapDbToTournament(data, liveCount);
        return NextResponse.json({ tournament: mapped });
      }
    } else {
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped = data.map((row: any) => {
          const liveCount = participantMap.get(row.id)?.size || 0;
          return type === 'international'
            ? mapDbToIntlTournament(row, liveCount)
            : mapDbToTournament(row, liveCount);
        });

        // Sync participant counts back to tournaments table in background if needed
        for (const row of data) {
          const live = participantMap.get(row.id)?.size || 0;
          const stored = Number(row.participants_count) || 0;
          if (live > stored) {
            supabase.from('tournaments').update({ participants_count: live }).eq('id', row.id).then(() => {}, () => {});
          }
        }

        return NextResponse.json({ tournaments: mapped }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }
    }
  } catch (dbErr) {
    console.warn('[Tournaments API] Supabase query error, fallback to defaults:', dbErr);
  }

  // If table was empty or not ready yet, return defaults
  if (type === 'international') {
    const defaults = getDefaultIntlTournaments();
    if (id) {
      const item = defaults.find(t => t.id === id);
      return NextResponse.json({ tournament: item || null });
    }
    return NextResponse.json({ tournaments: defaults });
  }

  const defaults = getDefaultNationalTournaments();
  if (id) {
    const item = defaults.find(t => t.id === id);
    return NextResponse.json({ tournament: item || null });
  }
  return NextResponse.json({ tournaments: defaults });
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

    const id = tournament.id || (type === 'international' ? `intl_${Date.now()}` : `tourn_${Date.now()}`);

    const dbPayload = {
      id,
      type,
      title: tournament.title || 'Yangi Musobaqa',
      category: tournament.category || (type === 'international' ? 'sat' : null),
      category_label: tournament.categoryLabel || (type === 'international' ? 'SAT Digital' : null),
      subject: tournament.subject || (type === 'international' ? 'SAT Math & Reading' : 'Matematika'),
      description: tournament.description || '',
      badge: tournament.badge || (type === 'international' ? '🔥 XALQARO ARENA' : '🏆 RESPUBLIKA'),
      badge_bg: tournament.badgeBg || (type === 'international' ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white' : ''),
      status: tournament.status || 'upcoming',
      start_date: tournament.startDate || new Date().toISOString().split('T')[0],
      start_time: tournament.startTime || '12:00',
      end_date: tournament.endDate || null,
      end_time: tournament.endTime || null,
      duration_minutes: Number(tournament.durationMinutes) || 60,
      total_questions: Number(tournament.questions?.length ?? tournament.totalQuestions ?? 0),
      entry_coins: Number(tournament.entryCoins) || 0,
      prize_pool: tournament.prizePool || "G'oliblarga sovg'alar",
      top_prizes: Array.isArray(tournament.topPrizes) ? tournament.topPrizes : [],
      rules: Array.isArray(tournament.rules) ? tournament.rules : [],
      participants_count: Number(tournament.participantsCount) || 0,
      questions: Array.isArray(tournament.questions) ? tournament.questions : [],
      scoring_scale: tournament.scoringScale || (type === 'international' ? '1600 Ballik SAT Shkalasi' : '100 Ballik Shkala'),
      is_published: tournament.isPublished ?? true,
      updated_at: new Date().toISOString()
    };

    // Save directly to Supabase
    try {
      const supabase = await createTelegramBotClient();
      const { data, error } = await supabase
        .from('tournaments')
        .upsert(dbPayload, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        const mapped = type === 'international' ? mapDbToIntlTournament(data) : mapDbToTournament(data);
        return NextResponse.json({ success: true, data: mapped });
      }
    } catch (dbErr) {
      console.error('[Tournaments API] Supabase upsert error:', dbErr);
    }

    const fallbackMapped = type === 'international' ? mapDbToIntlTournament(dbPayload) : mapDbToTournament(dbPayload);
    return NextResponse.json({ success: true, data: fallbackMapped });
  } catch (error: any) {
    console.error('[Tournaments API] Error saving tournament:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// ── DELETE /api/tournaments?id=...&type=national|international ──
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing tournament id' }, { status: 400 });
    }

    try {
      const supabase = await createTelegramBotClient();
      await supabase.from('tournaments').delete().eq('id', id);
    } catch (e) {
      console.error('[Tournaments API] Supabase delete error:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Tournaments API] Error deleting tournament:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
