const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testWebhookQueriesWithAdmin() {
  const telegramId = 2064830631;

  // Sign in as admin to bypass RLS restrictions on server side
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: '998955137776@promax.uz',
    password: 'Admin123!'
  });
  console.log('Auth result:', authData?.user?.email, authErr);

  const { data: parentLinks, error: plErr } = await supabase
    .from('parent_students')
    .select('student_id, student:profiles!student_id(id, full_name)')
    .eq('parent_telegram_id', telegramId);

  console.log('parentLinks:', parentLinks, plErr);

  if (parentLinks && parentLinks.length > 0) {
    const studentIds = parentLinks.map(p => p.student_id);
    console.log('studentIds:', studentIds);

    // Test payment query
    const res1 = await supabase
      .from('payments')
      .select('amount, payment_method, month_year, payment_date, student:profiles(full_name)')
      .in('student_id', studentIds);

    console.log('Payment query:', JSON.stringify(res1, null, 2));

    // Test group query
    const res2 = await supabase
      .from('group_students')
      .select('group:groups(name, schedule, subject:subjects(title)), student:profiles(full_name)')
      .in('student_id', studentIds);

    console.log('Group query:', JSON.stringify(res2, null, 2));
  }
}

testWebhookQueriesWithAdmin();
