"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { getSubjectById, getLessonsBySubjectId, type Subject, type Lesson } from "@/lib/supabase-queries";
import { getCompletedLessonIds, calculateSubjectProgress } from "@/lib/lesson-progress";
import { ArrowLeft, BookOpen, CheckCircle2, PlayCircle, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    setCompletedIds(getCompletedLessonIds());
    const handleSync = () => setCompletedIds(getCompletedLessonIds());
    window.addEventListener("promax_lesson_progress_updated", handleSync);
    return () => window.removeEventListener("promax_lesson_progress_updated", handleSync);
  }, []);

 const fetcher = async (id: string) => {
 if (!id) return null;
 const [subj, less] = await Promise.all([
 getSubjectById(id),
 getLessonsBySubjectId(id)
 ]);
 return { subject: subj, lessons: less };
 };

 const { data, isLoading: loading } = useSWR(subjectId ? `subject-${subjectId}` : null, () => fetcher(subjectId));
 const subject = data?.subject || null;
 const lessons = data?.lessons || [];

 if (loading) {
 return (
 <div className="space-y-6 sm:space-y-8 pb-10 animate-pulse">
 <div className="h-10 bg-white/40 dark:bg-slate-800/40 rounded w-1/4 mb-4"></div>
 <div className="h-40 bg-white/40 dark:bg-slate-800/40 rounded-3xl w-full"></div>
 <div className="space-y-4">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-20 bg-white/40 dark:bg-slate-800/40 rounded-2xl w-full"></div>
 ))}
 </div>
 </div>
 );
 }

  if (!subject) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100">Fan topilmadi</h2>
        <button onClick={() => router.back()} className="mt-4 text-brand-blue active:underline">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const progress = calculateSubjectProgress(
    lessons.map((l) => l.id),
    completedIds
  );
  const completedSet = new Set(completedIds);
  const nextIncompleteLesson = lessons.find((l) => !completedSet.has(l.id)) || lessons[0];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header / Back button */}
      <button
        onClick={() => router.push("/dashboard/lessons")}
        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors font-medium cursor-pointer"
      >
        <ArrowLeft size={20} />
        Fanlar ro&apos;yxatiga qaytish
      </button>

      {/* Subject Banner */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-none flex flex-col relative">
        {/* Full-width Cover Image */}
        <div className="w-full h-48 md:h-64 relative bg-gradient-to-br from-brand-blue to-blue-900 flex items-center justify-center text-white shrink-0">
          {subject.cover_image ? (
            <>
              <Image src={subject.cover_image} alt={subject.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </>
          ) : (
            <BookOpen size={64} className="opacity-80" />
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 md:p-10 flex-1 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800 dark:text-slate-100 font-fredoka uppercase tracking-tighter mb-2">
                {subject.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl">
                {subject.description || "Fanning batafsil tavsifi kiritilmagan."}
              </p>
            </div>

            {nextIncompleteLesson && (
              <Link
                href={`/dashboard/lessons/${nextIncompleteLesson.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-brand-blue/20 transition-all shrink-0 active:scale-95"
              >
                <PlayCircle size={18} />
                <span>{progress.completedCount > 0 && progress.completedCount < progress.totalCount ? "Darsni davom ettirish" : "Darsni boshlash"}</span>
              </Link>
            )}
          </div>

          {/* Course Progress Bar */}
          {lessons.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={15} className="text-brand-orange" />
                  O&apos;zlashtirish ko&apos;rsatkichi
                </span>
                <span className="text-brand-blue dark:text-blue-400">
                  {progress.completedCount} / {progress.totalCount} dars ({progress.percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-blue to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div>
        <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 font-fredoka uppercase tracking-tighter mb-6 flex items-center gap-2">
          <PlayCircle className="text-brand-orange" size={24} />
          Darslar ro&apos;yxati
        </h2>

        {lessons.length === 0 ? (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 text-center shadow-none">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Hozircha bu fanda darslar kiritilmagan.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {lessons.map((lesson, index) => {
              const isDone = completedSet.has(lesson.id);
              return (
                <Link href={`/dashboard/lessons/${lesson.id}`} key={lesson.id} className="block">
                  <div
                    className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border p-4 sm:p-5 shadow-none active:scale-[0.99] transition-all duration-300 flex items-center gap-3 sm:gap-5 group ${
                      isDone
                        ? "border-emerald-300/60 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                        : "border-white/60 dark:border-slate-700/50 hover:border-brand-blue/40"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full flex items-center justify-center font-medium font-fredoka text-base sm:text-lg transition-colors ${
                        isDone
                          ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                          : "bg-brand-blue/10 dark:bg-brand-blue/20 text-brand-blue group-hover:bg-brand-blue group-hover:text-white"
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={22} /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors line-clamp-2 sm:line-clamp-1">
                          {lesson.title}
                        </h3>
                        {isDone && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Tugatilgan
                          </span>
                        )}
                      </div>
                      {lesson.description && (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-brand-blue transition-colors shrink-0">
                      <span>{isDone ? "Qayta ko'rish" : "Boshlash"}</span>
                      <ChevronRight size={18} />
                    </div>
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
