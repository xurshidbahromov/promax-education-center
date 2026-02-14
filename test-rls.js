const { createClient } = require('@supabase/supabase-js');

// Read from .env.local
const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRLSPolicies() {
    console.log('🔍 Testing RLS Policies...\n');

    try {
        // Try to insert a test exam
        const { data, error } = await supabase
            .from('exams')
            .insert({
                title: 'RLS Test Exam',
                date: '2026-02-15',
                max_score: 100,
                type: 'quiz',
                status: 'upcoming'
            })
            .select()
            .single();

        if (error) {
            console.log('❌ RLS Policy ERROR:');
            console.log('   ', error.message);
            console.log('\n⚠️  Migration NOT applied yet!');
            console.log('\n📋 To fix:');
            console.log('   1. Go to: https://supabase.com/dashboard/project/zgvpbxyakiugenrdygzr/sql/new');
            console.log('   2. Copy SQL from: supabase/migrations/007_add_exams_results_rls_policies.sql');
            console.log('   3. Paste and click RUN');
        } else {
            console.log('✅ Success! RLS policies are working!');
            console.log('   Created exam:', data);

            // Clean up test exam
            await supabase.from('exams').delete().eq('id', data.id);
            console.log('   (Test exam deleted)');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

testRLSPolicies();
