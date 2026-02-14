"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getAttemptResults, type TestAttempt, type QuestionResponse, type Question } from "@/lib/tests";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    HelpCircle,
    Check
} from "lucide-react";

type DetailedResponse = QuestionResponse & { question: Question };

export default function ResultDetailPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const params = useParams();

    const [loading, setLoading] = useState(true);
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [responses, setResponses] = useState<DetailedResponse[]>([]);

    useEffect(() => {
        if (params.id) {
            fetchResult(params.id as string);
        }
    }, [params.id]);

    const fetchResult = async (id: string) => {
        try {
            const data = await getAttemptResults(id);
            if (data) {
                setAttempt(data.attempt);
                setResponses(data.responses);
            }
        } catch (error) {
            console.error("Error fetching result:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (!attempt) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Natija topilmadi</h2>
                <button
                    onClick={() => router.back()}
                    className="text-brand-blue hover:underline mt-4 inline-block"
                >
                    Ortga qaytish
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    {t('common.back') || "Ortga"}
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Test Natijalari
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <Clock size={16} />
                                {new Date(attempt.completed_at || attempt.started_at).toLocaleString()}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Ball</div>
                            <div className="text-3xl font-bold text-brand-blue">
                                {attempt.score} <span className="text-lg text-gray-400 font-normal">/ {attempt.max_score}</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Foiz</div>
                            <div className={`text-3xl font-bold ${(attempt.percentage || 0) >= 80 ? 'text-green-500' :
                                    (attempt.percentage || 0) >= 60 ? 'text-yellow-500' : 'text-red-500'
                                }`}>
                                {attempt.percentage}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Savollar Tahlili
                </h2>

                {responses.map((response, index) => {
                    const isCorrect = response.is_correct;
                    const question = response.question;

                    return (
                        <div key={response.id} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border-l-4 shadow-sm ${isCorrect ? 'border-l-green-500 border-gray-200 dark:border-slate-800' : 'border-l-red-500 border-gray-200 dark:border-slate-800'
                            }`}>
                            <div className="flex justify-between gap-4 mb-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    <span className="text-gray-400 mr-2">{index + 1}.</span>
                                    {question.question_text}
                                </h3>
                                <div>
                                    {isCorrect ? (
                                        <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                                            <CheckCircle2 size={16} />
                                            To'g'ri (+{response.points_earned})
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                                            <XCircle size={16} />
                                            Xato (0)
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3 pl-6">
                                {question.options && Object.entries(question.options).map(([key, value]) => {
                                    const isSelected = response.student_answer === key;
                                    const isCorrectAnswer = question.correct_answer === key;

                                    let optionClass = "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800";
                                    let icon = null;

                                    if (isCorrectAnswer) {
                                        optionClass = "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900 text-green-800 dark:text-green-300";
                                        icon = <Check size={16} />;
                                    } else if (isSelected && !isCorrectAnswer) {
                                        optionClass = "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 text-red-800 dark:text-red-300";
                                        icon = <XCircle size={16} />;
                                    }

                                    return (
                                        <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border ${optionClass} transition-colors`}>
                                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-900 shadow-sm text-sm font-bold">
                                                {key}
                                            </div>
                                            <span className="flex-1 font-medium">{value}</span>
                                            {icon}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation */}
                            {question.explanation && (
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-indigo-900/20 rounded-xl flex gap-3 text-sm text-blue-800 dark:text-blue-200">
                                    <HelpCircle size={20} className="shrink-0" />
                                    <div>
                                        <span className="font-bold block mb-1">Tushuntirish:</span>
                                        {question.explanation}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
