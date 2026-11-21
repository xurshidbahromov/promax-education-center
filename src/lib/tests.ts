// Test system helper functions for client-side operations

import { createClient } from '@/utils/supabase/client';

export type TestType = 'subject' | 'practice' | 'progress' | 'mock';
export type Subject = 'math' | 'english' | 'physics' | 'chemistry' | 'biology' | 'general';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned';

const VALID_SUBJECTS: Subject[] = ['math', 'english', 'physics', 'chemistry', 'biology', 'general'];

export function sanitizeSubject(subject: string): Subject {
  const normalized = (subject || '').toLowerCase().trim();
  if (VALID_SUBJECTS.includes(normalized as Subject)) {
    return normalized as Subject;
  }
  if (normalized.includes('matematik') || normalized.includes('math') || normalized.includes('algebra') || normalized.includes('geometriya')) return 'math';
  if (normalized.includes('ingliz') || normalized.includes('english') || normalized.includes('ing')) return 'english';
  if (normalized.includes('fizik') || normalized.includes('physics')) return 'physics';
  if (normalized.includes('kimyo') || normalized.includes('chemist')) return 'chemistry';
  if (normalized.includes('biolog') || normalized.includes('biol')) return 'biology';
  return 'general';
}

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

  // Attempt test insertion with created_by
  const insertPayload: any = {
    title: testData.title,
    description: testData.description,
    subject: sanitizeSubject(testData.subject),
    test_type: testData.test_type,
    difficulty_level: testData.difficulty_level,
    duration_minutes: testData.duration_minutes,
    is_published: testData.is_published,
    total_questions: testData.questions.length,
  };

  if (user?.id) {
    insertPayload.created_by = user.id;
  }

  let { data: test, error: testError } = await supabase
    .from('tests')
    .insert(insertPayload)
    .select()
    .single();

  if (testError && user?.id) {
    // If created_by caused an RLS or foreign key error, try without created_by
    console.warn('Initial test insert failed, trying without created_by:', testError.message);
    delete insertPayload.created_by;
    const retryResult = await supabase
      .from('tests')
      .insert(insertPayload)
      .select()
      .single();
    test = retryResult.data;
    testError = retryResult.error;
  }

  if (testError || !test) {
    console.error('Error creating test:', testError?.message || testError?.details || JSON.stringify(testError));
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
      console.error('Error creating questions:', questionsError.message || questionsError.details || JSON.stringify(questionsError));
      // Delete test if questions insert fails
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

 const maxScore = questions?.reduce((sum, q) => sum + (Number(q.points) || 1), 0) || 0;

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

 return attempt ? { id: attempt.id, started_at: attempt.started_at || attempt.created_at || new Date().toISOString() } : null;
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
 // If the error is RLS related and we are submitting, it usually means the test is completed/abandoned
 if (error.message?.includes('row-level security')) {
 console.warn('Answer submission blocked by RLS (Test likely completed):', error.message);
 } else {
 console.error('Error submitting answer:', error.message, error);
 }
 return false;
 }

 return true;
}

/**
 * Batch submit multiple question answers in a single database round-trip
 */
export async function submitAnswersBatch(
  attemptId: string,
  answersMap: Record<string, string>
): Promise<boolean> {
  const entries = Object.entries(answersMap);
  if (entries.length === 0) return true;

  const supabase = createClient();
  const rows = entries.map(([questionId, answer]) => ({
    attempt_id: attemptId,
    question_id: questionId,
    student_answer: answer,
  }));

  const { error } = await supabase
    .from('question_responses')
    .upsert(rows, { onConflict: 'attempt_id,question_id' });

  if (error) {
    if (error.message?.includes('row-level security')) {
      console.warn('Batch answer submission blocked by RLS:', error.message);
    } else {
      console.error('Error batch submitting answers:', error.message, error);
    }
    return false;
  }

  return true;
}

/**
 * Complete test attempt and calculate score (case-insensitive, trimmed, accepts client answers fallback)
 */
export async function completeTestAttempt(
  attemptId: string,
  totalTimeSpent?: number,
  clientAnswers?: Record<string, string>
): Promise<boolean> {
  const supabase = createClient();

  // 1. Fetch attempt to get test_id
  const { data: attempt, error: attemptError } = await supabase
    .from('test_attempts')
    .select('test_id, student_id, status')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attempt) {
    console.error('Error fetching attempt:', attemptError);
    return false;
  }

  // Already completed — avoid duplicate RLS errors
  if (attempt.status === 'completed') {
    return true;
  }

  // 2 & 3. Fetch questions and saved responses in parallel
  const [questionsRes, responsesRes] = await Promise.all([
    supabase
      .from('questions')
      .select('id, correct_answer, points')
      .eq('test_id', attempt.test_id),
    supabase
      .from('question_responses')
      .select('question_id, student_answer')
      .eq('attempt_id', attemptId),
  ]);

  if (questionsRes.error || !questionsRes.data) {
    console.error('Error fetching questions:', questionsRes.error);
    return false;
  }

  const questions = questionsRes.data;
  const responses = responsesRes.data || [];

  // Merge DB responses with latest clientAnswers (clientAnswers takes precedence so last-second picks are never lost)
  const responseMap = new Map<string, string>();
  for (const r of responses) {
    if (r.student_answer != null) {
      responseMap.set(r.question_id, r.student_answer);
    }
  }
  if (clientAnswers) {
    for (const [qId, ans] of Object.entries(clientAnswers)) {
      if (ans != null && ans.trim() !== '') {
        responseMap.set(qId, ans);
      }
    }
  }

  // 4. Calculate Score (normalized trim + lowercase to match frontend evaluation 1:1)
  let totalScore = 0;
  let maxScore = 0;
  const updates = [];

  for (const question of questions) {
    const pts = Number(question.points) || 1;
    maxScore += pts;
    const rawAnswer = responseMap.get(question.id) ?? null;
    const normalizedStudent = (rawAnswer || '').trim().toLowerCase();
    const normalizedCorrect = (question.correct_answer || '').trim().toLowerCase();
    const isCorrect = normalizedStudent.length > 0 && normalizedStudent === normalizedCorrect;
    const pointsEarned = isCorrect ? pts : 0;

    if (isCorrect) {
      totalScore += pointsEarned;
    }

    updates.push({
      attempt_id: attemptId,
      question_id: question.id,
      student_answer: rawAnswer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
    });
  }

  // 5. Update responses with scoring info BEFORE closing attempt (required by RLS status='in_progress')
  if (updates.length > 0) {
    const { error: updateResponsesError } = await supabase
      .from('question_responses')
      .upsert(updates, { onConflict: 'attempt_id,question_id' });

    if (updateResponsesError) {
      console.error('Error updating response scores:', updateResponsesError);
    }
  }

  // 6. Update Attempt with final results
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const updatePayload: any = {
    status: 'completed',
    completed_at: new Date().toISOString(),
    score: Math.round(totalScore * 10) / 10,
    max_score: Math.round(maxScore * 10) / 10,
    percentage: Math.round(percentage * 10) / 10,
  };

  if (totalTimeSpent !== undefined) {
    updatePayload.time_spent_seconds = Math.max(1, Math.round(totalTimeSpent));
  }

  const { error: updateAttemptError } = await supabase
    .from('test_attempts')
    .update(updatePayload)
    .eq('id', attemptId);

  if (updateAttemptError) {
    console.error('Error completing attempt:', JSON.stringify(updateAttemptError, null, 2));
    return false;
  }

  return true;
}

/**
 * Mark an expired in-progress attempt as abandoned so student can start fresh
 */
export async function abandonTestAttempt(attemptId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('test_attempts')
    .update({ status: 'abandoned', completed_at: new Date().toISOString() })
    .eq('id', attemptId);
  return !error;
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
 .eq('status', 'completed')
 .order('completed_at', { ascending: false });

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
 .maybeSingle();

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
    passing_score?: number;
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
 subject: sanitizeSubject(testData.subject),
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

 // Separate existing questions (update) from new questions (insert without id so DB generates UUID)
 const toUpdate = testData.questions
   .map((q, index) => ({ q, index }))
   .filter(({ q }) => Boolean(q.id))
   .map(({ q, index }) => ({
     id: q.id as string,
     test_id: testId,
     question_text: q.question_text,
     question_type: q.question_type,
     options: q.options,
     correct_answer: q.correct_answer,
     explanation: q.explanation,
     points: q.points,
     order_index: index,
     image_url: q.image_url || null,
   }));

 const toInsert = testData.questions
   .map((q, index) => ({ q, index }))
   .filter(({ q }) => !q.id)
   .map(({ q, index }) => ({
     test_id: testId,
     question_text: q.question_text,
     question_type: q.question_type,
     options: q.options,
     correct_answer: q.correct_answer,
     explanation: q.explanation,
     points: q.points,
     order_index: index,
     image_url: q.image_url || null,
   }));

 if (toUpdate.length > 0) {
   const { error: updateErr } = await supabase
     .from('questions')
     .upsert(toUpdate, { onConflict: 'id' });
   if (updateErr) {
     console.error('Error updating existing questions:', updateErr);
     return false;
   }
 }

 if (toInsert.length > 0) {
   const { error: insertErr } = await supabase
     .from('questions')
     .insert(toInsert);
   if (insertErr) {
     console.error('Error inserting new questions:', insertErr);
     return false;
   }
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

/**
 * Get a single test with all its questions (for admin detail view)
 */
export async function getTestWithQuestions(testId: string): Promise<(Test & { questions: Question[] }) | null> {
  const supabase = createClient();
  
  const { data: test, error: testError } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single();
  
  if (testError || !test) return null;
  
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', testId)
    .order('order_index');
  
  if (questionsError) return null;
  
  return { ...test, questions: questions || [] };
}

/**
 * Get all tests (for admin list with React Query)
 */
export async function getAllTests(): Promise<Test[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export interface TestResult {
  id: string;
  student_id: string;
  started_at: string;
  completed_at: string | null;
  score: number;
  max_score: number;
  percentage: number | null;
  status: AttemptStatus;
  student: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

/**
 * Get results for a specific test (who attempted it and their scores)
 */
export async function getTestResults(testId: string): Promise<TestResult[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('test_attempts')
    .select(`
      id,
      student_id,
      started_at,
      completed_at,
      score,
      max_score,
      percentage,
      status,
      student:profiles!test_attempts_student_id_fkey(full_name, phone)
    `)
    .eq('test_id', testId)
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching test results:', error);
    return [];
  }
  
  return (data || []) as unknown as TestResult[];
}

export interface GroupTest {
  id: string;
  group_id: string;
  test_id: string;
  assigned_at: string;
  due_date: string | null;
  group: { name: string } | null;
}

/**
 * Assign a test to a group
 */
export async function assignTestToGroup(
  testId: string,
  groupId: string,
  dueDate?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // Check if already assigned
  const { data: existing } = await supabase
    .from('group_tests')
    .select('id')
    .eq('test_id', testId)
    .eq('group_id', groupId)
    .single();
  
  if (existing) {
    return { success: false, error: 'Bu test allaqachon ushbu guruhga biriktirilgan' };
  }
  
  const { error } = await supabase
    .from('group_tests')
    .insert({ test_id: testId, group_id: groupId, due_date: dueDate || null });
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Remove test assignment from a group
 */
export async function removeTestFromGroup(testId: string, groupId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('group_tests')
    .delete()
    .eq('test_id', testId)
    .eq('group_id', groupId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Get all groups that a test is assigned to
 */
export async function getTestGroups(testId: string): Promise<GroupTest[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('group_tests')
    .select(`
      id, group_id, test_id, assigned_at, due_date,
      group:groups(name)
    `)
    .eq('test_id', testId);
  
  if (error) return [];
  return (data || []) as unknown as GroupTest[];
}

/**
 * Upload an image for a test question
 */
export async function uploadQuestionImage(file: File): Promise<string | null> {
  try {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `question_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `questions/${fileName}`;

    // Attempt upload to Supabase storage 'test-images'
    const { error: uploadError } = await supabase.storage
      .from('test-images')
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from('test-images').getPublicUrl(filePath);
      return data.publicUrl;
    }

    // Try fallback bucket 'avatars'
    const { error: fallbackError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (!fallbackError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    }

    // Base64 fallback if storage bucket is not created
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  } catch (err) {
    console.error("Error uploading question image:", err);
    return null;
  }
}
