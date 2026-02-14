"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronDown,
    FileText,
    Eye,
    BookOpen,
    GraduationCap
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getStudentResults, type ExamResult } from "@/lib/supabase-queries";
import Link from "next/link";

export default function ResultsPage() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<ExamResult[]>([]);

    // Fetch results from Supabase
    useEffect(() => {
        async function fetchResults() {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch student results
            const studentResults = await getStudentResults(user.id);
            setResults(studentResults);
            setLoading(false);
        }

        fetchResults();
    }, []);

    const filteredResults = results.filter(result => {
        const examTitle = result.exam?.title || "";
        const matchesSearch = examTitle.toLowerCase().includes(searchQuery.toLowerCase());
        // For now, show all results (can add status filter later)
        return matchesSearch;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t('results.title')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('results.subtitle')}
                    </p>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-brand-blue/30 flex items-center gap-2">
                    <Download size={18} />
                    {t('results.export')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search exam name..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="appearance-none px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all cursor-pointer dark:text-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Results Cards */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-12 text-center">
                        <p className="text-gray-400">Loading results...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-12 text-center">
                        <p className="text-gray-400">{t('dashboard.no_results')}</p>
                    </div>
                ) : (
                    filteredResults.map((result) => {
                        const examDate = new Date(result.created_at).toLocaleDateString('uz-UZ', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                        const examType = result.exam?.type || 'quiz';
                        const isDTM = examType === 'dtm';
                        const maxScore = 189.0; // DTM max score

                        return (
                            <div key={result.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        {/* Left Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock size={16} />
                                                {examDate}
                                                {isDTM && (
                                                    <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange rounded text-xs font-bold uppercase tracking-wider">
                                                        DTM 2025
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {result.exam?.title || 'Unknown Exam'}
                                            </h3>

                                            {isDTM && (
                                                <div className="flex flex-wrap gap-3 mt-3">
                                                    {/* Compulsory Subjects Total */}
                                                    <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-medium border border-gray-100 dark:border-slate-700 flex items-center gap-1.5">
                                                        <BookOpen size={14} className="text-gray-400" />
                                                        Majburiy:
                                                        <span className="text-gray-900 dark:text-white font-bold">
                                                            {((result.compulsory_math_score || 0) + (result.compulsory_history_score || 0) + (result.compulsory_lang_score || 0)).toFixed(1)}
                                                        </span>
                                                    </div>
                                                    {/* Subject 1 */}
                                                    {result.subject_1_score && (
                                                        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-800 flex items-center gap-1.5">
                                                            <GraduationCap size={14} className="text-brand-blue" />
                                                            Fan 1:
                                                            <span className="text-brand-blue font-bold">{result.subject_1_score.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                    {/* Subject 2 */}
                                                    {result.subject_2_score && (
                                                        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-800 flex items-center gap-1.5">
                                                            <GraduationCap size={14} className="text-brand-blue" />
                                                            Fan 2:
                                                            <span className="text-brand-blue font-bold">{result.subject_2_score.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Direction Info */}
                                            {result.direction && (
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {result.direction.title} ({result.direction.code})
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Score */}
                                        <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                                            <div>
                                                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                                    {result.total_score.toFixed(1)} <span className="text-lg text-gray-400 font-normal">/ {maxScore}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/dashboard/results/${result.id}`}
                                                    className="px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <Eye size={16} />
                                                    Ko'rish
                                                </Link>
                                                <Link
                                                    href={`/dashboard/results/${result.id}`}
                                                    className="px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-xl text-sm font-bold transition-colors"
                                                >
                                                    Tahlil
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-6 w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-brand-blue rounded-full"
                                            style={{ width: `${(result.total_score / maxScore) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
