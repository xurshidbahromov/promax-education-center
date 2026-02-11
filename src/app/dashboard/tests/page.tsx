"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import {
    FileText,
    Clock,
    Zap,
    BookOpen,
    CheckCircle2,
    BarChart,
    Search,
    Filter
} from "lucide-react";
import { getAvailableExams, type Exam } from "@/lib/supabase-queries";

export default function OnlineTestsPage() {
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<Exam[]>([]);

    // Fetch available exams from Supabase
    useEffect(() => {
        async function fetchExams() {
            const availableExams = await getAvailableExams();
            setExams(availableExams);
            setLoading(false);
        }

        fetchExams();
    }, []);

    // Filter by exam type (category)
    const filteredTests = selectedCategory === "all"
        ? exams
        : exams.filter(exam => exam.type === selectedCategory);

    const categories = [
        { id: "all", label: t('tests.categories.all') || "All Tests" },
        { id: "dtm", label: "DTM" },
        { id: "quiz", label: t('tests.categories.quiz') || "Quiz" },
        { id: "topic", label: t('tests.categories.topic') || "Topic Test" },
    ];

    return (
        <div className="space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Zap className="text-brand-blue" size={32} />
                        {t('tests.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('tests.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <Search className="text-gray-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        className="bg-transparent border-none focus:ring-0 text-sm w-48"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`
                            px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all
                            ${selectedCategory === cat.id
                                ? "bg-brand-blue text-white shadow-md shadow-blue-500/20"
                                : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                            }
                        `}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Tests Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-400">Loading tests...</p>
                    </div>
                ) : filteredTests.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-400">{t('dashboard.no_results')}</p>
                    </div>
                ) : (
                    filteredTests.map((exam) => {
                        // Determine colors based on exam type
                        const getColors = (type: string) => {
                            switch (type) {
                                case 'dtm':
                                    return { bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-500' };
                                case 'quiz':
                                    return { bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-500' };
                                default:
                                    return { bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-500' };
                            }
                        };

                        const { bg, color } = getColors(exam.type);
                        const examDate = new Date(exam.created_at).toLocaleDateString('uz-UZ', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        // Status badge
                        const isUpcoming = exam.status === 'upcoming';
                        const isActive = exam.status === 'active';

                        return (
                            <div key={exam.id} className={`${bg} rounded-3xl p-6 border border-gray-200/50 dark:border-slate-700/50 cursor-pointer hover:shadow-lg transition-all group`}>
                                <div className="flex items-start justify-between mb-4">
                                    <FileText className={color} size={28} />
                                    {isActive && (
                                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                            Active
                                        </span>
                                    )}
                                    {isUpcoming && (
                                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                                            Upcoming
                                        </span>
                                    )}
                                </div>

                                <h3 className={`text-lg font-bold ${color} mb-3`}>{exam.title}</h3>

                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock size={16} />
                                        {examDate}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen size={16} />
                                        {exam.type.toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BarChart size={16} />
                                        Max: 189 ball
                                    </div>
                                </div>

                                <button
                                    className="w-full py-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white font-bold group-hover:bg-brand-blue group-hover:text-white transition-all flex items-center justify-center gap-2"
                                    disabled={exam.status === 'finished'}
                                >
                                    {isActive ? 'Start Test' : 'View Details'} <CheckCircle2 size={18} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
