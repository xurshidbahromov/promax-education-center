"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X } from "lucide-react";
import {
  getCachedStreak,
  getCurrentWeekStatus,
  checkAndUpdateDailyStreak,
  type StreakData,
} from "@/lib/streak";
import StreakFlameIcon from "@/components/ui/StreakFlameIcon";

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

  // Flat minimalist details modal
  const detailsModal = (
    <AnimatePresence>
      {expanded && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <motion.div
            ref={popoverRef}
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
                  <h4 className="text-sm font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
                    Kunlik Faollik
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    O&apos;quv zanjirini uzmay davom ettiring
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

            {/* Current vs Record */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Joriy Zanjir
                </span>
                <p className="text-2xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  {current} <span className="text-xs font-bold text-brand-orange">kun</span>
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Eng Yaxshi
                </span>
                <p className="text-2xl font-black font-fredoka text-slate-700 dark:text-slate-200 mt-0.5 tabular-nums">
                  {longest} <span className="text-xs font-bold text-slate-400">kun</span>
                </p>
              </div>
            </div>

            {/* Week Status */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Haftalik faollik
              </p>
              <div className="grid grid-cols-7 gap-1.5 text-center bg-slate-50/80 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
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

            {/* 7-day milestone info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles size={13} className="text-brand-orange" strokeWidth={1.8} />
                  Keyingi bonusgacha: <strong className="text-slate-900 dark:text-white">{daysUntilMilestone} kun</strong>
                </span>
                <span className="text-brand-orange font-bold tabular-nums">+25 coin</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-orange rounded-full transition-all duration-500"
                  style={{ width: `${milestoneProgressPct || 12}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Flat Minimalist Editorial Streak Capsule */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(true); }}
        className="group relative flex items-center justify-between gap-2.5 sm:gap-4 bg-white/60 dark:bg-slate-900/60 hover:bg-white/85 dark:hover:bg-slate-900/85 backdrop-blur-xl rounded-2xl px-3 py-2.5 sm:px-4 sm:py-2.5 border border-white/70 dark:border-slate-800/70 shadow-none transition-colors duration-200 cursor-pointer select-none shrink-0"
        title="Batafsil ko'rish uchun bosing"
      >
        {/* Left: Flat Geometric Flame Icon & Count */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-brand-orange/[0.08] dark:bg-brand-orange/15 border border-brand-orange/15 text-brand-orange flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
            <StreakFlameIcon size={17} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm sm:text-[15px] font-bold font-fredoka text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
              {current} <span className="text-[11px] font-semibold text-slate-400">kun</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline mt-0.5">
              faollik zanjiri
            </span>
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="w-px h-5 bg-slate-200/70 dark:bg-slate-800 shrink-0" />

        {/* Middle: 7 Flat Minimalist Circular Day Indicators */}
        <div className="flex items-center justify-between flex-1 max-w-[215px] sm:max-w-none sm:flex-initial gap-1 sm:gap-2">
          {weekStatus.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1">
              <span
                className={`text-[9px] font-bold uppercase leading-none transition-colors ${
                  day.isToday
                    ? "text-brand-orange"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {day.dayLabel.slice(0, 2)}
              </span>

              <div
                className={`w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-all ${
                  day.isActive
                    ? day.isToday
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 ring-2 ring-brand-orange/30"
                      : "bg-brand-orange text-white"
                    : day.isToday
                    ? "border border-dashed border-brand-orange bg-brand-orange/5 text-brand-orange"
                    : "border border-slate-200/90 dark:border-slate-700/70 bg-transparent text-slate-300 dark:text-slate-600"
                }`}
              >
                {day.isActive ? (
                  <Check size={10} strokeWidth={2.8} />
                ) : day.isToday ? (
                  <span className="w-1 h-1 rounded-full bg-brand-orange" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-current opacity-45" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Minimalist Flat Reward Pill */}
        <div
          className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded-full border shrink-0 tabular-nums ${
            streak.todayAwarded
              ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-300"
          }`}
        >
          {streak.todayAwarded ? (
            <Check size={11} strokeWidth={2.6} className="shrink-0" />
          ) : (
            <Sparkles size={11} strokeWidth={2} className="text-brand-orange shrink-0" />
          )}
          <span>+5</span>
        </div>
      </div>

      {/* Popover Modal on Click */}
      {mounted && createPortal(detailsModal, document.body)}
    </>
  );
}
