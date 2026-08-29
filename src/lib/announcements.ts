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

const STORAGE_KEY = 'promax_announcements';

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

function getStoredAnnouncements(): Announcement[] {
  if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored announcements:', e);
  }
  // Initialize default
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
  } catch (e) {}
  return INITIAL_ANNOUNCEMENTS;
}

function saveStoredAnnouncements(list: Announcement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('promax_announcements_updated'));
  } catch (e) {
    console.warn('Error saving stored announcements:', e);
  }
}

/**
 * Fetch all announcements for Admin
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const localData = getStoredAnnouncements();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Map correctly respecting is_featured
      const mapped: Announcement[] = data.map((item: any) => {
        const isFeatured = item.is_featured === true;
        return {
          id: item.id,
          title: item.title,
          message: item.message || item.content || '',
          type: (item.type || 'info') as AnnouncementType,
          priority: item.priority || 0,
          target_audience: (item.target_audience || 'all') as TargetAudience,
          badge: isFeatured ? (item.badge || null) : null,
          image_url: isFeatured ? (item.image_url || null) : null,
          is_featured: isFeatured,
          is_active: item.is_active !== undefined ? item.is_active : true,
          expires_at: item.expires_at || null,
          created_at: item.created_at || new Date().toISOString(),
          created_by: item.created_by || null
        };
      });

      // Keep localData in sync if user modified local items
      saveStoredAnnouncements(mapped);
      return mapped;
    }
  } catch (e) {
    // Supabase network/table issue, safely return localData
  }

  return localData;
}

/**
 * Fetch active announcements for Student Dashboard
 */
export async function getActiveStudentAnnouncements(): Promise<Announcement[]> {
  const all = await getAllAnnouncements();
  return all.filter(a => a.is_active !== false && (a.target_audience === 'all' || a.target_audience === 'students'));
}

/**
 * Save announcement (Create or Update)
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
  const currentList = getStoredAnnouncements();
  let updatedItem: Announcement;

  const isFeatured = Boolean(payload.is_featured);
  const imageUrl = isFeatured ? (payload.image_url || null) : null;
  const badgeText = isFeatured ? (payload.badge || null) : null;

  if (payload.id) {
    // Update
    const index = currentList.findIndex(a => a.id === payload.id);
    updatedItem = {
      id: payload.id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      priority: payload.priority,
      target_audience: payload.target_audience,
      badge: badgeText,
      image_url: imageUrl,
      is_featured: isFeatured,
      is_active: payload.is_active,
      expires_at: payload.expires_at || null,
      created_at: index >= 0 ? currentList[index].created_at : new Date().toISOString()
    };

    if (index >= 0) {
      currentList[index] = updatedItem;
    } else {
      currentList.unshift(updatedItem);
    }
  } else {
    // Create
    updatedItem = {
      id: 'ann_' + Date.now() + '_' + Math.random().toString(36).substring(7),
      title: payload.title,
      message: payload.message,
      type: payload.type,
      priority: payload.priority,
      target_audience: payload.target_audience,
      badge: badgeText,
      image_url: imageUrl,
      is_featured: isFeatured,
      is_active: payload.is_active,
      expires_at: payload.expires_at || null,
      created_at: new Date().toISOString()
    };
    currentList.unshift(updatedItem);
  }

  saveStoredAnnouncements(currentList);

  // Sync to Supabase in background
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

    if (payload.id && !payload.id.startsWith('ann_') && !payload.id.startsWith('ann-')) {
      await supabase.from('announcements').update(dbPayload).eq('id', payload.id);
    } else {
      const { data } = await supabase.from('announcements').insert([dbPayload]).select().single();
      if (data?.id) {
        updatedItem.id = data.id;
        const idx = currentList.findIndex(a => a.title === payload.title);
        if (idx >= 0) currentList[idx].id = data.id;
        saveStoredAnnouncements(currentList);
      }
    }
  } catch (e) {
    console.warn('Supabase sync skipped/failed:', e);
  }

  return updatedItem;
}

/**
 * Delete announcement
 */
export async function deleteAnnouncementData(id: string): Promise<void> {
  const currentList = getStoredAnnouncements().filter(a => a.id !== id);
  saveStoredAnnouncements(currentList);

  try {
    const supabase = createClient();
    if (!id.startsWith('ann_') && !id.startsWith('ann-')) {
      await supabase.from('announcements').delete().eq('id', id);
    }
  } catch (e) {
    console.warn('Supabase delete skipped/failed:', e);
  }
}

/**
 * Toggle announcement active status
 */
export async function toggleAnnouncementActive(id: string, currentStatus: boolean): Promise<boolean> {
  const currentList = getStoredAnnouncements();
  const item = currentList.find(a => a.id === id);
  const newStatus = !currentStatus;

  if (item) {
    item.is_active = newStatus;
    saveStoredAnnouncements(currentList);
  }

  try {
    const supabase = createClient();
    if (!id.startsWith('ann_') && !id.startsWith('ann-')) {
      await supabase.from('announcements').update({ is_active: newStatus }).eq('id', id);
    }
  } catch (e) {
    console.warn('Supabase status update skipped/failed:', e);
  }

  return newStatus;
}
