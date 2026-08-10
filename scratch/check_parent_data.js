const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

async function checkParentData() {
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '998955137776@promax.uz', password: 'Admin123!' })
  });
  const { access_token } = await signInRes.json();

  const headers = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${access_token}` };

  // Check parent_students
  const psRes = await fetch(`${SUPABASE_URL}/rest/v1/parent_students?select=*`, { headers });
  const ps = await psRes.json();
  console.log('=== PARENT_STUDENTS ===', ps);

  // Check payments
  const payRes = await fetch(`${SUPABASE_URL}/rest/v1/payments?select=*`, { headers });
  const pay = await payRes.json();
  console.log('=== PAYMENTS ===', pay);

  // Check test_attempts
  const taRes = await fetch(`${SUPABASE_URL}/rest/v1/test_attempts?select=*`, { headers });
  const ta = await taRes.json();
  console.log('=== TEST ATTEMPTS ===', ta);

  // Check group_students
  const gsRes = await fetch(`${SUPABASE_URL}/rest/v1/group_students?select=*`, { headers });
  const gs = await gsRes.json();
  console.log('=== GROUP STUDENTS ===', gs);
}

checkParentData();
