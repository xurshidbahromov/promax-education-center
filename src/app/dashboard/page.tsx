"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser, useUserProfile, useDashboardStats, useUpcomingTests, useAnnouncements, useStudentSubjects } from "@/hooks/useDashboardData";
import Link from "next/link";
import {
  BookOpenText,
  FlaskConical,
  Globe,
  Calculator,
  Atom,
  Leaf,
  FileCheck,
  Trophy,
  ChevronRight,
  Megaphone,
  Clock,
  Zap,
  TrendingUp,
  Play,
  Gamepad2,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardHomeSkeleton } from "@/components/ui/Skeleton";
import { OlympiadBannerTeaser } from "@/components/dashboard/OlympiadSection";
import { InternationalBannerTeaser } from "@/components/dashboard/InternationalSection";
import DailyStreakCard from "@/components/dashboard/DailyStreakCard";
import {
  calculateSubjectProgress,
  getCompletedLessonIds,
  getLastVisitedLesson,
  type LastVisitedLesson,
} from "@/lib/lesson-progress";

// Subject colors & icons
const subjectMeta: Record<string, { color: string; bg: string; icon: any }> = {
  matematika: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500", icon: Calculator },
  ingliz: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500", icon: Globe },
  fizika: { color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500", icon: Atom },
  kimyo: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500", icon: FlaskConical },
  biologiya: { color: "text-green-600 dark:text-green-400", bg: "bg-green-500", icon: Leaf },
  default: { color: "text-brand-blue", bg: "bg-brand-blue", icon: BookOpenText },
};

function getSubjectMeta(title: string) {
  const key = Object.keys(subjectMeta).find(k => title?.toLowerCase().includes(k));
  return subjectMeta[key || "default"];
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);
  const { data: stats } = useDashboardStats(user?.id);
  const { data: upcomingTests } = useUpcomingTests();
  const { data: dbAnnouncements = [] } = useAnnouncements();
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [lastLesson, setLastLesson] = useState<LastVisitedLesson | null>(null);

  useEffect(() => {
    const syncProgress = () => {
      setCompletedLessonIds(getCompletedLessonIds());
      setLastLesson(getLastVisitedLesson());
    };
    syncProgress();

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    };

    window.addEventListener('promax_announcements_updated', handleUpdate);
    window.addEventListener('promax_lesson_progress_updated', syncProgress);
    return () => {
      window.removeEventListener('promax_announcements_updated', handleUpdate);
      window.removeEventListener('promax_lesson_progress_updated', syncProgress);
    };
  }, [queryClient]);

  const { data: subjects = [], isLoading: subjectsLoading } = useStudentSubjects();

  const activeBannerAnnouncements = useMemo(() => {
    if (dbAnnouncements && dbAnnouncements.length > 0) {
      return dbAnnouncements
        .filter((a: any) => Boolean(a.is_featured) && a.is_active !== false)
        .map((a: any) => ({
          id: a.id,
          title: a.title,
          message: a.content || a.message || "",
          image: a.image_url || "",
          badge: a.badge || (a.type === 'error' ? "MOCK EXAM" : a.type === 'warning' ? "SPEAKING CLUB" : a.type === 'success' ? "YANGI KURS" : "KABINET E'LONI"),
          date: a.created_at ? new Date(a.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }) : "",
          badgeBg: a.type === 'error' ? "bg-red-500/90 text-white" : a.type === 'warning' ? "bg-amber-500/90 text-white" : a.type === 'success' ? "bg-emerald-500/90 text-white" : "bg-blue-600/90 text-white"
        }));
    }
    return [];
  }, [dbAnnouncements]);

  const isLoading = !user || subjectsLoading;

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";

  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-4 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Standard Ambient background matching all dashboard subpages */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-300/20 dark:bg-purple-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 max-w-[1600px] w-full min-w-0 mx-auto pt-1 sm:pt-2">

        {/* ── LOADING SKELETON ── */}
        {isLoading ? (
          <DashboardHomeSkeleton />
        ) : (<>
          {/* ── 1. HERO GREETING & COMPACT STREAK ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {greeting}, <span className="font-semibold text-slate-700 dark:text-slate-200">{firstName}!</span>
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold font-fredoka text-slate-800 dark:text-slate-100 leading-tight">
                Bugun nima o'rganamiz?
              </h1>
            </div>

            <DailyStreakCard userId={user?.id} />
          </div>

          {/* ── 2. ONLAYN OLIMPIADALAR & XALQARO MUSOBAQALAR (Eng tepada) ── */}
          <div className="flex flex-col gap-4">
            <OlympiadBannerTeaser />
            <InternationalBannerTeaser />
          </div>

          {/* ── 3. RESUME LAST LESSON (Darsni davom ettirish) ── */}
          {lastLesson && (
            <Link
              href={`/dashboard/lessons/${lastLesson.lessonId}`}
              className="bg-white/65 dark:bg-slate-900/65 backdrop-blur-xl rounded-[1.5rem] px-4 py-3.5 border border-white/60 dark:border-slate-800/60 hover:bg-white/85 dark:hover:bg-slate-900/85 active:scale-[0.99] transition-all flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/15 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                <Play size={18} className="fill-current ml-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-brand-blue dark:text-blue-400 leading-none">
                  Oxirgi darsni davom ettirish
                </p>
                <p className="text-[14px] sm:text-[15px] font-semibold text-slate-800 dark:text-slate-100 mt-1 truncate">
                  {lastLesson.title}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shrink-0">
                <span className="hidden xs:inline">Ochish</span>
                <ChevronRight size={14} />
              </span>
            </Link>
          )}

          {/* ── 4. STATS ROW — 3 Clickable Flat Cards ── */}
          <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {[
              {
                label: "Testlar",
                value: stats?.totalTests ?? 0,
                href: "/dashboard/results",
                icon: FileCheck,
                iconBg: "bg-brand-blue/10 dark:bg-brand-blue/15 text-brand-blue dark:text-blue-400",
              },
              {
                label: "O'rtacha",
                value: `${stats?.averageScore ?? 0}%`,
                href: "/dashboard/results",
                icon: TrendingUp,
                iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              },
              {
                label: "Tangalar",
                value: stats?.totalCoins ?? 0,
                href: "/dashboard/shop",
                icon: Trophy,
                iconBg: "bg-brand-orange/10 dark:bg-brand-orange/15 text-brand-orange",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-3.5 sm:p-4 border border-white/60 dark:border-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-900/80 shadow-none flex flex-col items-center gap-1.5 text-center active:scale-[0.98] transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                    <Icon size={18} className="stroke-[2.1]" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold font-fredoka text-slate-800 dark:text-slate-100 tabular-nums leading-tight mt-0.5">
                    {s.value}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                    {s.label}
                  </p>
                </Link>
              );
            })}
          </section>

          {/* ── 4.5 COMPACT SECONDARY ACCESS (Mobile-friendly Natijalar & O'yinlar) ── */}
          <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:hidden">
            <Link
              href="/dashboard/results"
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl px-3.5 py-3 border border-white/60 dark:border-slate-800/60 active:scale-[0.98] transition-all flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">Natijalar</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Ball va tahlil</p>
              </div>
              <ChevronRight size={15} className="text-slate-400 shrink-0" />
            </Link>

            <Link
              href="/dashboard/games"
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl px-3.5 py-3 border border-white/60 dark:border-slate-800/60 active:scale-[0.98] transition-all flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                <Gamepad2 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">O&apos;yinlar</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Tezkor mashqlar</p>
              </div>
              <ChevronRight size={15} className="text-slate-400 shrink-0" />
            </Link>
          </section>

          {/* ── 5. SUBJECT PROGRESS CARDS (Fanlarim — Haqiqiy progress) ── */}
          {subjects.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-[13px] sm:text-[14px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  Fanlarim
                </h2>
                <Link href="/dashboard/lessons" className="text-[13px] text-brand-blue font-semibold flex items-center gap-1 transition-all">
                  Barchasi <ChevronRight size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {subjects.slice(0, 4).map((subject) => {
                  const meta = getSubjectMeta(subject.title);
                  const Icon = meta.icon;
                  const { completedCount, totalCount, percentage } = calculateSubjectProgress(
                    subject.lesson_ids || [],
                    completedLessonIds
                  );

                  return (
                    <div key={subject.id}>
                      <Link
                        href={`/dashboard/subjects/${subject.id}`}
                        className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-800/60 hover:bg-white/80 dark:hover:bg-slate-900/80 shadow-none active:scale-[0.99] transition-all duration-200 flex flex-col gap-3 group block"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center justify-center transition-transform group-active:scale-95">
                            <Icon size={26} className={meta.color} />
                          </div>
                          <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                            {completedCount}
                            <span className="text-slate-400 dark:text-slate-600 font-medium">/{totalCount}</span>
                          </span>
                        </div>

                        <div>
                          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider line-clamp-1">
                            {subject.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {percentage > 0 ? `${percentage}% o'zlashtirildi` : `${totalCount} ta dars`}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 w-full bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${meta.bg}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 6. UPCOMING TESTS — Vertical Stacked List ── */}
          {(upcomingTests?.length ?? 0) > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] sm:text-[14px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={16} className="text-brand-blue" />
                  Testlar
                </h2>
                <Link href="/dashboard/tests" className="text-[13px] text-brand-blue font-semibold flex items-center gap-1 transition-all">
                  Barchasi <ChevronRight size={14} />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {upcomingTests?.slice(0, 3).map((test: any) => (
                  <Link
                    key={test.id}
                    href={`/dashboard/tests/${test.id}`}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 dark:border-slate-800/60 shadow-none active:scale-[0.99] transition-all flex items-center gap-4 group"
                  >
                    <div className="flex items-center justify-center shrink-0 group-active:scale-95 transition-transform">
                      <FileCheck size={28} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{test.title}</p>
                      <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock size={11} />
                        {test.duration_minutes ? `${test.duration_minutes} daqiqa` : "Cheksiz"} · {test.total_questions} savol
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-active:text-brand-blue group-active:scale-95 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── 7. YANGILIKLAR & E'LONLAR (Eng pastda) ── */}
          {activeBannerAnnouncements.length > 0 && (
            <section className="relative overflow-hidden w-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] sm:text-[14px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Megaphone size={16} className="text-brand-blue" />
                  Yangiliklar & E'lonlar
                </h2>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar w-full scroll-smooth">
                {activeBannerAnnouncements.map((item, i) => (
                  <div
                    key={item.id}
                    className="snap-start shrink-0 w-[290px] sm:w-[380px] relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-slate-800/60 shadow-none h-[200px] sm:h-[230px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white"
                  >
                    {/* Background Image if exists */}
                    {item.image ? (
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/20 z-10" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-brand-blue/90 via-indigo-900/90 to-purple-900/90" />
                    )}

                    {/* Content Overlay */}
                    <div className="relative z-20 p-5 flex flex-col justify-between h-full text-white">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full backdrop-blur-md shadow-none tracking-wider ${item.badgeBg}`}>
                          {item.badge}
                        </span>
                        {item.date && (
                          <span className="text-[11px] font-semibold text-slate-200/90 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <Clock size={11} />
                            {item.date}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold leading-snug font-fredoka tracking-wide text-white drop-shadow-sm line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[12px] sm:text-[13px] text-slate-200/90 line-clamp-2 leading-relaxed font-medium">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </>) /* end isLoading check */}
      </div>
    </div>
  );
}
