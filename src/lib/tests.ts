// Test system helper functions for client-side operations

import { createClient } from '@/utils/supabase/client';

export type TestType = 'subject' | 'practice' | 'progress' | 'mock';
export type Subject = 'math' | 'english' | 'physics' | 'chemistry' | 'biology' | 'general';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

export interface Test {
    id: string;
    title: string;
    description: string | null;
    subject: Subject;
    test_type: TestType;
    category: string | null;
    duration_minutes: number | null;
    total_questions: number;
    difficulty_level: DifficultyLevel;
    passing_score: number;
    is_published: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface Question {
    id: string;
    test_id: string;
    question_text: string;
    question_type: QuestionType;
    options: Record<string, string> | null;
    correct_answer: string;
    explanation: string | null;
    points: number;
    order_index: number;
    image_url: string | null;
}

export interface TestAttempt {
    id: string;
    test_id: string;
    student_id: string;
    started_at: string;
    completed_at: string | null;
    time_spent_seconds: number | null;
    score: number;
    max_score: number;
    percentage: number | null;
    status: AttemptStatus;
}

export interface QuestionResponse {
    id: string;
    attempt_id: string;
    question_id: string;
    student_answer: string | null;
    is_correct: boolean | null;
    points_earned: number;
    time_spent_seconds: number | null;
}

export interface TestFilters {
    subject?: Subject;
    test_type?: TestType;
    difficulty?: DifficultyLevel;
    search?: string;
}

/**
 * Get all published tests with optional filters
 */
export async function getPublishedTests(filters?: TestFilters): Promise<Test[]> {
    const supabase = createClient();

    let query = supabase
        .from('tests')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (filters?.subject) {
        query = query.eq('subject', filters.subject);
    }

    if (filters?.test_type) {
        query = query.eq('test_type', filters.test_type);
    }

    if (filters?.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
    }

    if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching tests:', error);
        return [];
    }

    return data || [];
}

/**
 * Create a new test with questions
 */
export async function createTest(testData: {
    title: string;
    description: string | null;
    subject: Subject;
    test_type: TestType;
    difficulty_level: DifficultyLevel;
    duration_minutes: number | null;
    is_published: boolean;
    questions: Omit<Question, 'id' | 'test_id'>[];
}): Promise<string | null> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Insert test
    const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
            title: testData.title,
            description: testData.description,
            subject: testData.subject,
            test_type: testData.test_type,
            difficulty_level: testData.difficulty_level,
            duration_minutes: testData.duration_minutes,
            is_published: testData.is_published,
            total_questions: testData.questions.length,
            created_by: user.id
        })
        .select()
        .single();

    if (testError || !test) {
        console.error('Error creating test:', testError);
        return null;
    }

    // Insert questions
    if (testData.questions.length > 0) {
        const { error: questionsError } = await supabase
            .from('questions')
            .insert(
                testData.questions.map((q) => ({
                    test_id: test.id,
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: q.options,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation,
                    points: q.points,
                    order_index: q.order_index,
                    image_url: q.image_url || null
                }))
            );

        if (questionsError) {
            console.error('Error creating questions:', questionsError);
            // Optionally delete the test if questions fail
            await supabase.from('tests').delete().eq('id', test.id);
            return null;
        }
    }

    return test.id;
}

/**
 * Get test by ID with all questions
 */
export async function getTestById(testId: string): Promise<Test | null> {
    const supabase = createClient();

    const { data: test, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

    if (testError || !test) {
        console.error('Error fetching test:', testError);
        return null;
    }

    return test;
}

/**
 * Start a new test attempt
 */
export async function startTestAttempt(testId: string): Promise<string | null> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get test to calculate max_score
    const { data: test } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

    if (!test) return null;

    // Get total points from questions
    const { data: questions } = await supabase
        .from('questions')
        .select('points')
        .eq('test_id', testId);

    const maxScore = questions?.reduce((sum, q) => sum + q.points, 0) || 0;

    const { data: attempt, error } = await supabase
        .from('test_attempts')
        .insert({
            test_id: testId,
            student_id: user.id,
            max_score: maxScore,
            status: 'in_progress'
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating attempt:', error);
        return null;
    }

    return attempt?.id || null;
}

/**
 * Submit answer to a question
 */
export async function submitAnswer(
    attemptId: string,
    questionId: string,
    answer: string,
    timeSpent?: number
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('question_responses')
        .upsert({
            attempt_id: attemptId,
            question_id: questionId,
            student_answer: answer,
            time_spent_seconds: timeSpent
        }, {
            onConflict: 'attempt_id,question_id'
        });

    if (error) {
        console.error('Error submitting answer:', error);
        return false;
    }

    return true;
}

/**
 * Complete test attempt
 */
export async function completeTestAttempt(attemptId: string, totalTimeSpent: number): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase
        .from('test_attempts')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            time_spent_seconds: totalTimeSpent
        })
        .eq('id', attemptId);

    if (error) {
        console.error('Error completing attempt:', error);
        return false;
    }

    return true;
}

/**
 * Get test attempt results
 */
export async function getAttemptResults(attemptId: string): Promise<{
    attempt: TestAttempt;
    responses: (QuestionResponse & { question: Question })[];
} | null> {
    const supabase = createClient();

    const { data: attempt, error: attemptError } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('id', attemptId)
        .single();

    if (attemptError || !attempt) {
        console.error('Error fetching attempt:', attemptError);
        return null;
    }

    const { data: responses, error: responsesError } = await supabase
        .from('question_responses')
        .select(`
            *,
            question:questions(*)
        `)
        .eq('attempt_id', attemptId);

    if (responsesError) {
        console.error('Error fetching responses:', responsesError);
        return null;
    }

    return { attempt, responses: responses || [] };
}

/**
 * Get student's test history
 */
export async function getStudentTestHistory(studentId?: string, testId?: string): Promise<TestAttempt[]> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user && !studentId) return [];

    let query = supabase
        .from('test_attempts')
        .select('*')
        .eq('student_id', studentId || user!.id)
        .order('started_at', { ascending: false });

    if (testId) {
        query = query.eq('test_id', testId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching history:', error);
        return [];
    }

    return data || [];
}

/**
 * Get active (in-progress) attempt for a test
 */
export async function getActiveAttempt(testId: string): Promise<TestAttempt | null> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('test_id', testId)
        .eq('student_id', user.id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

    if (error) return null;

    return data;
}

/**
 * Get student's saved responses for an attempt
 */
export async function getAttemptResponses(attemptId: string): Promise<QuestionResponse[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('question_responses')
        .select('*')
        .eq('attempt_id', attemptId);

    if (error) {
        console.error('Error fetching responses:', error);
        return [];
    }

    return data || [];
}
