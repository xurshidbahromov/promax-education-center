import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import { getDashboardStats, getRecentResultsForChart, getStudentActivity, getLeaderboard, getAvailableExams, getUserRank } from '@/lib/supabase-queries';

// Hook to get current user ID
export const useCurrentUser = () => {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            return user;
        },
        staleTime: Infinity, // User session doesn't change often
    });
};

// Hook to get user profile
export const useUserProfile = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            if (!userId) return null;
            const supabase = createClient();
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single();
            return profile;
        },
        enabled: !!userId,
    });
};

export const useDashboardStats = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['dashboardStats', userId],
        queryFn: () => userId ? getDashboardStats(userId) : Promise.resolve({ totalTests: 0, averageScore: 0, bestScore: 0, totalCoins: 0 }),
        enabled: !!userId,
    });
};

export const useChartData = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['chartData', userId],
        queryFn: () => userId ? getRecentResultsForChart(userId) : Promise.resolve([]),
        enabled: !!userId,
    });
};

export const useActivityFeed = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['activityFeed', userId],
        queryFn: () => userId ? getStudentActivity(userId) : Promise.resolve([]),
        enabled: !!userId,
    });
};

export const useLeaderboard = () => {
    return useQuery({
        queryKey: ['leaderboard'],
        queryFn: () => getLeaderboard(), // Fix: wrap in arrow function
        staleTime: 5 * 60 * 1000,
    });
};

export const useUserRank = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['userRank', userId],
        queryFn: () => userId ? getUserRank(userId) : Promise.resolve(null),
        enabled: !!userId,
    });
};

export const useUpcomingTests = () => {
    return useQuery({
        queryKey: ['upcomingTests'],
        queryFn: async () => {
            const exams = await getAvailableExams();
            return exams.slice(0, 3);
        },
    });
};

export const useAnnouncements = () => {
    return useQuery({
        queryKey: ['announcements'],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .or('target_audience.eq.all,target_audience.eq.students')
                .order('created_at', { ascending: false })
                .order('priority', { ascending: false })
                .limit(5);

            if (error) throw error;
            return data || [];
        },
    });
};
