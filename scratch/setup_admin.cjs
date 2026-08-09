const { createClient } = require('./node_modules/@supabase/supabase-js');

const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const targetPhone = '+998955137776';
  const targetEmail = '998955137776@promax.uz';
  const targetPassword = 'Admin123!';
  const targetName = 'Bosh Admin';

  console.log("Setting up main admin:", targetPhone);

  // 1. Try sign in first
  let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: targetPassword,
  });

  let userId = signInData?.user?.id;

  if (!userId) {
    // Try sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: targetEmail,
      password: targetPassword,
      options: {
        data: {
          full_name: targetName,
          role: 'admin',
        }
      }
    });
    if (authError) {
      console.log("Auth notice:", authError.message);
    }
    userId = authData?.user?.id;
  }

  if (userId) {
    console.log("Admin User ID:", userId);
    // Upsert admin profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: targetName,
      phone: targetPhone,
      role: 'admin',
      coins: 1000,
    });

    if (profileErr) {
      console.error("Profile upsert error:", profileErr.message);
    } else {
      console.log("✅ Admin profile successfully created/updated!");
    }

    // Delete other profiles
    const { error: deleteErr } = await supabase
      .from('profiles')
      .delete()
      .neq('id', userId);

    if (deleteErr) {
      console.log("Delete profiles note:", deleteErr.message);
    } else {
      console.log("✅ Other profiles cleaned up!");
    }
  } else {
    console.error("Failed to get Admin User ID:", signInError?.message);
  }
}

main();
