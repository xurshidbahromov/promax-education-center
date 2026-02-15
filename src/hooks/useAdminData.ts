import { useQuery } from '@tanstack/react-query';
import { getAdminStats, getRecentActivity, getTeachers, getStudents, getAllResults, Student } from '@/lib/admin-queries';
import { getPaymentSummariesForStudents } from '@/lib/payments';

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['adminStats'],
        queryFn: () => getAdminStats(),
        staleTime: 5 * 60 * 1000, // Stats are relatively stable
    });
};

export const useRecentActivity = () => {
    return useQuery({
        queryKey: ['recentActivity'],
        queryFn: () => getRecentActivity(),
        refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds for live feel
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
        queryKey: ['paymentSummaries', studentIds.sort().join(',')], // Sort to ensure consistent key
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
