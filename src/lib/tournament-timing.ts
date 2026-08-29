/**
 * Unified Tournament Timing & Schedule Engine
 * Handles ISO & local date parsing, dynamic real-time status calculation,
 * and live countdown timers for both National and International tournaments.
 */

const UZ_MONTH_MAP: Record<string, number> = {
  yanvar: 0,
  fevral: 1,
  mart: 2,
  aprel: 3,
  may: 4,
  iyun: 5,
  iyul: 6,
  avgust: 7,
  sentabr: 8,
  oktabr: 9,
  noyabr: 10,
  dekabr: 11,
};

/**
 * Robustly parses a date string and optional time string into a Date object.
 * Supports:
 * - 'YYYY-MM-DD'
 * - 'DD-MM-YYYY'
 * - '20-Avgust, 2026'
 * - ISO string
 */
export function parseTournamentDateTime(dateStr?: string | null, timeStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return null;
  }

  const cleanDate = dateStr.trim();
  const cleanTime = timeStr && timeStr.trim() ? timeStr.trim() : '00:00';

  // 1. ISO format 'YYYY-MM-DD'
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    const [hours, minutes] = cleanTime.split(':').map((n) => parseInt(n, 10) || 0);
    const [year, month, day] = cleanDate.split('-').map((n) => parseInt(n, 10));
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  }

  // 2. Uzbek month format: '20-Avgust, 2026' or '20-Avgust 2026'
  const uzMatch = cleanDate.match(/^(\d{1,2})[-/\s]+([a-zA-Z]+)[,\s]+(\d{4})$/);
  if (uzMatch) {
    const day = parseInt(uzMatch[1], 10);
    const monthName = uzMatch[2].toLowerCase();
    const year = parseInt(uzMatch[3], 10);
    const month = UZ_MONTH_MAP[monthName] ?? 0;
    const [hours, minutes] = cleanTime.split(':').map((n) => parseInt(n, 10) || 0);
    return new Date(year, month, day, hours, minutes, 0, 0);
  }

  // 3. Fallback standard parsing
  try {
    const parsed = new Date(`${cleanDate} ${cleanTime}`);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  } catch {}

  return null;
}

export type TournamentDynamicStatus = 'upcoming' | 'live' | 'finished';

export interface TournamentTimingInfo {
  status: TournamentDynamicStatus;
  startDateFormatted: string;
  startTimeFormatted: string;
  endDateFormatted: string;
  endTimeFormatted: string;
  startDateTime: Date | null;
  endDateTime: Date | null;
  canStart: boolean;
  isUpcoming: boolean;
  isLive: boolean;
  isFinished: boolean;
  countdown: {
    label: string;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    formatted: string;
  };
}

/**
 * Computes dynamic real-time status and countdown metrics for a tournament.
 */
export function getTournamentTimingInfo(tournament: {
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  durationMinutes?: number;
  status?: string;
}): TournamentTimingInfo {
  const now = Date.now();

  const start = parseTournamentDateTime(tournament.startDate, tournament.startTime || '00:00');
  
  // If no explicit endDate, default to start + (duration or 24 hours)
  let end = parseTournamentDateTime(tournament.endDate, tournament.endTime || '23:59');
  if (!end && start) {
    const durationMs = (tournament.durationMinutes || 60) * 60 * 1000;
    end = new Date(start.getTime() + Math.max(durationMs, 24 * 60 * 60 * 1000));
  }

  let status: TournamentDynamicStatus = 'upcoming';
  let totalSeconds = 0;
  let countdownLabel = 'Kutilmoqda';

  if (!start) {
    // If no valid start date, use existing status or default to upcoming
    status = (tournament.status as TournamentDynamicStatus) || 'upcoming';
  } else {
    const startMs = start.getTime();
    const endMs = end ? end.getTime() : startMs + (tournament.durationMinutes || 60) * 60 * 1000;

    if (now < startMs) {
      status = 'upcoming';
      totalSeconds = Math.max(0, Math.floor((startMs - now) / 1000));
      countdownLabel = 'Boshlanishiga';
    } else if (now >= startMs && now <= endMs) {
      status = 'live';
      totalSeconds = Math.max(0, Math.floor((endMs - now) / 1000));
      countdownLabel = 'Tugashiga';
    } else {
      status = 'finished';
      totalSeconds = 0;
      countdownLabel = 'Yakunlangan';
    }
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formattedCountdown = 'Yakunlangan';
  if (status === 'upcoming' || status === 'live') {
    if (days > 0) {
      formattedCountdown = `${days}k ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }

  return {
    status,
    startDateFormatted: tournament.startDate || '',
    startTimeFormatted: tournament.startTime || '00:00',
    endDateFormatted: tournament.endDate || tournament.startDate || '',
    endTimeFormatted: tournament.endTime || '23:59',
    startDateTime: start,
    endDateTime: end,
    canStart: status === 'live',
    isUpcoming: status === 'upcoming',
    isLive: status === 'live',
    isFinished: status === 'finished',
    countdown: {
      label: countdownLabel,
      days,
      hours,
      minutes,
      seconds,
      totalSeconds,
      formatted: formattedCountdown,
    },
  };
}

/**
 * Format date to standard ISO YYYY-MM-DD for date inputs
 */
export function toInputDateFormat(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format time to standard HH:mm for time inputs
 */
export function toInputTimeFormat(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Format date in nice Uzbek format: '29-Avgust, 2026'
 */
export function formatUzbekDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const parsed = parseTournamentDateTime(dateStr);
  if (!parsed) return dateStr;

  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];

  return `${parsed.getDate()}-${months[parsed.getMonth()]}, ${parsed.getFullYear()}`;
}
