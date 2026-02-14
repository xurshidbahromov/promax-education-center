'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function RLSDiagnosticPage() {
    const [report, setReport] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        const logs: string[] = [];
        const supabase = createClient();

        try {
            logs.push('🔍 RLS Diagnostic Report');
            logs.push('='.repeat(60));

            // 1. Check user
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                logs.push('❌ Not authenticated');
                logs.push('Please login first');
                setReport(logs);
                setLoading(false);
                return;
            }

            logs.push(`✅ User: ${user.email || user.id}`);

            // 2. Check profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, full_name, phone')
                .eq('id', user.id)
                .single();

            if (profileError) {
                logs.push(`❌ Profile error: ${profileError.message}`);
            } else {
                logs.push(`✅ Profile loaded:`);
                logs.push(`   Name: ${profile.full_name}`);
                logs.push(`   Phone: ${profile.phone}`);
                logs.push(`   Role: ${profile.role}`);

                if (!['admin', 'teacher', 'staff'].includes(profile.role)) {
                    logs.push('');
                    logs.push('❌ ROLE PROBLEM!');
                    logs.push(`   Current role: ${profile.role}`);
                    logs.push('   Required: admin, teacher, or staff');
                    logs.push('');
                    logs.push('🔧 Fix in Supabase Dashboard:');
                    logs.push(`   UPDATE profiles SET role = 'admin' WHERE id = '${user.id}';`);
                }
            }

            logs.push('');
            logs.push('Testing RLS policy...');

            // 3. Test exam insert
            const { data: testExam, error: examError } = await supabase
                .from('exams')
                .insert({
                    title: 'RLS Diagnostic Test',
                    date: '2026-02-15',
                    max_score: 100,
                    type: 'quiz',
                    status: 'upcoming'
                })
                .select()
                .single();

            if (examError) {
                logs.push('❌ RLS Policy FAILED');
                logs.push(`   Error: ${examError.message}`);
                logs.push('');
                logs.push('📋 Possible causes:');
                logs.push('   1. Migration not applied');
                logs.push('   2. Wrong user role');
                logs.push('   3. Auth token issue');
            } else {
                logs.push('✅ RLS policy working!');
                logs.push(`   Created exam: ${testExam.title}`);

                // Cleanup
                await supabase.from('exams').delete().eq('id', testExam.id);
                logs.push('   (Test exam deleted)');
            }

        } catch (err: any) {
            logs.push(`❌ Error: ${err.message}`);
        }

        logs.push('='.repeat(60));
        setReport(logs);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">RLS Diagnostic Tool</h1>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-200 dark:border-slate-800">
                    {loading ? (
                        <p>Running diagnostics...</p>
                    ) : (
                        <pre className="text-sm font-mono whitespace-pre-wrap">
                            {report.join('\n')}
                        </pre>
                    )}
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => {
                            setLoading(true);
                            runDiagnostics();
                        }}
                        className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-600"
                    >
                        Run Again
                    </button>
                </div>
            </div>
        </div>
    );
}
