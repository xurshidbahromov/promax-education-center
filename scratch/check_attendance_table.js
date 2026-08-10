const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTables() {
  await supabase.auth.signInWithPassword({ email: '998955137776@promax.uz', password: 'Admin123!' });

  const { data: attData, error: attErr } = await supabase.from('attendance').select('*').limit(1);
  console.log('attendance table:', attData, attErr);

  const { data: hwData, error: hwErr } = await supabase.from('homework').select('*').limit(1);
  console.log('homework table:', hwData, hwErr);
}

checkTables();
