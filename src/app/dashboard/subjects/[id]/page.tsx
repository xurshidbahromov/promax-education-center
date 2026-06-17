"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { getSubjectById, getLessonsBySubjectId, type Subject, type Lesson } from "@/lib/supabase-queries";
import { ArrowLeft, BookOpen, Clock, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function SubjectDetailPage() {
 const params = useParams();
 const router = useRouter();
 const subjectId = params.id as string;

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
 <button onClick={() => router.back()} className="mt-4 text-brand-blue hover:underline">
 Orqaga qaytish
 </button>
 </div>
 );
 }

 return (
        <div className="space-y-6 sm:space-y-8 pb-10">
            {/* Header / Back button */}
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue transition-colors font-medium"
            >
                <ArrowLeft size={20} />
                Fanlar ro'yxatiga qaytish
            </button>

            {/* Subject Banner */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg flex flex-col relative">
                
                {/* Full-width Cover Image */}
                <div className="w-full h-48 md:h-64 relative bg-gradient-to-br from-brand-blue to-blue-900 flex items-center justify-center text-white shrink-0">
                    {subject.cover_image ? (
                        <>
                            <Image src={subject.cover_image} alt={subject.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </>
                    ) : (
                        <BookOpen size={64} className="opacity-80" />
                    )}
                </div>
                
                {/* Content Area */}
                <div className="p-6 sm:p-8 md:p-10 flex-1 bg-white/40 dark:bg-slate-900/40">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800 dark:text-slate-100 font-fredoka uppercase tracking-tighter mb-3">
                        {subject.title}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-4xl">
                        {subject.description || "Fanning batafsil tavsifi kiritilmagan."}
                    </p>
                </div>
            </div>

 {/* Lessons List */}
 <div>
 <h2 className="text-2xl font-medium text-slate-800 dark:text-slate-100 font-fredoka uppercase tracking-tighter mb-6 flex items-center gap-2">
 <PlayCircle className="text-brand-orange" size={24} />
 Darslar ro'yxati
 </h2>

 {lessons.length === 0 ? (
 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-800/60 p-8 text-center shadow-sm">
 <p className="text-gray-500 dark:text-gray-400 font-medium">Hozircha bu fanda darslar kiritilmagan.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {lessons.map((lesson, index) => (
 <Link href={`/dashboard/lessons/${lesson.id}`} key={lesson.id}>
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 whileTap={{ scale: 0.96 }}
 transition={{ delay: index * 0.05 }}
 className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/80 dark:border-slate-700/80 p-4 sm:p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex items-center gap-3 sm:gap-5 group"
 >
 <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center text-brand-blue font-medium font-fredoka text-base sm:text-lg group-hover:bg-brand-blue group-hover:text-white transition-colors">
 {index + 1}
 </div>
 <div className="flex-1">
 <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors line-clamp-2 sm:line-clamp-1">
 {lesson.title}
 </h3>
 {lesson.description && (
 <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
 {lesson.description}
 </p>
 )}
 </div>
 <div className="hidden sm:flex text-slate-400 group-hover:text-brand-blue transition-colors">
 <PlayCircle size={24} />
 </div>
 </motion.div>
 </Link>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
