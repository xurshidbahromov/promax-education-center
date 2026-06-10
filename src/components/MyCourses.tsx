"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import { getActiveStudentCourses, getMonthlyPaymentStatus, type StudentCourse, type MonthlyPaymentStatus } from "@/lib/payments";
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

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
 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-800/60 p-6 shadow-lg">
 <div className="animate-pulse">
 <div className="h-6 bg-white/50 dark:bg-slate-800/50 rounded w-1/3 mb-6"></div>
 <div className="space-y-4">
 <div className="h-24 bg-white/50 dark:bg-slate-800/50 rounded-2xl"></div>
 <div className="h-24 bg-white/50 dark:bg-slate-800/50 rounded-2xl"></div>
 </div>
 </div>
 </div>
 );
 }

 if (courses.length === 0) {
 return (
 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 text-center shadow-lg">
 <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
 <BookOpen className="w-10 h-10 text-brand-blue" />
 </div>
 <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-2 font-fredoka">
 Hozircha kurslar yo'q
 </h3>
 <p className="text-gray-600 dark:text-gray-300 font-medium">
 Siz hali hech qaysi kursga yozilmagansiz. Kurs haqida ma'lumot olish uchun admin bilan bog'laning.
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-5">
 <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 font-fredoka flex items-center gap-2">
 <BookOpen className="text-brand-blue" />
 Mening kurslarim
 </h2>

 <div className="space-y-4">
 {courses.map((course, index) => {
 const status = paymentStatus[course.id];
 const percentage = status
 ? (status.paid_amount / status.required_amount) * 100
 : 0;

 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 key={course.id}
 className={`bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border p-5 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
 status?.status === 'overdue'
 ? 'border-red-400/50 dark:border-red-800/50 bg-red-50/40 dark:bg-red-900/10 hover:border-red-500'
 : 'border-white/60 dark:border-slate-800/60 hover:border-brand-blue/40 dark:hover:border-slate-600'
 }`}
 >
 <div className="flex flex-col lg:flex-row lg:items-center gap-5 sm:gap-6">
 {/* Icon & Subject */}
 <div className="flex items-center gap-4 flex-shrink-0">
 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue/70 flex items-center justify-center text-white shadow-lg shadow-brand-blue/30 group-hover:scale-110 transition-transform duration-500">
 <BookOpen size={24} />
 </div>
 <div className="min-w-[160px]">
 <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 ">
 {formatSubject(course.subject)}
 </h3>
 <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
 Boshlanish: {new Date(course.start_date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
 </p>
 </div>
 </div>

 {/* Progress Bar */}
 <div className="flex-1 w-full lg:w-auto mt-2 lg:mt-0">
 <div className="flex justify-between text-sm mb-2">
 <span className="text-gray-600 dark:text-gray-300 font-medium">
 {status ? `${status.paid_amount.toLocaleString()} / ${status.required_amount.toLocaleString()} so'm` : 'Ma\'lumot yo\'q'}
 </span>
 <span className="font-medium text-slate-800 dark:text-slate-100 ">
 {status ? `${percentage.toFixed(0)}%` : '0%'}
 </span>
 </div>
 <div className="w-full bg-white/50 dark:bg-slate-800/50 rounded-full h-3 border border-white/60 dark:border-slate-700/50 shadow-inner overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 whileInView={{ width: `${Math.min(percentage, 100)}%` }}
 viewport={{ once: true }}
 transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
 className={`h-full rounded-full shadow-md ${
 status?.status === 'paid'
 ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-green-500/50'
 : status?.status === 'partial'
 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-yellow-500/50'
 : status?.status === 'overdue'
 ? 'bg-gradient-to-r from-red-500 to-red-400 shadow-red-500/50'
 : 'bg-gradient-to-r from-gray-400 to-gray-300'
 }`}
 />
 </div>
 </div>

 {/* Status Badge */}
 {status && (
 <div className="flex items-center gap-4 flex-shrink-0 mt-3 lg:mt-0 justify-between lg:justify-end">
 {status.remaining_amount > 0 && (
 <div className="text-right">
 <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Qolgan</p>
 <p className="text-sm font-semibold text-red-500 ">
 {status.remaining_amount.toLocaleString()}
 </p>
 </div>
 )}
 <span className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium shadow-sm backdrop-blur-md border ${
 status.status === 'paid'
 ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
 : status.status === 'partial'
 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
 : status.status === 'overdue'
 ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
 : 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400'
 }`}>
 {status.status === 'paid' && <CheckCircle size={16} />}
 {status.status === 'partial' && <Clock size={16} />}
 {status.status === 'overdue' && <AlertCircle size={16} />}
 {status.status === 'pending' && <XCircle size={16} />}
 <span className="uppercase tracking-wider">
 {status.status === 'paid' ? 'To\'liq to\'langan' :
 status.status === 'partial' ? 'Qisman' :
 status.status === 'overdue' ? 'Muddati o\'tgan' : 'Kutilmoqda'}
 </span>
 </span>
 </div>
 )}
 </div>
 </motion.div>
 );
 })}
 </div>
 </div>
 );
}
