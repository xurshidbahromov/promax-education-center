"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, X, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { getCachedStreak, getCurrentWeekStatus, type StreakData } from "@/lib/streak";
import { useCurrentUser } from "@/hooks/useDashboardData";

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
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false); }}
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900 border-t border-x sm:border border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden text-left text-slate-800 dark:text-white"
          >
            {/* Sticky Header (Shop style) */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Flame size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-fredoka leading-tight">
                      Kunlik Faollik
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Har kuni kiring va mukofot oling
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Yopish"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Metric Strip */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Joriy zanjir
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black font-fredoka text-slate-900 dark:text-white tabular-nums">
                      {streak.currentStreak}
                    </span>
                    <span className="text-xs font-bold text-amber-500">kun</span>
                  </div>
                </div>
                <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
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

              {/* 7-Day Grid */}
              <div>
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Bu hafta</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold normal-case">
                    {streak.todayAwarded ? (
                      <>
                        <Check size={12} strokeWidth={2.5} />
                        <span>Bugun faol (+5 tanga)</span>
                      </>
                    ) : (
                      <span className="text-slate-400">Kutilmoqda</span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  {weekStatus.map((day) => (
                    <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                      <span className={`text-[10px] font-bold ${day.isToday ? "text-amber-500" : "text-slate-400"}`}>
                        {day.dayLabel}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          day.isActive
                            ? "bg-amber-500 text-white"
                            : day.isToday
                            ? "border border-dashed border-amber-500 text-amber-500 bg-amber-500/10"
                            : "border border-slate-200 dark:border-slate-700 bg-transparent text-slate-300 dark:text-slate-600"
                        }`}
                      >
                        {day.isActive ? (
                          <Check size={13} strokeWidth={2.6} />
                        ) : day.isToday ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shop-style Amber Bonus Note */}
              <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl p-3.5 flex items-center gap-2.5 font-medium">
                <Sparkles size={15} className="text-amber-500 shrink-0" />
                <span>
                  Har kuni <strong className="text-amber-900 dark:text-amber-200">+5 tanga</strong>, har 7-kunda esa <strong className="text-amber-900 dark:text-amber-200">+25 tanga</strong> beriladi.
                </span>
              </div>

              {/* Footer Action */}
              <Link
                href="/dashboard"
                onClick={() => setExpanded(false)}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Bosh sahifada ko&apos;rish</span>
                <ChevronRight size={14} />
              </Link>
            </div>
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
        className="h-7 sm:h-8 px-2.5 sm:px-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-full flex items-center gap-1 sm:gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold font-fredoka transition-colors active:scale-95 cursor-pointer shrink-0 shadow-none"
        title="Kunlik faollik zanjiri"
      >
        <Flame size={14} className="text-amber-500 shrink-0" />
        <span className="leading-none tabular-nums text-slate-800 dark:text-slate-100">{streak.currentStreak}</span>
        <span className="hidden sm:inline leading-none text-amber-600 dark:text-amber-400 font-semibold">kun</span>
      </button>

      {mounted && createPortal(popoverCard, document.body)}
    </>
  );
}
