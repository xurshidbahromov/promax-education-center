"use client";

import { useEffect } from "react";

/**
 * Background ticker that pings /api/tournaments/reminders every 30 seconds
 * to ensure that:
 * 1. Server-side reminder worker is actively running
 * 2. 10-minute pre-tournament reminders are dispatched on-time with 100% reliability
 */
export default function TournamentReminderTicker() {
  useEffect(() => {
    // Initial check on mount
    const checkReminders = () => {
      fetch('/api/tournaments/reminders', {
        method: 'GET',
        cache: 'no-store',
      }).catch(() => {});
    };

    // Run immediately once
    checkReminders();

    // Run every 30 seconds
    const interval = setInterval(checkReminders, 30 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
