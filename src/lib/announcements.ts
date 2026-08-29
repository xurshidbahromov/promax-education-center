import { createClient } from '@/utils/supabase/client';

export type AnnouncementType = 'info' | 'warning' | 'success' | 'error';
export type TargetAudience = 'all' | 'students' | 'teachers' | 'admin';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: number;
  target_audience: TargetAudience;
  badge?: string | null;
  image_url?: string | null;
  is_featured?: boolean | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  created_by?: string | null;
}

// localStorage is the SINGLE source of truth for all rich fields (is_featured, badge, image_url)
const STORAGE_KEY = 'promax_announcements_v2'; // v2 to avoid stale data from previous versions

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-mock-ielts",
    title: "MOCK IELTS Imtihoni",
    message: "Yakshanba soat 10:00 da navbatdagi MOCK imtihoni bo'lib o'tadi. O'z bilimingizni haqiqiy IELTS imtihon muhitida sinab ko'ring va natijalarni 2 kunda oling.",
    type: "error",
    priority: 10,
    target_audience: "all",
    badge: "MOCK EXAM",
    image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
    is_featured: true,
    is_active: true,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "ann-math-group",
    title: "Yangi Matematika Guruhi",
    message: "Noldan boshlab mukammal darajagacha bo'lgan yangi guruhimizga qabul ochildi.",
    type: "success",
    priority: 8,
    target_audience: "all",
    badge: "YANGI KURS",
    image_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    is_featured: true,
    is_active: true,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "ann-physics-club",
    title: "Fizika va Astronomiya To'garagi",
    message: "Koinot sirlari va fizika qonunlarini qiziqarli amaliy tajribalar orqali o'rganish.",
    type: "info",
    priority: 6,
    target_audience: "all",
    badge: "TO'GARAK",
    image_url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80",
    is_featured: true,
    is_active: true,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "ann-speaking-club",
    title: "English Speaking Club",
    message: "Har shanba erkin muloqot. Native speakerlar bilan jonli suhbatlarda qatnashib, nutqingizni ravonlashtiring.",
    type: "warning",
    priority: 4,
    target_audience: "all",
    badge: "SPEAKING CLUB",
    image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
    is_featured: true,
    is_active: true,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  }
];

// ─── localStorage helpers ────────────────────────────────────────────────────

function readLocalList(): Announcement[] {
  if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Announcement[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // First boot: write defaults and return
  writeLocalList(INITIAL_ANNOUNCEMENTS, false);
  return INITIAL_ANNOUNCEMENTS;
}

function writeLocalList(list: Announcement[], broadcast = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (broadcast) window.dispatchEvent(new Event('promax_announcements_updated'));
  } catch {}
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get all announcements — localStorage is the truth.
 * We enrich with Supabase `is_active` status only (since that IS stored in Supabase).
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const local = readLocalList();

  // Optionally refresh is_active from Supabase (the one field we trust from Supabase)
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('id, is_active, title')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      let changed = false;
      const updated = local.map(item => {
        // Match by id or title
        const row = data.find((r: any) => r.id === item.id || r.title === item.title);
        if (row && row.is_active !== item.is_active) {
          changed = true;
          return { ...item, is_active: row.is_active };
        }
        return item;
      });
      if (changed) {
        writeLocalList(updated, false);
        return updated;
      }
    }
  } catch {}

  return local;
}

/**
 * Active announcements for Student Dashboard.
 */
export async function getActiveStudentAnnouncements(): Promise<Announcement[]> {
  const all = await getAllAnnouncements();
  return all.filter(a =>
    a.is_active !== false &&
    (a.target_audience === 'all' || a.target_audience === 'students')
  );
}

/**
 * Save (create or update) an announcement.
 * localStorage is updated immediately and fully.
 * Supabase sync happens in background for basic fields only.
 */
export async function saveAnnouncementData(payload: {
  id?: string | null;
  title: string;
  message: string;
  type: AnnouncementType;
  priority: number;
  target_audience: TargetAudience;
  badge?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  is_active: boolean;
  expires_at: string | null;
}): Promise<Announcement> {
  const isFeatured = Boolean(payload.is_featured);
  const imageUrl = isFeatured ? (payload.image_url || null) : null;
  const badge = isFeatured ? (payload.badge || null) : null;

  const list = readLocalList();

  let item: Announcement;

  if (payload.id) {
    // UPDATE existing
    const idx = list.findIndex(a => a.id === payload.id);
    const existing = idx >= 0 ? list[idx] : null;
    item = {
      id: payload.id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      priority: payload.priority,
      target_audience: payload.target_audience,
      badge,
      image_url: imageUrl,
      is_featured: isFeatured,
      is_active: payload.is_active,
      expires_at: payload.expires_at || null,
      created_at: existing?.created_at ?? new Date().toISOString(),
    };
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
  } else {
    // CREATE new
    item = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(7),
      title: payload.title,
      message: payload.message,
      type: payload.type,
      priority: payload.priority,
      target_audience: payload.target_audience,
      badge,
      image_url: imageUrl,
      is_featured: isFeatured,
      is_active: payload.is_active,
      expires_at: payload.expires_at || null,
      created_at: new Date().toISOString(),
    };
    list.unshift(item);
  }

  // Save to localStorage immediately — this is the source of truth
  writeLocalList(list);

  // Background Supabase sync (basic fields only — no is_featured/badge/image_url)
  try {
    const supabase = createClient();
    const dbFields = {
      title: payload.title,
      message: payload.message,
      type: payload.type,
      priority: payload.priority,
      target_audience: payload.target_audience,
      is_active: payload.is_active,
      expires_at: payload.expires_at || null,
    };

    if (payload.id && !payload.id.startsWith('local_') && !payload.id.startsWith('ann-')) {
      // Update in Supabase
      await supabase.from('announcements').update(dbFields).eq('id', payload.id);
    } else {
      // Insert into Supabase
      const { data: inserted } = await supabase
        .from('announcements')
        .insert([dbFields])
        .select('id')
        .single();

      if (inserted?.id) {
        // Replace local ID with Supabase UUID in localStorage
        const refreshed = readLocalList();
        const idx2 = refreshed.findIndex(a => a.id === item.id);
        if (idx2 >= 0) {
          refreshed[idx2].id = inserted.id;
          item.id = inserted.id;
          writeLocalList(refreshed);
        }
      }
    }
  } catch (e) {
    console.warn('[announcements] Supabase sync skipped:', e);
  }

  return item;
}

/**
 * Delete announcement.
 */
export async function deleteAnnouncementData(id: string): Promise<void> {
  const updated = readLocalList().filter(a => a.id !== id);
  writeLocalList(updated);

  try {
    const supabase = createClient();
    if (!id.startsWith('local_') && !id.startsWith('ann-')) {
      await supabase.from('announcements').delete().eq('id', id);
    }
  } catch {}
}

/**
 * Toggle active status.
 */
export async function toggleAnnouncementActive(id: string, currentStatus: boolean): Promise<boolean> {
  const list = readLocalList();
  const item = list.find(a => a.id === id);
  const newStatus = !currentStatus;
  if (item) {
    item.is_active = newStatus;
    writeLocalList(list);
  }

  try {
    const supabase = createClient();
    if (!id.startsWith('local_') && !id.startsWith('ann-')) {
      await supabase.from('announcements').update({ is_active: newStatus }).eq('id', id);
    }
  } catch {}

  return newStatus;
}
