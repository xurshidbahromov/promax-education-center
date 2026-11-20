"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { getCachedStreak, getCurrentWeekStatus, type StreakData } from "@/lib/streak";
import { useCurrentUser } from "@/hooks/useDashboardData";
import StreakFlameIcon from "@/components/ui/StreakFlameIcon";

export default function StreakPill() {
  const { data: user } = useCurrentUser();
  const [streak, setStreak] = useState<StreakData>(() => getCachedStreak(user?.id));
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setStreak(getCachedStreak(user?.id));

    const handleUpdate = () => {
      setStreak(getCachedStreak(user?.id));
    };

    window.addEventListener("promax_streak_updated", handleUpdate);
    return () => {
      window.removeEventListener("promax_streak_updated", handleUpdate);
    };
  }, [user?.id]);

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
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-slate-200/70 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.12)] space-y-4 text-left text-slate-800 dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center">
                  <StreakFlameIcon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-fredoka text-slate-900 dark:text-white leading-none">
                    Kunlik Faollik
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Har kuni kiring va mukofot oling
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Flat Minimalist Metric Strip */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Joriy zanjir
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black font-fredoka text-slate-900 dark:text-white tabular-nums">
                    {streak.currentStreak}
                  </span>
                  <span className="text-xs font-bold text-brand-orange">kun</span>
                </div>
              </div>
              <div className="rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Rekord
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black font-fredoka text-slate-700 dark:text-slate-200 tabular-nums">
                    {streak.longestStreak}
                  </span>
                  <span className="text-xs font-bold text-slate-400">kun</span>
                </div>
              </div>
            </div>

            {/* 7-Day Minimalist Grid */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Bu hafta</span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold normal-case">
                  {streak.todayAwarded ? (
                    <>
                      <Check size={12} strokeWidth={2.5} />
                      <span>Bugun faol (+5 coin)</span>
                    </>
                  ) : (
                    <span className="text-slate-400">Kutilmoqda</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 bg-slate-50/80 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                {weekStatus.map((day) => (
                  <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                    <span className={`text-[10px] font-bold ${day.isToday ? "text-brand-orange" : "text-slate-400"}`}>
                      {day.dayLabel}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        day.isActive
                          ? "bg-brand-orange text-white"
                          : day.isToday
                          ? "border border-dashed border-brand-orange text-brand-orange bg-brand-orange/5"
                          : "border border-slate-200/80 dark:border-slate-700/70 bg-transparent text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      {day.isActive ? (
                        <Check size={13} strokeWidth={2.6} />
                      ) : day.isToday ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Flat Bonus Note */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-2.5">
              <Sparkles size={15} className="text-brand-orange shrink-0" strokeWidth={1.8} />
              <span>
                Har kuni <strong className="text-slate-700 dark:text-slate-200">+5 coin</strong>, har 7-kunda esa <strong className="text-slate-700 dark:text-slate-200">+25 coin</strong> beriladi.
              </span>
            </div>

            {/* Footer Action */}
            <Link
              href="/dashboard"
              onClick={() => setExpanded(false)}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Bosh sahifada ko&apos;rish</span>
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
        className="h-7 sm:h-8 px-2 sm:px-2.5 bg-brand-orange/[0.08] hover:bg-brand-orange/[0.14] dark:bg-brand-orange/15 dark:hover:bg-brand-orange/20 border border-brand-orange/15 rounded-full flex items-center gap-1 sm:gap-1.5 text-slate-800 dark:text-slate-100 text-xs font-bold font-fredoka transition-colors active:scale-95 cursor-pointer shrink-0 shadow-none"
        title="Kunlik faollik zanjiri"
      >
        <StreakFlameIcon size={15} className="text-brand-orange shrink-0" />
        <span className="leading-none tabular-nums">{streak.currentStreak}</span>
        <span className="hidden sm:inline leading-none text-slate-500 dark:text-slate-400 font-semibold">kun</span>
      </button>

      {mounted && createPortal(popoverCard, document.body)}
    </>
  );
}
