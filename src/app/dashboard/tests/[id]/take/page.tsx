"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
 ArrowLeft,
 ArrowRight,
 Clock,
 CheckCircle,
 AlertCircle,
 Flag,
 Save,
 Send
} from "lucide-react";
import {
 getTestById,
 startTestAttempt,
 submitAnswer,
 completeTestAttempt,
 getActiveAttempt,
 getAttemptResponses,
 type Question
} from "@/lib/tests";
import { TakeTestSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function TakeTestPage() {
 const params = useParams();
 const router = useRouter();
 const { t } = useLanguage();
 const testId = params.id as string;

 const [test, setTest] = useState<any>(null);
 const [questions, setQuestions] = useState<Question[]>([]);
 const [attemptId, setAttemptId] = useState<string | null>(null);
 const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
 const [answers, setAnswers] = useState<Record<string, string>>({});
 const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
 const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [autoSaving, setAutoSaving] = useState(false);
 const [showConfirmModal, setShowConfirmModal] = useState(false);

 const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);
 const questionStartTime = useRef<number>(Date.now());

 // Load test and start attempt
 useEffect(() => {
 async function loadTestAndStart() {
 try {
 // Get test details
 const testData = await getTestById(testId);
 if (!testData) {
 router.push('/dashboard/tests');
 return;
 }
 setTest(testData);

 // Get questions
 const supabase = createClient();
 const { data: questionsData } = await supabase
 .from('questions')
 .select('*')
 .eq('test_id', testId)
 .order('order_index', { ascending: true });

 setQuestions(questionsData || []);

 // Check for active attempt or create new one
 const activeAttempt = await getActiveAttempt(testId);
 if (activeAttempt) {
 setAttemptId(activeAttempt.id);
 // Load saved responses
 const savedResponses = await getAttemptResponses(activeAttempt.id);
 const savedAnswers: Record<string, string> = {};
 savedResponses.forEach(r => {
 if (r.student_answer) {
 savedAnswers[r.question_id] = r.student_answer;
 }
 });
 setAnswers(savedAnswers);

 // Calculate remaining time if timed test
 if (testData.duration_minutes) {
 const elapsed = Math.floor(
 (Date.now() - new Date(activeAttempt.started_at).getTime()) / 1000
 );
 const remaining = (testData.duration_minutes * 60) - elapsed;
 setTimeRemaining(Math.max(0, remaining));
 }
 } else {
 // Start new attempt
 const attemptData = await startTestAttempt(testId);
 if (!attemptData) {
 alert(t('tests.take.error.start'));
 router.push('/dashboard/tests');
 return;
 }
 setAttemptId(attemptData.id);

 // Set initial time
 if (testData.duration_minutes) {
 // For a brand new attempt, full duration is available
 setTimeRemaining(testData.duration_minutes * 60);
 }
 }
 } catch (error) {
 console.error("Error loading test:", error);
 } finally {
 setLoading(false);
 }
 }

 loadTestAndStart();
 }, [testId, router]);

 // Timer countdown
 useEffect(() => {
 if (timeRemaining === null || timeRemaining <= 0) return;

 const interval = setInterval(() => {
 setTimeRemaining(prev => {
 if (prev === null || prev <= 0) {
 handleAutoSubmit();
 return 0;
 }
 return prev - 1;
 });
 }, 1000);

 return () => clearInterval(interval);
 }, [timeRemaining]);

 // Auto-save answers
 useEffect(() => {
 if (!attemptId || submitting) return;

 autoSaveInterval.current = setInterval(() => {
 saveAnswers();
 }, 5000); // Save every 5 seconds

 return () => {
 if (autoSaveInterval.current) {
 clearInterval(autoSaveInterval.current);
 }
 };
 }, [attemptId, answers, submitting]);

 const saveAnswers = useCallback(async () => {
 if (!attemptId || Object.keys(answers).length === 0) return;

 setAutoSaving(true);
 try {
 for (const [questionId, answer] of Object.entries(answers)) {
 await submitAnswer(attemptId, questionId, answer);
 }
 } catch (error) {
 console.error("Error auto-saving:", error);
 } finally {
 setAutoSaving(false);
 }
 }, [attemptId, answers]);

 const handleAnswerChange = (questionId: string, answer: string) => {
 setAnswers(prev => ({
 ...prev,
 [questionId]: answer
 }));
 };

 const handleMarkForReview = (questionId: string) => {
 setMarkedForReview(prev => {
 const newSet = new Set(prev);
 if (newSet.has(questionId)) {
 newSet.delete(questionId);
 } else {
 newSet.add(questionId);
 }
 return newSet;
 });
 };

 const handleAutoSubmit = async () => {
 if (!attemptId || submitting) return;

 setSubmitting(true);
 toast("Vaqt tugadi! Test avtomatik yakunlanmoqda...", { icon: "⚠️" });

 try {
 await saveAnswers();
 const success = await completeTestAttempt(attemptId, test?.duration_minutes ? test.duration_minutes * 60 : 0);
 if (success) {
 router.push(`/dashboard/results/${attemptId}`);
 }
 } catch (error) {
 console.error("Error auto-submitting:", error);
 }
 };

 const handleSubmitClick = () => {
 setShowConfirmModal(true);
 };

 const handleConfirmSubmit = async () => {
 if (!attemptId) return;

 setShowConfirmModal(false);
 setSubmitting(true);

 try {
 // Save any pending answers
 await saveAnswers();

 // Calculate time spent
 const timeSpent = test?.duration_minutes ? (test.duration_minutes * 60 - (timeRemaining || 0)) : 0;

 // Complete the attempt
 const success = await completeTestAttempt(attemptId, timeSpent);

 if (success) {
 toast.success("Test muvaffaqiyatli yakunlandi!");
 // Redirect to results page
 router.push(`/dashboard/results/${attemptId}`);
 } else {
 toast.error("Testni yakunlashda xatolik yuz berdi");
 setSubmitting(false);
 }
 } catch (error) {
 console.error("Error submitting test:", error);
 toast.error("Kutilmagan xatolik yuz berdi");
 setSubmitting(false);
 }
 };

 const formatTime = (seconds: number) => {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${mins}:${secs.toString().padStart(2, '0')}`;
 };

 const getTimerColor = () => {
 if (!timeRemaining || !test?.duration_minutes) return "text-gray-700 dark:text-gray-300";
 const totalSeconds = test.duration_minutes * 60;
 const percentage = (timeRemaining / totalSeconds) * 100;

 if (percentage <= 10) return "text-red-600 dark:text-red-400 animate-pulse";
 if (percentage <= 25) return "text-orange-600 dark:text-orange-400";
 return "text-gray-700 dark:text-gray-300";
 };

  if (loading) {
    return <TakeTestSkeleton />;
  }

 if (!test || questions.length === 0) {
 return (
 <div className="text-center py-12">
 <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
 <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-2">{t('tests.take.error.title')}</h2>
 <Link href="/dashboard/tests" className="text-brand-blue hover:underline">
 {t('tests.take.back_to_list')}
 </Link>
 </div>
 );
 }

 const currentQuestion = questions[currentQuestionIndex];
 const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans bg-transparent pb-24 md:pb-0">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      {/* Floating Header Island */}
      <div className="fixed top-4 left-4 right-4 md:left-auto md:right-1/2 md:translate-x-1/2 md:w-full md:max-w-3xl z-50 pointer-events-none">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-white/70 dark:border-slate-700/60 rounded-[32px] p-3 shadow-[0_8px_30px_rgb(0,86,210,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] pointer-events-auto flex flex-col gap-2 transition-all">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 truncate flex-1 pr-4">
              <span className="w-9 h-9 shrink-0 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold shadow-sm">
                {currentQuestionIndex + 1}/{questions.length}
              </span>
              <h1 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate hidden md:block">
                {test.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              {autoSaving && (
                <div className="hidden md:flex items-center gap-2 text-[13px] font-medium text-slate-500">
                  <Save size={16} className="animate-pulse text-brand-blue" />
                  {t('tests.take.saving')}
                </div>
              )}

              {timeRemaining !== null && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-full font-mono text-[14px] md:text-[15px] font-bold border border-slate-200/50 dark:border-slate-700/50 ${getTimerColor()}`}>
                  <Clock size={16} />
                  {formatTime(timeRemaining)}
                </div>
              )}

              <button
                onClick={handleSubmitClick}
                disabled={submitting}
                className="hidden md:flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-full font-bold transition-all shadow-sm text-[14px]"
              >
                <Send size={16} />
                {submitting ? "..." : "Yakunlash"}
              </button>
            </div>
          </div>
          
          <div className="px-3 pb-1 w-full">
            <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-brand-blue h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8 pt-32 pb-32 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* ── QUESTION DISPLAY ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] border border-gray-200/50 dark:border-slate-800/50 p-6 sm:p-8 shadow-sm">
              {/* Question Header */}
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 flex items-center justify-center bg-brand-blue text-white rounded-full font-bold text-lg shadow-sm shrink-0">
                  {currentQuestionIndex + 1}
                </span>
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[10px] text-[13px] font-bold tracking-wide uppercase">
                  {t('tests.take.points', { points: currentQuestion.points })}
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => handleMarkForReview(currentQuestion.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    markedForReview.has(currentQuestion.id)
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                  title={markedForReview.has(currentQuestion.id) ? t('tests.take.marked') : t('tests.take.mark')}
                >
                  <Flag size={18} className={markedForReview.has(currentQuestion.id) ? "fill-amber-500/20" : ""} />
                </button>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <p className="text-[18px] sm:text-[20px] font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                  {currentQuestion.question_text}
                </p>
              </div>

              {/* Answer Options */}
              <div className="flex flex-col gap-3">
                {currentQuestion.question_type === "multiple_choice" && currentQuestion.options && (
                  <>
                    {Object.entries(currentQuestion.options).map(([key, value]) => {
                      const isSelected = answers[currentQuestion.id] === key;
                      return (
                        <label
                          key={key}
                          className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all border ${
                            isSelected
                              ? "border-brand-blue bg-brand-blue/5 shadow-sm"
                              : "border-gray-200/60 dark:border-slate-700/60 hover:border-brand-blue/30 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-brand-blue bg-brand-blue" : "border-slate-300 dark:border-slate-600 bg-transparent"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            value={key}
                            checked={isSelected}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="hidden"
                          />
                          <div className="flex-1 text-[15px]">
                            <span className="font-bold text-slate-700 dark:text-slate-300 mr-2 uppercase">
                              {key}.
                            </span>
                            <span className={`font-medium ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                              {value as React.ReactNode}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </>
                )}

                {currentQuestion.question_type === "true_false" && (
                  <>
                    {["true", "false"].map((option) => {
                      const isSelected = answers[currentQuestion.id] === option;
                      return (
                        <label
                          key={option}
                          className={`flex items-center gap-4 p-4 rounded-[20px] cursor-pointer transition-all border ${
                            isSelected
                              ? "border-brand-blue bg-brand-blue/5 shadow-sm"
                              : "border-gray-200/60 dark:border-slate-700/60 hover:border-brand-blue/30 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-brand-blue bg-brand-blue" : "border-slate-300 dark:border-slate-600 bg-transparent"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <input
                            type="radio"
                            name={currentQuestion.id}
                            value={option}
                            checked={isSelected}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="hidden"
                          />
                          <span className={`font-bold text-[15px] ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>
                            {option === "true" ? t('tests.take.true') : t('tests.take.false')}
                          </span>
                        </label>
                      );
                    })}
                  </>
                )}

                {currentQuestion.question_type === "short_answer" && (
                  <textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={t('tests.take.placeholder')}
                    rows={4}
                    className="w-full px-5 py-4 border border-gray-200/60 dark:border-slate-700/60 rounded-[20px] bg-white/50 dark:bg-slate-800/50 text-[15px] font-medium text-slate-800 dark:text-slate-100 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
                  />
                )}
              </div>
            </div>

            {/* Navigation Buttons - Desktop Only */}
            <div className="hidden md:flex items-center justify-between mt-2">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-gray-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 rounded-[20px] font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ArrowLeft size={18} />
                {t('tests.take.prev')}
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitClick}
                  disabled={submitting}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-[20px] font-bold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                  {submitting ? t('tests.take.submitting') : t('tests.take.finish')}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-8 py-3 bg-brand-blue text-white rounded-[20px] font-bold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  {t('tests.take.next')}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* ── QUESTION NAVIGATOR ── */}
          <div className="lg:col-span-1">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] border border-gray-200/50 dark:border-slate-800/50 p-6 sticky top-28 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">{t('tests.take.questions_list')}</h3>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, index) => {
                  const isAnswered = !!answers[q.id];
                  const isMarked = markedForReview.has(q.id);
                  const isCurrent = index === currentQuestionIndex;

                  let btnClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent";
                  if (isCurrent) {
                    btnClass = "bg-brand-blue text-white shadow-md border-brand-blue";
                  } else if (isMarked) {
                    btnClass = "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-transparent";
                  } else if (isAnswered) {
                    btnClass = "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-transparent";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded-xl font-bold text-[14px] flex items-center justify-center transition-all border ${btnClass}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-5 border-t border-gray-200/50 dark:border-slate-800/50 flex flex-col gap-3 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                  <span>{t('tests.take.status.answered')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
                  <span>{t('tests.take.status.marked')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                  <span>{t('tests.take.status.no_answer')}</span>
                </div>
              </div>
            </div>

            {/* Mobile Horizontal Question Navigator */}
            <div className="lg:hidden mt-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] border border-gray-200/50 dark:border-slate-800/50 p-4 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {questions.map((q, index) => {
                  const isAnswered = !!answers[q.id];
                  const isMarked = markedForReview.has(q.id);
                  const isCurrent = index === currentQuestionIndex;

                  let btnClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
                  if (isCurrent) btnClass = "bg-brand-blue text-white shadow-md";
                  else if (isMarked) btnClass = "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
                  else if (isAnswered) btnClass = "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`shrink-0 w-11 h-11 rounded-xl font-bold text-[14px] flex items-center justify-center transition-all ${btnClass}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONFIRMATION MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] p-8 max-w-md w-full border border-gray-200/50 dark:border-slate-800/50 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/20 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="text-amber-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-fredoka">Testni yakunlash</h3>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <p className="text-[15px] text-slate-600 dark:text-slate-300 font-medium">
                Siz <span className="font-bold text-brand-blue px-2 py-1 bg-brand-blue/10 rounded-md mx-1">{Object.keys(answers).length}/{questions.length}</span> ta savolga javob berdingiz.
              </p>
              {Object.keys(answers).length < questions.length && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-[20px] border border-amber-200/50 dark:border-amber-500/20">
                  <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-[13px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                    <span className="font-bold">{questions.length - Object.keys(answers).length}</span> ta savol javobsiz qoldi! Agar ishonchingiz komil bo'lsa, yakunlashingiz mumkin.
                  </p>
                </div>
              )}
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Testni yakunlagandan keyin qayta tahrirlash imkoniyati bo'lmaydi.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-[20px] font-bold transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="flex-1 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-[20px] font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle size={18} />
                {submitting ? "Yuklanmoqda..." : "Yakunlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE FLOATING BOTTOM NAVIGATION ── */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 pointer-events-none">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-white/70 dark:border-slate-700/60 rounded-full p-2 shadow-[0_8px_30px_rgb(0,86,210,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] pointer-events-auto flex items-center justify-between gap-2 max-w-sm mx-auto safe-area-pb">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="w-12 h-12 flex items-center justify-center shrink-0 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-full font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitClick}
              disabled={submitting}
              className="flex-1 h-12 px-6 bg-emerald-500 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-md transition-all disabled:opacity-50 shadow-sm"
            >
              <Send size={18} />
              <span className="text-[15px]">{submitting ? "..." : "Yakunlash"}</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex-1 h-12 px-6 bg-brand-blue text-white rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-md transition-all shadow-sm"
            >
              <span className="text-[15px]">Keyingi</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
