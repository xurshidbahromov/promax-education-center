import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import fs from 'fs';
import path from 'path';

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

const COMMENTS_FILE = path.join(process.cwd(), 'src/data/tournament_comments.json');

function getFallbackComments(): TournamentComment[] {
  try {
    if (fs.existsSync(COMMENTS_FILE)) {
      const data = fs.readFileSync(COMMENTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading comments file:', err);
  }
  return [];
}

function saveFallbackComments(comments: TournamentComment[]) {
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

  try {
    const supabase = await createClient();
    let query = supabase
      .from('tournament_comments')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return NextResponse.json({ comments: data });
    }
  } catch (err) {
    // Supabase query fallback
  }

  // Fallback to local server json sync
  let list = getFallbackComments();
  list = list.filter((c) => c.category === category);
  if (tournamentId) {
    list = list.filter((c) => !c.tournament_id || c.tournament_id === tournamentId);
  }
  return NextResponse.json({ comments: list });
}

// POST /api/tournament-comments
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category = 'olympiad', tournament_id, author, avatar, role = "O'quvchi", text, user_id } = body;

    if (!text || !text.trim() || !author) {
      return NextResponse.json({ error: 'Text and author are required' }, { status: 400 });
    }

    const newComment: TournamentComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category: category as 'olympiad' | 'international',
      tournament_id: tournament_id || undefined,
      author: author.trim(),
      avatar: avatar || null,
      role: role || "O'quvchi",
      time: "Hozirgina",
      text: text.trim(),
      likes: 0,
      user_id: user_id || undefined,
      created_at: new Date().toISOString()
    };

    // 1. Try Supabase
    try {
      const supabase = await createClient();
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
        // Also mirror to file fallback
        const all = getFallbackComments();
        all.unshift(data);
        saveFallbackComments(all);
        return NextResponse.json({ comment: data });
      }
    } catch (e) {}

    // 2. Fallback to server sync
    const all = getFallbackComments();
    all.unshift(newComment);
    saveFallbackComments(all);

    return NextResponse.json({ comment: newComment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PATCH /api/tournament-comments (Like / Unlike)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, delta = 1 } = body;

    if (!commentId) {
      return NextResponse.json({ error: 'commentId is required' }, { status: 400 });
    }

    // Try Supabase update
    try {
      const supabase = await createClient();
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

        // Also update in file fallback
        const all = getFallbackComments();
        const target = all.find((c) => c.id === commentId);
        if (target) {
          target.likes = newLikes;
          saveFallbackComments(all);
        }

        return NextResponse.json({ success: true, likes: newLikes });
      }
    } catch (e) {}

    // Fallback sync
    const all = getFallbackComments();
    const target = all.find((c) => c.id === commentId);
    if (target) {
      target.likes = Math.max(0, (target.likes || 0) + delta);
      saveFallbackComments(all);
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

  try {
    const supabase = await createClient();
    await supabase.from('tournament_comments').delete().eq('id', id);
  } catch (e) {}

  const all = getFallbackComments();
  const filtered = all.filter((c) => c.id !== id);
  saveFallbackComments(filtered);

  return NextResponse.json({ success: true });
}
