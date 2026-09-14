import { createClient } from "@/utils/supabase/client";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDays: string[];   // Recent active dates YYYY-MM-DD
  todayAwarded: boolean;
  rewardCoins: number;
}

export interface WeekDayStatus {
  dayLabel: string;
  dateStr: string;
  isToday: boolean;
  isActive: boolean;
  isFuture: boolean;
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 1,
  longestStreak: 1,
  lastActiveDate: "",
  activeDays: [],
  todayAwarded: false,
  rewardCoins: 0,
};

function getTodayStr(): string {
  try {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" });
  } catch {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }
}

function parseDaysDiff(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(`${dateStr1}T00:00:00`);
  const d2 = new Date(`${dateStr2}T00:00:00`);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getCachedStreak(userId?: string): StreakData {
  if (typeof window === "undefined") return DEFAULT_STREAK;
  const key = `promax_streak_${userId || "current"}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const today = getTodayStr();
      parsed.todayAwarded = parsed.lastActiveDate === today;
      return parsed;
    }
  } catch {}
  return DEFAULT_STREAK;
}

export function saveCachedStreak(data: StreakData, userId?: string) {
  if (typeof window === "undefined") return;
  const key = `promax_streak_${userId || "current"}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export async function checkAndUpdateDailyStreak(userId?: string): Promise<{
  streak: StreakData;
  newlyAwarded: boolean;
  rewardCoins: number;
}> {
  const today = getTodayStr();
  const currentCached = getCachedStreak(userId);

  // If already checked in today, return cached state
  if (currentCached.lastActiveDate === today) {
    return {
      streak: { ...currentCached, todayAwarded: true },
      newlyAwarded: false,
      rewardCoins: 0,
    };
  }

  const daysDiff = currentCached.lastActiveDate
    ? parseDaysDiff(today, currentCached.lastActiveDate)
    : 999;

  let newCurrent = 1;
  let newLongest = Math.max(currentCached.longestStreak || 1, 1);
  let activeDays = Array.isArray(currentCached.activeDays)
    ? [...currentCached.activeDays]
    : [];

  if (daysDiff === 1) {
    // Consecutive day
    newCurrent = (currentCached.currentStreak || 0) + 1;
    newLongest = Math.max(newLongest, newCurrent);
  } else if (daysDiff === 0) {
    // Same day
    newCurrent = currentCached.currentStreak || 1;
  } else {
    // Missed one or more days -> reset to 1
    newCurrent = 1;
  }

  if (!activeDays.includes(today)) {
    activeDays.push(today);
  }
  // Keep only the last 21 active days
  if (activeDays.length > 21) {
    activeDays = activeDays.slice(-21);
  }

  // Calculate reward: 5 base coins, +20 bonus for 7-day milestones
  let rewardCoins = 5;
  if (newCurrent % 7 === 0) {
    rewardCoins = 25;
  }

  const updatedStreak: StreakData = {
    currentStreak: newCurrent,
    longestStreak: newLongest,
    lastActiveDate: today,
    activeDays,
    todayAwarded: true,
    rewardCoins,
  };

  saveCachedStreak(updatedStreak, userId);

  // Persist to Supabase in background
  if (userId) {
    try {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins, settings")
        .eq("id", userId)
        .maybeSingle();

      const existingSettings = profile?.settings || {};
      const newCoins = (profile?.coins || 0) + rewardCoins;

      await supabase
        .from("profiles")
        .update({
          coins: newCoins,
          settings: {
            ...existingSettings,
            streak: {
              currentStreak: newCurrent,
              longestStreak: newLongest,
              lastActiveDate: today,
              activeDays,
            },
          },
        })
        .eq("id", userId);
    } catch (err) {
      console.warn("Streak backend sync error:", err);
    }
  }

  return {
    streak: updatedStreak,
    newlyAwarded: true,
    rewardCoins,
  };
}

/**
 * Returns array of 7 days for the current week (Monday to Sunday)
 */
export function getCurrentWeekStatus(streak: StreakData): WeekDayStatus[] {
  const today = getTodayStr();
  const now = new Date(`${today}T00:00:00`);
  // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat
  const dayOfWeek = now.getDay();
  // Monday distance: Mon is 1, so offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);

  const dayNamesUz = ["Du", "Se", "Chor", "Pay", "Juma", "Shan", "Yak"];
  const weekStatus: WeekDayStatus[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateStr = current.toLocaleDateString("en-CA", { timeZone: "Asia/Tashkent" });
    const isToday = dateStr === today;
    const isFuture = parseDaysDiff(dateStr, today) > 0;
    const isActive = streak.activeDays?.includes(dateStr) || (isToday && streak.todayAwarded);

    weekStatus.push({
      dayLabel: dayNamesUz[i],
      dateStr,
      isToday,
      isActive,
      isFuture,
    });
  }

  return weekStatus;
}
