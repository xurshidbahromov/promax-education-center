"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    GraduationCap,
    Edit,
    Trash2,
    Mail,
    Phone,
    Award,
    Calendar,
    Search,
    UserPlus,
    FileText,
    BarChart3
} from "lucide-react";

// This will be replaced with actual Supabase query
interface Teacher {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    subjects: string[];
    joined_date: string;
    total_tests: number;
}

export default function AdminTeachersPage() {
    const { t } = useLanguage();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // TODO: Fetch teachers from Supabase
        // For now, show empty state
        setLoading(false);
    }, []);

    const filteredTeachers = teachers.filter(teacher =>
        teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSubjectBadges = (subjects: string[]) => {
        const colors: Record<string, string> = {
            "Matematika": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            "Ingliz tili": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            "Fizika": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        };

        return subjects.map(subject => (
            <span
                key={subject}
                className={`px-2 py-1 rounded-lg text-xs font-semibold ${colors[subject] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"}`}
            >
                {subject}
            </span>
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <GraduationCap className="text-brand-blue" size={32} />
                        O'qituvchilar Boshqaruvi
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        O'qituvchilarni qo'shish va boshqarish
                    </p>
                </div>

                <Link
                    href="/admin/teachers/create"
                    className="px-6 py-3 bg-gradient-to-r from-brand-blue to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                >
                    <UserPlus size={20} />
                    Yangi O'qituvchi
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="O'qituvchilarni ism yoki email bo'yicha qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 flex-1 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Teachers Grid */}
            {loading ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                    <p className="text-gray-400 mt-4">Yuklanmoqda...</p>
                </div>
            ) : filteredTeachers.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-12 text-center">
                    <GraduationCap className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {teachers.length === 0 ? "Hali o'qituvchilar yo'q" : "O'qituvchi topilmadi"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {teachers.length === 0
                            ? "Birinchi o'qituvchini qo'shing"
                            : "Boshqa qidiruv so'rovini sinab ko'ring"
                        }
                    </p>
                    {teachers.length === 0 && (
                        <Link
                            href="/admin/teachers/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            <UserPlus size={20} />
                            Yangi O'qituvchi Qo'shish
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeachers.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group"
                        >
                            {/* Avatar & Name */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                                        {teacher.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">
                                            {teacher.full_name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">O'qituvchi</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Link
                                        href={`/admin/teachers/${teacher.id}/edit`}
                                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit size={16} />
                                    </Link>
                                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Mail size={16} className="text-brand-blue" />
                                    <span className="truncate">{teacher.email}</span>
                                </div>
                                {teacher.phone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Phone size={16} className="text-green-500" />
                                        <span>{teacher.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar size={16} className="text-purple-500" />
                                    <span>{new Date(teacher.joined_date).toLocaleDateString('uz-UZ')}</span>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div className="mb-4">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Fanlar:</div>
                                <div className="flex flex-wrap gap-2">
                                    {getSubjectBadges(teacher.subjects)}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="pt-4 border-t border-gray-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FileText size={16} className="text-brand-blue" />
                                        <span>{teacher.total_tests} ta test</span>
                                    </div>
                                    <Link
                                        href={`/admin/teachers/${teacher.id}`}
                                        className="text-sm text-brand-blue hover:underline font-medium"
                                    >
                                        Batafsil →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats */}
            {teachers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <GraduationCap className="text-blue-600" size={20} />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Jami O'qituvchilar</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{teachers.length}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <FileText className="text-green-600" size={20} />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">Jami Testlar</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {teachers.reduce((sum, t) => sum + t.total_tests, 0)}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <BarChart3 className="text-purple-600" size={20} />
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">O'rtacha Testlar</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + t.total_tests, 0) / teachers.length) : 0}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
