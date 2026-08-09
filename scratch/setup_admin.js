const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

async function main() {
  const targetPhone = '+998955137776';
  const targetEmail = '998955137776@promax.uz';
  const targetPassword = 'Admin123!';
  const targetName = 'Bosh Admin';

  console.log("Authenticating Bosh Admin...");

  // Sign in to get access token
  const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: targetEmail,
      password: targetPassword
    })
  });
  const signInData = await signInRes.json();
  const accessToken = signInData?.access_token;
  const userId = signInData?.user?.id;

  if (!userId || !accessToken) {
    console.error("Could not obtain access token:", signInData);
    return;
  }

  console.log("✅ Authenticated Bosh Admin:", userId);

  // Update profile using user's access token
  const upsertProfileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      full_name: targetName,
      phone: targetPhone,
      role: 'admin'
    })
  });

  if (upsertProfileRes.ok) {
    const updatedProfile = await upsertProfileRes.json();
    console.log("✅ Admin profile successfully updated:", updatedProfile);
  } else {
    // If patch returns empty, try insert
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: userId,
        full_name: targetName,
        phone: targetPhone,
        role: 'admin',
        coins: 1000
      })
    });
    console.log("Profile insert status:", insertRes.status, await insertRes.text());
  }

  // Delete all non-admin profiles
  const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=neq.${userId}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  console.log("Delete test profiles status:", deleteRes.status, await deleteRes.text());
}

main();
