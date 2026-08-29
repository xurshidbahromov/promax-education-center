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

// Primary localStorage key — source of truth for is_featured / badge / image_url
const STORAGE_KEY = 'promax_announcements';

// Separate key to store banner metadata that Supabase table may not have columns for
const BANNER_META_KEY = 'promax_announcement_meta';

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
    created_by: null
  },
  {
    id: "ann-math-group",
    title: "Yangi Matematika Guruhi",
    message: "Noldan boshlab mukammal darajagacha bo'lgan yangi guruhimizga qabul ochildi. Darslar tajribali ustozlar tomonidan zamonaviy metodikalar asosida o'tiladi.",
    type: "success",
    priority: 8,
    target_audience: "all",
    badge: "YANGI KURS",
    image_url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    is_featured: true,
    is_active: true,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_by: null
  },
  {
    id: "ann-physics-club",
    title: "Fizika va Astronomiya To'garagi",
    message: "Koinot sirlari va fizika qonunlarini qiziqarli amaliy tajribalar orqali o'rganishni istaysizmi? Bizning ilmiy to'garakka qo'shiling va kelajak olimiga aylaning.",
    type: "info",
    priority: 6,
    target_audience: "all",
    badge: "TO'GARAK",
    image_url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80",
    is_featured: true,
    is_active: true,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    created_by: null
  },
  {
    id: "ann-speaking-club",
    title: "English Speaking Club",
    message: "Har shanba erkin muloqot va yangi do'stlar orttirish imkoniyati. Native speakerlar bilan jonli suhbatlarda qatnashib, nutqingizni ravonlashtiring.",
    type: "warning",
    priority: 4,
    target_audience: "all",
    badge: "SPEAKING CLUB",
    image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80",
    is_featured: true,
    is_active: true,
    expires_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    created_by: null
  }
];

// ── Banner Metadata helpers ──────────────────────────────────────────────────
// Supabase may not have is_featured / badge / image_url columns.
// We persist them separately so Supabase reads never overwrite them.

interface BannerMeta {
  is_featured: boolean;
  badge: string | null;
  image_url: string | null;
}

function getBannerMeta(): Record<string, BannerMeta> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(BANNER_META_KEY);
    if (raw) return JSON.parse(raw) as Record<string, BannerMeta>;
  } catch {}
  return {};
}

function setBannerMeta(id: string, meta: BannerMeta): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getBannerMeta();
    all[id] = meta;
    localStorage.setItem(BANNER_META_KEY, JSON.stringify(all));
  } catch {}
}

function deleteBannerMeta(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getBannerMeta();
    delete all[id];
    localStorage.setItem(BANNER_META_KEY, JSON.stringify(all));
  } catch {}
}

// ── Main storage helpers ──────────────────────────────────────────────────────

function getStoredList(): Announcement[] {
  if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS)); } catch {}
  return INITIAL_ANNOUNCEMENTS;
}

function saveStoredList(list: Announcement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('promax_announcements_updated'));
  } catch {}
}

// ── Core API ──────────────────────────────────────────────────────────────────

/**
 * Fetch all announcements for Admin panel.
 * Supabase is used for basic fields; is_featured / badge / image_url come from
 * the separate BannerMeta store so they are never lost on Supabase reads.
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const localList = getStoredList();
  const meta = getBannerMeta();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped: Announcement[] = data.map((item: any) => {
        // Resolve banner metadata: BannerMeta store → Supabase column → local list match → false
        const m = meta[item.id];
        const localMatch = localList.find(l => l.id === item.id || l.title === item.title);
        const isFeatured = !!(m?.is_featured || item.is_featured === true || localMatch?.is_featured);
        const imageUrl = m?.image_url ?? item.image_url ?? localMatch?.image_url ?? null;
        const badge = m?.badge ?? item.badge ?? localMatch?.badge ?? null;

        return {
          id: item.id,
          title: item.title,
          message: item.message || item.content || '',
          type: (item.type || 'info') as AnnouncementType,
          priority: item.priority || 0,
          target_audience: (item.target_audience || 'all') as TargetAudience,
          badge: isFeatured ? badge : null,
          image_url: isFeatured ? imageUrl : null,
          is_featured: isFeatured,
          is_active: item.is_active !== undefined ? item.is_active : true,
          expires_at: item.expires_at || null,
          created_at: item.created_at || new Date().toISOString(),
          created_by: item.created_by || null
        };
      });

      saveStoredList(mapped);
      return mapped;
    }
  } catch (_) {}

  // Fallback: enrich localList with meta
  return localList.map(item => {
    const m = meta[item.id];
    if (!m) return item;
    return {
      ...item,
      is_featured: m.is_featured,
      badge: m.is_featured ? m.badge : null,
      image_url: m.is_featured ? m.image_url : null
    };
  });
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

  const currentList = getStoredList();
  let finalId = payload.id || ('ann_' + Date.now() + '_' + Math.random().toString(36).substring(7));
  let createdAt = new Date().toISOString();

  if (payload.id) {
    const existing = currentList.find(a => a.id === payload.id);
    if (existing) createdAt = existing.created_at;
  }

  const updatedItem: Announcement = {
    id: finalId,
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
    created_at: createdAt
  };

  // Save to localStorage
  if (payload.id) {
    const idx = currentList.findIndex(a => a.id === payload.id);
    if (idx >= 0) currentList[idx] = updatedItem;
    else currentList.unshift(updatedItem);
  } else {
    currentList.unshift(updatedItem);
  }
  saveStoredList(currentList);

  // Save banner meta separately — survives Supabase overwrites
  setBannerMeta(finalId, { is_featured: isFeatured, badge, image_url: imageUrl });

  // Sync basic fields to Supabase in background
  try {
    const supabase = createClient();
    const dbPayload = {
      title: payload.title,
      message: payload.message,
      type: payload.type,
      priority: payload.priority,
      target_audience: payload.target_audience,
      is_active: payload.is_active,
      expires_at: payload.expires_at || null
    };

    const isLocalId = !payload.id || payload.id.startsWith('ann_') || payload.id.startsWith('ann-');
    if (!isLocalId) {
      await supabase.from('announcements').update(dbPayload).eq('id', payload.id!);
    } else {
      const { data } = await supabase.from('announcements').insert([dbPayload]).select().single();
      if (data?.id) {
        // Update localStorage with real Supabase ID
        const idx = currentList.findIndex(a => a.id === finalId);
        if (idx >= 0) currentList[idx].id = data.id;
        // Move banner meta to new ID
        setBannerMeta(data.id, { is_featured: isFeatured, badge, image_url: imageUrl });
        deleteBannerMeta(finalId);
        finalId = data.id;
        updatedItem.id = data.id;
        saveStoredList(currentList);
      }
    }
  } catch (e) {
    console.warn('Supabase sync skipped:', e);
  }

  return updatedItem;
}

/**
 * Delete announcement.
 */
export async function deleteAnnouncementData(id: string): Promise<void> {
  const updated = getStoredList().filter(a => a.id !== id);
  saveStoredList(updated);
  deleteBannerMeta(id);

  try {
    const supabase = createClient();
    if (!id.startsWith('ann_') && !id.startsWith('ann-')) {
      await supabase.from('announcements').delete().eq('id', id);
    }
  } catch (e) {
    console.warn('Supabase delete skipped:', e);
  }
}

/**
 * Toggle active status.
 */
export async function toggleAnnouncementActive(id: string, currentStatus: boolean): Promise<boolean> {
  const list = getStoredList();
  const item = list.find(a => a.id === id);
  const newStatus = !currentStatus;
  if (item) {
    item.is_active = newStatus;
    saveStoredList(list);
  }

  try {
    const supabase = createClient();
    if (!id.startsWith('ann_') && !id.startsWith('ann-')) {
      await supabase.from('announcements').update({ is_active: newStatus }).eq('id', id);
    }
  } catch (e) {
    console.warn('Supabase status update skipped:', e);
  }

  return newStatus;
}
