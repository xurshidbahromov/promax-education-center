import { createClient } from '@/utils/supabase/client';
import { UserProfile } from './profile';
import directionsData from "@/data/dtm_directions.json";

export interface Student extends UserProfile {
    status?: string; // Derived or placeholder
    course?: string; // Derived or placeholder
    joined_at: string;
}

// Teacher Interface (extending Profile)
export interface Teacher extends UserProfile {
    subjects: string[];
    total_tests: number;
    joined_date: string;
}

// Fetch Teachers
export async function getTeachers(searchTerm: string = ""): Promise<Teacher[]> {
    const supabase = createClient();

    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching teachers:', error);
        return [];
    }

    // Mocking extra fields for now since they don't exist in DB yet
    // In real app, we would parse `settings` column for subjects
    return data.map(profile => ({
        ...profile,
        joined_date: profile.created_at,
        subjects: profile.settings?.subjects || ['Matematika'], // Fallback
        total_tests: 0 // Mock default
    }));
}

// Get Single Teacher
export async function getTeacher(id: string): Promise<Teacher | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'teacher')
        .single();

    if (error || !data) {
        console.error('Error fetching teacher:', error);
        return null;
    }

    return {
        ...data,
        joined_date: data.created_at,
        subjects: data.settings?.subjects || [],
        total_tests: 0
    };
}

// Update Teacher
export async function updateTeacher(id: string, updates: { full_name: string; phone: string; subjects: string[] }): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    // 1. Get current settings to merge
    const { data: profile } = await supabase.from('profiles').select('settings').eq('id', id).single();
    const currentSettings = profile?.settings || {};

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: updates.full_name,
            phone: updates.phone,
            settings: {
                ...currentSettings,
                subjects: updates.subjects
            }
        })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Demote Teacher (Delete)
export async function demoteTeacher(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('profiles')
        .update({ role: 'student' })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Promote user to teacher (by ID)
export async function promoteToTeacher(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    // Update role directly
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'teacher' })
        .eq('id', userId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    return { success: true };
}

export async function getStudents(searchTerm: string = ""): Promise<Student[]> {
    const supabase = createClient();

    let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching students:', error);
        return [];
    }

    return data.map(profile => ({
        ...profile,
        joined_at: profile.created_at,
        status: 'Active', // Placeholder until we have real status
        course: 'N/A' // Placeholder until we have courses
    }));
}

// Get Single Student
export async function getStudent(id: string): Promise<Student | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'student')
        .single();

    if (error || !data) {
        console.error('Error fetching student:', error);
        return null;
    }

    return {
        ...data,
        joined_at: data.created_at,
        status: 'Active',
        course: 'N/A'
    };
}

// Update Student
export async function updateStudent(id: string, updates: { full_name: string; phone: string }): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: updates.full_name,
            phone: updates.phone
        })
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Delete Student (Hard Delete or Deactivate? Let's do Hard Delete for now as per usual admin req, or check constraints)
// Actually, hard deleting a student might cascade delete results. Let's try it, but warn.
export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    // In Supabase, deleting a user from 'auth.users' is the proper way, but we can't do that easily from client SDK without service role.
    // So we will just delete from 'profiles' and let triggers handle it or just leave orphan auth user (not ideal but consistent with current setup).
    // BETTER: Just delete from profiles.

    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function saveExamResult(
    studentId: string,
    examDate: string,
    directionCode: string,
    scores: any
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
        // 1. Find or Create Exam
        let examId;
        const { data: existingExams } = await supabase
            .from('exams')
            .select('id')
            .eq('date', examDate)
            .eq('type', 'dtm')
            .limit(1);

        if (existingExams && existingExams.length > 0) {
            examId = existingExams[0].id;
        } else {
            // Create new exam
            const { data: newExam, error: createExamError } = await supabase
                .from('exams')
                .insert({
                    title: `DTM Mock Exam (${examDate})`,
                    date: examDate,
                    type: 'dtm',
                    status: 'finished',
                    max_score: 189.0
                })
                .select()
                .single();

            if (createExamError) throw new Error('Error creating exam: ' + createExamError.message);
            examId = newExam.id;
        }

        // 2. Find or Create Direction
        let directionId;
        const { data: existingDirection } = await supabase
            .from('directions')
            .select('id')
            .eq('code', directionCode)
            .single();

        if (existingDirection) {
            directionId = existingDirection.id;
        } else {
            // Find details from JSON
            const dirInfo = directionsData.find(d => d.code === directionCode);
            if (!dirInfo) throw new Error('Invalid direction code');

            const { data: newDirection, error: createDirError } = await supabase
                .from('directions')
                .insert({
                    code: dirInfo.code,
                    title: dirInfo.name,
                    subtitle: `${dirInfo.subject_1} & ${dirInfo.subject_2}`
                })
                .select()
                .single();

            if (createDirError) throw new Error('Error creating direction: ' + createDirError.message);
            directionId = newDirection.id;
        }

        // 3. Save Result
        const { error: saveError } = await supabase
            .from('results')
            .insert({
                student_id: studentId,
                exam_id: examId,
                direction_id: directionId,
                total_score: scores.total,
                compulsory_math_score: scores.comp_math,
                compulsory_history_score: scores.comp_history,
                compulsory_lang_score: scores.comp_lang,
                subject_1_score: scores.subject_1,
                subject_2_score: scores.subject_2
            });

        if (saveError) throw saveError;

        return { success: true };

    } catch (error: any) {
        console.error('Save result error:', error);
        return { success: false, error: error.message };
    }
}

export async function getAllResults(limit: number = 20): Promise<any[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('results')
        .select(`
            *,
            student:profiles!results_student_id_fkey(full_name),
            exam:exams(title, date),
            direction:directions(title, code)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching results:', error);
        return [];
    }

    return data;
}

export async function getStudentResults(studentId: string): Promise<any[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('results')
        .select(`
            *,
            exam:exams(title, date),
            direction:directions(title, code)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching student results:', error);
        return [];
    }

    return data;
}

// Admin Dashboard Stats
export async function getAdminStats() {
    const supabase = createClient();

    try {
        // Run queries in parallel
        const [studentsParams, teachersParams, resultsParams] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
            supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
            supabase.from('results').select('id', { count: 'exact', head: true })
        ]);

        const totalStudents = studentsParams.count || 0;
        const activeTeachers = teachersParams.count || 0;
        const totalTests = resultsParams.count || 0;

        // Mock revenue: e.g. 150,000 UZS per student (just for display)
        const monthlyRevenue = (totalStudents * 150000).toLocaleString('uz-UZ');

        return {
            totalStudents,
            activeTeachers,
            totalTests,
            monthlyRevenue
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return {
            totalStudents: 0,
            activeTeachers: 0,
            totalTests: 0,
            monthlyRevenue: '0'
        };
    }
}

// Admin Dashboard Recent Activity
export async function getRecentActivity() {
    const supabase = createClient();

    try {
        // 1. Latest Results (Completed Mock Exam)
        const { data: recentResults } = await supabase
            .from('results')
            .select(`
                id,
                created_at,
                total_score,
                student:profiles!results_student_id_fkey(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        // 2. Latest Registrations (New Student)
        const { data: recentUsers } = await supabase
            .from('profiles')
            .select('id, full_name, created_at, role')
            .eq('role', 'student')
            .order('created_at', { ascending: false })
            .limit(5);

        // Normalize and merge
        const activities = [
            ...(recentResults || []).map((r: any) => ({
                id: r.id,
                user: r.student?.full_name || 'Unknown Student',
                action: `Imtihon topshirdi (${r.total_score.toFixed(1)} ball)`,
                date: r.created_at,
                status: 'Result', // for badge color
                type: 'exam'
            })),
            ...(recentUsers || []).map((u: any) => ({
                id: u.id,
                user: u.full_name || 'New User',
                action: 'Tizimdan ro\'yxatdan o\'tdi',
                date: u.created_at,
                status: 'New',
                type: 'user'
            }))
        ];

        // Sort by date desc
        return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return [];
    }
}
