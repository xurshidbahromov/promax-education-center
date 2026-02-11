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
                type
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

    if (error || !results || results.length === 0) {
        return {
            totalTests: 0,
            averageScore: 0,
            bestScore: 0,
            totalCoins: 0
        };
    }

    const scores = results.map(r => r.total_score);
    const totalTests = scores.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalTests;
    const bestScore = Math.max(...scores);

    // Calculate coins (1 coin per 10 points)
    const totalCoins = Math.floor(scores.reduce((a, b) => a + b, 0) / 10);

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

    const { data, error } = await supabase
        .from('results')
        .select(`
            total_score,
            created_at,
            exam:exams (
                title,
                date
            )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error || !data) {
        console.error('Error fetching chart data:', error);
        return [];
    }

    // Reverse to show oldest to newest in chart
    return data.reverse().map((result: any, index: number) => ({
        week: `Week ${index + 1}`,
        score: result.total_score,
        examTitle: result.exam?.title || 'Unknown'
    }));
}
