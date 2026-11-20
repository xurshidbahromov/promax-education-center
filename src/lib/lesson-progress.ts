import { createClient } from "@/utils/supabase/client";

const STORAGE_KEY = "promax_completed_lessons_v1";

export function getCompletedLessonIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isLessonCompleted(lessonId: string): boolean {
  return getCompletedLessonIds().includes(lessonId);
}

export async function toggleLessonCompleted(lessonId: string): Promise<{ completed: boolean; allCompleted: string[] }> {
  const current = getCompletedLessonIds();
  const exists = current.includes(lessonId);
  const updated = exists
    ? current.filter((id) => id !== lessonId)
    : [...current, lessonId];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("promax_lesson_progress_updated"));
    } catch {}
  }

  // Persist in background to user profile settings if authenticated
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("settings")
        .eq("id", user.id)
        .maybeSingle();

      const currentSettings = profile?.settings || {};
      await supabase
        .from("profiles")
        .update({
          settings: {
            ...currentSettings,
            completed_lessons: updated,
          },
        })
        .eq("id", user.id);
    }
  } catch {
    // Non-blocking background sync
  }

  return { completed: !exists, allCompleted: updated };
}

export function calculateSubjectProgress(lessonIds: string[], completedIds?: string[]): {
  completedCount: number;
  totalCount: number;
  percentage: number;
} {
  const totalCount = lessonIds.length;
  if (totalCount === 0) {
    return { completedCount: 0, totalCount: 0, percentage: 0 };
  }
  const activeCompleted = completedIds || getCompletedLessonIds();
  const completedSet = new Set(activeCompleted);
  const completedCount = lessonIds.filter((id) => completedSet.has(id)).length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  return { completedCount, totalCount, percentage };
}
