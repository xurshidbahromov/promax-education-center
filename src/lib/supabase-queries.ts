// Supabase Query Functions for Dashboard
// Centralized data fetching logic

import { createClient } from '@/utils/supabase/client';

export interface ExamResult {
    id: string;
    exam_id: string;
    student_id: string;
    total_score: number;
    compulsory_math_score: number | null;
    compulsory_history_score: number | null;
    compulsory_lang_score: number | null;
    subject_1_score: number | null;
    subject_2_score: number | null;
    created_at: string;
    exam?: {
        title: string;
        date: string;
        type: string;
        max_score: number;
    };
    direction?: {
        title: string;
        code: string;
    };
}

export interface Exam {
    id: string;
    title: string;
    date: string;
    max_score: number;
    type: 'dtm' | 'quiz' | 'topic';
    status: 'upcoming' | 'active' | 'finished';
    created_at: string;
}

export interface DashboardStats {
    totalTests: number;
    averageScore: number;
    bestScore: number;
    totalCoins: number;
}

/**
 * Get student's exam results with related data
 */
export async function getStudentResults(studentId: string): Promise<ExamResult[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('results')
        .select(`
            *,
            exam:exams (
                title,
                date,
                type,
                max_score
            ),
            direction:directions (
                title,
                code
            )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching results:', error);
        return [];
    }

    return data || [];
}

/**
 * Get available exams (for tests page)
 */
export async function getAvailableExams(): Promise<Exam[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('exams')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('date', { ascending: true });

    if (error) {
        console.error('Error fetching exams:', error);
        return [];
    }

    return data || [];
}

/**
 * Get dashboard statistics for a student
 */
export async function getDashboardStats(studentId: string): Promise<DashboardStats> {
    const supabase = createClient();

    const { data: results, error } = await supabase
        .from('results')
        .select('total_score')
        .eq('student_id', studentId);

    const { data: attempts, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('score')
        .eq('student_id', studentId)
        .eq('status', 'completed');

    if (error && attemptsError) {
        return {
            totalTests: 0,
            averageScore: 0,
            bestScore: 0,
            totalCoins: 0
        };
    }

    const resultScores = results?.map(r => r.total_score) || [];
    const attemptScores = attempts?.map(a => a.score) || [];
    const allScores = [...resultScores, ...attemptScores];

    if (allScores.length === 0) {
        return {
            totalTests: 0,
            averageScore: 0,
            bestScore: 0,
            totalCoins: 0
        };
    }

    const totalTests = allScores.length;
    const averageScore = allScores.reduce((a, b) => a + b, 0) / totalTests;
    const bestScore = Math.max(...allScores);

    // Calculate coins (1 coin per 10 points)
    const totalCoins = Math.floor(allScores.reduce((a, b) => a + b, 0) / 10);

    return {
        totalTests,
        averageScore: Math.round(averageScore * 10) / 10,
        bestScore,
        totalCoins
    };
}

/**
 * Get recent 5 results for chart
 */
export async function getRecentResultsForChart(studentId: string) {
    const supabase = createClient();

    // Fetch DTM results
    const { data: results } = await supabase
        .from('results')
        .select(`
            total_score,
            created_at,
            exam:exams (title)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch Online Test attempts
    const { data: attempts } = await supabase
        .from('test_attempts')
        .select(`
            score,
            completed_at,
            test:tests (title)
        `)
        .eq('student_id', studentId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

    // Combine and sort
    const combined = [
        ...((results as any[])?.map(r => ({
            score: r.total_score,
            date: new Date(r.created_at),
            title: Array.isArray(r.exam) ? r.exam[0]?.title : r.exam?.title
        })) || []),
        ...((attempts as any[])?.map(a => ({
            score: a.score,
            date: new Date(a.completed_at),
            title: Array.isArray(a.test) ? a.test[0]?.title : a.test?.title
        })) || [])
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

    // Reverse to show oldest to newest in chart
    return combined.reverse().map((result: any) => {
        const day = result.date.getDate().toString().padStart(2, '0');
        const month = (result.date.getMonth() + 1).toString().padStart(2, '0');

        return {
            date: `${day}.${month}`,
            score: result.score,
            examTitle: result.title || 'Unknown'
        };
    });
}

/**
 * Get student's recent activity (e.g. completed tests)
 */
export async function getStudentActivity(studentId: string) {
    const supabase = createClient();

    // Fetch DTM results
    const { data: results } = await supabase
        .from('results')
        .select(`
            id,
            total_score,
            created_at,
            exam:exams (title, max_score)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

    // Fetch Online Test attempts
    const { data: attempts } = await supabase
        .from('test_attempts')
        .select(`
            id,
            score,
            max_score,
            completed_at,
            test:tests (title)
        `)
        .eq('student_id', studentId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

    // Combine and sort
    const combined = [
        ...((results as any[])?.map(r => ({
            id: r.id,
            title: Array.isArray(r.exam) ? r.exam[0]?.title : r.exam?.title || 'Unknown Exam',
            score: r.total_score,
            maxScore: (Array.isArray(r.exam) ? r.exam[0]?.max_score : r.exam?.max_score) || 189,
            date: r.created_at,
            type: 'result'
        })) || []),
        ...((attempts as any[])?.map(a => ({
            id: a.id,
            title: Array.isArray(a.test) ? a.test[0]?.title : a.test?.title || 'Online Test',
            score: a.score,
            maxScore: a.max_score,
            date: a.completed_at,
            type: 'test'
        })) || [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return combined;
}

/**
 * Update user coins
 */
export async function updateUserCoins(userId: string, amount: number) {
    const supabase = createClient();

    // 1. Get current coins
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('coins')
        .eq('id', userId)
        .single();

    if (fetchError) {
        console.error('Error fetching coins:', fetchError);
        return { success: false, error: fetchError };
    }

    const currentCoins = profile?.coins || 0;
    const newBalance = currentCoins + amount;

    // 2. Update coins
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ coins: newBalance })
        .eq('id', userId);

    if (updateError) {
        console.error('Error updating coins:', updateError);
        return { success: false, error: updateError };
    }

    return { success: true, newBalance };
}

/**
 * Get leaderboard (top students by coins)
 */
export async function getLeaderboard(limit: number = 1000) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, coins')
        .eq('role', 'student')
        .order('coins', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    return data.map((user, index) => ({
        id: user.id,
        name: user.full_name || 'Anonymous',
        points: user.coins || 0,
        rank: index + 1,
        avatar: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤"
    }));
}

/**
 * Get specific user rank and stats
 */
export async function getUserRank(userId: string) {
    const supabase = createClient();

    // 1. Get user stats
    const { data: user, error } = await supabase
        .from('profiles')
        .select('full_name, coins, role')
        .eq('id', userId)
        .single();

    if (error || !user) return null;

    // If admin/teacher, mock a rank for display purposes or return null
    if (user.role !== 'student') {
        return {
            id: userId,
            name: user.full_name || 'User',
            points: user.coins || 0,
            rank: 0, // Special indicator
            avatar: "🛡️"
        };
    }

    // 2. Get rank (count students with more coins)
    const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')
        .gt('coins', user.coins || 0);

    const rank = (count || 0) + 1;

    return {
        id: userId,
        name: user.full_name || 'Student',
        points: user.coins || 0,
        rank,
        avatar: rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "👤"
    };
}
