"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    Filter,
    FileText,
    Download,
    Eye,
    Trash2,
    Calendar,
    GraduationCap
} from "lucide-react";
import { getAllResults } from "@/lib/admin-queries";
import { exportStudentResults } from "@/lib/excel-export";
import { useToast } from "@/context/ToastContext";

export default function ResultsListPage() {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const data = await getAllResults(50); // Fetch last 50 results
            setResults(data);
        } catch (error) {
            console.error("Error fetching results:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(result =>
        (result.student?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.exam?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = async () => {
        if (filteredResults.length === 0) {
            showToast("Export qilish uchun ma'lumot yo'q", "warning");
            return;
        }

        try {
            const exportData = filteredResults.map(r => ({
                student_name: r.student?.full_name || 'Unknown',
                phone: r.student?.phone || 'N/A',
                test_title: r.exam?.title || 'N/A', // Changed from r.test?.title
                subject: r.direction?.title || 'N/A', // Changed from r.test?.subject
                score: r.total_score || 0, // Changed from r.score
                max_score: 189, // Changed from r.max_score, assuming 189 is constant
                percentage: ((r.total_score || 0) / 189) * 100, // Changed from r.percentage
                passing_score: 60, // Changed from r.test?.passing_score || 60, assuming 60 is constant
                completed_at: r.exam?.date || new Date().toISOString(), // Changed from r.completed_at
                time_spent_seconds: null // Changed from r.time_spent_seconds, assuming null
            }));

            setLoading(true);
            await exportStudentResults(exportData);
            showToast(`${filteredResults.length} ta natija Excel formatida yuklandi`, "success");
        } catch (error) {
            console.error("Export error:", error);
            showToast("Export qilishda xatolik yuz berdi", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="text-brand-blue" size={32} />
                        Imtihon Natijalari
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Barcha o'tkazilgan imtihonlar ro'yxati va natijalari.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="h-10 px-4 flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    <Link
                        href="/admin/results/new"
                        className="h-10 px-4 bg-brand-blue text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <Plus size={18} />
                        Yangi Natija
                    </Link>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="w-full sm:flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="O'quvchi ismi bo'yicha qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                    />
                </div>
                {/* Filters can generally be add later */}
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-500">
                        Natijalar topilmadi.
                    </div>
                ) : (
                    filteredResults.map((result) => {
                        const percentage = (result.total_score / 189) * 100;
                        return (
                            <div key={result.id} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 shadow-sm">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {result.student?.full_name || "Unknown"}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                            <Calendar size={12} />
                                            {result.exam?.date ? new Date(result.exam.date).toLocaleDateString() : "-"}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                                            {result.total_score?.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-gray-400">/ 189.0</div>
                                    </div>
                                </div>

                                {/* Direction */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                                    <GraduationCap size={14} />
                                    <span className="truncate">{result.direction?.title || "-"}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Foiz</span>
                                        <span className="font-semibold" style={{ color: percentage >= 56.6 ? '#16a34a' : percentage >= 30 ? '#f59e0b' : '#ef4444' }}>
                                            {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: percentage >= 56.6 ? '#16a34a' : percentage >= 30 ? '#f59e0b' : '#ef4444'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Tablet+ Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">O'quvchi</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imtihon</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Yo'nalish</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ball</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Foiz</th>
                                {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amallar</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Yuklanmoqda...
                                    </td>
                                </tr>
                            ) : filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Natijalar topilmadi.
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result) => {
                                    const percentage = (result.total_score / 189) * 100;

                                    return (
                                        <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {result.student?.full_name || "Unknown"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {result.exam?.date ? new Date(result.exam.date).toLocaleDateString() : "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <GraduationCap size={14} className="text-gray-400" />
                                                    {result.direction?.title || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {result.total_score?.toFixed(1)}
                                                </span>
                                                <span className="text-gray-400 text-xs ml-1">/ 189.0</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                            {/* <td className="px-6 py-4">
                                            <button className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                <Eye size={16} />
                                            </button>
                                        </td> */}
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
