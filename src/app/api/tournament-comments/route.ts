import { NextRequest, NextResponse } from 'next/server';
import { createClient, createTelegramBotClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const UZ_SHORT_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

function formatRelativeUzTime(iso?: string | null): string {
  if (!iso) return 'Yaqinda';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Yaqinda';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'Hozirgina';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} daq oldin`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} soat oldin`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} kun oldin`;
  const uz = new Date(d.getTime() + 5 * 60 * 60 * 1000);
  return `${uz.getUTCDate()}-${UZ_SHORT_MONTHS[uz.getUTCMonth()]}`;
}

export interface TournamentComment {
  id: string;
  category: 'olympiad' | 'international';
  tournament_id?: string;
  author: string;
  avatar?: string | null;
  role: string;
  time: string;
  text: string;
  likes: number;
  user_id?: string;
  created_at: string;
}

// Global in-memory cache for instant cross-device and cross-request sync
declare global {
  var __tournament_comments_cache: TournamentComment[] | undefined;
}

const COMMENTS_FILE = path.join(process.cwd(), 'src/data/tournament_comments.json');

function loadAllComments(): TournamentComment[] {
  if (globalThis.__tournament_comments_cache && globalThis.__tournament_comments_cache.length > 0) {
    return globalThis.__tournament_comments_cache;
  }

  try {
    if (fs.existsSync(COMMENTS_FILE)) {
      const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__tournament_comments_cache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading comments file:', err);
  }

  globalThis.__tournament_comments_cache = [];
  return [];
}

function persistComments(comments: TournamentComment[]) {
  globalThis.__tournament_comments_cache = comments;
  try {
    const dir = path.dirname(COMMENTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing comments file:', err);
  }
}

// GET /api/tournament-comments?category=olympiad
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'olympiad';
  const tournamentId = searchParams.get('tournament_id');

  // 1. Try Supabase first
  try {
    const supabase = await createTelegramBotClient();
    let query = supabase
      .from('tournament_comments')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }

    const { data, error } = await query;
    if (!error && data) {
      const normalized = data.map((row: any) => ({
        ...row,
        time: formatRelativeUzTime(row.created_at),
      }));
      return NextResponse.json(
        { comments: normalized },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }
  } catch (err) {
    // Supabase query fallback
  }

  // 2. Global Server Store fallback
  let list = loadAllComments();
  list = list.filter((c) => c.category === category);
  if (tournamentId) {
    list = list.filter((c) => !c.tournament_id || c.tournament_id === tournamentId);
  }

  return NextResponse.json(
    { comments: list },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

// POST /api/tournament-comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category = 'olympiad', tournament_id, author, avatar, role = "O'quvchi", text, user_id } = body;

    const cleanText = String(text || '').trim().slice(0, 500);
    if (!cleanText || !author) {
      return NextResponse.json({ error: 'Text and author are required' }, { status: 400 });
    }

    const newComment: TournamentComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category: category as 'olympiad' | 'international',
      tournament_id: tournament_id || undefined,
      author: String(author).trim().slice(0, 80),
      avatar: avatar || null,
      role: role || "O'quvchi",
      time: "Hozirgina",
      text: cleanText,
      likes: 0,
      user_id: user_id || undefined,
      created_at: new Date().toISOString()
    };

    // 1. Try inserting to Supabase
    try {
      const supabase = await createTelegramBotClient();
      const { data, error } = await supabase
        .from('tournament_comments')
        .insert({
          id: newComment.id,
          category: newComment.category,
          tournament_id: newComment.tournament_id,
          author: newComment.author,
          avatar: newComment.avatar,
          role: newComment.role,
          text: newComment.text,
          likes: newComment.likes,
          user_id: newComment.user_id,
          created_at: newComment.created_at
        })
        .select()
        .single();

      if (!error && data) {
        const formatted = { ...data, time: 'Hozirgina' };
        // Also keep local cache in sync
        const all = loadAllComments();
        all.unshift(formatted);
        persistComments(all);

        return NextResponse.json({ comment: formatted });
      }
    } catch (e) {}

    // 2. Global Server Store fallback
    const all = loadAllComments();
    all.unshift(newComment);
    persistComments(all);

    return NextResponse.json({ comment: newComment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PATCH /api/tournament-comments (Like / Unlike)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId } = body;
    const delta = Number(body.delta) < 0 ? -1 : 1;

    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
    }

    // 1. Try Supabase update
    try {
      const supabase = await createTelegramBotClient();
      const { data: existing } = await supabase
        .from('tournament_comments')
        .select('likes')
        .eq('id', commentId)
        .single();

      if (existing) {
        const newLikes = Math.max(0, (existing.likes || 0) + delta);
        await supabase
          .from('tournament_comments')
          .update({ likes: newLikes })
          .eq('id', commentId);

        const all = loadAllComments();
        const target = all.find((c) => c.id === commentId);
        if (target) {
          target.likes = newLikes;
          persistComments(all);
        }

        return NextResponse.json({ success: true, likes: newLikes });
      }
    } catch (e) {}

    // 2. Global Server Store fallback
    const all = loadAllComments();
    const target = all.find((c) => c.id === commentId);
    if (target) {
      target.likes = Math.max(0, (target.likes || 0) + delta);
      persistComments(all);
      return NextResponse.json({ success: true, likes: target.likes });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/tournament-comments?id=...
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  // Verify caller is authenticated and either comment owner or admin/staff/teacher
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Avtorizatsiya talab qilinadi' }, { status: 401 });
  }

  try {
    const supabase = await createTelegramBotClient();
    const [{ data: profile }, { data: target }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
      supabase.from('tournament_comments').select('id, user_id').eq('id', id).maybeSingle(),
    ]);

    const isPrivileged = ['admin', 'superadmin', 'staff', 'teacher'].includes(profile?.role || '');
    const isOwner = Boolean(target?.user_id && target.user_id === user.id);

    if (target && !isPrivileged && !isOwner) {
      return NextResponse.json({ error: "Faqat o'z izohingizni o'chira olasiz" }, { status: 403 });
    }

    await supabase.from('tournament_comments').delete().eq('id', id);
  } catch (e) {}

  const all = loadAllComments();
  const filtered = all.filter((c) => c.id !== id);
  persistComments(filtered);

  return NextResponse.json({ success: true });
}
