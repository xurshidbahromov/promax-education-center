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

const STORAGE_KEY = 'promax_announcements_v3';

function readLocalList(): Announcement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Announcement[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function writeLocalList(list: Announcement[], broadcast = true): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (broadcast) window.dispatchEvent(new Event('promax_announcements_updated'));
  } catch {}
}

/**
 * Get all announcements for Admin panel.
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const local = readLocalList();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped: Announcement[] = data.map((item: any) => {
        const localMatch = local.find(l => l.id === item.id || l.title === item.title);
        const isFeatured = item.is_featured ?? localMatch?.is_featured ?? false;
        const imageUrl = item.image_url ?? localMatch?.image_url ?? null;
        const badge = item.badge ?? localMatch?.badge ?? null;

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

      writeLocalList(mapped, false);
      return mapped;
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
 * Save announcement (create or update).
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
    // UPDATE
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
    // CREATE
    item = {
      id: 'ann_' + Date.now() + '_' + Math.random().toString(36).substring(7),
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

  writeLocalList(list);

  // Sync to Supabase
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

    if (payload.id && !payload.id.startsWith('ann_')) {
      await supabase.from('announcements').update(dbFields).eq('id', payload.id);
    } else {
      const { data: inserted } = await supabase
        .from('announcements')
        .insert([dbFields])
        .select('id')
        .single();

      if (inserted?.id) {
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
    if (!id.startsWith('ann_')) {
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
    if (!id.startsWith('ann_')) {
      await supabase.from('announcements').update({ is_active: newStatus }).eq('id', id);
    }
  } catch {}

  return newStatus;
}
