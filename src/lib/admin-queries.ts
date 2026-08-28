import { createClient } from '@/utils/supabase/client';
import { UserProfile } from './profile';
import directionsData from "@/data/dtm_directions.json";

export interface Student extends UserProfile {
 status?: string; // Derived or placeholder
 course?: string; // Derived or placeholder
 joined_at: string;
}

// Teacher Interface (extending Profile)
export interface Teacher extends UserProfile {
 subjects: string[];
 total_tests: number;
 joined_date: string;
}

// Fetch Teachers
export async function getTeachers(searchTerm: string = ""): Promise<Teacher[]> {
 const supabase = createClient();

 let query = supabase
 .from('profiles')
 .select('*')
 .eq('role', 'teacher')
 .order('created_at', { ascending: false });

 if (searchTerm) {
 query = query.or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
 }

 const { data, error } = await query;

 if (error) {
 console.error('Error fetching teachers:', error);
 return [];
 }

 // Mocking extra fields for now since they don't exist in DB yet
 // In real app, we would parse `settings` column for subjects
 return data.map(profile => ({
 ...profile,
 joined_date: profile.created_at,
 subjects: profile.settings?.subjects || ['Matematika'], // Fallback
 total_tests: 0 // Mock default
 }));
}

// Get Single Teacher
export async function getTeacher(id: string): Promise<Teacher | null> {
 const supabase = createClient();

 const { data, error } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', id)
 .eq('role', 'teacher')
 .single();

 if (error || !data) {
 console.error('Error fetching teacher:', error);
 return null;
 }

 return {
 ...data,
 joined_date: data.created_at,
 subjects: data.settings?.subjects || [],
 total_tests: 0
 };
}

// Update Teacher
export async function updateTeacher(id: string, updates: { full_name: string; phone: string; subjects: string[] }): Promise<{ success: boolean; error?: string }> {
 const supabase = createClient();

 // 1. Get current settings to merge
 const { data: profile } = await supabase.from('profiles').select('settings').eq('id', id).single();
 const currentSettings = profile?.settings || {};

 const { error } = await supabase
 .from('profiles')
 .update({
 full_name: updates.full_name,
 phone: updates.phone,
 settings: {
 ...currentSettings,
 subjects: updates.subjects
 }
 })
 .eq('id', id);

 if (error) {
 return { success: false, error: error.message };
 }

 return { success: true };
}

// Demote Teacher (Delete)
export async function demoteTeacher(id: string): Promise<{ success: boolean; error?: string }> {
 const supabase = createClient();

 const { error } = await supabase
 .from('profiles')
 .update({ role: 'student' })
 .eq('id', id);

 if (error) {
 return { success: false, error: error.message };
 }

 return { success: true };
}

// Promote user to teacher (by ID)
export async function promoteToTeacher(userId: string, subjects: string[] = []): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // First get current profile to preserve other settings
  const { data: profile } = await supabase.from('profiles').select('settings').eq('id', userId).single();
  const currentSettings = profile?.settings || {};
  
  const newSettings = {
    ...currentSettings,
    subjects: subjects
  };

  // Update role and settings
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ 
      role: 'teacher',
      settings: newSettings
    })
    .eq('id', userId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

export async function getStudents(searchTerm: string = ""): Promise<Student[]> {
  const supabase = createClient();

  let query = supabase
    .from('profiles')
    .select('*')
    .neq('role', 'teacher')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (searchTerm) {
    query = query.or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,parent_phone.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }

  return (data || []).map(profile => ({
    ...profile,
    joined_at: profile.created_at,
    status: 'Active',
    course: 'N/A'
  }));
}

// Get Single Student
export async function getStudent(id: string): Promise<Student | null> {
 const supabase = createClient();

 const { data, error } = await supabase
 .from('profiles')
 .select('*')
 .eq('id', id)
 .eq('role', 'student')
 .single();

 if (error || !data) {
 console.error('Error fetching student:', error);
 return null;
 }

 return {
 ...data,
 joined_at: data.created_at,
 status: 'Active',
 course: 'N/A'
 };
}

// Update Student
export async function updateStudent(id: string, updates: { full_name: string; phone: string; parent_phone?: string | null; parent_name?: string | null }): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const payload: any = {
    full_name: updates.full_name,
    phone: updates.phone,
  };
  if (updates.parent_phone !== undefined) payload.parent_phone = updates.parent_phone;
  if (updates.parent_name !== undefined) payload.parent_name = updates.parent_name;

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Delete Student (Hard Delete or Deactivate? Let's do Hard Delete for now as per usual admin req, or check constraints)
// Actually, hard deleting a student might cascade delete results. Let's try it, but warn.
export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
 const supabase = createClient();

 // In Supabase, deleting a user from 'auth.users' is the proper way, but we can't do that easily from client SDK without service role.
 // So we will just delete from 'profiles' and let triggers handle it or just leave orphan auth user (not ideal but consistent with current setup).
 // BETTER: Just delete from profiles.

 const { error } = await supabase
 .from('profiles')
 .delete()
 .eq('id', id);

 if (error) {
 return { success: false, error: error.message };
 }

 return { success: true };
}

export async function saveExamResult(
 studentId: string,
 examDate: string,
 directionCode: string,
 scores: any
): Promise<{ success: boolean; error?: string }> {
 const supabase = createClient();

 try {
 // 1. Find or Create Exam
 let examId;
 const { data: existingExams } = await supabase
 .from('exams')
 .select('id')
 .eq('date', examDate)
 .eq('type', 'dtm')
 .limit(1);

 if (existingExams && existingExams.length > 0) {
 examId = existingExams[0].id;
 } else {
 // Create new exam
 const { data: newExam, error: createExamError } = await supabase
 .from('exams')
 .insert({
 title: `DTM Mock Exam (${examDate})`,
 date: examDate,
 type: 'dtm',
 status: 'finished',
 max_score: 189.0
 })
 .select()
 .single();

 if (createExamError) throw new Error('Error creating exam: '+ createExamError.message);
 examId = newExam.id;
 }

 // 2. Find or Create Direction
 let directionId;
 const { data: existingDirection } = await supabase
 .from('directions')
 .select('id')
 .eq('code', directionCode)
 .single();

 if (existingDirection) {
 directionId = existingDirection.id;
 } else {
 // Find details from JSON
 const dirInfo = directionsData.find(d => d.code === directionCode);
 if (!dirInfo) throw new Error('Invalid direction code');

 const { data: newDirection, error: createDirError } = await supabase
 .from('directions')
 .insert({
 code: dirInfo.code,
 title: dirInfo.name
 })
 .select()
 .single();

 if (createDirError) throw new Error('Error creating direction: '+ createDirError.message);
 directionId = newDirection.id;
 }

 // 3. Save Result
 const { error: saveError } = await supabase
 .from('results')
 .insert({
 student_id: studentId,
 exam_id: examId,
 direction_id: directionId,
 total_score: scores.total,
 compulsory_math_score: scores.comp_math,
 compulsory_history_score: scores.comp_history,
 compulsory_lang_score: scores.comp_lang,
 subject_1_score: scores.subject_1,
 subject_2_score: scores.subject_2
 });

 if (saveError) throw saveError;

 return { success: true };

 } catch (error: any) {
 console.error('Save result error:', error);
 return { success: false, error: error.message };
 }
}

export async function getAllResults(limit: number = 20): Promise<any[]> {
 const supabase = createClient();

 const { data, error } = await supabase
 .from('results')
 .select(`
 *,
 student:profiles!results_student_id_fkey(full_name),
 exam:exams(title, date),
 direction:directions(title, code)
 `)
 .order('created_at', { ascending: false })
 .limit(limit);

 if (error) {
 console.error('Error fetching results:', error);
 return [];
 }

 return data;
}

export async function getStudentResults(studentId: string): Promise<any[]> {
 const supabase = createClient();

 const { data, error } = await supabase
 .from('results')
 .select(`
 *,
 exam:exams(title, date),
 direction:directions(title, code)
 `)
 .eq('student_id', studentId)
 .order('created_at', { ascending: false });

 if (error) {
 console.error('Error fetching student results:', error);
 return [];
 }

 return data;
}

export async function updateResult(id: string, updates: { total_score?: number; notes?: string }) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('results')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    const { data: attData, error: attError } = await supabase
      .from('test_attempts')
      .update({ score: updates.total_score })
      .eq('id', id)
      .select();

    if (attError) {
      console.error('Error updating result:', error || attError);
      return { success: false, error: (error || attError).message };
    }
    return { success: true, data: attData };
  }

  return { success: true, data };
}

export async function deleteResult(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('results')
    .delete()
    .eq('id', id);

  if (error) {
    const { error: attError } = await supabase
      .from('test_attempts')
      .delete()
      .eq('id', id);

    if (attError) {
      console.error('Error deleting result:', error || attError);
      return { success: false, error: (error || attError).message };
    }
  }

  return { success: true };
}

// Admin Dashboard Stats
export async function getAdminStats() {
  const supabase = createClient();

  try {
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'teacher')
      .neq('role', 'admin');

    const { count: activeTeachers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher');

    const { count: totalGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: totalTests } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true });

    // Calculate current month's revenue
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount')
      .eq('month_year', currentMonth);

    const monthlyRevenueRaw = (paymentsData || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return {
      totalStudents: totalStudents || 0,
      activeTeachers: activeTeachers || 0,
      totalGroups: totalGroups || 0,
      totalTests: totalTests || 0,
      monthlyRevenue: monthlyRevenueRaw.toLocaleString('uz-UZ'),
      rawMonthlyRevenue: monthlyRevenueRaw
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalStudents: 0,
      activeTeachers: 0,
      totalGroups: 0,
      totalTests: 0,
      monthlyRevenue: '0',
      rawMonthlyRevenue: 0
    };
  }
}

// Admin Dashboard Recent Activity
export async function getRecentActivity() {
 const supabase = createClient();

 try {
 // 1. Latest Results (Completed Mock Exam)
 const { data: recentResults } = await supabase
 .from('results')
 .select(`
 id,
 created_at,
 total_score,
 student:profiles!results_student_id_fkey(full_name)
 `)
 .order('created_at', { ascending: false })
 .limit(5);

 // 2. Latest Registrations (New Student)
 const { data: recentUsers } = await supabase
 .from('profiles')
 .select('id, full_name, created_at, role')
 .eq('role', 'student')
 .order('created_at', { ascending: false })
 .limit(5);

 // Normalize and merge
 const activities = [
 ...(recentResults || []).map((r: any) => ({
 id: r.id,
 user: r.student?.full_name || 'Unknown Student',
 action: `Imtihon topshirdi (${r.total_score.toFixed(1)} ball)`,
 date: r.created_at,
 status: 'Result', // for badge color
 type: 'exam'
 })),
 ...(recentUsers || []).map((u: any) => ({
 id: u.id,
 user: u.full_name || 'New User',
 action: 'Tizimdan ro\'yxatdan o\'tdi',
 date: u.created_at,
 status: 'New',
 type: 'user'
 }))
 ];

 // Sort by date desc
 return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

 } catch (error) {
 console.error('Error fetching recent activity:', error);
 return [];
 }
}

// Broadcast Notification
export async function broadcastNotification(
 title: string,
 message: string,
 type: 'info' | 'success' | 'warning' | 'error',
 audience: 'all' | 'students' | 'teachers' | 'admin' = 'all'
): Promise<{ success: boolean; error?: string; count?: number }> {
 const supabase = createClient();

 try {
 const { data, error } = await supabase.rpc('broadcast_announcement', {
 title,
 message,
 type,
 audience
 });

 if (error) throw error;

 // RPC returns { success: boolean, count?: number, error?: string }
 return data as { success: boolean; error?: string; count?: number };
 } catch (error: any) {
 console.error('Error broadcasting notification:', error);
 return { success: false, error: error.message };
 }
}

// ============================================================
// GURUHLAR (Groups) CRUD
// ============================================================

export interface Group {
  id: string;
  name: string;
  subject_id: string;
  description: string | null;
  max_students: number;
  schedule: string | null;
  teacher_id: string | null;
  status: 'active' | 'archived';
  price: number;
  created_at: string;
  updated_at: string;
  subject?: { title: string };
  teacher?: { full_name: string | null; email: string | null };
  student_count?: number;
}

export interface GroupStudent {
  id: string;
  group_id: string;
  student_id: string;
  joined_at: string;
  student?: { id: string; full_name: string | null; email: string | null; phone: string | null; avatar_url: string | null };
}

export async function getGroups(subjectId?: string): Promise<Group[]> {
  const supabase = createClient();
  let query = supabase
    .from("groups")
    .select("*, subject:subjects(title), teacher:profiles!groups_teacher_id_fkey(full_name, phone)")
    .order("created_at", { ascending: false });
  if (subjectId) query = query.eq("subject_id", subjectId);
  const { data, error } = await query;
  if (error) throw error;
  const groups = data || [];
  if (groups.length === 0) return [];
  const { data: counts } = await supabase
    .from("group_students").select("group_id").in("group_id", groups.map((g: any) => g.id));
  const countMap: Record<string, number> = {};
  (counts || []).forEach((row: any) => { countMap[row.group_id] = (countMap[row.group_id] || 0) + 1; });
  return groups.map((g: any) => ({ ...g, student_count: countMap[g.id] || 0 }));
}

export async function getGroup(id: string): Promise<Group | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("*, subject:subjects(title), teacher:profiles!groups_teacher_id_fkey(full_name, email)")
    .eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createGroup(groupData: {
  name: string; subject_id: string; description?: string;
  max_students?: number; schedule?: string; teacher_id?: string;
  price?: number;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.from("groups").insert(groupData).select("id").single();
  if (error) return { success: false, error: error.message };
  return { success: true, id: data.id };
}

export async function updateGroup(
  id: string,
  updates: Partial<{ name: string; description: string; max_students: number; schedule: string; teacher_id: string; status: "active" | "archived", price: number }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("groups").update(updates).eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteGroup(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getGroupStudents(groupId: string): Promise<GroupStudent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("group_students")
    .select("*, student:profiles!group_students_student_id_fkey(id, full_name, phone, avatar_url)")
    .eq("group_id", groupId).order("joined_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addStudentToGroup(
  groupId: string, studentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from("group_students").insert({ group_id: groupId, student_id: studentId });
  if (error) {
    if (error.code === "23505") return { success: false, error: "O'quvchi bu guruhda allaqachon mavjud" };
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function addMultipleStudentsToGroup(
  groupId: string, studentIds: string[]
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!studentIds.length) return { success: true, count: 0 };
  const supabase = createClient();
  const rows = studentIds.map(id => ({ group_id: groupId, student_id: id }));
  const { error } = await supabase
    .from("group_students")
    .upsert(rows, { onConflict: "group_id,student_id", ignoreDuplicates: true });
  if (error) return { success: false, count: 0, error: error.message };
  return { success: true, count: studentIds.length };
}

export async function removeStudentFromGroup(
  groupId: string, studentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("group_students").delete().eq("group_id", groupId).eq("student_id", studentId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getStudentGroups(studentId: string): Promise<Group[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("group_students").select("group:groups(*, subject:subjects(title))").eq("student_id", studentId);
  if (error) throw error;
  return (data || []).map((d: any) => d.group).filter(Boolean);
}

export async function getStudentsNotInGroup(groupId: string, searchTerm: string = ""): Promise<Student[]> {
  const supabase = createClient();
  const { data: existing } = await supabase.from("group_students").select("student_id").eq("group_id", groupId);
  const existingIds = (existing || []).map((e: any) => e.student_id);
  let query = supabase.from("profiles").select("*").neq("role", "teacher").neq("role", "admin").order("full_name");
  if (existingIds.length > 0) query = query.not("id", "in", "(" + existingIds.join(",") + ")");
  if (searchTerm) query = query.or("full_name.ilike.%" + searchTerm + "%,phone.ilike.%" + searchTerm + "%,parent_phone.ilike.%" + searchTerm + "%");
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return (data || []) as Student[];
}

// --- VIDEO LESSONS ---

export async function createVideoLesson(subjectId: string, title: string, description: string, videoUrl: string, orderNum: number = 1): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // 1. Create Lesson
  const { data: lesson, error: lessonError } = await supabase.from('lessons').insert({
    subject_id: subjectId,
    title,
    description,
    order_num: orderNum
  }).select().single();

  if (lessonError) return { success: false, error: lessonError.message };

  // 2. Create Material (Video)
  const { error: materialError } = await supabase.from('materials').insert({
    lesson_id: lesson.id,
    title: "Asosiy Video",
    type: 'video',
    url: videoUrl
  });

  if (materialError) return { success: false, error: materialError.message };
  return { success: true };
}

export async function updateVideoLesson(lessonId: string, title: string, description: string, videoUrl: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // 1. Update Lesson
  const { error: lessonError } = await supabase.from('lessons').update({
    title,
    description
  }).eq('id', lessonId);

  if (lessonError) return { success: false, error: lessonError.message };

  // 2. Update existing video material, or create one if it doesn't exist
  const { data: existingMaterials } = await supabase.from('materials').select('id').eq('lesson_id', lessonId).eq('type', 'video');
  
  if (existingMaterials && existingMaterials.length > 0) {
    const { error: materialError } = await supabase.from('materials').update({ url: videoUrl }).eq('id', existingMaterials[0].id);
    if (materialError) return { success: false, error: materialError.message };
  } else {
    const { error: materialError } = await supabase.from('materials').insert({
      lesson_id: lessonId,
      title: "Asosiy Video",
      type: 'video',
      url: videoUrl
    });
    if (materialError) return { success: false, error: materialError.message };
  }

  return { success: true };
}

export async function deleteVideoLesson(lessonId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  await supabase.from('materials').delete().eq('lesson_id', lessonId);
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Subject CRUD & Aliases
export async function createSubject(title: string, description?: string, cover_image?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const trimmedTitle = title.trim();

  // Supply both 'name' and 'title' so it satisfies both table schemas
  const fullPayload: any = {
    name: trimmedTitle,
    title: trimmedTitle,
    description: description?.trim() || null,
    cover_image: cover_image?.trim() || null,
  };

  const { error } = await supabase.from('subjects').insert(fullPayload);
  if (error) {
    // If 'title' column doesn't exist in the database, insert with 'name' only
    if (error.message?.includes('title') || error.code === '42703') {
      const fallbackPayload: any = {
        name: trimmedTitle,
        description: description?.trim() || null,
        cover_image: cover_image?.trim() || null,
      };
      const { error: fallbackError } = await supabase.from('subjects').insert(fallbackPayload);
      if (fallbackError) return { success: false, error: fallbackError.message };
      return { success: true };
    }
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateSubject(id: string, title: string, description?: string, cover_image?: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const trimmedTitle = title.trim();

  const fullPayload: any = {
    name: trimmedTitle,
    title: trimmedTitle,
    description: description?.trim() || null,
    cover_image: cover_image?.trim() || null,
  };

  const { error } = await supabase.from('subjects').update(fullPayload).eq('id', id);
  if (error) {
    if (error.message?.includes('title') || error.code === '42703') {
      const fallbackPayload: any = {
        name: trimmedTitle,
        description: description?.trim() || null,
        cover_image: cover_image?.trim() || null,
      };
      const { error: fallbackError } = await supabase.from('subjects').update(fallbackPayload).eq('id', id);
      if (fallbackError) return { success: false, error: fallbackError.message };
      return { success: true };
    }
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteSubject(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getSubjectById(id: string) {
  const supabase = createClient();
  const { data } = await supabase.from('subjects').select('*').eq('id', id).single();
  if (data) {
    return {
      ...data,
      title: data.title || data.name || 'Nomsiz Fan',
      name: data.name || data.title || 'Nomsiz Fan',
    };
  }
  return data;
}

export async function getSubjectGroups(subjectId: string): Promise<Group[]> {
  return getGroups(subjectId);
}

export interface VideoLesson {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration?: string;
  created_at: string;
}

export async function getSubjectLessons(subjectId: string): Promise<VideoLesson[]> {
  const supabase = createClient();
  const { data } = await supabase.from('lessons').select('*').eq('subject_id', subjectId);
  return (data || []).map((l: any) => ({
    id: l.id,
    subject_id: l.subject_id,
    title: l.title,
    description: l.description || null,
    video_url: l.video_url || '',
    duration: '15 min',
    created_at: l.created_at
  }));
}

export const assignStudentToGroup = addStudentToGroup;
export const assignMultipleStudentsToGroup = addMultipleStudentsToGroup;
export const demoteToStudent = demoteTeacher;

// ── TOURNAMENTS (MUSOBAQALAR) ADMIN QUERIES ──
import type { AdminTournamentComment } from './tournaments';
export type {
  TournamentQuestion,
  AdminTournament,
  AdminTournamentComment,
  TournamentParticipant,
  TournamentLeaderboardEntry
} from './tournaments';

export {
  INITIAL_TOURNAMENTS as INITIAL_ADMIN_TOURNAMENTS,
  SAMPLE_MATH_QUESTIONS,
  getAdminTournaments,
  getTournamentById,
  duplicateAdminTournament,
  saveAdminTournament,
  deleteAdminTournament,
  registerForTournament,
  getTournamentRegistrations,
  getTournamentLeaderboard,
  submitTournamentAttempt
} from './tournaments';

export const INITIAL_ADMIN_COMMENTS: AdminTournamentComment[] = [
  {
    id: "c1",
    tournament_id: "math-pro-2026",
    author: "Jasurbek Aliyev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasurbek",
    role: "O'quvchi",
    time: "10 daqiqa avval",
    text: "Matematika musobaqasi savollari darajasi qanday bo'ladi? Tayyorgarlik uchun tayyor testlar bormi?",
    likes: 8
  },
  {
    id: "c2",
    tournament_id: "math-pro-2026",
    author: "Promax Admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PromaxAdmin",
    role: "Tashkilotchi",
    time: "5 daqiqa avval",
    text: "Assalomu alaykum! Musobaqa testlari mantiqiy va standart murakkablikda bo'ladi. Testlar bo'limida tayyorgarlik testlarini yechishingiz mumkin.",
    likes: 15
  }
];

export async function getAdminTournamentComments(): Promise<AdminTournamentComment[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('tournament_comments')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !data || data.length === 0) {
      return INITIAL_ADMIN_COMMENTS;
    }
    return data;
  } catch (err) {
    return INITIAL_ADMIN_COMMENTS;
  }
}

export async function deleteAdminTournamentComment(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('tournament_comments').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: true };
  }
}
