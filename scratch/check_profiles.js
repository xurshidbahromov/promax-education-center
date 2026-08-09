const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

// Sign in as Bosh Admin to check all profiles
async function main() {
  // Sign in as admin
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '998955137776@promax.uz', password: 'Admin123!' })
  });
  const { access_token, user } = await signInRes.json();

  if (!access_token) {
    console.error('Sign in failed');
    return;
  }

  // Get ALL profiles from DB
  const profilesRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,phone,role,telegram_id,telegram_username,created_at`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    }
  });
  const profiles = await profilesRes.json();
  console.log('\n=== ALL PROFILES IN DATABASE ===');
  console.table(profiles.map(p => ({
    id: p.id.substring(0, 8) + '...',
    name: p.full_name,
    phone: p.phone,
    role: p.role,
    telegram_id: p.telegram_id,
    telegram_username: p.telegram_username
  })));
  console.log(`\nTotal: ${profiles.length} profile(s)`);
}

main();
