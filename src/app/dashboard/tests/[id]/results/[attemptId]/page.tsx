"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    TrendingUp,
    Star,
    RotateCcw,
    Share2,
    AlertCircle
} from "lucide-react";
import { getAttemptResults } from "@/lib/tests";

export default function TestResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const testId = params.id as string;
    const attemptId = params.attemptId as string;

    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showReview, setShowReview] = useState(false);

    useEffect(() => {
        async function loadResults() {
            try {
                const data = await getAttemptResults(attemptId);
                setResults(data);
            } catch (error) {
                console.error("Error loading results:", error);
            } finally {
                setLoading(false);
            }
        }

        loadResults();
    }, [attemptId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">{t('tests.result.loading')}</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('tests.result.not_found')}</h2>
                <Link href="/dashboard/tests" className="text-brand-blue hover:underline">
                    {t('tests.result.back')}
                </Link>
            </div>
        );
    }

    const { attempt, responses } = results;
    const percentage = attempt.percentage || 0;
    const correctCount = responses.filter((r: any) => r.is_correct).length;
    const totalQuestions = responses.length;

    const getPerformanceMessage = () => {
        if (percentage >= 90) return { text: t('tests.result.msg.excellent'), color: "text-green-600", emoji: "🎉" };
        if (percentage >= 75) return { text: t('tests.result.msg.very_good'), color: "text-blue-600", emoji: "👏" };
        if (percentage >= 60) return { text: t('tests.result.msg.good'), color: "text-yellow-600", emoji: "👍" };
        return { text: t('tests.result.msg.practice'), color: "text-orange-600", emoji: "💪" };
    };

    const performance = getPerformanceMessage();

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            {/* Back Button */}
            <Link
                href="/dashboard/tests"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-blue mb-6"
            >
                <ArrowLeft size={20} />
                {t('tests.result.back')}
            </Link>

            {/* Results Summary */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 mb-8 text-white">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur rounded-full mb-4">
                        <Award size={48} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">
                        {performance.emoji} {performance.text}
                    </h1>
                    <p className="text-white/90 text-lg">{t('tests.result.finished')}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold mb-1">{percentage.toFixed(0)}%</div>
                        <div className="text-sm opacity-90">{t('tests.result.stat.score')}</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold mb-1">{attempt.score}/{attempt.max_score}</div>
                        <div className="text-sm opacity-90">{t('tests.result.stat.points')}</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                        <div className="text-3xl font-bold mb-1">{correctCount}/{totalQuestions}</div>
                        <div className="text-sm opacity-90">{t('tests.result.stat.correct')}</div>
                    </div>

                    {attempt.time_spent_seconds && (
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                            <div className="text-3xl font-bold mb-1">
                                {Math.floor(attempt.time_spent_seconds / 60)}:{(attempt.time_spent_seconds % 60).toString().padStart(2, '0')}
                            </div>
                            <div className="text-sm opacity-90">{t('tests.result.stat.time')}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link
                    href={`/dashboard/tests/${testId}`}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-brand-blue to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                >
                    <RotateCcw size={20} />
                    {t('tests.result.retry')}
                </Link>

                <button
                    onClick={() => setShowReview(!showReview)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:border-brand-blue transition-all"
                >
                    <CheckCircle size={20} />
                    {showReview ? t('tests.result.hide_answers') : t('tests.result.show_answers')}
                </button>

                <Link
                    href="/dashboard/tests"
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                >
                    {t('tests.result.list')}
                </Link>
            </div>

            {/* Score Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={24} className="text-brand-blue" />
                    {t('tests.result.analysis')}
                </h2>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tests.result.correct_answers')}</span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">{correctCount} / {totalQuestions}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                                style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('tests.result.incorrect_answers')}</span>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">{totalQuestions - correctCount} / {totalQuestions}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-3">
                            <div
                                className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all"
                                style={{ width: `${((totalQuestions - correctCount) / totalQuestions) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Review */}
            {showReview && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {t('tests.result.review')}
                    </h2>

                    {responses.map((response: any, index: number) => {
                        const isCorrect = response.is_correct;
                        const question = response.question;

                        return (
                            <div
                                key={response.id}
                                className={`bg-white dark:bg-slate-900 rounded-2xl border-2 p-6 ${isCorrect
                                    ? "border-green-200 dark:border-green-900/30"
                                    : "border-red-200 dark:border-red-900/30"
                                    }`}
                            >
                                {/* Question Header */}
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold">
                                        {index + 1}
                                    </span>
                                    {isCorrect ? (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
                                            <CheckCircle size={16} />
                                            {t('tests.take.true')}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold">
                                            <XCircle size={16} />
                                            {t('tests.take.false')}
                                        </div>
                                    )}
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm">
                                        {t('tests.take.points', { points: `${response.points_earned}/${question.points}` })}
                                    </span>
                                </div>

                                {/* Question Text */}
                                <p className="text-lg text-gray-900 dark:text-white mb-4">
                                    {question.question_text}
                                </p>

                                {/* Your Answer */}
                                <div className="mb-3">
                                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        {t('tests.result.your_answer')}
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg ${isCorrect
                                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                        }`}>
                                        {response.student_answer || t('tests.result.no_answer')}
                                    </div>
                                </div>

                                {/* Correct Answer */}
                                {!isCorrect && (
                                    <div className="mb-3">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            {t('tests.result.correct_answer')}
                                        </div>
                                        <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
                                            {question.correct_answer}
                                        </div>
                                    </div>
                                )}

                                {/* Explanation */}
                                {question.explanation && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                        <div className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">
                                            💡 {t('tests.result.explanation')}
                                        </div>
                                        <p className="text-sm text-blue-600 dark:text-blue-300">
                                            {question.explanation}
                                        </p>
                                    </div>
                                )}

                                {/* Options for MCQ */}
                                {question.question_type === "multiple_choice" && question.options && (
                                    <div className="mt-4 space-y-2">
                                        {Object.entries(question.options).map(([key, value]: [string, any]) => (
                                            <div
                                                key={key}
                                                className={`p-3 rounded-lg border ${key === question.correct_answer
                                                    ? "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                                                    : key === response.student_answer
                                                        ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
                                                        : "border-gray-200 dark:border-slate-800"
                                                    }`}
                                            >
                                                <span className="font-semibold mr-2">{key}.</span>
                                                <span>{value}</span>
                                                {key === question.correct_answer && (
                                                    <CheckCircle className="inline ml-2 text-green-600" size={16} />
                                                )}
                                                {key === response.student_answer && key !== question.correct_answer && (
                                                    <XCircle className="inline ml-2 text-red-600" size={16} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Motivational Message */}
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 text-center">
                <Star className="mx-auto text-purple-600 dark:text-purple-400 mb-2" size={32} />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {percentage >= 80 ? t('tests.result.motivation.keep_going') : t('tests.result.motivation.practice')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    {percentage >= 80
                        ? t('tests.result.motivation.high_desc')
                        : t('tests.result.motivation.low_desc')}
                </p>
            </div>
        </div>
    );
}
