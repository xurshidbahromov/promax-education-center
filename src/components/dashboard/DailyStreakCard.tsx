"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Sparkles, Check, X, Coins } from "lucide-react";
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

  // Popover for full details when clicked
  const detailsModal = (
    <AnimatePresence>
      {expanded && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md">
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-4 text-left text-slate-800 dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Flame size={22} className="fill-white" />
                </div>
                <div>
                  <h4 className="text-base font-bold font-fredoka text-slate-900 dark:text-white leading-tight">
                    Kunlik Faollik
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O'quv zanjirini uzmay davom ettiring
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

            {/* Current vs Record */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-3 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20">
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                  Joriy Zanjir
                </span>
                <p className="text-2xl font-black font-fredoka text-slate-900 dark:text-white mt-0.5">
                  {current} <span className="text-xs font-bold text-orange-500">kun</span>
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Eng Yaxshi
                </span>
                <p className="text-2xl font-black font-fredoka text-slate-700 dark:text-slate-200 mt-0.5">
                  {longest} <span className="text-xs font-bold text-slate-400">kun</span>
                </p>
              </div>
            </div>

            {/* Week Status */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Haftalik faollik
              </p>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {weekStatus.map((day) => (
                  <div key={day.dateStr} className="flex flex-col items-center gap-1">
                    <span className={`text-[10px] font-semibold ${day.isToday ? "text-orange-500 font-bold" : "text-slate-400"}`}>
                      {day.dayLabel}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        day.isActive
                          ? "bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30"
                          : day.isToday
                          ? "border-2 border-dashed border-orange-400 text-orange-500"
                          : day.isFuture
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"
                          : "bg-slate-100 dark:bg-slate-800/40 text-slate-300 dark:text-slate-600"
                      }`}
                    >
                      {day.isActive ? "✓" : day.isToday ? "🔥" : "·"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-day milestone info */}
            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  Keyingi yirik bonusgacha: <strong>{daysUntilMilestone} kun</strong>
                </span>
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <Coins size={12} /> +25
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${milestoneProgressPct || 10}%` }}
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
      {/* Compact, Borderless, Ultra-clean Streak Capsule */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(true); }}
        className="group relative flex items-center justify-between gap-3 sm:gap-4 bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-900/80 backdrop-blur-xl rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow transition-all duration-200 cursor-pointer select-none shrink-0"
        title="Batafsil ko'rish uchun bosing"
      >
        {/* Left: Flame & Count */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center transition-transform group-hover:scale-105">
            <Flame size={17} className="fill-orange-500 text-orange-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm sm:text-base font-black font-fredoka text-slate-900 dark:text-white">
              {current} <span className="text-xs font-bold text-orange-500">kun</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline mt-0.5">
              faollik zanjiri
            </span>
          </div>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* Middle: 7 Minimal Week Dots */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {weekStatus.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1">
              <span
                className={`text-[9px] font-bold uppercase transition-colors ${
                  day.isToday
                    ? "text-orange-600 dark:text-orange-400 font-black"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {day.dayLabel.slice(0, 2)}
              </span>

              {/* Minimal Dot */}
              <div className="relative flex items-center justify-center w-2.5 h-2.5">
                {day.isActive ? (
                  <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]" />
                ) : day.isToday ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-orange-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                  </>
                ) : day.isFuture ? (
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Status Pill or Reward */}
        {streak.todayAwarded ? (
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full shrink-0">
            <Check size={12} strokeWidth={2.8} />
            <span>+5</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
            <Sparkles size={11} />
            <span>+5</span>
          </div>
        )}
      </div>

      {/* Popover Modal on Click */}
      {mounted && createPortal(detailsModal, document.body)}
    </>
  );
}
