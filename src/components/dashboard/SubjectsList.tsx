"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getSubjects, type Subject } from "@/lib/supabase-queries";
import { BookOpen, ChevronRight, LayoutGrid, Star } from "lucide-react";
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
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
    {subjects.map((subject, index) => {
     const rating = (4.8 + Math.random() * 0.2).toFixed(1); // Premium rating

     return (
       <Link href={`/dashboard/subjects/${subject.id}`} key={subject.id} className="block group">
        <motion.div
         initial={{ opacity: 0, y: 15 }}
         animate={{ opacity: 1, y: 0 }}
         whileTap={{ scale: 0.98 }}
         transition={{ delay: index * 0.05 }}
         className="bg-black/5 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-lg border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)] transition-all duration-500 flex flex-col h-[360px] cursor-pointer relative group/card"
        >
         {/* Top 50% Image */}
         <div className="relative h-[55%] w-full bg-slate-200 dark:bg-slate-800 shrink-0">
          <Image 
            src={subject.cover_image || "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop"} 
            alt={subject.title} 
            fill 
            className="object-cover group-hover/card:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Rating Top Right */}
          <div className="absolute top-4 right-4 bg-black/40 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5">
           <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
           <span className="text-xs font-bold text-white">{rating}</span>
          </div>

          <div className="absolute bottom-4 left-4">
             <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <BookOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
             </div>
          </div>
         </div>

         {/* Bottom 45% Content */}
         <div className="p-6 flex flex-col flex-1 relative z-10 bg-white/60 dark:bg-transparent backdrop-blur-md">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-fredoka mb-2 leading-tight tracking-wide line-clamp-1">
           {subject.title}
          </h3>
          <p className="text-slate-600 dark:text-zinc-400 font-medium line-clamp-2 text-sm sm:text-base">
           {subject.description || "Fanning batafsil tavsifi kiritilmagan."}
          </p>
          
          {/* Bottom Row: Minimal UI & Action Button */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium tracking-wider uppercase">{t('dashboard.active_course') === 'dashboard.active_course' ? "Faol Dars" : t('dashboard.active_course')}</span>
           </div>
           
           <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover/card:scale-110 group-hover/card:bg-yellow-400 transition-all duration-300">
            <ChevronRight className="w-5 h-5 text-black" strokeWidth={2.5} />
           </div>
          </div>
         </div>
         
         {/* Subtle background glow for the card itself */}
         <div className="absolute top-1/2 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover/card:bg-yellow-500/10 transition-colors duration-500 pointer-events-none z-0"></div>
        </motion.div>
      </Link>
     );
    })}
   </div>
  </div>
 );
}
