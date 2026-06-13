"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useCurrentUser, useUserProfile } from "@/hooks/useDashboardData";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

// Dynamically import heavy dashboard components for code splitting & performance
const SubjectsList = dynamic(() => import("@/components/dashboard/SubjectsList"));

export default function DashboardPage() {
  const { t } = useLanguage();

  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-zinc-50 font-sans pb-10">
      {/* Background Glowing Mesh (adapts to light/dark) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-400/20 dark:bg-yellow-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-purple-500/10 blur-[120px]"></div>
      </div>
      
      <div className="relative z-10 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto pt-2 sm:pt-4">
        <div className="px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex items-start justify-between gap-4 mt-2"
            >
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white font-fredoka leading-[1.1] tracking-tight">
                  {t('dashboard.title') === 'dashboard.title' ? "Fanlar Ro'yxati" : t('dashboard.title')}
                </h1>
                <p className="text-slate-500 dark:text-zinc-400 mt-2 sm:mt-3 font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                  {t('auth.welcome')}, <span className="text-slate-800 dark:text-white font-semibold">{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}</span>
                </p>
              </div>
              
              <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md flex items-center justify-center shrink-0 hover:bg-black/10 dark:hover:bg-white/10 hover:scale-105 transition-all dark:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-zinc-300" />
              </button>
            </motion.div>

            <div className="pt-2">
              <SubjectsList />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
