"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useDashboardData";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  BarChart,
  Play,
  Award,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { getTestById, getStudentTestHistory } from "@/lib/tests";
import { TestDetailSkeleton } from "@/components/ui/Skeleton";

const UZ_SHORT_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

const SUBJECT_LABELS: Record<string, string> = {
  math: "Matematika",
  english: "Ingliz tili",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  general: "Umumiy fan",
};

const TEST_TYPE_LABELS: Record<string, string> = {
  subject: "Fan testi",
  practice: "Mashq testi",
  progress: "Oraliq nazorat",
  mock: "Mock imtihon",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Oson",
  medium: "O'rta",
  hard: "Qiyin",
};

function formatAttemptDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()}-${UZ_SHORT_MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}

export default function TestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (testId) {
      router.prefetch(`/dashboard/tests/${testId}/take`);
    }
  }, [testId, router]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["testDetail", testId, currentUser?.id],
    queryFn: async () => {
      const [testData, history] = await Promise.all([
        getTestById(testId),
        currentUser?.id ? getStudentTestHistory(currentUser.id, testId) : Promise.resolve([]),
      ]);
      return { test: testData, previousAttempts: history };
    },
    enabled: !!testId,
    staleTime: 2 * 60 * 1000,
  });

  const test = data?.test || null;
  const previousAttempts = data?.previousAttempts || [];

  if (loading) {
    return <TestDetailSkeleton />;
  }

  if (!test) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold font-fredoka text-slate-800 dark:text-slate-100">
          Test topilmadi
        </h2>
        <Link
          href="/dashboard/tests"
          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
        >
          Testlar ro&apos;yxatiga qaytish
        </Link>
      </div>
    );
  }

  const bestScore =
    previousAttempts.length > 0
      ? Math.max(...previousAttempts.map((a) => a.percentage || 0))
      : null;

  const subjectLabel = SUBJECT_LABELS[test.subject] || test.subject;
  const typeLabel = TEST_TYPE_LABELS[test.test_type] || test.test_type;
  const diffLabel = DIFFICULTY_LABELS[test.difficulty_level] || test.difficulty_level;

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-white font-sans pb-10">
      {/* Ambient background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-5 max-w-2xl mx-auto pt-1 sm:pt-3">
        {/* Back Pill */}
        <Link
          href="/dashboard/tests"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors w-fit group"
        >
          <span className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center shrink-0">
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          </span>
          <span>Testlar ro&apos;yxati</span>
        </Link>

        {/* ── HERO BRIEFING CARD (Title + Metrics + Immediate Start CTA) ── */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-[28px] p-5 sm:p-7 border border-white/80 dark:border-slate-800 space-y-5 shadow-none">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-brand-blue/10 text-brand-blue dark:text-blue-400 text-[11px] font-extrabold uppercase tracking-wider">
                {subjectLabel}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                {typeLabel}
              </span>
              {bestScore !== null && bestScore >= 60 && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Topshirilgan
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
              {test.title}
            </h1>

            {test.description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {test.description}
              </p>
            )}
          </div>

          {/* Compact 4-Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center gap-1">
              <div className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                <BookOpen size={15} />
              </div>
              <span className="text-lg font-black font-fredoka text-slate-900 dark:text-white tabular-nums leading-tight mt-0.5">
                {test.total_questions}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                Savollar
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center gap-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock size={15} />
              </div>
              <span className="text-lg font-black font-fredoka text-slate-900 dark:text-white tabular-nums leading-tight mt-0.5">
                {test.duration_minutes || "∞"}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                Daqiqa
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center gap-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BarChart size={15} />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-1">
                {diffLabel}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                Daraja
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center gap-1">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Award size={15} />
              </div>
              <span className="text-lg font-black font-fredoka text-slate-900 dark:text-white tabular-nums leading-tight mt-0.5">
                {bestScore !== null ? `${bestScore.toFixed(0)}%` : "—"}
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                Eng yaxshi
              </span>
            </div>
          </div>

          {/* Primary Start CTA — Immediately Visible Above the Fold */}
          <Link
            href={`/dashboard/tests/${test.id}/take`}
            className="w-full py-3.5 px-5 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Play size={16} className="fill-white" />
            <span>
              {previousAttempts.length > 0 ? "Qayta topshirish" : "Testni boshlash"}
            </span>
          </Link>
        </div>

        {/* ── TEST RULES ── */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] p-5 sm:p-6 border border-white/80 dark:border-slate-800 space-y-4 shadow-none">
          <h2 className="text-sm sm:text-base font-extrabold font-fredoka text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
              <AlertCircle size={15} />
            </span>
            <span>Test qoidalari</span>
          </h2>

          <ul className="space-y-3">
            {[
              `Testda jami ${test.total_questions} ta savol mavjud. Har bir savolga bittadan to'g'ri javob belgilang.`,
              ...(test.duration_minutes
                ? [`Testni yechish uchun ${test.duration_minutes} daqiqa ajratilgan. Vaqt tugagach avtomatik yakunlanadi.`]
                : []),
              "Javoblaringiz avtomatik saqlanadi — internet uzilib qolsa ham qaytib davom ettira olasiz.",
              "Yakunlangach har bir savol tahlili, to'g'ri javoblar va 60%+ natija uchun elektron sertifikat beriladi.",
            ].map((rule, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rule}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* ── PREVIOUS ATTEMPTS ── */}
        {previousAttempts.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] p-5 sm:p-6 border border-white/80 dark:border-slate-800 space-y-3.5 shadow-none">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-extrabold font-fredoka text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp size={15} />
                </span>
                <span>Oldingi urinishlar</span>
              </h2>
              <span className="text-[11px] font-bold text-slate-400">
                {previousAttempts.length} ta
              </span>
            </div>

            <div className="space-y-2.5">
              {previousAttempts.slice(0, 5).map((attempt, index) => {
                const perc = attempt.percentage || 0;
                const scoreColor =
                  perc >= 80
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    : perc >= 60
                    ? "text-amber-600 dark:text-amber-400 bg-amber-500/10"
                    : "text-rose-600 dark:text-rose-400 bg-rose-500/10";

                return (
                  <Link
                    key={attempt.id}
                    href={`/dashboard/tests/${test.id}/results/${attempt.id}`}
                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-fredoka font-black text-sm tabular-nums ${scoreColor}`}
                      >
                        {perc.toFixed(0)}%
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                          Urinish #{previousAttempts.length - index}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatAttemptDate(attempt.completed_at || attempt.started_at)} ·{" "}
                          <strong className="text-slate-700 dark:text-slate-300">
                            {attempt.score || 0}/{attempt.max_score || test.total_questions} ball
                          </strong>
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue shrink-0">
                      <span>Tahlil</span>
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
