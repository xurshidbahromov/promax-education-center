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
    const [filterSubject, setFilterSubject] = useState("all");
    const [filterTestType, setFilterTestType] = useState("all");
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<ExamResult[]>([]);

    const [exporting, setExporting] = useState(false);

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

    const handleExport = async () => {
        try {
            setExporting(true);
            const { utils, writeFile } = await import("xlsx");

            const exportData = filteredResults.map(result => {
                const examType = result.exam?.type || 'quiz';
                const isDTM = examType === 'dtm';
                const score = result.total_score || 0;
                const maxScore = result.exam?.max_score || (isDTM ? 189.0 : 100);
                const percentage = (score / maxScore) * 100;

                return {
                    "Sana": new Date(result.created_at).toLocaleDateString('uz-UZ'),
                    "Imtihon Nomi": result.exam?.title || "Noma'lum",
                    "Fan": (result.exam as any)?.subject || "Noma'lum",
                    "Tur": isDTM ? "DTM" : "Quiz",
                    "To'plangan Ball": score.toFixed(1),
                    "Maksimal Ball": maxScore,
                    "Foiz": `${percentage.toFixed(1)}%`,
                    "Holat": percentage >= 60 ? "O'tgan" : "O'tmagan"
                };
            });

            const wb = utils.book_new();
            const ws = utils.json_to_sheet(exportData);

            // Auto-width columns
            const colWidths = [
                { wch: 12 }, // Sana
                { wch: 30 }, // Imtihon Nomi
                { wch: 15 }, // Fan
                { wch: 10 }, // Tur
                { wch: 15 }, // To'plangan Ball
                { wch: 15 }, // Maksimal Ball
                { wch: 10 }, // Foiz
                { wch: 10 }  // Holat
            ];
            ws['!cols'] = colWidths;

            utils.book_append_sheet(wb, ws, "Natijalar");
            writeFile(wb, `Promax_Natijalar_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error("Export error:", error);
            alert("Export qilishda xatolik yuz berdi");
        } finally {
            setExporting(false);
        }
    };


    const filteredResults = results.filter(result => {
        const examTitle = result.exam?.title || "";
        // @ts-ignore - subject property might be missing in type but present in data or legacy
        const examSubject = (result.exam as any)?.subject || "";
        const examType = result.exam?.type || "";
        const score = result.total_score || 0;
        const maxScore = result.exam?.max_score || 100;
        const percentage = (score / maxScore) * 100;

        // Search filter
        const matchesSearch = examTitle.toLowerCase().includes(searchQuery.toLowerCase());

        // Subject filter
        const matchesSubject = filterSubject === "all" || examSubject === filterSubject;

        // Test type filter
        const matchesTestType = filterTestType === "all" || examType === filterTestType;

        // Status filter
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "passed" && percentage >= 60) ||
            (filterStatus === "failed" && percentage < 60);

        return matchesSearch && matchesSubject && matchesTestType && matchesStatus;
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
                <button
                    onClick={handleExport}
                    disabled={exporting || filteredResults.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-brand-blue/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {exporting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Download size={18} />
                    )}
                    {exporting ? "Yuklanmoqda..." : t('results.export')}
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
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                >
                    <option value="all">Barcha fanlar</option>
                    <option value="matematika">Matematika</option>
                    <option value="ingliz_tili">Ingliz tili</option>
                    <option value="ona_tili">Ona tili</option>
                    <option value="tarix">Tarix</option>
                    <option value="biologiya">Biologiya</option>
                    <option value="fizika">Fizika</option>
                    <option value="kimyo">Kimyo</option>
                </select>
                <select
                    className="appearance-none px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all cursor-pointer dark:text-white"
                    value={filterTestType}
                    onChange={(e) => setFilterTestType(e.target.value)}
                >
                    <option value="all">Barcha turlar</option>
                    <option value="dtm">DTM</option>
                    <option value="quiz">Quiz</option>
                    <option value="topic">Mavzu</option>
                </select>
                <select
                    className="appearance-none px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all cursor-pointer dark:text-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">Barcha holatlar</option>
                    <option value="passed">O'tgan</option>
                    <option value="failed">O'tmagan</option>
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
