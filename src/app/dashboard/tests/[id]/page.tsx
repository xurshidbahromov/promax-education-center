"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
 ArrowLeft,
 Clock,
 FileText,
 BookOpen,
 BarChart,
 Play,
 Award,
 TrendingUp,
 AlertCircle
} from "lucide-react";
import { getTestById, getStudentTestHistory, type Test } from "@/lib/tests";
import { TestDetailSkeleton } from "@/components/ui/Skeleton";

export default function TestDetailsPage() {
 const params = useParams();
 const router = useRouter();
 const { t } = useLanguage();
 const testId = params.id as string;

 const [test, setTest] = useState<Test | null>(null);
 const [previousAttempts, setPreviousAttempts] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 async function loadTest() {
 try {
 const testData = await getTestById(testId);
 setTest(testData);

 // Get previous attempts
 const { data: user } = await (await import("@/lib/supabase")).supabase.auth.getUser();
 if (user.user) {
 const history = await getStudentTestHistory(user.user.id, testId);
 setPreviousAttempts(history);
 }
 } catch (error) {
 console.error("Error loading test:", error);
 } finally {
 setLoading(false);
 }
 }

 loadTest();
 }, [testId]);

  if (loading) {
    return <TestDetailSkeleton />;
  }

 if (!test) {
 return (
 <div className="text-center py-12">
 <AlertCircle className="mx-auto text-gray-300 dark:text-gray-700 mb-4" size={64} />
 <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-2">Test topilmadi</h2>
 <Link href="/dashboard/tests" className="text-brand-blue hover:underline">
 Testlar ro'yxatiga qaytish
 </Link>
 </div>
 );
 }

  const bestScore = previousAttempts.length > 0
    ? Math.max(...previousAttempts.map(a => a.percentage || 0))
    : null;

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-24">
      {/* Ambient bg blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 max-w-2xl mx-auto pt-4 sm:pt-6">
        
        {/* Back Button */}
        <Link
          href="/dashboard/tests"
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors text-[14px] font-medium w-fit"
        >
          <ArrowLeft size={18} />
          Testlar ro'yxatiga qaytish
        </Link>

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-2.5 py-1 rounded-md">
              {test.subject}
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-200/50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md">
              {test.test_type}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight mt-2">
            {test.title}
          </h1>
          {test.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {test.description}
            </p>
          )}
        </div>

        {/* ── TEST STATS (Minimalist Grid) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {/* Savollar */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[20px] p-4 border border-gray-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
            <BookOpen size={18} className="text-brand-blue mb-1" />
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-fredoka leading-none">{test.total_questions}</span>
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Savollar</span>
          </div>

          {/* Vaqt */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[20px] p-4 border border-gray-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
            <Clock size={18} className="text-orange-500 mb-1" />
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-fredoka leading-none">{test.duration_minutes || "∞"}</span>
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Daqiqa</span>
          </div>

          {/* Qiyinlik */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[20px] p-4 border border-gray-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
            <BarChart size={18} className="text-emerald-500 mb-1" />
            <span className="text-[16px] font-bold text-slate-800 dark:text-slate-100 leading-none capitalize mt-1 mb-1">{test.difficulty_level}</span>
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Qiyinlik</span>
          </div>

          {/* Eng yaxshi natija */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[20px] p-4 border border-gray-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center text-center gap-1 shadow-sm">
            <Award size={18} className="text-purple-500 mb-1" />
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-fredoka leading-none">
              {bestScore !== null ? `${bestScore.toFixed(0)}%` : "0%"}
            </span>
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Eng yaxshi</span>
          </div>
        </div>

        {/* ── TEST RULES ── */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-gray-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-5 mt-2">
          <h2 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <AlertCircle className="text-brand-blue" size={18} />
            Test qoidalari
          </h2>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-brand-blue text-[11px] font-bold">1</span>
              </div>
              <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Testda jami <strong className="text-slate-800 dark:text-white">{test.total_questions} ta savol</strong> mavjud. Har bir savolga bittadan to'g'ri javobni tanlang.
              </p>
            </li>
            {test.duration_minutes && (
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-brand-blue text-[11px] font-bold">2</span>
                </div>
                <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Testni yechish uchun sizga <strong className="text-slate-800 dark:text-white">{test.duration_minutes} daqiqa</strong> vaqt beriladi. Vaqt tugagach test avtomatik yakunlanadi.
                </p>
              </li>
            )}
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-brand-blue text-[11px] font-bold">{test.duration_minutes ? '3' : '2'}</span>
              </div>
              <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Javoblaringiz avtomatik saqlanadi. Agarda internet uzilib qolsa yoki sahifani yopsangiz, qaytib kelganda davom ettira olasiz.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-brand-blue text-[11px] font-bold">{test.duration_minutes ? '4' : '3'}</span>
              </div>
              <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Test yakunlangach, to'g'ri va noto'g'ri javoblarni, shuningdek to'liq tahlilni ko'rishingiz mumkin.
              </p>
            </li>
          </ul>
        </div>

        {/* ── PREVIOUS ATTEMPTS ── */}
        {previousAttempts.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-gray-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-4">
            <h2 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="text-brand-blue" size={18} />
              Oldingi urinishlar
            </h2>
            <div className="flex flex-col gap-3 mt-2">
              {previousAttempts.slice(0, 5).map((attempt, index) => {
                const perc = attempt.percentage || 0;
                const scoreColor = perc >= 80 ? "text-emerald-500 bg-emerald-500/10" : perc >= 60 ? "text-amber-500 bg-amber-500/10" : "text-rose-500 bg-rose-500/10";
                
                return (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-white/50 dark:bg-slate-800/50 rounded-[20px] border border-gray-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      {/* Circle score badge */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-fredoka font-bold ${scoreColor}`}>
                        {perc.toFixed(0)}%
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-[14px]">
                          Urinish #{previousAttempts.length - index}
                        </span>
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString('uz-UZ', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Ball</span>
                        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                          {attempt.score || 0} / {attempt.max_score || test.total_questions}
                        </span>
                      </div>
                      {attempt.status === 'completed' && (
                        <Link
                          href={`/dashboard/results/${attempt.id}`}
                          className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          Ko'rish
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── START BUTTON ACTION AREA ── */}
        <div className="mt-4 mb-8">
          <Link
            href={`/dashboard/tests/${test.id}/take`}
            className="w-full bg-brand-blue text-white rounded-[24px] p-4 flex items-center justify-center gap-3 shadow-[0_8px_24px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:-translate-y-1 transition-all duration-300"
          >
            <Play size={20} className="fill-white" />
            <span className="font-bold text-[16px]">
              {previousAttempts.length > 0 ? "Qayta urinib ko'rish" : "Testni Boshlash"}
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}
