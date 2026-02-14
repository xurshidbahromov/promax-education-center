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
export async function startTestAttempt(testId: string): Promise<{ id: string; started_at: string } | null> {
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

    return attempt ? { id: attempt.id, started_at: attempt.created_at } : null;
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
/**
 * Complete test attempt and calculate score
 */
export async function completeTestAttempt(attemptId: string, totalTimeSpent?: number): Promise<boolean> {
    const supabase = createClient();

    // 1. Fetch attempt to get test_id
    const { data: attempt, error: attemptError } = await supabase
        .from('test_attempts')
        .select('test_id, student_id')
        .eq('id', attemptId)
        .single();

    if (attemptError || !attempt) {
        console.error('Error fetching attempt:', attemptError);
        return false;
    }

    // 2. Fetch all questions with correct answers
    const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, correct_answer, points')
        .eq('test_id', attempt.test_id);

    if (questionsError || !questions) {
        console.error('Error fetching questions:', questionsError);
        return false;
    }

    // 3. Fetch all student responses
    const { data: responses, error: responsesError } = await supabase
        .from('question_responses')
        .select('question_id, student_answer')
        .eq('attempt_id', attemptId);

    if (responsesError || !responses) {
        console.error('Error fetching responses:', responsesError);
        return false;
    }

    // 4. Calculate Score
    let totalScore = 0;
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    const updates = [];

    // Map responses for easy lookup
    const responseMap = new Map(responses.map(r => [r.question_id, r.student_answer]));

    for (const question of questions) {
        const studentAnswer = responseMap.get(question.id);
        const isCorrect = studentAnswer === question.correct_answer;
        const pointsEarned = isCorrect ? question.points : 0;

        if (isCorrect) {
            totalScore += pointsEarned;
        }

        // Prepare update for the response
        updates.push({
            attempt_id: attemptId,
            question_id: question.id,
            student_answer: studentAnswer, // Ensure we keep the answer
            is_correct: isCorrect,
            points_earned: pointsEarned
        });
    }

    // 5. Update responses with scoring info (Batch upsert)
    const { error: updateResponsesError } = await supabase
        .from('question_responses')
        .upsert(updates, { onConflict: 'attempt_id,question_id' });

    if (updateResponsesError) {
        console.error('Error updating response scores:', updateResponsesError);
        // Continue anyway to close the attempt
    }

    // 6. Update Attempt with final results
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Check if time_spent_seconds is provided, otherwise calculate from start time? 
    // For now use the provided argument or ignore if null
    const updatePayload: any = {
        status: 'completed',
        completed_at: new Date().toISOString(),
        score: totalScore,
        max_score: maxScore,
        percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal
    };

    if (totalTimeSpent !== undefined) {
        updatePayload.time_spent_seconds = totalTimeSpent;
    }

    const { error: updateAttemptError } = await supabase
        .from('test_attempts')
        .update(updatePayload)
        .eq('id', attemptId);

    if (updateAttemptError) {
        console.error('Error completing attempt:', updateAttemptError);
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

/**
 * Update logic for editing a test
 */
export async function updateTest(
    testId: string,
    testData: {
        title: string;
        description: string | null;
        subject: Subject;
        test_type: TestType;
        difficulty_level: DifficultyLevel;
        duration_minutes: number | null;
        is_published: boolean;
        questions: (Omit<Question, 'test_id' | 'id'> & { id?: string })[];
    }
): Promise<boolean> {
    const supabase = createClient();

    // 1. Update Test Details
    const { error: testError } = await supabase
        .from('tests')
        .update({
            title: testData.title,
            description: testData.description,
            subject: testData.subject,
            test_type: testData.test_type,
            difficulty_level: testData.difficulty_level,
            duration_minutes: testData.duration_minutes,
            is_published: testData.is_published,
            total_questions: testData.questions.length,
            updated_at: new Date().toISOString()
        })
        .eq('id', testId);

    if (testError) {
        console.error('Error updating test:', testError);
        return false;
    }

    // 2. Handle Questions
    // Identify questions to delete: IDs in DB but not in new List
    if (testData.questions.length > 0) {
        // Fetch existing question IDs
        const { data: existingQuestions } = await supabase
            .from('questions')
            .select('id')
            .eq('test_id', testId);

        const existingIds = existingQuestions?.map(q => q.id) || [];
        const newIds = testData.questions.filter(q => q.id).map(q => q.id as string);
        const idsToDelete = existingIds.filter(id => !newIds.includes(id));

        // Delete removed questions
        if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('questions')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) {
                console.error('Error deleting old questions:', deleteError);
                // Continue... potentially dangerous but we want to try to save the rest
            }
        }

        // Upsert (Update or Insert) questions
        const questionsToUpsert = testData.questions.map((q, index) => ({
            id: q.id, // If provided, it updates. If undefined, it inserts (but Supabase upsert needs distinct handling or ID must be generated if not present?)
            // Actually supabase upsert works best if we provide ID for updates. For new items, we shouldn't pass ID if it's auto-generated, OR we generate a UUID here.
            // Let's generate UUIDs for new questions to ensure consistency
            test_id: testId,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            points: q.points,
            order_index: index,
            image_url: q.image_url || null
        }));

        const { error: questionsError } = await supabase
            .from('questions')
            .upsert(questionsToUpsert, { onConflict: 'id' });

        if (questionsError) {
            console.error('Error updating questions:', questionsError);
            return false;
        }
    }

    return true;
}

/**
 * Delete a test and all its related data
 */
export async function deleteTest(testId: string): Promise<boolean> {
    const supabase = createClient();

    // Note: If you have foreign key constraints with ON DELETE CASCADE, 
    // you might only need to delete the test. 
    // If not, you need to delete related items manually.
    // Assuming standard Supabase cascade setup usually handles this, 
    // but let's be safe and try to delete the test directly.

    const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

    if (error) {
        console.error('Error deleting test:', error);
        return false;
    }

    return true;
}

/**
 * Toggle test publish status
 */
export async function toggleTestPublish(testId: string): Promise<boolean> {
    const supabase = createClient();

    // Get current status
    const { data: test, error: fetchError } = await supabase
        .from('tests')
        .select('is_published')
        .eq('id', testId)
        .single();

    if (fetchError || !test) {
        console.error('Error fetching test:', fetchError);
        return false;
    }

    // Toggle the status
    const { error: updateError } = await supabase
        .from('tests')
        .update({ is_published: !test.is_published })
        .eq('id', testId);

    if (updateError) {
        console.error('Error toggling publish status:', updateError);
        return false;
    }

    return true;
}

/**
 * Duplicate a test with all its questions
 */
export async function duplicateTest(testId: string): Promise<string | null> {
    const supabase = createClient();

    try {
        // 1. Get the original test
        const { data: originalTest, error: testError } = await supabase
            .from('tests')
            .select('*')
            .eq('id', testId)
            .single();

        if (testError || !originalTest) {
            console.error('Error fetching test:', testError);
            return null;
        }

        // 2. Get all questions for the original test
        const { data: originalQuestions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('test_id', testId)
            .order('order_index');

        if (questionsError) {
            console.error('Error fetching questions:', questionsError);
            return null;
        }

        // 3. Create new test (without id and with modified title)
        const { data: newTest, error: newTestError } = await supabase
            .from('tests')
            .insert({
                title: `${originalTest.title} (Nusxa)`,
                description: originalTest.description,
                subject: originalTest.subject,
                test_type: originalTest.test_type,
                difficulty_level: originalTest.difficulty_level,
                duration_minutes: originalTest.duration_minutes,
                total_questions: originalTest.total_questions,
                max_score: originalTest.max_score,
                is_published: false, // New copy is draft by default
                created_by: originalTest.created_by
            })
            .select()
            .single();

        if (newTestError || !newTest) {
            console.error('Error creating new test:', newTestError);
            return null;
        }

        // 4. Copy all questions
        if (originalQuestions && originalQuestions.length > 0) {
            const newQuestions = originalQuestions.map(q => ({
                test_id: newTest.id,
                question_text: q.question_text,
                question_type: q.question_type,
                options: q.options,
                correct_answer: q.correct_answer,
                explanation: q.explanation,
                points: q.points,
                order_index: q.order_index,
                image_url: q.image_url
            }));

            const { error: questionsInsertError } = await supabase
                .from('questions')
                .insert(newQuestions);

            if (questionsInsertError) {
                console.error('Error copying questions:', questionsInsertError);
                // Rollback: delete the new test
                await supabase.from('tests').delete().eq('id', newTest.id);
                return null;
            }
        }

        return newTest.id;
    } catch (error) {
        console.error('Error duplicating test:', error);
        return null;
    }
}
