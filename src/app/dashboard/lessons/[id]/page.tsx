"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getLessonById, getMaterialsByLessonId, type Lesson, type Material } from "@/lib/supabase-queries";
import { ArrowLeft, PlayCircle, FileText, FileDown, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LessonDetailPage() {
 const params = useParams();
 const router = useRouter();
 const lessonId = params.id as string;

 const [lesson, setLesson] = useState<Lesson | null>(null);
 const [materials, setMaterials] = useState<Material[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 async function loadData() {
 if (!lessonId) return;
 const [less, mats] = await Promise.all([
 getLessonById(lessonId),
 getMaterialsByLessonId(lessonId)
 ]);
 setLesson(less);
 setMaterials(mats);
 setLoading(false);
 }
 loadData();
 }, [lessonId]);

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
 <button onClick={() => router.back()} className="mt-4 text-brand-blue hover:underline">
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
 <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-blue/50 group transition-colors">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center">
 <FileDown size={20} />
 </div>
 <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors">{material.title}</span>
 </div>
 <span className="text-sm font-medium text-brand-blue px-3 py-1 bg-brand-blue/10 rounded-full">Ochish</span>
 </a>
 );
 case 'link':
 return (
 <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-blue/50 group transition-colors">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
 <LinkIcon size={20} />
 </div>
 <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors">{material.title}</span>
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

 return (
 <div className="space-y-6 sm:space-y-8 pb-10">
 {/* Header / Back button */}
 <button 
 onClick={() => router.back()}
 className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors font-medium"
 >
 <ArrowLeft size={20} />
 Fanga qaytish
 </button>

 {/* Lesson Title */}
 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-lg relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-[40px] -z-10 pointer-events-none"></div>
 <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 font-fredoka uppercase tracking-tighter mb-2 flex items-center gap-3">
 <PlayCircle className="text-brand-orange" />
 {lesson.title}
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
 materials.map((material, index) => (
 <motion.div
 key={material.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 className="space-y-3"
 >
 <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 px-1">
 {material.title}
 </h3>
 {renderMaterial(material)}
 </motion.div>
 ))
 )}
 </div>
 </div>
 );
}
