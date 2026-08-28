import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_TOURNAMENTS, AdminTournament } from '@/lib/tournaments';
import { INITIAL_INTERNATIONAL_TOURNAMENTS, InternationalTournament } from '@/lib/international-tournaments';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Global memory cache for instant cross-user and cross-request synchronization
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

  if (!fs.existsSync(NATIONAL_FILE)) {
    fs.writeFileSync(NATIONAL_FILE, JSON.stringify(INITIAL_TOURNAMENTS, null, 2), 'utf8');
  }

  if (!fs.existsSync(INTL_FILE)) {
    fs.writeFileSync(INTL_FILE, JSON.stringify(INITIAL_INTERNATIONAL_TOURNAMENTS, null, 2), 'utf8');
  }
}

function loadNationalTournaments(): AdminTournament[] {
  if (globalThis.__national_tournaments_cache && Array.isArray(globalThis.__national_tournaments_cache)) {
    return globalThis.__national_tournaments_cache;
  }

  try {
    ensureDataFiles();
    if (fs.existsSync(NATIONAL_FILE)) {
      const content = fs.readFileSync(NATIONAL_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        globalThis.__national_tournaments_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading national tournaments file:', err);
  }

  globalThis.__national_tournaments_cache = [...INITIAL_TOURNAMENTS];
  return globalThis.__national_tournaments_cache;
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
  if (globalThis.__intl_tournaments_cache && Array.isArray(globalThis.__intl_tournaments_cache)) {
    return globalThis.__intl_tournaments_cache;
  }

  try {
    ensureDataFiles();
    if (fs.existsSync(INTL_FILE)) {
      const content = fs.readFileSync(INTL_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        globalThis.__intl_tournaments_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading international tournaments file:', err);
  }

  globalThis.__intl_tournaments_cache = [...INITIAL_INTERNATIONAL_TOURNAMENTS];
  return globalThis.__intl_tournaments_cache;
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
