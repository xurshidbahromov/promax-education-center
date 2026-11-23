"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getSubjectById, getLessonsBySubjectId } from "@/lib/supabase-queries";
import {
  getCompletedLessonIds,
  calculateSubjectProgress,
} from "@/lib/lesson-progress";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Play,
  PlayCircle,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LessonsComingSoonEmblem from "@/components/ui/LessonsComingSoonEmblem";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "pending" | "done">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleSync = () => setCompletedIds(getCompletedLessonIds());
    handleSync();
    window.addEventListener("promax_lesson_progress_updated", handleSync);
    return () =>
      window.removeEventListener("promax_lesson_progress_updated", handleSync);
  }, []);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["subjectDetail", subjectId],
    queryFn: async () => {
      if (!subjectId) return null;
      const [subj, less] = await Promise.all([
        getSubjectById(subjectId),
        getLessonsBySubjectId(subjectId),
      ]);
      return { subject: subj, lessons: less };
    },
    enabled: !!subjectId,
    staleTime: 3 * 60 * 1000,
  });

  const subject = data?.subject || null;
  const lessons = data?.lessons || [];

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);
  const progress = useMemo(
    () =>
      calculateSubjectProgress(
        lessons.map((l) => l.id),
        completedIds
      ),
    [lessons, completedIds]
  );

  const nextIncompleteLesson = useMemo(
    () => lessons.find((l) => !completedSet.has(l.id)) || lessons[0],
    [lessons, completedSet]
  );

  // Prefetch next lesson for instant navigation
  useEffect(() => {
    if (nextIncompleteLesson?.id) {
      router.prefetch(`/dashboard/lessons/${nextIncompleteLesson.id}`);
    }
  }, [nextIncompleteLesson?.id, router]);

  const filteredLessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessons
      .map((lesson, idx) => ({ lesson, order: idx + 1 }))
      .filter(({ lesson }) => {
        const isDone = completedSet.has(lesson.id);
        if (filterMode === "done" && !isDone) return false;
        if (filterMode === "pending" && isDone) return false;
        if (q) {
          const inTitle = (lesson.title || "").toLowerCase().includes(q);
          const inDesc = (lesson.description || "").toLowerCase().includes(q);
          return inTitle || inDesc;
        }
        return true;
      });
  }, [lessons, completedSet, filterMode, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-5 pb-10 max-w-4xl mx-auto pt-1 sm:pt-2 animate-pulse">
        <div className="h-9 bg-white/70 dark:bg-slate-800/70 rounded-full w-44" />
        <div className="h-64 bg-white/80 dark:bg-slate-900/80 rounded-[28px] w-full" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-white/80 dark:bg-slate-900/80 rounded-2xl w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-3 p-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <BookOpen size={26} />
        </div>
        <h2 className="text-xl font-bold font-fredoka text-slate-800 dark:text-slate-100">
          Fan topilmadi
        </h2>
        <Link
          href="/dashboard/lessons"
          className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
        >
          Fanlar ro&apos;yxatiga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-10 max-w-4xl mx-auto pt-1 sm:pt-2">
      {/* Back Pill */}
      <Link
        href="/dashboard/lessons"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors w-fit"
      >
        <span className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center shrink-0">
          <ArrowLeft size={15} />
        </span>
        <span>Fanlar ro&apos;yxatiga qaytish</span>
      </Link>

      {/* Subject Hero Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 rounded-[28px] overflow-hidden">
        <div className="w-full h-40 sm:h-52 relative bg-gradient-to-br from-brand-blue to-indigo-700 flex items-center justify-center text-white">
          {subject.cover_image ? (
            <>
              <Image
                src={subject.cover_image}
                alt={subject.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent" />
            </>
          ) : (
            <BookOpen size={56} className="opacity-80" />
          )}
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-blue dark:text-blue-400">
                O&apos;quv kursi
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-fredoka leading-tight">
                {subject.title}
              </h1>
              {subject.description && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                  {subject.description}
                </p>
              )}
            </div>

            {nextIncompleteLesson && (
              <Link
                href={`/dashboard/lessons/${nextIncompleteLesson.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm transition-all shrink-0 active:scale-[0.98]"
              >
                <Play size={15} className="fill-white" />
                <span>
                  {progress.completedCount > 0 &&
                  progress.completedCount < progress.totalCount
                    ? "Davom ettirish"
                    : "Darsni boshlash"}
                </span>
              </Link>
            )}
          </div>

          {/* Course Progress Bar */}
          {lessons.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold tabular-nums">
                <span className="text-slate-600 dark:text-slate-300">
                  O&apos;zlashtirish ko&apos;rsatkichi
                </span>
                <span className="text-brand-blue dark:text-blue-400">
                  {progress.completedCount} / {progress.totalCount} dars (
                  {progress.percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress.percentage === 100
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-brand-blue to-emerald-500"
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lessons Section */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="text-amber-500 shrink-0" size={20} />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-fredoka">
              Darslar ro&apos;yxati
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold tabular-nums">
              {lessons.length}
            </span>
          </div>

          {lessons.length > 0 && (
            <div className="inline-flex items-center p-1 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 self-start sm:self-auto">
              {(
                [
                  { id: "all", label: "Barchasi" },
                  { id: "pending", label: "Qolgan" },
                  { id: "done", label: "Tugatilgan" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterMode === tab.id
                      ? "bg-brand-blue text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {lessons.length > 4 && (
          <div className="relative flex items-center bg-white/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 focus-within:border-brand-blue transition-colors">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Search size={14} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mavzu nomini qidiring..."
              className="bg-transparent border-none text-xs sm:text-sm w-full text-slate-800 dark:text-slate-100 placeholder:text-slate-400 px-3 py-1 outline-none font-medium"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {lessons.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[28px] border border-white/70 dark:border-slate-800/70 p-8 sm:p-10 flex flex-col items-center text-center gap-3.5">
            <LessonsComingSoonEmblem />
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base sm:text-lg font-bold font-fredoka text-slate-900 dark:text-white">
                Bu fanga darslar tez kunda yuklanadi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Hozircha boshqa fanlarni ko&apos;rib chiqishingiz yoki online testlarni yechib turishingiz mumkin.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/dashboard/tests"
                className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
              >
                Online testlar
              </Link>
              <Link
                href="/dashboard/lessons"
                className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                Barcha fanlar
              </Link>
            </div>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-[24px] border border-slate-200/70 dark:border-slate-800 p-8 text-center space-y-1">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Mos darslar topilmadi
            </p>
            <p className="text-xs text-slate-400">
              Filtr yoki qidiruv so&apos;zini o&apos;zgartirib ko&apos;ring.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLessons.map(({ lesson, order }) => {
              const isDone = completedSet.has(lesson.id);
              return (
                <Link
                  href={`/dashboard/lessons/${lesson.id}`}
                  key={lesson.id}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all active:scale-[0.99] flex items-center gap-3.5 group bg-white/90 dark:bg-slate-900/90 ${
                    isDone
                      ? "border-emerald-500/30 dark:border-emerald-500/25"
                      : "border-slate-200/70 dark:border-slate-800 hover:border-brand-blue/40"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl flex items-center justify-center font-extrabold text-sm tabular-nums transition-colors ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue dark:text-blue-400 group-hover:bg-brand-blue group-hover:text-white"
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={19} /> : order}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-blue transition-colors line-clamp-2 sm:line-clamp-1">
                        {lesson.title}
                      </h3>
                      {isDone && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Tugatilgan
                        </span>
                      )}
                    </div>
                    {lesson.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-brand-blue transition-colors shrink-0">
                    <span className="hidden sm:inline">
                      {isDone ? "Qayta ko'rish" : "Boshlash"}
                    </span>
                    <ChevronRight size={17} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
