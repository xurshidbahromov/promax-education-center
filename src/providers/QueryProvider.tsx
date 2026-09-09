"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Keep data fresh for 3 minutes to avoid redundant network hits
        staleTime: 3 * 60 * 1000,
        // Cache data for 10 minutes in memory
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
    },
  }));

  // Background reminder check for tournaments every 30 seconds
  useEffect(() => {
    const checkReminders = () => {
      fetch('/api/tournaments/reminders', {
        method: 'GET',
        cache: 'no-store'
      }).catch(() => {});
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
