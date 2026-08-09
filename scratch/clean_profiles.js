const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

// The ONE true Bosh Admin ID
const BOSH_ADMIN_ID = '276665ec-05e7-4fd5-bedb-84430c6212b8';

async function main() {
  // Sign in as Bosh Admin to get access token
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '998955137776@promax.uz', password: 'Admin123!' })
  });
  const { access_token } = await signInRes.json();

  if (!access_token) {
    console.error('Sign in failed');
    return;
  }
  console.log('✅ Signed in as Bosh Admin');

  // Get all profiles
  const profilesRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,role,telegram_id`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${access_token}` }
  });
  const profiles = await profilesRes.json();
  console.log('\nCurrent profiles:');
  profiles.forEach(p => console.log(`  ${p.id.substring(0,8)}... | ${p.role.padEnd(8)} | ${p.full_name}`));

  // IDs to delete (all except Bosh Admin)
  const toDelete = profiles.filter(p => p.id !== BOSH_ADMIN_ID);
  console.log(`\nDeleting ${toDelete.length} profiles...`);

  for (const profile of toDelete) {
    // 1. First NULL out their FK references in tests, announcements etc.
    await fetch(`${SUPABASE_URL}/rest/v1/tests?created_by=eq.${profile.id}`, {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ created_by: null })
    });

    // 2. Delete their profile
    const delRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${profile.id}`, {
      method: 'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${access_token}` }
    });
    console.log(`  Deleted profile: ${profile.full_name} (${profile.role}) — HTTP ${delRes.status}`);
  }

  // Verify remaining
  const remainingRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,role,telegram_id`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${access_token}` }
  });
  const remaining = await remainingRes.json();
  console.log('\n=== REMAINING PROFILES ===');
  remaining.forEach(p => console.log(`  ✅ ${p.full_name} | role: ${p.role} | telegram_id: ${p.telegram_id}`));
}

main();
