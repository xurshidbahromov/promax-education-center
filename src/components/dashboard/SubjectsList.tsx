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
       <Link href={`/dashboard/subjects/${subject.id}`} key={subject.id} className="block w-full group">
        <motion.div
         initial={{ opacity: 0, y: 15 }}
         animate={{ opacity: 1, y: 0 }}
         whileTap={{ scale: 0.98 }}
         transition={{ delay: index * 0.05 }}
         className="bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col h-[280px] cursor-pointer relative group/card w-full"
        >
         {/* Top 40% Image */}
         <div className="relative h-[40%] w-full bg-slate-100 dark:bg-slate-800 shrink-0">
          <Image 
            src={subject.cover_image || "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop"} 
            alt={subject.title} 
            fill 
            className="object-cover group-hover/card:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Rating Top Right */}
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
           <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
           <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{rating}</span>
          </div>
         </div>

         {/* Bottom 60% Content */}
         <div className="p-5 flex flex-col flex-1 relative z-10 bg-white dark:bg-slate-900">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1.5 leading-tight tracking-wide line-clamp-1">
           {subject.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2 text-sm">
           {subject.description || "Fanning batafsil tavsifi kiritilmagan."}
          </p>
          
          {/* Bottom Row: Minimal UI & Action Button */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">{t('dashboard.active_course') === 'dashboard.active_course' ? "Faol Dars" : t('dashboard.active_course')}</span>
           </div>
           
           <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover/card:bg-brand-blue group-hover/card:border-brand-blue group-hover/card:text-white text-slate-500 dark:text-slate-400 transition-colors duration-300">
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
           </div>
          </div>
         </div>
        </motion.div>
      </Link>
     );
    })}
   </div>
  </div>
 );
}
