"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import { getActiveStudentCourses, getMonthlyPaymentStatus, type StudentCourse, type MonthlyPaymentStatus } from "@/lib/payments";
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function MyCourses() {
    const { t } = useLanguage();
    const [courses, setCourses] = useState<StudentCourse[]>([]);
    const [paymentStatus, setPaymentStatus] = useState<Record<string, MonthlyPaymentStatus>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    async function loadCourses() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const studentCourses = await getActiveStudentCourses(user.id);
        setCourses(studentCourses);

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const statuses = await getMonthlyPaymentStatus(user.id, currentMonth, currentYear);

        const statusMap: Record<string, MonthlyPaymentStatus> = {};
        statuses.forEach(status => {
            statusMap[status.student_course_id] = status;
        });

        setPaymentStatus(statusMap);
        setLoading(false);
    }

    const formatSubject = (subject: string) => {
        const subjectMap: Record<string, string> = {
            'matematika': 'Matematika',
            'ingliz_tili': 'Ingliz tili',
            'ona_tili': 'Ona tili',
            'fizika': 'Fizika',
            'kimyo': 'Kimyo',
            'biologiya': 'Biologiya',
            'tarix': 'Tarix',
            'geografiya': 'Geografiya'
        };
        return subjectMap[subject] || subject;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-200 dark:bg-slate-800 rounded"></div>
                        <div className="h-20 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Hozircha kurslar yo'q
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Siz hali hech qaysi kursga yozilmagansiz. Kurs haqida ma'lumot olish uchun admin bilan bog'laning.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mening kurslarim
            </h2>

            <div className="space-y-3">
                {courses.map((course) => {
                    const status = paymentStatus[course.id];
                    const percentage = status
                        ? (status.paid_amount / status.required_amount) * 100
                        : 0;

                    return (
                        <div
                            key={course.id}
                            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm ${status?.status === 'overdue'
                                ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                                : 'border-gray-200 dark:border-slate-800'
                                }`}
                        >
                            <div className="flex items-center gap-5">
                                {/* Icon & Subject */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-indigo-600 flex items-center justify-center text-white">
                                        <BookOpen size={22} />
                                    </div>
                                    <div className="min-w-[160px]">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                            {formatSubject(course.subject)}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(course.start_date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar - Takes remaining space */}
                                <div className="flex-1 min-w-[200px]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm mb-1.5">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {status ? `${status.paid_amount.toLocaleString()} / ${status.required_amount.toLocaleString()} so'm` : 'Ma\'lumot yo\'q'}
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {status ? `${percentage.toFixed(0)}%` : '0%'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all ${status?.status === 'paid'
                                                        ? 'bg-green-600'
                                                        : status?.status === 'partial'
                                                            ? 'bg-yellow-500'
                                                            : status?.status === 'overdue'
                                                                ? 'bg-red-600'
                                                                : 'bg-gray-400'
                                                        }`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                {status && (
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {status.remaining_amount > 0 && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Qolgan</p>
                                                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                                    {status.remaining_amount.toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                        <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${status.status === 'paid'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : status.status === 'partial'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                                : status.status === 'overdue'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                                            }`}>
                                            {status.status === 'paid' && <CheckCircle size={14} />}
                                            {status.status === 'partial' && <Clock size={14} />}
                                            {status.status === 'overdue' && <AlertCircle size={14} />}
                                            {status.status === 'pending' && <XCircle size={14} />}
                                            <span>
                                                {status.status === 'paid' ? 'To\'liq to\'langan' :
                                                    status.status === 'partial' ? 'Qisman' :
                                                        status.status === 'overdue' ? 'Muddati o\'tgan' : 'Kutilmoqda'}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
