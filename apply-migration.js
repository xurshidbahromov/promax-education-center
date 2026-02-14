// Quick script to apply RLS migration
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

// Read the migration file
const migrationPath = path.join(__dirname, 'supabase', 'migrations', '007_add_exams_results_rls_policies.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Migration SQL:');
console.log('='.repeat(80));
console.log(sql);
console.log('='.repeat(80));
console.log('\n✅ Migration file ready!');
console.log('\n📌 To apply this migration:');
console.log('1. Go to: https://supabase.com/dashboard/project/zgvpbxyakiugenrdygzr/sql/new');
console.log('2. Copy the SQL above');
console.log('3. Paste and click "Run"');
console.log('\nOr copy from: supabase/migrations/007_add_exams_results_rls_policies.sql');
