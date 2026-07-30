"use client";

import { useSupabaseRealtimeSync } from "@/hooks/useAdminData";

export default function RealtimeSyncEnabler() {
  useSupabaseRealtimeSync();
  return null;
}
