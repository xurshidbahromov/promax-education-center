"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import {
  getTournamentTimingInfo,
  toInputDateFormat,
  toInputTimeFormat
} from "@/lib/tournament-timing";

interface TournamentSchedulePickerProps {
  startDate: string;
  setStartDate: (val: string) => void;
  startTime: string;
  setStartTime: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  endTime: string;
  setEndTime: (val: string) => void;
  durationMinutes: number | null;
  setDurationMinutes: (val: number | null) => void;
}

export default function TournamentSchedulePicker({
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime,
  durationMinutes,
  setDurationMinutes,
}: TournamentSchedulePickerProps) {
  // Compute timing info in real-time
  const timingInfo = useMemo(() => {
    return getTournamentTimingInfo({
      startDate,
      startTime,
      endDate,
      endTime,
      durationMinutes: durationMinutes || 60,
    });
  }, [startDate, startTime, endDate, endTime, durationMinutes]);

  const applyTodayPreset = () => {
    const now = new Date();
    const todayStr = toInputDateFormat(now);
    setStartDate(todayStr);
    setStartTime(toInputTimeFormat(now));

    const end = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    setEndDate(toInputDateFormat(end));
    setEndTime(toInputTimeFormat(end));
    setDurationMinutes(60);
  };

  const applyTomorrowPreset = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toInputDateFormat(tomorrow);
    setStartDate(tomorrowStr);
    setStartTime("10:00");
    setEndDate(tomorrowStr);
    setEndTime("22:00");
    setDurationMinutes(60);
  };

  const applyWeekendPreset = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToSaturday = (6 - day + 7) % 7 || 7;
    const sat = new Date(now.getTime() + diffToSaturday * 86400000);
    const sun = new Date(sat.getTime() + 86400000);

    setStartDate(toInputDateFormat(sat));
    setStartTime("09:00");
    setEndDate(toInputDateFormat(sun));
    setEndTime("23:59");
    setDurationMinutes(90);
  };

  const applyWeeklyGrandPreset = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 86400000);
    setStartDate(toInputDateFormat(now));
    setStartTime("08:00");
    setEndDate(toInputDateFormat(nextWeek));
    setEndTime("23:59");
    setDurationMinutes(120);
  };

  return (
    <div className="space-y-3 pt-1">
      {/* Header with Quick Presets & Subtle Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Vaqt va Sanalar
          </label>
          {timingInfo.status === "live" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Faol ({timingInfo.countdown.formatted})
            </span>
          ) : timingInfo.status === "upcoming" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Clock size={11} />
              Kutilmoqda ({timingInfo.countdown.formatted})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Yakunlangan
            </span>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={applyTodayPreset}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Bugun
          </button>
          <button
            type="button"
            onClick={applyTomorrowPreset}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Ertaga
          </button>
          <button
            type="button"
            onClick={applyWeekendPreset}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Dam olish kunlari
          </button>
          <button
            type="button"
            onClick={applyWeeklyGrandPreset}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            1 Hafta
          </button>
        </div>
      </div>

      {/* Clean Modern Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Start Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Boshlanish sanasi *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
            required
          />
        </div>

        {/* 2. Start Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Boshlanish vaqti *
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
            required
          />
        </div>

        {/* 3. End Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Tugash sanasi *
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
            required
          />
        </div>

        {/* 4. End Time */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Tugash vaqti *
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
            required
          />
        </div>

        {/* 5. Duration (minutes) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Test vaqti (daqiqa) *
          </label>
          <input
            type="number"
            min={5}
            max={360}
            value={durationMinutes || ""}
            onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value, 10) : null)}
            placeholder="60"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-blue/30 outline-none text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
            required
          />
        </div>
      </div>
    </div>
  );
}
