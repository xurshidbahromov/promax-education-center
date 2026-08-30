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

    // 4. Null out non-cascade creator FK references
    await botClient.from('tests').update({ created_by: null }).eq('created_by', userId);
    await botClient.from('announcements').update({ created_by: null }).eq('created_by', userId);
    await botClient.from('groups').update({ teacher_id: null }).eq('teacher_id', userId);

    // 5. Clean up associated child tables
    await botClient.from('parent_students').delete().eq('student_id', userId);
    if (targetProfile.telegram_id) {
      await botClient.from('parent_students').delete().eq('parent_telegram_id', targetProfile.telegram_id);
    }
    await botClient.from('group_students').delete().eq('student_id', userId);
    await botClient.from('attendance').delete().eq('student_id', userId);
    await botClient.from('payments').delete().eq('student_id', userId);
    await botClient.from('shop_orders').delete().eq('student_id', userId);
    await botClient.from('notifications').delete().eq('user_id', userId);
    await botClient.from('results').delete().eq('student_id', userId);

    // Fetch attempt IDs to delete responses
    const { data: attempts } = await botClient
      .from('test_attempts')
      .select('id')
      .eq('student_id', userId);

    if (attempts && attempts.length > 0) {
      const attemptIds = attempts.map(a => a.id);
      await botClient.from('question_responses').delete().in('attempt_id', attemptIds);
      await botClient.from('test_attempts').delete().eq('student_id', userId);
    }

    // 6. Delete profile from profiles table
    const { error: deleteProfileError } = await botClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.error('[Delete User API] Delete error:', deleteProfileError);
      return NextResponse.json({ error: deleteProfileError.message }, { status: 500 });
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
