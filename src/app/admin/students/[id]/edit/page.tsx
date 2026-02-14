"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getStudent, updateStudent, type Student } from "@/lib/admin-queries";
import {
    ArrowLeft,
    Save,
    User,
    Phone,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";

export default function EditStudentPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const params = useParams();

    // State
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");

    // Form State
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (params.id) {
            fetchStudent(params.id as string);
        }
    }, [params.id]);

    const fetchStudent = async (id: string) => {
        setLoading(true);
        try {
            const data = await getStudent(id);
            if (data) {
                setStudent(data);
                setFullName(data.full_name || "");
                setPhone(data.phone || "");
            } else {
                setStatus('error');
                setMessage("O'quvchi topilmadi");
            }
        } catch (error) {
            console.error("Error fetching student:", error);
            setStatus('error');
            setMessage("Server xatoligi");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        setSaving(true);
        setStatus('idle');
        setMessage("");

        try {
            const result = await updateStudent(student.id, {
                full_name: fullName,
                phone: phone
            });

            if (result.success) {
                setStatus('success');
                setMessage("O'zgarishlar muvaffaqiyatli saqlandi!");
                // Optionally redirect after short delay
                setTimeout(() => {
                    router.push('/admin/students');
                }, 1500);
            } else {
                setStatus('error');
                setMessage(result.error || "Saqlashda xatolik yuz berdi");
            }
        } catch (error) {
            console.error("Update error:", error);
            setStatus('error');
            setMessage("Tizim xatoligi");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-brand-blue/30 border-t-brand-blue rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">O'quvchi topilmadi</h2>
                <Link href="/admin/students" className="text-brand-blue hover:underline mt-4 inline-block">
                    Ortga qaytish
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <Link
                    href="/admin/students"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue mb-4 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Ortga qaytish
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    O'quvchini Tahrirlash
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {student.full_name} ma'lumotlarini o'zgartirish
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 shadow-lg space-y-6">

                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <User size={16} />
                        F.I.O
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                    />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Phone size={16} />
                        Telefon Raqam
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-blue transition-all"
                    />
                </div>

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

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                >
                    {saving ? (
                        <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save size={20} />
                            Saqlash
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
