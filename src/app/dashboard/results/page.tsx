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
    FileText
} from "lucide-react";

export default function ResultsPage() {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // Mock Data
    const results = [
        { id: 1, exam: "Mock Exam #4", subject: "Mathematics (SAT)", score: 92, maxScore: 100, date: "2024-04-20", status: "passed", rank: 5 },
        { id: 2, exam: "IELTS Speaking", subject: "English", score: 6.5, maxScore: 9, date: "2024-04-18", status: "passed", rank: 12 },
        { id: 3, exam: "Vocabulary Quiz 3", subject: "English", score: 45, maxScore: 100, date: "2024-04-15", status: "failed", rank: 45 },
        { id: 4, exam: "Physics Chapter 5", subject: "Physics", score: 78, maxScore: 100, date: "2024-04-10", status: "passed", rank: 8 },
        { id: 5, exam: "General Mock", subject: "Mixed", score: 68, maxScore: 100, date: "2024-04-05", status: "passed", rank: 22 },
    ];

    const filteredResults = results.filter(result => {
        const matchesSearch = result.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === "all" || result.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

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
                    Export All Results
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by exam name or subject..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <select
                            className="appearance-none pl-4 pr-10 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all cursor-pointer"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-blue/5 border-b border-gray-200 dark:border-slate-800">
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Exam Name</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Subject</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Score</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Rank</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {filteredResults.map((result) => (
                                <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{result.exam}</div>
                                        <div className="text-xs text-gray-500 md:hidden">{result.subject}</div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">{result.subject}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" />
                                            {result.date}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {result.score} <span className="text-gray-400 text-xs font-normal">/ {result.maxScore}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">
                                        #{result.rank}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(result.status)}`}>
                                            {result.status === 'passed' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                            {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="p-2 text-gray-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Download Report">
                                            <FileText size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredResults.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No results found for your search.
                    </div>
                )}
            </div>
        </div>
    );
}
