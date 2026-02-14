"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import {
    Plus,
    FileText,
    Edit,
    Trash2,
    Eye,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    BarChart3,
    Search,
    Filter,
    Copy
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { type Test, deleteTest, toggleTestPublish, duplicateTest } from "@/lib/tests";

export default function AdminTestsPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const { t } = useLanguage();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");

    useEffect(() => {
        fetchTests();
    }, []);

    async function fetchTests() {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTests(data || []);
        } catch (error) {
            console.error("Error fetching tests:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham bu testni o'chirmoqchimisiz? Barcha bog'liq ma'lumotlar o'chib ketadi.")) {
            return;
        }

        try {
            const success = await deleteTest(id);
            if (success) {
                setTests(tests.filter(t => t.id !== id));
                showToast("Test muvaffaqiyatli o'chirildi", "success");
            } else {
                showToast("Xatolik yuz berdi", "error");
            }
        } catch (error) {
            console.error("Error deleting test:", error);
        }
    };

    const handleTogglePublish = async (id: string) => {
        try {
            const success = await toggleTestPublish(id);
            if (success) {
                // Update local state
                setTests(tests.map(t =>
                    t.id === id ? { ...t, is_published: !t.is_published } : t
                ));
                showToast("Status o'zgartirildi", "success");
            } else {
                showToast("Xatolik yuz berdi", "error");
            }
        } catch (error) {
            console.error("Error toggling publish status:", error);
        }
    };

    const handleDuplicate = async (id: string) => {
        if (!confirm("Bu testni nusxalamoqchimisiz?")) {
            return;
        }

        try {
            const newTestId = await duplicateTest(id);
            if (newTestId) {
                // Refresh the list to show the new test
                fetchTests();
                showToast("Test muvaffaqiyatli nusxalandi!", "success");
            } else {
                showToast("Xatolik yuz berdi", "error");
            }
        } catch (error) {
            console.error("Error duplicating test:", error);
        }
    };

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterPublished === "all" ? true :
                filterPublished === "published" ? test.is_published :
                    !test.is_published;

        return matchesSearch && matchesFilter;
    });

    const getSubjectBadgeColor = (subject: string) => {
        const colors: Record<string, string> = {
            math: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            english: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            physics: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            chemistry: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            biology: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
        };
        return colors[subject] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="text-brand-blue" size={32} />
                        Test Boshqaruvi
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Testlarni yaratish, tahrirlash va boshqarish
                    </p>
                </div>

                <Link
                    href="/admin/tests/create"
                    className="h-10 px-4 bg-brand-blue text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Yangi Test
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                        <Search className="text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Testlarni qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 flex-1 text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        {["all", "published", "draft"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setFilterPublished(filter as any)}
                                className={`h-10 px-4 rounded-xl text-sm font-medium transition-all ${filterPublished === filter
                                    ? "bg-brand-blue text-white shadow-sm"
                                    : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {filter === "all" ? "Hammasi" : filter === "published" ? "Chop etilgan" : "Qoralama"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tests Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                        <p className="text-gray-400 mt-4">Yuklanmoqda...</p>
                    </div>
                ) : filteredTests.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Hali testlar yo'q
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Birinchi testingizni yaratib boshlang
                        </p>
                        <Link
                            href="/admin/tests/create"
                            className="inline-flex items-center gap-2 h-10 px-6 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
                        >
                            <Plus size={18} />
                            Yangi Test Yaratish
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Test Nomi</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Fan</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Turi</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Savollar</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Vaqt</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Holat</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                                {filteredTests.map((test) => (
                                    <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{test.title}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSubjectBadgeColor(test.subject)}`}>
                                                {test.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                                            {test.test_type}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {test.total_questions} ta
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {test.duration_minutes ? `${test.duration_minutes} min` : "∞"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {test.is_published ? (
                                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                                                    <CheckCircle size={16} />
                                                    Chop etilgan
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                                                    <XCircle size={16} />
                                                    Qoralama
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/tests/${test.id}/analytics`}
                                                    className="h-8 w-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Analytics"
                                                >
                                                    <BarChart3 size={18} />
                                                </Link>
                                                <Link
                                                    href={`/admin/tests/${test.id}`}
                                                    className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Ko'rish"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleTogglePublish(test.id)}
                                                    className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${test.is_published
                                                        ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                                                        : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                        }`}
                                                    title={test.is_published ? "Noshir qilish" : "Nashr qilish"}
                                                >
                                                    {test.is_published ? (
                                                        <XCircle size={18} />
                                                    ) : (
                                                        <CheckCircle size={18} />
                                                    )}
                                                </button>
                                                <Link
                                                    href={`/admin/tests/${test.id}/edit`}
                                                    className="h-8 w-8 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Tahrirlash"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDuplicate(test.id)}
                                                    className="h-8 w-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Nusxalash"
                                                >
                                                    <Copy size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test.id)}
                                                    className="h-8 w-8 flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="O'chirish"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats */}
            {tests.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FileText className="text-blue-600" size={20} />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Jami Testlar</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{tests.length}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="text-green-600" size={20} />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Chop Etilgan</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {tests.filter(t => t.is_published).length}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <XCircle className="text-yellow-600" size={20} />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Qoralama</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {tests.filter(t => !t.is_published).length}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Users className="text-purple-600" size={20} />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Jami Savollar</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {tests.reduce((sum, t) => sum + t.total_questions, 0)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
