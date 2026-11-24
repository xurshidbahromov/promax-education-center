"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getLessonById,
  getLessonsBySubjectId,
  getMaterialsByLessonId,
  type Material,
} from "@/lib/supabase-queries";
import {
  isLessonCompleted,
  toggleLessonCompleted,
  saveLastVisitedLesson,
} from "@/lib/lesson-progress";
import {
  ArrowLeft,
  ArrowRight,
  PlayCircle,
  FileText,
  FileDown,
  ExternalLink,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { soundFx } from "@/lib/sound-effects";
import PromaxEmptyState from "@/components/ui/PromaxEmptyState";

function getEmbedVideoUrl(rawUrl: string): string {
  const url = (rawUrl || "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (host.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/watch")) {
        const id = parsed.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/")[2];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
  } catch {
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/").split("&")[0];
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/").split("?")[0];
    }
  }
  return url;
}

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [completed, setCompleted] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["lessonDetail", lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const [less, mats] = await Promise.all([
        getLessonById(lessonId),
        getMaterialsByLessonId(lessonId),
      ]);
      const siblings = less?.subject_id
        ? await getLessonsBySubjectId(less.subject_id)
        : [];
      return { lesson: less, materials: mats, siblingLessons: siblings };
    },
    enabled: !!lessonId,
    staleTime: 3 * 60 * 1000,
  });

  const lesson = data?.lesson || null;
  const materials = data?.materials || [];
  const siblingLessons = data?.siblingLessons || [];

  useEffect(() => {
    if (!lessonId) return;
    setCompleted(isLessonCompleted(lessonId));
  }, [lessonId]);

  useEffect(() => {
    if (lesson) {
      saveLastVisitedLesson({
        lessonId: lesson.id,
        title: lesson.title,
        subjectId: lesson.subject_id,
      });
    }
  }, [lesson]);

  const currentIdx = lesson
    ? siblingLessons.findIndex((l) => l.id === lesson.id)
    : -1;
  const prevLesson = currentIdx > 0 ? siblingLessons[currentIdx - 1] : null;
  const nextLesson =
    currentIdx !== -1 && currentIdx < siblingLessons.length - 1
      ? siblingLessons[currentIdx + 1]
      : null;

  // Prefetch next lesson for zero-latency switching
  useEffect(() => {
    if (nextLesson?.id) {
      router.prefetch(`/dashboard/lessons/${nextLesson.id}`);
    }
  }, [nextLesson?.id, router]);

  const handleToggleCompleted = async () => {
    if (!lessonId) return;
    const res = await toggleLessonCompleted(lessonId);
    setCompleted(res.completed);
    if (res.completed) {
      soundFx.playSuccess();
      toast.success("Dars o'zlashtirildi deb belgilandi");
    } else {
      toast("Dars holati qaytarildi");
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 pb-10 max-w-4xl mx-auto pt-1 sm:pt-2 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-9 bg-white/70 dark:bg-slate-800/70 rounded-full w-36" />
          <div className="h-10 bg-white/70 dark:bg-slate-800/70 rounded-2xl w-44" />
        </div>
        <div className="h-28 bg-white/80 dark:bg-slate-900/80 rounded-[28px] w-full" />
        <div className="aspect-video bg-white/80 dark:bg-slate-900/80 rounded-[28px] w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center p-4 sm:p-6">
        <PromaxEmptyState
          variant="not-found"
          className="w-full max-w-md"
          title="Dars topilmadi"
          description="Bu dars o'chirilgan yoki vaqtincha yashirilgan bo'lishi mumkin."
          actions={
            <button
              type="button"
              onClick={() => router.push("/dashboard/lessons")}
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Darslar ro&apos;yxatiga qaytish</span>
            </button>
          }
        />
      </div>
    );
  }

  const renderMaterial = (material: Material) => {
    switch (material.type) {
      case "video": {
        const videoUrl = getEmbedVideoUrl(material.url);
        return (
          <div className="aspect-video w-full rounded-[24px] overflow-hidden bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={material.title}
            />
          </div>
        );
      }
      case "pdf":
        return (
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 p-4 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-brand-blue/40 active:scale-[0.99] group transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <FileDown size={19} />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                  {material.title}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  PDF hujjat
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue px-3 py-1.5 bg-brand-blue/10 rounded-xl shrink-0">
              <span>Ochish</span>
              <ExternalLink size={12} />
            </span>
          </a>
        );
      case "link":
        return (
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 p-4 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/70 dark:border-slate-800 hover:border-brand-blue/40 active:scale-[0.99] group transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0">
                <LinkIcon size={19} />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                  {material.title}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Qo&apos;shimcha havola
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue px-3 py-1.5 bg-brand-blue/10 rounded-xl shrink-0">
              <span>O&apos;tish</span>
              <ExternalLink size={12} />
            </span>
          </a>
        );
      case "text":
        return (
          <div className="p-5 sm:p-6 bg-white/90 dark:bg-slate-900/90 rounded-[24px] border border-slate-200/70 dark:border-slate-800 prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: material.content || material.url || "",
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-10 max-w-4xl mx-auto pt-1 sm:pt-2">
      {/* Top Bar: Back + Completion Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() =>
            lesson.subject_id
              ? router.push(`/dashboard/subjects/${lesson.subject_id}`)
              : router.back()
          }
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
        >
          <span className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 flex items-center justify-center shrink-0">
            <ArrowLeft size={15} />
          </span>
          <span>Fanga qaytish</span>
        </button>

        <button
          type="button"
          onClick={handleToggleCompleted}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-[0.98] ${
            completed
              ? "bg-emerald-500 text-white"
              : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500"
          }`}
        >
          {completed ? <CheckCircle2 size={17} /> : <Circle size={17} />}
          <span>{completed ? "Dars tugatilgan" : "Tugatdim deb belgilash"}</span>
        </button>
      </div>

      {/* Lesson Header Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 rounded-[28px] p-5 sm:p-6 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {currentIdx !== -1 && siblingLessons.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue dark:text-blue-400 text-[11px] font-extrabold tabular-nums">
              Dars {currentIdx + 1} / {siblingLessons.length}
            </span>
          )}
          {completed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
              <CheckCircle2 size={11} />
              O&apos;zlashtirildi
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-sans font-semibold text-slate-900 dark:text-white leading-snug tracking-tight flex items-start gap-2.5">
          <PlayCircle className="text-amber-500 shrink-0 mt-0.5" size={24} />
          <span>{lesson.title}</span>
        </h1>

        {lesson.description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Materials */}
      <div className="space-y-5">
        {materials.length === 0 ? (
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-[24px] border border-slate-200/70 dark:border-slate-800 p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText size={22} />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Hozircha bu darsga materiallar yuklanmagan
            </p>
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="space-y-2.5">
              {material.type === "video" || material.type === "text" ? (
                <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 px-1">
                  {material.title}
                </h3>
              ) : null}
              {renderMaterial(material)}
            </div>
          ))
        )}
      </div>

      {/* Sequential Lesson Navigation Footer */}
      {(prevLesson || nextLesson) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200/70 dark:border-slate-800">
          {prevLesson ? (
            <Link
              href={`/dashboard/lessons/${prevLesson.id}`}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 hover:border-brand-blue/40 transition-all group"
            >
              <ArrowLeft
                size={18}
                className="text-slate-400 group-hover:text-brand-blue group-hover:-translate-x-0.5 transition-all shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Oldingi dars
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate block">
                  {prevLesson.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextLesson && (
            <Link
              href={`/dashboard/lessons/${nextLesson.id}`}
              onClick={() => {
                if (!completed) {
                  toggleLessonCompleted(lesson.id);
                }
              }}
              className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition-all group text-right active:scale-[0.99]"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 block">
                  Keyingi dars
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {nextLesson.title}
                </span>
              </div>
              <ArrowRight
                size={18}
                className="text-white group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
