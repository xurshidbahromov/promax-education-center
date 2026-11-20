"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, Coins, Check, X } from "lucide-react";
import {
  getCachedStreak,
  getCurrentWeekStatus,
  checkAndUpdateDailyStreak,
  type StreakData,
} from "@/lib/streak";

interface DailyStreakCardProps {
  userId?: string;
}

export default function DailyStreakCard({ userId }: DailyStreakCardProps) {
  const [streak, setStreak] = useState<StreakData>(() => getCachedStreak(userId));
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (userId) {
      checkAndUpdateDailyStreak(userId).then((res) => {
        setStreak(res.streak);
        window.dispatchEvent(new CustomEvent("promax_streak_updated"));
      });
    }

    const handleUpdate = () => {
      setStreak(getCachedStreak(userId));
    };

    window.addEventListener("promax_streak_updated", handleUpdate);
    return () => {
      window.removeEventListener("promax_streak_updated", handleUpdate);
    };
  }, [userId]);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expanded]);

  const weekStatus = getCurrentWeekStatus(streak);
  const current = streak.currentStreak || 1;
  const longest = streak.longestStreak || current;

  // Milestone calculation: 7-day cycles
  const currentMod7 = current % 7;
  const daysUntilMilestone = currentMod7 === 0 ? 7 : 7 - currentMod7;
  const milestoneProgressPct = Math.round(((7 - daysUntilMilestone) / 7) * 100);

  // Shop-aligned Bottom Sheet / Modal
  const detailsModal = (
    <AnimatePresence>
      {expanded && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false); }}
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div
            ref={popoverRef}
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
                      O&apos;quv zanjirini uzmay davom ettiring
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
              {/* Current vs Record */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Joriy Zanjir
                  </span>
                  <p className="text-2xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5 tabular-nums">
                    {current} <span className="text-xs font-bold text-amber-500">kun</span>
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Eng Yaxshi
                  </span>
                  <p className="text-2xl font-black font-fredoka text-slate-700 dark:text-slate-200 mt-0.5 tabular-nums">
                    {longest} <span className="text-xs font-bold text-slate-400">kun</span>
                  </p>
                </div>
              </div>

              {/* Week Status */}
              <div>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Haftalik faollik
                </p>
                <div className="grid grid-cols-7 gap-1.5 text-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
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

              {/* 7-day milestone info (Shop amber note style) */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500 shrink-0" />
                    Keyingi bonusgacha: <strong className="text-amber-900 dark:text-amber-200">{daysUntilMilestone} kun</strong>
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 tabular-nums">
                    <Coins size={12} />
                    +25 tanga
                  </span>
                </div>
                <div className="h-1.5 w-full bg-amber-200/60 dark:bg-amber-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${milestoneProgressPct || 12}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Tushunarli
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Shop-aligned Streak Capsule (matching Coins Balance Card) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(true); }}
        className="group relative flex items-center justify-between gap-2.5 sm:gap-4 bg-white/60 dark:bg-slate-900/60 hover:bg-white/80 dark:hover:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] px-3.5 py-2.5 sm:px-4 sm:py-3 border border-white/60 dark:border-slate-800/60 shadow-none transition-colors duration-200 cursor-pointer select-none shrink-0"
        title="Batafsil ko'rish uchun bosing"
      >
        {/* Left: Solid Amber Icon Box & Count (Shop Balance Card style) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 shadow-none">
            <Flame size={18} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:block mb-0.5">
              Kunlik Faollik
            </span>
            <span className="text-base sm:text-lg font-black font-fredoka text-slate-800 dark:text-white whitespace-nowrap tabular-nums leading-none">
              {current} <span className="text-xs font-bold text-amber-500">kun</span>
            </span>
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="w-px h-6 bg-slate-200/70 dark:bg-slate-800 shrink-0" />

        {/* Middle: 7 Clean Circular Day Indicators */}
        <div className="flex items-center justify-between flex-1 max-w-[215px] sm:max-w-none sm:flex-initial gap-1 sm:gap-2">
          {weekStatus.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1">
              <span
                className={`text-[9px] font-bold uppercase leading-none transition-colors ${
                  day.isToday
                    ? "text-amber-500"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {day.dayLabel.slice(0, 2)}
              </span>

              <div
                className={`w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all ${
                  day.isActive
                    ? day.isToday
                      ? "bg-amber-500 text-white ring-2 ring-amber-500/25"
                      : "bg-amber-500 text-white"
                    : day.isToday
                    ? "border border-dashed border-amber-500 bg-amber-500/10 text-amber-500"
                    : "border border-slate-200/90 dark:border-slate-700/70 bg-transparent text-slate-300 dark:text-slate-600"
                }`}
              >
                {day.isActive ? (
                  <Check size={10} strokeWidth={2.8} />
                ) : day.isToday ? (
                  <span className="w-1 h-1 rounded-full bg-amber-500" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-current opacity-45" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Reward Pill */}
        <div
          className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 tabular-nums ${
            streak.todayAwarded
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
          }`}
        >
          {streak.todayAwarded ? (
            <Check size={11} strokeWidth={2.6} className="shrink-0" />
          ) : (
            <Coins size={11} className="shrink-0" />
          )}
          <span>+5</span>
        </div>
      </div>

      {/* Popover Modal on Click */}
      {mounted && createPortal(detailsModal, document.body)}
    </>
  );
}
