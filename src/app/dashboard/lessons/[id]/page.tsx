"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLessonById, getLessonsBySubjectId, getMaterialsByLessonId, type Lesson, type Material } from "@/lib/supabase-queries";
import { isLessonCompleted, toggleLessonCompleted, saveLastVisitedLesson } from "@/lib/lesson-progress";
import { ArrowLeft, ArrowRight, PlayCircle, FileText, FileDown, Link as LinkIcon, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [siblingLessons, setSiblingLessons] = useState<Lesson[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!lessonId) return;
      setCompleted(isLessonCompleted(lessonId));
      const [less, mats] = await Promise.all([
        getLessonById(lessonId),
        getMaterialsByLessonId(lessonId)
      ]);
      setLesson(less);
      setMaterials(mats);
      if (less) {
        saveLastVisitedLesson({
          lessonId: less.id,
          title: less.title,
          subjectId: less.subject_id,
        });
      }
      if (less?.subject_id) {
        const siblings = await getLessonsBySubjectId(less.subject_id);
        setSiblingLessons(siblings);
      }
      setLoading(false);
    }
    loadData();
  }, [lessonId]);

  const handleToggleCompleted = async () => {
    if (!lessonId) return;
    const res = await toggleLessonCompleted(lessonId);
    setCompleted(res.completed);
    if (res.completed) {
      toast.success("Dars o'zlashtirildi deb belgilandi! ✅");
    } else {
      toast("Dars holati qaytarildi");
    }
  };

 if (loading) {
 return (
 <div className="space-y-6 sm:space-y-8 pb-10 animate-pulse">
 <div className="h-10 bg-white/40 dark:bg-slate-800/40 rounded w-1/4 mb-4"></div>
 <div className="h-24 bg-white/40 dark:bg-slate-800/40 rounded-3xl w-full"></div>
 <div className="space-y-4">
 <div className="h-[400px] bg-white/40 dark:bg-slate-800/40 rounded-3xl w-full"></div>
 </div>
 </div>
 );
 }

 if (!lesson) {
 return (
 <div className="text-center py-20">
 <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100">Dars topilmadi</h2>
 <button onClick={() => router.back()} className="mt-4 text-brand-blue active:underline">
 Orqaga qaytish
 </button>
 </div>
 );
 }

 const renderMaterial = (material: Material) => {
 switch (material.type) {
 case 'video':
 // Auto-convert standard youtube links to embed links if necessary
 let videoUrl = material.url;
 if (videoUrl.includes('watch?v=')) {
 videoUrl = videoUrl.replace('watch?v=', 'embed/');
 } else if (videoUrl.includes('youtu.be/')) {
 videoUrl = videoUrl.replace('youtu.be/', 'youtube.com/embed/');
 }
 return (
 <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-white/20">
 <iframe 
 src={videoUrl} 
 className="w-full h-full"
 allowFullScreen
 title={material.title}
 ></iframe>
 </div>
 );
 case 'pdf':
 return (
 <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 active:border-brand-blue/50 group transition-colors">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center">
 <FileDown size={20} />
 </div>
 <span className="font-semibold text-slate-800 dark:text-slate-100 group-active:text-brand-blue transition-colors">{material.title}</span>
 </div>
 <span className="text-sm font-medium text-brand-blue px-3 py-1 bg-brand-blue/10 rounded-full">Ochish</span>
 </a>
 );
 case 'link':
 return (
 <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 active:border-brand-blue/50 group transition-colors">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
 <LinkIcon size={20} />
 </div>
 <span className="font-semibold text-slate-800 dark:text-slate-100 group-active:text-brand-blue transition-colors">{material.title}</span>
 </div>
 <span className="text-sm font-medium text-brand-blue px-3 py-1 bg-brand-blue/10 rounded-full">O'tish</span>
 </a>
 );
 case 'text':
 return (
 <div className="p-6 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700 prose dark:prose-invert max-w-none">
 <div dangerouslySetInnerHTML={{ __html: material.content || material.url || '' }} />
 </div>
 );
 default:
 return null;
 }
 };

  const currentIdx = siblingLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? siblingLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx !== -1 && currentIdx < siblingLessons.length - 1 ? siblingLessons[currentIdx + 1] : null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Header / Back button & Completion Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => lesson.subject_id ? router.push(`/dashboard/subjects/${lesson.subject_id}`) : router.back()}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft size={20} />
          Fanga qaytish
        </button>

        <button
          type="button"
          onClick={handleToggleCompleted}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
            completed
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500"
          }`}
        >
          {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          <span>{completed ? "Dars tugatilgan" : "Darsni tugatdim deb belgilash"}</span>
        </button>
      </div>

      {/* Lesson Title */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-[40px] -z-10 pointer-events-none"></div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 font-fredoka uppercase tracking-tighter mb-2 flex items-center gap-3">
          <PlayCircle className="text-brand-orange shrink-0" />
          <span>{lesson.title}</span>
        </h1>
        {lesson.description && (
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            {lesson.description}
          </p>
        )}
      </div>

      {/* Materials List */}
      <div className="space-y-8">
        {materials.length === 0 ? (
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 text-center shadow-sm">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">Hozircha bu darsga materiallar yuklanmagan.</p>
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="space-y-3">
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 px-1">
                {material.title}
              </h3>
              {renderMaterial(material)}
            </div>
          ))
        )}
      </div>

      {/* Sequential Lesson Navigation Footer */}
      {(prevLesson || nextLesson) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          {prevLesson ? (
            <Link
              href={`/dashboard/lessons/${prevLesson.id}`}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/60 dark:border-slate-800/60 hover:border-brand-blue/40 transition-all group"
            >
              <ArrowLeft size={18} className="text-slate-400 group-hover:text-brand-blue group-hover:-translate-x-0.5 transition-all shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Oldingi dars</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate block">{prevLesson.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextLesson && (
            <Link
              href={`/dashboard/lessons/${nextLesson.id}`}
              onClick={() => {
                if (!completed) {
                  toggleLessonCompleted(lesson.id);
                }
              }}
              className="flex items-center justify-end gap-3 p-4 rounded-2xl bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 hover:bg-brand-blue hover:text-white transition-all group text-right"
            >
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-blue dark:text-blue-300 group-hover:text-white/80 block">Keyingi dars</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white truncate block">{nextLesson.title}</span>
              </div>
              <ArrowRight size={18} className="text-brand-blue group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
