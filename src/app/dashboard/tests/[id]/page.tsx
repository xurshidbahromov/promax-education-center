"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    FileText,
    BookOpen,
    BarChart,
    Play,
    Award,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { getTestById, getStudentTestHistory, type Test } from "@/lib/tests";

export default function TestDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const testId = params.id as string;

    const [test, setTest] = useState<Test | null>(null);
    const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTest() {
            try {
                const testData = await getTestById(testId);
                setTest(testData);

                // Get previous attempts
                const { data: user } = await (await import("@/lib/supabase")).supabase.auth.getUser();
                if (user.user) {
                    const history = await getStudentTestHistory(user.user.id, testId);
                    setPreviousAttempts(history);
                }
            } catch (error) {
                console.error("Error loading test:", error);
            } finally {
                setLoading(false);
            }
        }

        loadTest();
    }, [testId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Test topilmadi</h2>
                <Link href="/dashboard/tests" className="text-brand-blue hover:underline">
                    Testlar ro'yxatiga qaytish
                </Link>
            </div>
        );
    }

    const getSubjectGradient = (subject: string) => {
        const gradients: Record<string, string> = {
            math: "from-blue-500 to-cyan-500",
            english: "from-green-500 to-emerald-500",
            physics: "from-purple-500 to-pink-500",
            chemistry: "from-orange-500 to-red-500",
            biology: "from-teal-500 to-green-500",
        };
        return gradients[subject] || "from-gray-500 to-slate-500";
    };

    const bestScore = previousAttempts.length > 0
        ? Math.max(...previousAttempts.map(a => a.percentage || 0))
        : null;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Back Button */}
            <Link
                href="/dashboard/tests"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-blue mb-6"
            >
                <ArrowLeft size={20} />
                Testlar ro'yxatiga qaytish
            </Link>

            {/* Test Header */}
            <div className={`bg-gradient-to-r ${getSubjectGradient(test.subject)} rounded-3xl p-8 mb-8 text-white`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                                {test.subject.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-semibold capitalize">
                                {test.test_type}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{test.title}</h1>
                        {test.description && (
                            <p className="text-white/90">{test.description}</p>
                        )}
                    </div>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                        <FileText size={40} />
                    </div>
                </div>

                {/* Test Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <BookOpen size={18} />
                            <span className="text-sm opacity-90">Savollar</span>
                        </div>
                        <div className="text-2xl font-bold">{test.total_questions}</div>
                    </div>

                    {test.duration_minutes && (
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock size={18} />
                                <span className="text-sm opacity-90">Vaqt</span>
                            </div>
                            <div className="text-2xl font-bold">{test.duration_minutes} min</div>
                        </div>
                    )}

                    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart size={18} />
                            <span className="text-sm opacity-90">Qiyinlik</span>
                        </div>
                        <div className="text-2xl font-bold capitalize">{test.difficulty_level}</div>
                    </div>

                    {bestScore !== null && (
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Award size={18} />
                                <span className="text-sm opacity-90">Eng yaxshi</span>
                            </div>
                            <div className="text-2xl font-bold">{bestScore.toFixed(0)}%</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Test Rules & Instructions */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Test qoidalari
                </h2>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">1</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            Testda <strong>{test.total_questions} ta savol</strong> bor
                        </p>
                    </li>
                    {test.duration_minutes && (
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-xs font-bold">2</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                                Vaqt cheklangan: <strong>{test.duration_minutes} daqiqa</strong>. Vaqt tugagach test avtomatik yuboriladi.
                            </p>
                        </li>
                    )}
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">{test.duration_minutes ? '3' : '2'}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            Javoblaringiz avtomatik saqlanadi. Sahifani yopsangiz ham, qaytib davom ettira olasiz.
                        </p>
                    </li>
                    <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-xs font-bold">{test.duration_minutes ? '4' : '3'}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            Testni tugatgandan keyin to'g'ri javoblar va tushuntirishlarni ko'rasiz.
                        </p>
                    </li>
                </ul>
            </div>

            {/* Previous Attempts */}
            {previousAttempts.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={24} className="text-brand-blue" />
                        Oldingi urinishlar
                    </h2>
                    <div className="space-y-3">
                        {previousAttempts.slice(0, 5).map((attempt, index) => (
                            <div
                                key={attempt.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${(attempt.percentage || 0) >= 80
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : (attempt.percentage || 0) >= 60
                                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        }`}>
                                        {attempt.percentage?.toFixed(0) || 0}%
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            Urinish #{previousAttempts.length - index}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString('uz-UZ', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">Ball</div>
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {attempt.score || 0}/{attempt.max_score || test.total_questions}
                                        </div>
                                    </div>
                                    {attempt.status === 'completed' && (
                                        <Link
                                            href={`/dashboard/results/${attempt.id}`}
                                            className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 text-sm font-medium"
                                        >
                                            Ko'rish
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Start Test Button */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                            Tayyor misiz?
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {previousAttempts.length > 0
                                ? "Natijani yaxshilash uchun qayta urinib ko'ring"
                                : "Testni boshlash uchun tugmani bosing"
                            }
                        </p>
                    </div>
                    <Link
                        href={`/dashboard/tests/${test.id}/take`}
                        className="px-8 py-4 bg-gradient-to-r from-brand-blue to-cyan-500 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all"
                    >
                        <Play size={20} />
                        Testni Boshlash
                    </Link>
                </div>
            </div>
        </div>
    );
}
