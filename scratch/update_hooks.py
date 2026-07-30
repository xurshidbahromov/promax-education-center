import os

code = """import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getAdminStats, getRecentActivity, getTeachers, getStudents, getAllResults, Student, getGroups, getGroupStudents, getStudentsNotInGroup } from '@/lib/admin-queries';
import { getPaymentSummariesForStudents } from '@/lib/payments';
import { getSubjects, getSubjectById, getLessonsBySubjectId, getMaterialsByLessonId } from '@/lib/supabase-queries';

export const useAdminStats = () => {
 return useQuery({
 queryKey: ['adminStats'],
 queryFn: () => getAdminStats(),
 staleTime: 5 * 60 * 1000,
 });
};

export const useRecentActivity = () => {
 return useQuery({
 queryKey: ['recentActivity'],
 queryFn: () => getRecentActivity(),
 refetchInterval: 30 * 1000,
 });
};

export const useTeachers = (searchTerm: string = "") => {
 return useQuery({
 queryKey: ['teachers', searchTerm],
 queryFn: () => getTeachers(searchTerm),
 });
};

export const useStudents = (searchTerm: string = "") => {
 return useQuery({
 queryKey: ['students', searchTerm],
 queryFn: () => getStudents(searchTerm),
 });
};

export const useStudentPaymentSummaries = (students: Student[]) => {
 const studentIds = students.map(s => s.id);
 return useQuery({
 queryKey: ['paymentSummaries', studentIds.sort().join(',')],
 queryFn: () => getPaymentSummariesForStudents(studentIds),
 enabled: students.length > 0,
 });
};

export const useAllResults = (limit: number = 20) => {
 return useQuery({
 queryKey: ['allResults', limit],
 queryFn: () => getAllResults(limit),
 });
};

// --- REAL-TIME HOOKS FOR COURSES / GROUPS / LESSONS ---

export const useSubjects = () => {
 return useQuery({
   queryKey: ['subjects'],
   queryFn: () => getSubjects(),
 });
};

export const useSubject = (id: string) => {
 return useQuery({
   queryKey: ['subject', id],
   queryFn: () => getSubjectById(id),
   enabled: !!id,
 });
};

export const useGroups = (subjectId: string) => {
 return useQuery({
   queryKey: ['groups', subjectId],
   queryFn: () => getGroups(subjectId),
   enabled: !!subjectId,
 });
};

export const useLessons = (subjectId: string) => {
 return useQuery({
   queryKey: ['lessons', subjectId],
   queryFn: () => getLessonsBySubjectId(subjectId),
   enabled: !!subjectId,
 });
};

export const useMaterialsByLessons = (lessons: any[]) => {
 const lessonIds = lessons.map(l => l.id).sort().join(',');
 return useQuery({
   queryKey: ['materials', lessonIds],
   queryFn: async () => {
     const mats: Record<string, any[]> = {};
     for (const l of lessons) {
       mats[l.id] = await getMaterialsByLessonId(l.id);
     }
     return mats;
   },
   enabled: lessons.length > 0,
 });
};

export const useGroupStudents = (groupId: string) => {
 return useQuery({
   queryKey: ['groupStudents', groupId],
   queryFn: () => getGroupStudents(groupId),
   enabled: !!groupId,
 });
};

export const useAvailableStudents = (groupId: string, search: string = "") => {
 return useQuery({
   queryKey: ['availableStudents', groupId, search],
   queryFn: () => getStudentsNotInGroup(groupId, search),
   enabled: !!groupId,
 });
};

/**
 * A hook to automatically invalidate relevant queries when Supabase data changes.
 * This provides true Realtime updates across multiple active sessions.
 */
export const useSupabaseRealtimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const table = payload.table;
          // Invalidate relevant queries based on which table changed
          if (table === 'subjects') queryClient.invalidateQueries({ queryKey: ['subjects'] });
          if (table === 'subjects') queryClient.invalidateQueries({ queryKey: ['subject'] });
          if (table === 'groups') queryClient.invalidateQueries({ queryKey: ['groups'] });
          if (table === 'lessons') queryClient.invalidateQueries({ queryKey: ['lessons'] });
          if (table === 'materials') queryClient.invalidateQueries({ queryKey: ['materials'] });
          if (table === 'group_students') {
            queryClient.invalidateQueries({ queryKey: ['groupStudents'] });
            queryClient.invalidateQueries({ queryKey: ['availableStudents'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] }); // to update student count
          }
          if (table === 'profiles') {
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['availableStudents'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
"""

with open("src/hooks/useAdminData.ts", "w") as f:
    f.write(code)
print("useAdminData.ts replaced.")
