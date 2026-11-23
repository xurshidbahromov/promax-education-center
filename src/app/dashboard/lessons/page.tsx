"use client";

import { useEffect, useMemo, useState } from "react";
import { useStudentSubjects } from "@/hooks/useDashboardData";
import {
  getCompletedLessonIds,
  calculateSubjectProgress,
  getLastVisitedLesson,
  type LastVisitedLesson,
} from "@/lib/lesson-progress";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  FlaskConical,
  Languages,
  Calculator,
  Atom,
  Dna,
  ArrowDownRight,
  ArrowUpRight,
  Play,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import LessonsComingSoonEmblem from "@/components/ui/LessonsComingSoonEmblem";

// ── Subject icon & accent mapping ────────────────────────────────────────────
const subjectMeta: Record<
  string,
  { iconColor: string; iconBg: string; icon: typeof BookOpen }
> = {
  matematika: {
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20",
    icon: Calculator,
  },
  ingliz: {
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/20",
    icon: Languages,
  },
  fizika: {
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/15 border-purple-500/20",
    icon: Atom,
  },
  kimyo: {
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/20",
    icon: FlaskConical,
  },
  biologiya: {
    iconColor: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500/10 dark:bg-teal-500/15 border-teal-500/20",
    icon: Dna,
  },
  default: {
    iconColor: "text-brand-blue dark:text-blue-400",
    iconBg: "bg-brand-blue/10 dark:bg-brand-blue/15 border-brand-blue/20",
    icon: BookOpen,
  },
};

function getSubjectMeta(title: string) {
  const key = Object.keys(subjectMeta).find((k) =>
    title?.toLowerCase().includes(k)
  );
  return subjectMeta[key || "default"];
}

// ── Loading Skeleton (Notched-Tab Banner style) ──────────────────────────────
function LessonsPageSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-20 max-w-[1400px] mx-auto pt-1 sm:pt-2 animate-pulse">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
        <Skeleton className="h-8 w-40 rounded-xl bg-slate-200/80 dark:bg-slate-700/50" />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full">
            <div className="flex items-stretch">
              <div className="w-[40%] sm:w-[30%] py-3 px-4">
                <Skeleton className="h-5 w-28 rounded-lg bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
              <div className="flex-1 bg-white/60 dark:bg-slate-900/60 rounded-t-3xl py-3 px-5 border-t border-r border-white/60 dark:border-slate-800/60">
                <Skeleton className="h-4 w-24 mx-auto rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
              </div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/60 rounded-b-3xl rounded-tl-3xl p-5 sm:p-6 border border-t-0 border-white/60 dark:border-slate-800/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 flex-1">
                <Skeleton className="w-12 h-12 rounded-2xl bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2 rounded-md bg-slate-200/80 dark:bg-slate-700/50" />
                  <Skeleton className="h-3 w-3/4 rounded-full bg-slate-200/80 dark:bg-slate-700/50" />
                </div>
              </div>
              <Skeleton className="h-10 w-28 rounded-full bg-slate-200/80 dark:bg-slate-700/50 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LessonsPage() {
  const { data: subjects = [], isLoading: loading } = useStudentSubjects();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [lastLesson, setLastLesson] = useState<LastVisitedLesson | null>(null);

  useEffect(() => {
    const sync = () => {
      setCompletedIds(getCompletedLessonIds());
      setLastLesson(getLastVisitedLesson());
    };
    sync();
    window.addEventListener("promax_lesson_progress_updated", sync);
    return () =>
      window.removeEventListener("promax_lesson_progress_updated", sync);
  }, []);

  const totalLessonIds = useMemo(
    () => subjects.flatMap((s) => s.lesson_ids || []),
    [subjects]
  );
  const overallProgress = useMemo(
    () => calculateSubjectProgress(totalLessonIds, completedIds),
    [totalLessonIds, completedIds]
  );

  if (loading) return <LessonsPageSkeleton />;

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-10">
      <div className="relative z-10 flex flex-col gap-5 max-w-[1400px] mx-auto pt-1 sm:pt-2">
        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">
              O&apos;quv materiali
            </p>
            <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">
              Darslar
            </h1>
          </div>

          {overallProgress.totalCount > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 self-start sm:self-auto">
              <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                {overallProgress.completedCount} / {overallProgress.totalCount} dars
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold tabular-nums">
                {overallProgress.percentage}%
              </span>
            </div>
          )}
        </div>

        {/* ── RESUME LAST LESSON STRIP ── */}
        {lastLesson && subjects.length > 0 && (
          <Link
            href={`/dashboard/lessons/${lastLesson.lessonId}`}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 hover:border-amber-500/40 rounded-[24px] p-3.5 sm:p-4 flex items-center justify-between gap-3.5 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Play size={15} className="fill-white ml-0.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Oxirgi ko&apos;rilgan dars
                </span>
                <p className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white truncate">
                  {lastLesson.title}
                </p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white text-xs font-bold transition-colors shrink-0">
              Davom ettirish
            </span>
          </Link>
        )}

        {/* ── PREMIUM EMPTY STATE (Hech narsa yo'q) ── */}
        {subjects.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2rem] border border-white/70 dark:border-slate-800/70 p-8 sm:p-12 flex flex-col items-center text-center gap-4 mt-2">
            <LessonsComingSoonEmblem />

            <div className="space-y-1.5 max-w-md">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Tez kunda tayyor bo&apos;ladi
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold font-sans tracking-tight text-slate-900 dark:text-white">
                Video darslar hozirda tayyorlanmoqda
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Ustozlarimiz fanlar bo&apos;yicha eng sara darslarni yuklamoqda. Ungacha online testlar va o&apos;yinlar orqali bilimingizni oshirib boring!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <Link
                href="/dashboard/tests"
                className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <FileCheck size={15} />
                <span>Online testlarga o&apos;tish</span>
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors"
              >
                Bosh sahifaga qaytish
              </Link>
            </div>
          </div>
        ) : (
          /* ── SIGNATURE MUSOBAQA-STYLE NOTCHED-TAB SUBJECT CARDS ── */
          <div className="flex flex-col gap-4">
            {subjects.map((subject) => {
              const meta = getSubjectMeta(subject.title);
              const SubjectIcon = meta.icon;
              const prog = calculateSubjectProgress(
                subject.lesson_ids || [],
                completedIds
              );
              const isInProgress =
                prog.completedCount > 0 && prog.completedCount < prog.totalCount;

              return (
                <div key={subject.id} className="relative w-full">
                  {/* ── TOP ROW: TRANSPARENT SHELF TAB + SEAMLESS RIGHT GLASS HEADER ── */}
                  <div className="flex items-stretch relative z-20">
                    <Link
                      href={`/dashboard/subjects/${subject.id}`}
                      className="w-[42%] sm:w-[32%] bg-transparent px-2.5 sm:px-6 py-2.5 sm:py-3 flex items-center shrink-0 z-10 cursor-pointer text-left group/step"
                    >
                      <h3 className="text-sm sm:text-xl font-medium font-sans tracking-tight text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-1 sm:gap-2 min-w-0">
                        <span className="truncate">{subject.title}</span>
                        <ArrowDownRight
                          size={18}
                          className="text-amber-500 stroke-[2.5] sm:w-[20px] sm:h-[20px] shrink-0 group-hover/step:translate-x-0.5 group-hover/step:translate-y-0.5 transition-transform"
                        />
                      </h3>
                    </Link>

                    <div className="flex-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl px-3 sm:px-6 py-2.5 sm:py-3 rounded-t-3xl border-t border-r border-white/60 dark:border-slate-800/60 border-b-0 border-l-0 flex items-center justify-center gap-2.5 z-20 min-w-0 tabular-nums">
                      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                        <BookOpen size={14} className="text-amber-500 shrink-0" />
                        <span>{prog.totalCount} ta dars</span>
                      </span>
                      {prog.completedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold whitespace-nowrap">
                          {prog.percentage}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── MAIN CARD BODY ── */}
                  <Link
                    href={`/dashboard/subjects/${subject.id}`}
                    className="relative z-10 w-full rounded-b-3xl rounded-tl-3xl rounded-tr-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl text-slate-800 dark:text-white p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-l border-r border-t-0 border-white/60 dark:border-slate-800/60 shadow-none group active:scale-[0.99] transition-all"
                  >
                    {/* Smooth Top-Left Corner Curved Border */}
                    <div className="absolute top-0 left-0 w-[42%] sm:w-[32%] h-6 rounded-tl-3xl border-t border-l border-white/60 dark:border-slate-800/60 pointer-events-none z-10" />

                    {/* Left: Cover Thumbnail or Icon Tile + Info + Progress Bar */}
                    <div className="relative z-10 flex items-start sm:items-center gap-3.5 min-w-0 flex-1 w-full">
                      {subject.cover_image ? (
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-white/60 dark:border-slate-700 shrink-0">
                          <Image
                            src={subject.cover_image}
                            alt={subject.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${meta.iconBg} border flex items-center justify-center ${meta.iconColor} shrink-0`}
                        >
                          <SubjectIcon size={23} strokeWidth={2.1} />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h4 className="text-base sm:text-xl font-semibold font-sans tracking-tight text-slate-800 dark:text-slate-100 leading-tight tracking-tight truncate">
                          {subject.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                          {subject.description ||
                            "Fanning barcha video darslari va o'quv materiallari"}
                        </p>

                        {prog.totalCount > 0 && (
                          <div className="flex items-center gap-2.5 pt-0.5 max-w-sm">
                            <div className="flex-1 h-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  prog.percentage === 100
                                    ? "bg-emerald-500"
                                    : "bg-gradient-to-r from-amber-500 to-brand-blue"
                                }`}
                                style={{ width: `${prog.percentage}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                              {prog.completedCount}/{prog.totalCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Pill Button */}
                    <div className="relative z-10 shrink-0 w-full sm:w-auto flex justify-end">
                      <span className="group/btn w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-full bg-amber-500 group-hover:bg-amber-600 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all">
                        <span>
                          {isInProgress
                            ? "Davom ettirish"
                            : prog.percentage === 100
                            ? "Qayta ko'rish"
                            : "O'qish"}
                        </span>
                        <ArrowUpRight
                          size={15}
                          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                        />
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
