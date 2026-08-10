const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testAttendanceInsert() {
  await supabase.auth.signInWithPassword({ email: '998955137776@promax.uz', password: 'Admin123!' });

  const { data, error } = await supabase.from('attendance').insert({
    group_id: '3dbb2952-9289-4fdb-8bd0-330a42148759',
    student_id: '09cd3dab-46eb-48d0-9dc9-d9152e5e6a12',
    date: '2026-08-10',
    status: 'present',
    homework: 'done'
  });

  console.log('insert test:', data, error);
}

testAttendanceInsert();
