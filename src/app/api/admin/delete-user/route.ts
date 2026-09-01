import { NextRequest, NextResponse } from 'next/server';
import { createClient, createTelegramBotClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verify caller session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    // 2. Verify caller has admin/staff privileges
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (!callerProfile || !['admin', 'staff', 'superadmin'].includes(callerProfile.role)) {
      return NextResponse.json({ error: "Faqat adminlar o'chirish huquqiga ega" }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: "userId talab qilinadi" }, { status: 400 });
    }

    // Prevent deleting oneself
    if (user.id === userId) {
      return NextResponse.json({ error: "O'z akkauntingizni o'chira olmaysiz" }, { status: 400 });
    }

    const botClient = await createTelegramBotClient();

    // 3. Check target user
    const { data: targetProfile, error: targetError } = await botClient
      .from('profiles')
      .select('id, full_name, role, telegram_id, phone')
      .eq('id', userId)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    // Prevent deleting superadmin
    if (targetProfile.role === 'superadmin' || targetProfile.phone?.includes('955137776')) {
      return NextResponse.json({ error: "Bosh admin akkauntini o'chirib bo'lmaydi" }, { status: 403 });
    }

    // 4. Try RPC delete_user_by_admin first (if SQL migration was executed)
    try {
      const { data: rpcResult, error: rpcError } = await botClient.rpc('delete_user_by_admin', {
        target_user_id: userId
      });

      if (!rpcError && rpcResult) {
        if (rpcResult.success) {
          return NextResponse.json({
            success: true,
            message: rpcResult.message || `"${targetProfile.full_name || 'Foydalanuvchi'}" muvaffaqiyatli o'chirildi`
          });
        } else if (rpcResult.error) {
          return NextResponse.json({ error: rpcResult.error }, { status: 400 });
        }
      }
    } catch {
      // RPC not yet installed or failed, proceed with fallback
    }

    // Check if SUPABASE_SERVICE_ROLE_KEY is available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let activeClient = botClient;

    if (serviceRoleKey) {
      const { createClient: createSupabaseJsClient } = await import('@supabase/supabase-js');
      activeClient = createSupabaseJsClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
    }

    // 5. Null out non-cascade creator FK references
    await activeClient.from('tests').update({ created_by: null }).eq('created_by', userId);
    await activeClient.from('announcements').update({ created_by: null }).eq('created_by', userId);
    await activeClient.from('groups').update({ teacher_id: null }).eq('teacher_id', userId);

    // 6. Clean up associated child tables
    await activeClient.from('parent_students').delete().eq('student_id', userId);
    if (targetProfile.telegram_id) {
      await activeClient.from('parent_students').delete().eq('parent_telegram_id', targetProfile.telegram_id);
    }
    await activeClient.from('group_students').delete().eq('student_id', userId);
    await activeClient.from('attendance').delete().eq('student_id', userId);
    await activeClient.from('payments').delete().eq('student_id', userId);
    await activeClient.from('shop_orders').delete().eq('student_id', userId);
    await activeClient.from('notifications').delete().eq('user_id', userId);
    await activeClient.from('results').delete().eq('student_id', userId);
    await activeClient.from('tournament_results').delete().eq('student_id', userId);
    await activeClient.from('tournament_registrations').delete().eq('student_id', userId);
    await activeClient.from('tournament_comments').update({ user_id: null }).eq('user_id', userId);

    // Fetch attempt IDs to delete responses
    const { data: attempts } = await activeClient
      .from('test_attempts')
      .select('id')
      .eq('student_id', userId);

    if (attempts && attempts.length > 0) {
      const attemptIds = attempts.map(a => a.id);
      await activeClient.from('question_responses').delete().in('attempt_id', attemptIds);
      await activeClient.from('test_attempts').delete().eq('student_id', userId);
    }

    // 7. Delete profile from profiles table
    const { data: deletedRows, error: deleteProfileError } = await activeClient
      .from('profiles')
      .delete()
      .eq('id', userId)
      .select('id');

    if (deleteProfileError) {
      console.error('[Delete User API] Delete error:', deleteProfileError);
      return NextResponse.json({ error: deleteProfileError.message }, { status: 500 });
    }

    if (!deletedRows || deletedRows.length === 0) {
      console.warn('[Delete User API] 0 rows deleted from profiles due to RLS.');
      return NextResponse.json({ 
        error: "Foydalanuvchini bazadan o'chirish bloklandi. Supabase SQL Editor'da 028_fix_admin_delete_user.sql skriptini ishga tushiring." 
      }, { status: 403 });
    }

    // 8. If service role is available, also delete from auth.users
    if (serviceRoleKey) {
      try {
        await (activeClient as any).auth.admin.deleteUser(userId);
      } catch (authDelErr) {
        console.warn('[Delete User API] auth.admin.deleteUser warning:', authDelErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `"${targetProfile.full_name || 'Foydalanuvchi'}" muvaffaqiyatli o'chirildi` 
    });

  } catch (error: any) {
    console.error('[Delete User API] Fatal error:', error);
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}
