import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getAdminStats, getRecentActivity, getTeachers, getStudents, getAllResults, getExamsList, Student, getGroups, getGroupStudents, getStudentsNotInGroup } from '@/lib/admin-queries';
import { getPaymentSummariesForStudents } from '@/lib/payments';
import { getSubjects, getAllSubjects, getSubjectById, getLessonsBySubjectId, getMaterialsByLessonIds } from '@/lib/supabase-queries';
import { getAllTests, getTestWithQuestions, getTestResults, getTestGroups } from '@/lib/tests';


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
    staleTime: 2 * 60 * 1000,
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

export const useExamsList = () => {
  return useQuery({
    queryKey: ['examsList'],
    queryFn: () => getExamsList(),
  });
};

// --- REAL-TIME HOOKS FOR COURSES / GROUPS / LESSONS ---

export const useSubjects = () => {
 return useQuery({
   queryKey: ['subjects'],
   queryFn: () => getAllSubjects(),
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
  const sortedIds = lessons.map(l => l.id).filter(Boolean).sort();
  const lessonIdsKey = sortedIds.join(',');
  return useQuery({
    queryKey: ['materials', lessonIdsKey],
    queryFn: () => getMaterialsByLessonIds(sortedIds),
    enabled: sortedIds.length > 0,
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

// --- TEST HOOKS ---

export const useTests = () => {
  return useQuery({
    queryKey: ['tests'],
    queryFn: () => getAllTests(),
  });
};

export const useTestDetail = (testId: string) => {
  return useQuery({
    queryKey: ['testDetail', testId],
    queryFn: () => getTestWithQuestions(testId),
    enabled: !!testId,
  });
};

export const useTestResults = (testId: string) => {
  return useQuery({
    queryKey: ['testResults', testId],
    queryFn: () => getTestResults(testId),
    enabled: !!testId,
  });
};

export const useTestGroups = (testId: string) => {
  return useQuery({
    queryKey: ['testGroups', testId],
    queryFn: () => getTestGroups(testId),
    enabled: !!testId,
  });
};


/**
 * A hook to automatically invalidate relevant queries when Supabase data changes.
 * Uses per-key debouncing to prevent query storms during bulk operations or student streak updates.
 */
export const useSupabaseRealtimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const timers: Record<string, ReturnType<typeof setTimeout>> = {};

    const debouncedInvalidate = (key: string, delayMs = 800) => {
      if (timers[key]) clearTimeout(timers[key]);
      timers[key] = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [key] });
        delete timers[key];
      }, delayMs);
    };

    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const table = payload.table;
          const eventType = payload.eventType;

          if (table === 'subjects') {
            debouncedInvalidate('subjects');
            debouncedInvalidate('subject');
          } else if (table === 'groups') {
            debouncedInvalidate('groups');
            debouncedInvalidate('adminStats', 1500);
          } else if (table === 'lessons') {
            debouncedInvalidate('lessons');
          } else if (table === 'materials') {
            debouncedInvalidate('materials');
          } else if (table === 'group_students') {
            debouncedInvalidate('groupStudents');
            debouncedInvalidate('availableStudents');
            debouncedInvalidate('groups');
          } else if (table === 'profiles') {
            if (eventType === 'INSERT' || eventType === 'DELETE') {
              debouncedInvalidate('teachers');
              debouncedInvalidate('students');
              debouncedInvalidate('availableStudents');
              debouncedInvalidate('recentActivity', 1200);
              debouncedInvalidate('adminStats', 1500);
            } else {
              // On UPDATE: check if core identity fields changed vs minor coin/streak updates
              const oldRow = (payload as any).old || {};
              const newRow = (payload as any).new || {};
              const identityChanged =
                oldRow.role !== undefined &&
                (oldRow.role !== newRow.role ||
                 oldRow.full_name !== newRow.full_name ||
                 oldRow.phone !== newRow.phone);

              if (identityChanged || newRow.role === 'teacher') {
                debouncedInvalidate('teachers', 1000);
                debouncedInvalidate('availableStudents', 1000);
              }
              debouncedInvalidate('students', 1500);
            }
          } else if (table === 'tests') {
            debouncedInvalidate('tests');
          } else if (table === 'questions') {
            debouncedInvalidate('testDetail');
          } else if (table === 'test_attempts') {
            debouncedInvalidate('testResults', 1200);
          } else if (table === 'results') {
            debouncedInvalidate('allResults', 1200);
            debouncedInvalidate('recentActivity', 1200);
          } else if (table === 'payments') {
            debouncedInvalidate('adminStats', 1500);
          } else if (table === 'group_tests') {
            debouncedInvalidate('testGroups');
            debouncedInvalidate('tests');
          }
        }
      )
      .subscribe();

    return () => {
      Object.values(timers).forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};


