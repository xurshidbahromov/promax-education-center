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
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/context/ToastContext";

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

    const { showToast } = useToast();

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
        if (!attemptId) return;

        autoSaveInterval.current = setInterval(() => {
            saveAnswers();
        }, 5000); // Save every 5 seconds

        return () => {
            if (autoSaveInterval.current) {
                clearInterval(autoSaveInterval.current);
            }
        };
    }, [attemptId, answers]);

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
        showToast("Vaqt tugadi! Test avtomatik yakunlanmoqda...", "warning");

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
                showToast("Test muvaffaqiyatli yakunlandi!", "success");
                // Redirect to results page
                router.push(`/dashboard/results/${attemptId}`);
            } else {
                showToast("Testni yakunlashda xatolik yuz berdi", "error");
                setSubmitting(false);
            }
        } catch (error) {
            console.error("Error submitting test:", error);
            showToast("Kutilmagan xatolik yuz berdi", "error");
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
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">{t('tests.take.loading')}</p>
                </div>
            </div>
        );
    }

    if (!test || questions.length === 0) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('tests.take.error.title')}</h2>
                <Link href="/dashboard/tests" className="text-brand-blue hover:underline">
                    {t('tests.take.back_to_list')}
                </Link>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            {/* Mobile-Responsive Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    {/* Desktop Header */}
                    <div className="hidden md:flex items-center justify-between">
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                {test.title}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('tests.take.question_progress', { current: currentQuestionIndex + 1, total: questions.length })}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {autoSaving && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Save size={16} className="animate-pulse" />
                                    {t('tests.take.saving')}
                                </div>
                            )}

                            {timeRemaining !== null && (
                                <div className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl font-mono text-lg font-bold ${getTimerColor()}`}>
                                    <Clock size={20} />
                                    {formatTime(timeRemaining)}
                                </div>
                            )}

                            <button
                                onClick={handleSubmitClick}
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors shadow-sm"
                            >
                                <Send size={18} />
                                {submitting ? "Yuklanmoqda..." : "Yakunlash"}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Header - Compact */}
                    <div className="md:hidden">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">
                                Savol {currentQuestionIndex + 1}/{questions.length}
                            </h1>
                            {timeRemaining !== null && (
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg font-mono text-sm font-bold ${getTimerColor()}`}>
                                    <Clock size={14} />
                                    {formatTime(timeRemaining)}
                                </div>
                            )}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-1.5">
                            <div
                                className="bg-gradient-to-r from-brand-blue to-cyan-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Desktop Progress Bar */}
                    <div className="hidden md:block mt-3 w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-brand-blue to-cyan-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Question Display */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
                            {/* Question Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-4 py-2 bg-brand-blue text-white rounded-xl font-bold text-lg">
                                    {currentQuestionIndex + 1}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                                    {t('tests.take.points', { points: currentQuestion.points })}
                                </span>
                            </div>

                            {/* Question Text */}
                            <div className="mb-8">
                                <p className="text-xl text-gray-900 dark:text-white leading-relaxed">
                                    {currentQuestion.question_text}
                                </p>
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3">
                                {currentQuestion.question_type === "multiple_choice" && currentQuestion.options && (
                                    <>
                                        {Object.entries(currentQuestion.options).map(([key, value]) => (
                                            <label
                                                key={key}
                                                className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${answers[currentQuestion.id] === key
                                                    ? "border-brand-blue bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={currentQuestion.id}
                                                    value={key}
                                                    checked={answers[currentQuestion.id] === key}
                                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                                    className="mt-1 w-5 h-5 text-brand-blue"
                                                />
                                                <div className="flex-1">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">
                                                        {key}.
                                                    </span>
                                                    <span className="text-gray-900 dark:text-white">
                                                        {value}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </>
                                )}

                                {currentQuestion.question_type === "true_false" && (
                                    <>
                                        {["true", "false"].map((option) => (
                                            <label
                                                key={option}
                                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${answers[currentQuestion.id] === option
                                                    ? "border-brand-blue bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={currentQuestion.id}
                                                    value={option}
                                                    checked={answers[currentQuestion.id] === option}
                                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                                    className="w-5 h-5 text-brand-blue"
                                                />
                                                <span className="text-gray-900 dark:text-white font-medium">
                                                    {option === "true" ? t('tests.take.true') : t('tests.take.false')}
                                                </span>
                                            </label>
                                        ))}
                                    </>
                                )}

                                {currentQuestion.question_type === "short_answer" && (
                                    <textarea
                                        value={answers[currentQuestion.id] || ""}
                                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                        placeholder={t('tests.take.placeholder')}
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                                    />
                                )}
                            </div>

                            {/* Mark for Review */}
                            <div className="mt-6">
                                <button
                                    onClick={() => handleMarkForReview(currentQuestion.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${markedForReview.has(currentQuestion.id)
                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    <Flag size={18} />
                                    {markedForReview.has(currentQuestion.id) ? t('tests.take.marked') : t('tests.take.mark')}
                                </button>
                            </div>
                        </div>

                        {/* Navigation Buttons - Desktop Only */}
                        <div className="hidden md:flex mt-6 items-center justify-between">
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                                className="px-6 py-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft size={20} />
                                {t('tests.take.prev')}
                            </button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <button
                                    onClick={handleSubmitClick}
                                    disabled={submitting}
                                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    <Send size={20} />
                                    {submitting ? t('tests.take.submitting') : t('tests.take.finish')}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="px-6 py-3 bg-brand-blue text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg"
                                >
                                    {t('tests.take.next')}
                                    <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Horizontal Question Navigator */}
                    <div className="lg:hidden mt-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-3">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {questions.map((q, index) => {
                                const isAnswered = !!answers[q.id];
                                const isMarked = markedForReview.has(q.id);
                                const isCurrent = index === currentQuestionIndex;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`shrink-0 w-12 h-12 rounded-lg font-semibold text-sm transition-all ${isCurrent
                                            ? "bg-brand-blue text-white ring-2 ring-brand-blue"
                                            : isMarked
                                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                : isAnswered
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    {/* Question Navigator - Responsive */}
                    <div className="lg:col-span-1">
                        {/* Desktop Sidebar */}
                        <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sticky top-24">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('tests.take.questions_list')}</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {questions.map((q, index) => {
                                    const isAnswered = !!answers[q.id];
                                    const isMarked = markedForReview.has(q.id);
                                    const isCurrent = index === currentQuestionIndex;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => setCurrentQuestionIndex(index)}
                                            className={`aspect-square rounded-lg font-semibold text-sm transition-all ${isCurrent
                                                ? "bg-brand-blue text-white ring-2 ring-brand-blue ring-offset-2 dark:ring-offset-slate-900"
                                                : isMarked
                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                    : isAnswered
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                        : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">{t('tests.take.status.answered')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">{t('tests.take.status.marked')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">{t('tests.take.status.no_answer')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-slate-800 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Testni yakunlash</h3>
                        </div>

                        <div className="space-y-3 mb-6">
                            <p className="text-gray-600 dark:text-gray-300">
                                Siz <span className="font-bold text-brand-blue">{Object.keys(answers).length}/{questions.length}</span> ta savolga javob berdingiz.
                            </p>
                            {Object.keys(answers).length < questions.length && (
                                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                    <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        <span className="font-semibold">{questions.length - Object.keys(answers).length}</span> ta savol javobsiz qoldi!
                                    </p>
                                </div>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Testni yakunlashdan keyin qayta tahrirlash imkoniyati bo'lmaydi.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={submitting}
                                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleConfirmSubmit}
                                disabled={submitting}
                                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                {submitting ? "Yuklanmoqda..." : "Yakunlash"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Sticky Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-4 z-40">
                <div className="flex items-center justify-between gap-3">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                    >
                        <ArrowLeft size={18} />
                        Orqaga
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmitClick}
                            disabled={submitting}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            <Send size={18} />
                            {submitting ? "Yuklanmoqda..." : "Yakunlash"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            className="px-4 py-3 bg-brand-blue text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg min-w-[100px]"
                        >
                            Keyingi
                            <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>

    );
}
