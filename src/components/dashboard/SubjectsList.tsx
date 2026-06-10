"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getSubjects, type Subject } from "@/lib/supabase-queries";
import { BookOpen, ChevronRight, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function SubjectsList() {
 const { t } = useLanguage();
 const [subjects, setSubjects] = useState<Subject[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadSubjects();
 }, []);

 async function loadSubjects() {
 const data = await getSubjects();
 setSubjects(data);
 setLoading(false);
 }

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3].map((i) => (
 <div key={i} className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-800/60 p-6 shadow-lg animate-pulse">
 <div className="w-16 h-16 bg-brand-blue/20 rounded-2xl mb-4"></div>
 <div className="h-6 bg-white/50 dark:bg-slate-800/50 rounded w-2/3 mb-3"></div>
 <div className="h-4 bg-white/50 dark:bg-slate-800/50 rounded w-full mb-2"></div>
 <div className="h-4 bg-white/50 dark:bg-slate-800/50 rounded w-4/5"></div>
 </div>
 ))}
 </div>
 );
 }

 if (subjects.length === 0) {
 return (
 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-800/60 p-12 text-center shadow-lg">
 <div className="w-24 h-24 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
 <BookOpen className="w-12 h-12 text-brand-blue" />
 </div>
 <h3 className="text-2xl font-medium text-slate-800 dark:text-slate-100 mb-3 font-fredoka">
 Hozircha fanlar yo'q
 </h3>
 <p className="text-gray-600 dark:text-gray-300 font-medium max-w-md mx-auto">
 Admin paneldan yangi fanlar qo'shilganda shu yerda ko'rinadi.
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <h2 className="text-2xl lg:text-3xl font-medium text-slate-800 dark:text-slate-100 font-fredoka uppercase tracking-tighter flex items-center gap-3">
 <LayoutGrid className="text-brand-blue" size={28} />
 Barcha Fanlar
 </h2>

 {/* Reduced number of columns to make cards wider on desktop */}
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
 {subjects.map((subject, index) => (
 <Link href={`/dashboard/subjects/${subject.id}`} key={subject.id} className="block group">
 <motion.div
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 whileTap={{ scale: 0.96 }}
 transition={{ delay: index * 0.05 }}
 className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl sm:rounded-[32px] border border-white/60 dark:border-slate-800/60 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full cursor-pointer"
 >
 {/* Card Cover Image - Shorter height as requested */}
 <div className="w-full h-28 sm:h-36 relative overflow-hidden border-b border-gray-100 dark:border-slate-850/60 shrink-0">
 {subject.cover_image ? (
 <Image
 src={subject.cover_image}
 alt={subject.title}
 fill
 className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
 />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-brand-blue to-blue-900 flex items-center justify-center text-white">
 <BookOpen className="w-10 h-10 opacity-80" />
 </div>
 )}
 </div>

 {/* Card Content */}
 <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
 <h3 className="text-base sm:text-xl font-medium text-slate-800 dark:text-slate-100 font-fredoka mb-1 sm:mb-2 line-clamp-2">
 {subject.title}
 </h3>
 <p className="text-[13px] sm:text-sm text-gray-600 dark:text-gray-400 font-medium line-clamp-2 mb-3 sm:mb-4 flex-1">
 {subject.description || "Fanning batafsil tavsifi kiritilmagan."}
 </p>
 
 <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 dark:border-slate-800/60 mt-auto">
 <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-150/80 dark:bg-slate-800/80 px-2 py-1 rounded-md sm:rounded-lg tracking-wider uppercase shrink-0">
 Fan
 </span>
 <span className="text-sm font-medium text-brand-blue dark:text-blue-400 flex items-center gap-1 transition-all shrink-0">
 Kirish
 <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform duration-200" />
 </span>
 </div>
 </div>
 </motion.div>
 </Link>
 ))}
 </div>
 </div>
 );
}
