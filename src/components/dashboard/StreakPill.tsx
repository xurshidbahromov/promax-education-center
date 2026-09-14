"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Award, Calendar, Sparkles, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getCachedStreak, getCurrentWeekStatus, type StreakData } from "@/lib/streak";

export default function StreakPill() {
  const [streak, setStreak] = useState<StreakData>(() => getCachedStreak());
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setStreak(getCachedStreak());

    const handleUpdate = () => {
      setStreak(getCachedStreak());
    };

    window.addEventListener("promax_streak_updated", handleUpdate);
    return () => {
      window.removeEventListener("promax_streak_updated", handleUpdate);
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  const weekStatus = getCurrentWeekStatus(streak);

  const popoverCard = (
    <AnimatePresence>
      {expanded && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 border border-white/80 dark:border-slate-800 shadow-2xl space-y-4 text-left text-slate-800 dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                  <Flame size={20} className="fill-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black font-fredoka text-slate-900 dark:text-white leading-none">
                    Kunlik Faollik
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Har kuni kiring va mukofot oling!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Main Streak Display */}
            <div className="bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                  Joriy Zanjir
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-black font-fredoka text-slate-900 dark:text-white">
                    {streak.currentStreak}
                  </span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    kun ketma-ket
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Rekord
                </span>
                <span className="text-base font-bold text-slate-700 dark:text-slate-200 font-fredoka">
                  {streak.longestStreak} kun
                </span>
              </div>
            </div>

            {/* 7-Day Mini Dots */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Bu hafta</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold lowercase">
                  {streak.todayAwarded ? "Bugun faol (+5 tanga) ✅" : "Kuting..."}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                {weekStatus.map((day) => (
                  <div key={day.dateStr} className="flex flex-col items-center gap-1">
                    <span className={`text-[10px] font-bold ${day.isToday ? "text-orange-500 font-black" : "text-slate-400"}`}>
                      {day.dayLabel}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                        day.isActive
                          ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30"
                          : day.isToday
                          ? "border-2 border-dashed border-orange-400 text-orange-500 animate-pulse"
                          : day.isFuture
                          ? "bg-slate-200/50 dark:bg-slate-800/60 text-slate-400"
                          : "bg-slate-100 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      {day.isActive ? "✓" : day.isToday ? "🔥" : "·"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus Info */}
            <div className="text-[12px] text-slate-500 dark:text-slate-400 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3 flex items-center gap-2.5">
              <Sparkles size={16} className="text-amber-500 shrink-0" />
              <span>Har kuni kirganingizda <strong>+5 tanga</strong>, har 7-kunda esa <strong>+25 tanga</strong> bonus beriladi!</span>
            </div>

            {/* Footer Action */}
            <Link
              href="/dashboard"
              onClick={() => setExpanded(false)}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Bosh sahifada ko'rish</span>
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="h-8 px-3 bg-orange-500/10 hover:bg-orange-500/15 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 border border-orange-500/20 dark:border-orange-500/20 rounded-full flex items-center gap-1.5 text-orange-600 dark:text-orange-400 text-xs font-bold font-fredoka transition-all active:scale-95 cursor-pointer shrink-0 shadow-none backdrop-blur-md"
        title="Kunlik faollik zanjiri"
      >
        <Flame size={14} className="fill-orange-500 text-orange-500 shrink-0 animate-pulse" />
        <span>{streak.currentStreak} kun</span>
      </button>

      {mounted && createPortal(popoverCard, document.body)}
    </>
  );
}
