"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    User,
    Phone,
    Calendar,
    FileText,
    TrendingUp,
    Award
} from "lucide-react";
import { getStudent, getStudentResults, Student } from "@/lib/admin-queries";

export default function StudentProgressPage() {
    const params = useParams();
    const [student, setStudent] = useState<Student | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchData(params.id as string);
        }
    }, [params.id]);

    const fetchData = async (id: string) => {
        setLoading(true);
        try {
            const [studentData, resultsData] = await Promise.all([
                getStudent(id),
                getStudentResults(id)
            ]);
            setStudent(studentData);
            setResults(resultsData);
        } catch (error) {
            console.error("Error fetching student data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats
    const totalTests = results.length;
    const avgScore = totalTests > 0
        ? results.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / totalTests
        : 0;
    const bestScore = totalTests > 0
        ? Math.max(...results.map(r => r.total_score || 0))
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">O'quvchi topilmadi</h2>
                <Link href="/admin/students" className="text-brand-blue hover:underline mt-4 inline-block">
                    Ortga qaytish
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div>
                <Link
                    href="/admin/students"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Ortga qaytish
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {student.full_name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                                <Phone size={14} /> {student.phone || "No phone"}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} /> Qo'shildi: {new Date(student.joined_at).toLocaleDateString()}
                            </span>
                        </p>
                    </div>

                    <Link
                        href={`/admin/students/${student.id}/edit`}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Tahrirlash
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="text-blue-600" size={20} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Jami Testlar</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalTests}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <TrendingUp className="text-orange-600" size={20} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">O'rtacha Ball</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {avgScore.toFixed(1)}
                        <span className="text-sm font-normal text-gray-400 ml-2">/ 189.0</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Award className="text-green-600" size={20} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Eng Yaxshi Natija</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {bestScore.toFixed(1)}
                    </div>
                </div>
            </div>

            {/* Recent Results Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Imtihon Tarixi</h2>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sana</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imtihon</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Yo'nalish</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ball</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Foiz</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Hozircha natijalar yo'q.
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((result) => {
                                        const percentage = (result.total_score / 189) * 100;
                                        return (
                                            <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {result.exam?.date ? new Date(result.exam.date).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {result.exam?.title || "DTM Mock"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {result.direction?.title || "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {result.total_score?.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${percentage >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                            percentage >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
