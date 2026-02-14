const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zgvpbxyakiugenrdygzr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_veUH39ObshTiuP8otgqZVQ_pmedeXXY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugRLS() {
    console.log('🔍 RLS Debug Report\n');
    console.log('='.repeat(60));

    try {
        // 1. Check current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.log('❌ Not logged in or auth error');
            console.log('   Please login first at http://localhost:3000/login');
            return;
        }

        console.log('✅ User logged in:');
        console.log('   ID:', user.id);
        console.log('   Email:', user.email || 'N/A');

        // 2. Check user's role in profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name, phone')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.log('\n❌ Profile fetch error:');
            console.log('   ', profileError.message);
        } else {
            console.log('\n✅ User profile:');
            console.log('   Name:', profile.full_name);
            console.log('   Phone:', profile.phone);
            console.log('   Role:', profile.role);
            console.log('   ⚠️  Role must be: admin, teacher, or staff');

            if (!['admin', 'teacher', 'staff'].includes(profile.role)) {
                console.log('\n❌ PROBLEM FOUND!');
                console.log('   Your role is:', profile.role);
                console.log('   Required roles: admin, teacher, staff');
                console.log('\n📋 To fix:');
                console.log('   Run this SQL in Supabase Dashboard:');
                console.log(`   UPDATE profiles SET role = 'admin' WHERE id = '${user.id}';`);
            }
        }

        // 3. Test exam insertion
        console.log('\n' + '='.repeat(60));
        console.log('Testing RLS policy...\n');

        const { data: testExam, error: examError } = await supabase
            .from('exams')
            .insert({
                title: 'RLS Test',
                date: '2026-02-15',
                max_score: 100,
                type: 'quiz',
                status: 'upcoming'
            })
            .select()
            .single();

        if (examError) {
            console.log('❌ RLS Policy ERROR:');
            console.log('   ', examError.message);
            console.log('\n📋 Possible causes:');
            console.log('   1. Migration not applied yet');
            console.log('   2. User role is not admin/teacher/staff');
            console.log('   3. Policy name mismatch');
            console.log('\n🔧 Solutions:');
            console.log('   • Apply migration in Supabase Dashboard SQL Editor');
            console.log('   • Update user role to admin/teacher/staff');
            console.log('   • Check Supabase Dashboard > Authentication > Policies');
        } else {
            console.log('✅ RLS policies working!');
            console.log('   Created exam:', testExam.title);

            // Clean up
            await supabase.from('exams').delete().eq('id', testExam.id);
            console.log('   (Test exam deleted)');
        }

    } catch (err) {
        console.error('\n❌ Unexpected error:', err.message);
    }

    console.log('\n' + '='.repeat(60));
}

debugRLS();
