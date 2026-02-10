"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
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

export default function ResultsPage() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Mock Data (Mixed: DTM & Regular)
    const results = [
        {
            id: 1,
            type: "dtm",
            exam: "DTM Mock #5 (Yurisprudensiya)",
            score: 156.5,
            maxScore: 189.0,
            date: "2024-05-12",
            status: "passed",
            rank: 3,
            breakdown: {
                compulsory: { math: 11, history: 11, lang: 11 }, // 33
                subject_1: { name: "Tarix", score: 86.8 }, // 28 * 3.1
                subject_2: { name: "Chet tili", score: 36.7 } // 17.5 * 2.1
            }
        },
        { id: 2, type: "regular", exam: "IELTS Full Mock", subject: "English", score: 7.5, maxScore: 9, date: "2024-05-05", status: "passed", rank: 12 },
        { id: 3, type: "dtm", exam: "DTM Mock #4", score: 112.2, maxScore: 189.0, date: "2024-04-28", status: "passed", rank: 25 },
        { id: 4, type: "regular", exam: "Math Quiz", subject: "Mathematics", score: 85, maxScore: 100, date: "2024-04-20", status: "passed", rank: 8 },
    ];

    const filteredResults = results.filter(result => {
        const matchesSearch = result.exam.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === "all" || result.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Imtihon Natijalari
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Barcha topshirilgan mock va testlar tarixi
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

            {/* Detailed Cards for DTM */}
            <div className="grid grid-cols-1 gap-6">
                {filteredResults.map((result: any) => (
                    <div key={result.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Left Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock size={16} />
                                        {result.date}
                                        {result.type === 'dtm' && (
                                            <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange rounded text-xs font-bold uppercase tracking-wider">
                                                DTM 2025
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{result.exam}</h3>

                                    {result.type === 'dtm' && result.breakdown && (
                                        <div className="flex flex-wrap gap-3 mt-3">
                                            <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-medium border border-gray-100 dark:border-slate-700 flex items-center gap-1.5">
                                                <BookOpen size={14} className="text-gray-400" />
                                                Majburiy:
                                                <span className="text-gray-900 dark:text-white font-bold">
                                                    {(result.breakdown.compulsory.math + result.breakdown.compulsory.history + result.breakdown.compulsory.lang).toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-800 flex items-center gap-1.5">
                                                <GraduationCap size={14} className="text-brand-blue" />
                                                {result.breakdown.subject_1.name}:
                                                <span className="text-brand-blue font-bold">{result.breakdown.subject_1.score}</span>
                                            </div>
                                            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-800 flex items-center gap-1.5">
                                                <GraduationCap size={14} className="text-brand-blue" />
                                                {result.breakdown.subject_2.name}:
                                                <span className="text-brand-blue font-bold">{result.breakdown.subject_2.score}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Score */}
                                <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                                    <div>
                                        <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                            {result.score} <span className="text-lg text-gray-400 font-normal">/ {result.maxScore}</span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Centrer Rank: <span className="font-bold text-gray-900 dark:text-white">#{result.rank}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
                                            <Eye size={16} />
                                            Check Answers
                                        </button>
                                        <button className="px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue rounded-xl text-sm font-bold transition-colors">
                                            Analysis
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6 w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand-blue rounded-full"
                                    style={{ width: `${(result.score / result.maxScore) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
