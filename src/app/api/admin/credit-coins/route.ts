import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    // Verify caller has admin/staff role
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!callerProfile || !['admin', 'staff', 'superadmin'].includes(callerProfile.role)) {
      return NextResponse.json({ error: "Ruxsat berilmagan (Faqat adminlar uchun)" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, coinsToAdd, orderId, status } = body;

    if (!studentId || typeof coinsToAdd !== 'number' || coinsToAdd <= 0) {
      return NextResponse.json({ error: 'studentId and positive coinsToAdd required' }, { status: 400 });
    }

    // 1. Fetch student current profile
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, coins')
      .eq('id', studentId)
      .single();

    if (pErr || !profile) {
      return NextResponse.json({ error: 'Talaba profili topilmadi' }, { status: 404 });
    }

    // 2. Atomic update of coins via Postgres RPC or fallback
    let newBalance = (profile.coins || 0) + coinsToAdd;
    const { data: rpcBalance, error: rpcErr } = await supabase.rpc('increment_student_coins', {
      p_student_id: studentId,
      p_amount: coinsToAdd,
    });

    if (!rpcErr && typeof rpcBalance === 'number') {
      newBalance = rpcBalance;
    } else {
      // Fallback if RPC is not yet executed in database
      const { error: uErr } = await supabase
        .from('profiles')
        .update({ coins: newBalance, updated_at: new Date().toISOString() })
        .eq('id', studentId);

      if (uErr) {
        console.error('[Credit Coins API] DB update error:', uErr);
        return NextResponse.json({ error: uErr.message }, { status: 500 });
      }
    }

    // 3. Update shop order status if orderId provided, or record bonus transaction
    if (orderId) {
      await supabase
        .from('shop_orders')
        .update({ status: status || 'delivered' })
        .eq('id', orderId);
    } else {
      await supabase.from('shop_orders').insert({
        student_id: studentId,
        coins_spent: 0,
        status: 'delivered',
        notes: body.reason ? `Bonus (${body.reason}): +${coinsToAdd} coin` : `Bonus: +${coinsToAdd} coin`
      });
    }

    // 4. Send in-app notification to student
    try {
      await supabase.from('notifications').insert({
        user_id: studentId,
        title: "Coin balansingiz to'ldirildi! 💎",
        message: `Hisobingizga ${coinsToAdd} coin muvaffaqiyatli qo'shildi. Yangi balansingiz: ${newBalance} coin.`,
        type: 'coin_credit',
        is_read: false
      });
    } catch (nErr) {
      console.log('Notification skipped:', nErr);
    }

    return NextResponse.json({
      success: true,
      newBalance,
      coinsAdded: coinsToAdd,
      studentName: profile.full_name
    });
  } catch (error: any) {
    console.error('[Credit Coins API] Fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
