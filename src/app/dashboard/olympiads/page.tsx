"use client";

import { motion } from "framer-motion";
import { OlympiadSection } from "@/components/dashboard/OlympiadSection";
import { Trophy, Award, Coins } from "lucide-react";

export default function OlympiadsPage() {
  return (
    <div className="relative text-slate-800 dark:text-white font-sans pb-8">
      {/* Ambient background glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[140px]" />
      </div>

      <div className="relative z-10 space-y-8 max-w-[1600px] mx-auto pt-2 sm:pt-4">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 dark:border-slate-800/80 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-0.5 rounded-full border border-amber-500/20">
                  PROMAX TOURNAMENTS
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-fredoka text-slate-900 dark:text-white leading-tight">
                Onlayn Musobaqalar & Olimpiadalar
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Bilimingizni sinang, tangalar yuting va pul mukofotlari hamda sovg'alarga ega bo'ling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl text-amber-600 dark:text-amber-400 text-xs font-black">
              <Coins size={16} />
              <span>Tangali Tizim</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-black">
              <Award size={16} />
              <span>Top Sovg'alar</span>
            </div>
          </div>
        </motion.div>

        {/* Olympiad Section Component */}
        <OlympiadSection />

      </div>
    </div>
  );
}
