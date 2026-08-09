const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

async function main() {
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '998955137776@promax.uz', password: 'Admin123!' })
  });
  const { access_token } = await signInRes.json();

  const profilesRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,role,telegram_id`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${access_token}` }
  });
  const profiles = await profilesRes.json();
  console.log('\n=== DATABASE PROFILES ===');
  console.table(profiles.map(p => ({ id: p.id.substring(0,8)+'...', name: p.full_name, role: p.role, telegram_id: p.telegram_id })));
}
main();
