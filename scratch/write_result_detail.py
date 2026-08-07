content = """"use client";

import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getExamResultById, type ExamResult } from "@/lib/supabase-queries";
import {
  ArrowLeft, Clock, AlertCircle, Trophy, GraduationCap,
  BookOpen, Calendar, Calculator, Book, Globe,
  CheckCircle2, XCircle, TrendingUp, Star, Medal, BarChart3
} from "lucide-react";
import Link from "next/link";

export default function ResultDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();

  const { data: result = null, isLoading: loading } = useSWR(
    params.id ? `result-${params.id}` : null,
    () => getExamResultById(params.id as string)
  );

  if (loading) {
    return (
      <div className="relative min-h-screen pb-24">
        {/* Ambient bg */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto pt-4 animate-pulse space-y-6">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-52 w-full bg-slate-200 dark:bg-slate-800 rounded-[2rem]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-[1.5rem]" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
        </div>
        <div className="relative z-10 text-center py-12">
          <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Natija topilmadi</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Bu natija mavjud emas yoki o'chirilgan</p>
          <Link
            href="/dashboard/results"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl font-medium transition-colors hover:bg-blue-600"
          >
            <ArrowLeft size={16} />
            Natijalar ro'yxatiga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const examDate = new Date(result.created_at).toLocaleDateString('uz-UZ', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const examType = result.exam?.type || 'quiz';
  const isDTM = examType === 'dtm';
  const maxScore = isDTM ? 189.0 : (result.exam?.max_score || 100);
  const percentage = Math.min(100, (result.total_score / maxScore) * 100);
  const isExcellent = percentage >= 80;
  const isPassed = percentage >= 60;

  const scoreColor = isExcellent ? 'text-emerald-500' : isPassed ? 'text-amber-500' : 'text-red-500';
  const barColor = isExcellent ? 'bg-emerald-500' : isPassed ? 'bg-amber-500' : 'bg-red-500';
  const statusLabel = isExcellent ? "A'lo" : isPassed ? "Yaxshi" : "Qoniqarsiz";
  const StatusIcon = isExcellent ? Star : isPassed ? CheckCircle2 : XCircle;

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white pb-24">
      {/* Ambient bg */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-4 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/results')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors active:scale-95"
        >
          <ArrowLeft size={18} />
          <span>Natijalar ro'yxatiga qaytish</span>
        </button>

        {/* Main Header Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-7 sm:p-10 rounded-[2rem] border border-white/60 dark:border-slate-700/50 shadow-lg relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-brand-blue/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-violet-500/5 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            {/* Left Info */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-xl text-[11px] font-bold uppercase tracking-wider">
                  {isDTM ? 'DTM' : (examType === 'quiz' ? 'Test' : examType === 'topic' ? 'Mavzu' : examType)}
                </span>
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-gray-200/50 dark:border-slate-700/50">
                  <Calendar size={14} />
                  {examDate}
                </span>
                <span className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold ${
                  isExcellent
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                    : isPassed
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                    : "bg-red-50 dark:bg-red-900/20 text-red-500"
                }`}>
                  <StatusIcon size={13} />
                  {statusLabel}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {result.exam?.title || "Imtihon natijasi"}
              </h1>

              {result.direction && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium border border-indigo-100 dark:border-indigo-800/30">
                  <GraduationCap size={16} />
                  {result.direction.title} ({result.direction.code})
                </div>
              )}
            </div>

            {/* Score Card */}
            <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-md border border-gray-100 dark:border-slate-700 min-w-[180px] text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Umumiy Ball</div>
              <div className={`text-5xl font-black font-fredoka leading-none ${scoreColor}`}>
                {result.total_score.toFixed(1)}
              </div>
              <div className="text-slate-400 text-sm font-medium mt-1">/ {maxScore}</div>

              {/* Progress bar */}
              <div className="w-full mt-4 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className={`mt-2 text-sm font-bold ${scoreColor}`}>
                {percentage.toFixed(1)}% o'zlashtirish
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "O'zlashtirish",
              value: `${percentage.toFixed(0)}%`,
              icon: TrendingUp,
              color: scoreColor,
              bg: isExcellent ? "bg-emerald-50 dark:bg-emerald-900/20" : isPassed ? "bg-amber-50 dark:bg-amber-900/20" : "bg-red-50 dark:bg-red-900/20"
            },
            {
              label: "Ball",
              value: `${result.total_score.toFixed(1)} / ${maxScore}`,
              icon: Medal,
              color: "text-brand-blue",
              bg: "bg-blue-50 dark:bg-blue-900/20"
            },
            {
              label: "Holat",
              value: statusLabel,
              icon: StatusIcon,
              color: scoreColor,
              bg: isExcellent ? "bg-emerald-50 dark:bg-emerald-900/20" : isPassed ? "bg-amber-50 dark:bg-amber-900/20" : "bg-red-50 dark:bg-red-900/20"
            },
          ].map((s, i) => (
            <div key={i} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-sm flex flex-col items-center gap-2 text-center">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={20} className={s.color} />
              </div>
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        {isDTM ? (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-blue" />
              Fanlar kesimida tahlil
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Compulsory */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <BookOpen size={22} className="text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Majburiy fanlar</h3>
                    <p className="text-xs text-slate-500">Maks. 31.5 ball</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Matematika", value: result.compulsory_math_score, icon: Calculator, color: "text-indigo-500" },
                    { label: "Tarix", value: result.compulsory_history_score, icon: Globe, color: "text-orange-500" },
                    { label: "Ona tili", value: result.compulsory_lang_score, icon: Book, color: "text-green-500" },
                  ].map(({ label, value, icon: Icon, color }) => {
                    const v = value ?? 0;
                    const pct = Math.min(100, (v / 10.5) * 100);
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                            <Icon size={14} className={color} /> {label}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-white">{v.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500">Jami (Majburiy)</span>
                    <span className="text-lg font-black text-brand-blue">
                      {((result.compulsory_math_score || 0) + (result.compulsory_history_score || 0) + (result.compulsory_lang_score || 0)).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject 1 */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Trophy size={22} className="text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Mutaxassislik fan 1</h3>
                    <p className="text-xs text-slate-500">Maks. 93.0 ball</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center h-[140px] bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <span className={`text-5xl font-black font-fredoka ${scoreColor} drop-shadow-sm`}>
                    {(result.subject_1_score ?? 0).toFixed(1)}
                  </span>
                  <span className="text-slate-400 font-medium mt-2 text-sm">ball to'plandi</span>
                </div>
                <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-700`}
                    style={{ width: `${Math.min(100, ((result.subject_1_score ?? 0) / 93) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Subject 2 */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Trophy size={22} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">Mutaxassislik fan 2</h3>
                    <p className="text-xs text-slate-500">Maks. 64.5 ball</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center h-[140px] bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                  <span className="text-5xl font-black font-fredoka text-purple-500 drop-shadow-sm">
                    {(result.subject_2_score ?? 0).toFixed(1)}
                  </span>
                  <span className="text-slate-400 font-medium mt-2 text-sm">ball to'plandi</span>
                </div>
                <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div
                    className="h-full rounded-full bg-purple-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, ((result.subject_2_score ?? 0) / 64.5) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Generic test result breakdown */
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-brand-blue" />
              Natija tahlili
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Score visual */}
              <div className="flex flex-col items-center justify-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/50 gap-4">
                <div className={`w-28 h-28 rounded-full border-4 ${
                  isExcellent ? "border-emerald-400" : isPassed ? "border-amber-400" : "border-red-400"
                } flex flex-col items-center justify-center`}>
                  <span className={`text-3xl font-black font-fredoka ${scoreColor}`}>
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="text-xs text-slate-400">ball</span>
                </div>
                <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                  isExcellent
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                    : isPassed
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                    : "bg-red-50 dark:bg-red-900/20 text-red-500"
                }`}>
                  {statusLabel}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-4">
                {[
                  { label: "To'plangan ball", value: result.total_score.toFixed(1) },
                  { label: "Maksimal ball", value: maxScore.toString() },
                  { label: "Foiz", value: `${percentage.toFixed(1)}%` },
                  { label: "Test turi", value: examType === "quiz" ? "Test" : examType === "topic" ? "Mavzu testi" : examType },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Motivational message */}
        <div className={`p-6 rounded-2xl border text-center ${
          isExcellent
            ? "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40"
            : isPassed
            ? "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40"
            : "bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/40"
        }`}>
          <p className={`text-base font-semibold ${scoreColor}`}>
            {isExcellent
              ? "🎉 Ajoyib natija! Zo'r ishladingiz, davom eting!"
              : isPassed
              ? "👍 Yaxshi natija! Yana mashq qilib, yanada yaxshilang!"
              : "💪 Qo'shimcha mashq kerak. Berilib o'qing, keyingisida zo'r bo'lasiz!"}
          </p>
        </div>

      </div>
    </div>
  );
}
"""

with open("src/app/dashboard/results/[id]/page.tsx", "w") as f:
    f.write(content)
print("Results detail page written!")
