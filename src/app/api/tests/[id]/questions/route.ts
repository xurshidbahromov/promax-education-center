import { NextRequest, NextResponse } from 'next/server';
import { createClient, createTelegramBotClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await context.params;
    if (!testId) {
      return NextResponse.json({ error: 'Missing testId' }, { status: 400 });
    }

    // Verify caller is authenticated
    const sessionClient = await createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = await createTelegramBotClient();

    // Ensure test exists and is either published or caller is admin/teacher
    const { data: test, error: testError } = await adminClient
      .from('tests')
      .select('id, is_published')
      .eq('id', testId)
      .maybeSingle();

    if (testError || !test) {
      return NextResponse.json({ questions: [] }, { status: 404 });
    }

    if (!test.is_published) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      const allowed = ['admin', 'teacher', 'staff', 'superadmin'];
      if (!profile || !allowed.includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const { data: questions, error: qError } = await adminClient
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_index', { ascending: true });

    if (qError) {
      console.error('[API /api/tests/[id]/questions] Error:', qError.message);
      return NextResponse.json({ questions: [], error: qError.message }, { status: 500 });
    }

    return NextResponse.json(
      { questions: questions || [] },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: any) {
    console.error('[API /api/tests/[id]/questions] Exception:', err);
    return NextResponse.json({ questions: [], error: err?.message || 'Server error' }, { status: 500 });
  }
}
