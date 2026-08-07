content = """"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Award, 
  TrendingUp, Star, RotateCcw, Target, ListChecks,
  AlertCircle, Medal, Check, Info, BarChart3, ChevronRight, X
} from "lucide-react";
import { getAttemptResults } from "@/lib/tests";
import { AttemptResultSkeleton } from "@/components/ui/Skeleton";

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const testId = params.id as string;
  const attemptId = params.attemptId as string;

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    async function loadResults() {
      try {
        const data = await getAttemptResults(attemptId);
        setResults(data);
      } catch (error) {
        console.error("Error loading results:", error);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [attemptId]);

  if (loading) {
    return <AttemptResultSkeleton />;
  }

  if (!results) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('tests.result.not_found') || "Natija topilmadi"}</h2>
          <Link href="/dashboard/tests" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
            <ArrowLeft size={18} />
            {t('tests.result.back') || "Ortga qaytish"}
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, responses } = results;
  const percentage = attempt.percentage || 0;
  const correctCount = responses.filter((r: any) => r.is_correct).length;
  const totalQuestions = responses.length;

  const isExcellent = percentage >= 80;
  const isGood = percentage >= 60 && percentage < 80;
  const isFailed = percentage < 60;

  const scoreColor = isExcellent ? "text-emerald-500" : isGood ? "text-amber-500" : "text-red-500";
  const bgBadgeColor = isExcellent ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : isGood ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "bg-red-50 dark:bg-red-900/20 text-red-500";
  const barColor = isExcellent ? "bg-emerald-500" : isGood ? "bg-amber-500" : "bg-red-500";

  const getPerformanceMessage = () => {
    if (isExcellent) return { text: t('tests.result.msg.excellent') || "A'lo natija!", emoji: "🏆" };
    if (isGood) return { text: t('tests.result.msg.good') || "Yaxshi natija!", emoji: "🌟" };
    return { text: t('tests.result.msg.practice') || "Mashq qilish kerak!", emoji: "💪" };
  };

  const performance = getPerformanceMessage();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen pb-24 text-slate-800 dark:text-slate-100">
      {/* Ambient backgrounds */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-blue/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto pt-4 space-y-6">
        {/* Back Button */}
        <Link
          href="/dashboard/tests"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors active:scale-95"
        >
          <ArrowLeft size={18} />
          {t('tests.result.back') || "Testlar ro'yxatiga qaytish"}
        </Link>

        {/* Hero Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] border border-white/60 dark:border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-blue/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex-1 space-y-4">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${bgBadgeColor}`}>
                {isExcellent ? <Award size={14} /> : isGood ? <Star size={14} /> : <Target size={14} />}
                {percentage.toFixed(0)}% O'zlashtirish
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-fredoka leading-tight">
                {performance.emoji} {performance.text}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                {t('tests.result.finished') || "Test muvaffaqiyatli yakunlandi"}
              </p>
            </div>

            <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-6 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-slate-700 min-w-[200px]">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Umumiy Ball</div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-6xl font-black font-fredoka leading-none ${scoreColor}`}>
                  {attempt.score}
                </span>
              </div>
              <div className="text-slate-400 text-sm font-medium mt-1">
                / {attempt.max_score} balldan
              </div>
              
              <div className="w-full mt-4 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('tests.result.stat.score') || "Foiz", value: `${percentage.toFixed(0)}%`, icon: TrendingUp, color: "text-brand-blue", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: t('tests.result.stat.points') || "Ball", value: `${attempt.score}/${attempt.max_score}`, icon: Medal, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
            { label: t('tests.result.stat.correct') || "To'g'ri", value: `${correctCount}/${totalQuestions}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: t('tests.result.stat.time') || "Vaqt", value: attempt.time_spent_seconds ? formatTime(attempt.time_spent_seconds) : "--:--", icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-sm flex flex-col items-center gap-3 text-center transition-transform hover:scale-[1.02]">
              <div className={`w-12 h-12 rounded-[1rem] ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                <p className={`text-2xl font-black font-fredoka ${stat.color} leading-none mb-1`}>{stat.value}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Link
            href={`/dashboard/tests/${testId}`}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-brand-blue to-blue-500 hover:from-blue-600 hover:to-blue-500 text-white rounded-[1.25rem] font-bold shadow-lg shadow-brand-blue/20 transition-all active:scale-95"
          >
            <RotateCcw size={20} />
            {t('tests.result.retry') || "Qayta urinish"}
          </Link>

          <button
            onClick={() => setShowReview(!showReview)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 rounded-[1.25rem] font-bold hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95"
          >
            <ListChecks size={20} className={showReview ? "text-brand-blue" : ""} />
            {showReview ? (t('tests.result.hide_answers') || "Tahlilni yashirish") : (t('tests.result.show_answers') || "Xatolarni ko'rish")}
          </button>

          <Link
            href="/dashboard/tests"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur text-slate-700 dark:text-slate-300 rounded-[1.25rem] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            {t('tests.result.list') || "Ro'yxatga qaytish"}
          </Link>
        </div>

        {/* Detailed Review Section */}
        {showReview && (
          <div className="pt-8 space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <BarChart3 size={20} />
              </div>
              <h2 className="text-2xl font-bold font-fredoka text-slate-800 dark:text-slate-100">
                {t('tests.result.review') || "Natijalar tahlili"}
              </h2>
            </div>

            <div className="space-y-4">
              {responses.map((response: any, index: number) => {
                const isCorrect = response.is_correct;
                const question = response.question;

                return (
                  <div
                    key={response.id}
                    className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[1.5rem] border p-6 transition-all shadow-sm ${
                      isCorrect
                        ? "border-emerald-100 dark:border-emerald-900/30"
                        : "border-red-100 dark:border-red-900/30"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <span className="flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-bold text-sm">
                        {index + 1}
                      </span>
                      {isCorrect ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                          <CheckCircle2 size={14} />
                          {t('tests.take.true') || "To'g'ri"}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                          <XCircle size={14} />
                          {t('tests.take.false') || "Noto'g'ri"}
                        </div>
                      )}
                      <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider ml-auto">
                        {response.points_earned}/{question.points} ball
                      </span>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-5 leading-relaxed">
                      {question.question_text}
                    </h3>

                    {/* Answers Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Student Answer */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                          {t('tests.result.your_answer') || "Sizning javobingiz"}
                        </div>
                        <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                          isCorrect 
                            ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30 text-red-700 dark:text-red-400"
                        }`}>
                          <div className="mt-0.5 shrink-0">
                            {isCorrect ? <Check size={18} /> : <X size={18} />}
                          </div>
                          <span className="font-medium">
                            {response.student_answer || (t('tests.result.no_answer') || "Javob berilmagan")}
                          </span>
                        </div>
                      </div>

                      {/* Correct Answer (if wrong) */}
                      {!isCorrect && (
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                            {t('tests.result.correct_answer') || "To'g'ri javob"}
                          </div>
                          <div className="flex items-start gap-3 p-4 rounded-xl border bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400">
                            <div className="mt-0.5 shrink-0">
                              <CheckCircle2 size={18} />
                            </div>
                            <span className="font-medium">
                              {question.correct_answer}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="mt-4 p-4 bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/10 dark:border-brand-blue/20 rounded-xl flex gap-3">
                        <Info size={20} className="text-brand-blue shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-brand-blue mb-1">
                            {t('tests.result.explanation') || "Izoh"}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open("src/app/dashboard/tests/[id]/results/[attemptId]/page.tsx", "w") as f:
    f.write(content)
print("Updated successfully")
