"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { promoteToTeacher, getStudents, type Student } from "@/lib/admin-queries";
import {
    ArrowLeft,
    Search,
    UserCheck,
    AlertCircle,
    CheckCircle2,
    Shield,
    User
} from "lucide-react";
import Link from "next/link";

export default function CreateTeacherPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length > 0) {
                handleSearch();
            } else {
                setStudents([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearch = async () => {
        setSearching(true);
        try {
            const results = await getStudents(searchTerm);
            setStudents(results);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setSearching(false);
        }
    };

    const handlePromote = async () => {
        if (!selectedStudent) return;

        setLoading(true);
        setStatus('idle');
        setMessage("");

        try {
            const result = await promoteToTeacher(selectedStudent.id);

            if (result.success) {
                setStatus('success');
                setMessage(`${selectedStudent.full_name} muvaffaqiyatli o'qituvchi etib tayinlandi!`);
                setSelectedStudent(null);
                setSearchTerm("");
                setStudents([]);
            } else {
                setStatus('error');
                setMessage(result.error || "Xatolik yuz berdi.");
            }
        } catch (error) {
            console.error("Promotion error:", error);
            setStatus('error');
            setMessage("Tizim xatoligi yuz berdi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <Link
                    href="/admin/teachers"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Ortga qaytish
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Yangi O'qituvchi Qo'shish
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Mavjud foydalanuvchini (student) o'qituvchi lavozimiga o'tkazish.
                </p>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-lg">
                <div className="flex items-start gap-4 mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                    <Shield className="flex-shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="font-bold mb-1">Muhim Eslatma</h3>
                        <p className="text-sm opacity-90">
                            <b>Ism bo'yicha qidiring</b> va ro'yxatdan tanlang.
                            Foydalanuvchi tizimda ro'yxatdan o'tgan bo'lishi shart.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Search Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Foydalanuvchi Ismi
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Ism familiya kiriting..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all font-medium"
                            />
                            {searching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchTerm.length > 0 && !selectedStudent && (
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {students.length === 0 && !searching ? (
                                <p className="text-center text-gray-400 py-4 text-sm">Foydalanuvchi topilmadi</p>
                            ) : (
                                students.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                                            {(student.full_name || "U").charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">
                                                {student.full_name}
                                            </p>
                                            <p className="text-xs text-gray-500">Student</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Selected Student Confirmation */}
                    {selectedStudent && (
                        <div className="p-4 bg-brand-blue/5 dark:bg-slate-800 rounded-2xl border border-brand-blue/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-xl">
                                    {(selectedStudent.full_name || "U").charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                                        {selectedStudent.full_name}
                                    </p>
                                    <p className="text-sm text-gray-500">Tanlangan foydalanuvchi</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedStudent(null);
                                    setSearchTerm("");
                                }}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                Bekor qilish
                            </button>
                        </div>
                    )}

                    {/* Status Messages */}
                    {status === 'error' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
                            <AlertCircle size={20} />
                            {message}
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center gap-3">
                            <CheckCircle2 size={20} />
                            {message}
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handlePromote}
                        disabled={loading || !selectedStudent}
                        className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <UserCheck size={20} />
                                O'qituvchi Etib Tayinlash
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
