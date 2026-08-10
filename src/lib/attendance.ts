import { createClient } from '@/utils/supabase/client';

export interface AttendanceRecord {
  id?: string;
  group_id: string;
  student_id: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late';
  homework: 'done' | 'not_done' | 'partially' | 'none';
  notes?: string;
  student?: {
    id: string;
    full_name: string;
    phone?: string;
    parent_phone?: string;
    telegram_id?: number;
  };
}

export interface GroupStudentInfo {
  student_id: string;
  student: {
    id: string;
    full_name: string;
    phone?: string;
    parent_phone?: string;
    telegram_id?: number;
  };
}

/**
 * Fetch students enrolled in a group
 */
export async function getGroupStudentsForAttendance(groupId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('group_students')
    .select('student_id, student:profiles!student_id(id, full_name, phone, parent_phone, telegram_id)')
    .eq('group_id', groupId);

  if (error) {
    console.error('Error fetching group students:', error);
    return [];
  }

  return (data || []) as unknown as GroupStudentInfo[];
}

/**
 * Fetch existing attendance records for a group on a specific date
 */
export async function getAttendanceForGroupDate(groupId: string, date: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('group_id', groupId)
    .eq('date', date);

  if (error) {
    // If table doesn't exist yet, handle gracefully
    if (error.code === 'PGRST205') {
      console.warn('Attendance table not found. Please run migration 007.');
    } else {
      console.error('Error fetching attendance records:', error);
    }
    return [];
  }

  return (data || []) as AttendanceRecord[];
}

/**
 * Upsert attendance records for a group and date
 */
export async function saveGroupAttendance(records: Omit<AttendanceRecord, 'id'>[]) {
  const supabase = createClient();

  if (records.length === 0) return { success: true, count: 0 };

  const { data, error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: 'group_id,student_id,date' })
    .select();

  if (error) {
    console.error('Error saving attendance:', error);
    return { success: false, error: error.message };
  }

  return { success: true, count: data?.length || 0 };
}
