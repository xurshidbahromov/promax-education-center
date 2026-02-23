"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Skeleton, StatsSkeleton, ChartSkeleton, ListItemSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import {
    BookOpen,
    Trophy,
    Target,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Megaphone,
    Medal,
    Crown
} from "lucide-react";
import {
    useCurrentUser,
    useUserProfile,
    useDashboardStats,
    useChartData,
    useActivityFeed,
    useLeaderboard,
    useUserRank,
    useUpcomingTests,
    useAnnouncements
} from "@/hooks/useDashboardData";
import MyCourses from "@/components/MyCourses";

export default function DashboardPage() {
    const { t } = useLanguage();

    // React Query Hooks
    const { data: user } = useCurrentUser();
    const { data: profile } = useUserProfile(user?.id);
    const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats(user?.id);
    const { data: chartData, isLoading: chartLoading } = useChartData(user?.id);
    const { data: activityFeed, isLoading: activityLoading } = useActivityFeed(user?.id);
    const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
    const { data: userRank } = useUserRank(user?.id);
    const { data: upcomingTests, isLoading: testsLoading } = useUpcomingTests();
    const { data: announcements, isLoading: announcementsLoading } = useAnnouncements();

    const loading = statsLoading || chartLoading || activityLoading || leaderboardLoading || testsLoading || announcementsLoading;
    const userFullName = profile?.full_name || user?.user_metadata?.full_name || "Student";
    const currentUserId = user?.id;

    // derived stats (safely access data)
    const stats = [
        {
            title: t('dashboard.stats.coins'),
            value: statsLoading ? "..." : `${dashboardStats?.totalCoins || 0}`,
            icon: Trophy,
            color: "bg-brand-orange",
            textColor: "text-brand-orange",
            trend: statsLoading ? "" : `+${Math.floor((dashboardStats?.totalCoins || 0) / 10)} ${t('dashboard.stats.coins.trend')}`
        },
        {
            title: t('dashboard.stats.average_score'),
            value: statsLoading ? "..." : `${dashboardStats?.averageScore.toFixed(1) || 0}`,
            icon: Target,
            color: "bg-brand-blue",
            textColor: "text-brand-blue",
            trend: statsLoading ? "" : t('dashboard.stats.average_score.trend')
        },
        {
            title: t('dashboard.stats.exams_count'),
            value: statsLoading ? "..." : `${dashboardStats?.totalTests || 0}`,
            icon: BookOpen,
            color: "bg-indigo-500",
            textColor: "text-indigo-500",
            trend: statsLoading ? "" : t('dashboard.stats.exams_count.trend')
        },
        {
            title: t('dashboard.stats.next_exam'),
            value: statsLoading ? "..." : t('dashboard.stats.next_exam.value'),
            icon: Calendar,
            color: "bg-green-500",
            textColor: "text-green-500",
            trend: t('dashboard.stats.next_exam.trend')
        },
    ];

    // const leaderboard = [
    //     { name: "Aziz Rahimov", points: 2400, rank: 1, avatar: "🥇" },
    //     { name: "Malika Karimova", points: 2150, rank: 2, avatar: "🥈" },
    //     { name: t('dashboard.leaderboard.you'), points: 1250, rank: 15, avatar: "👤" },
    // ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {t('auth.welcome')} 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {new Date().toLocaleDateString(t('locale') === 'uz' ? 'uz-UZ' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    // Show 4 Skeletons while loading
                    [...Array(4)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative group h-full"
                        >
                            <StatsSkeleton />
                        </motion.div>
                    ))
                ) : (
                    stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group h-full"
                        >
                            {/* Soft Glow Behind Box */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color.replace('bg-', 'from-')} to-transparent opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-2xl`} />

                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative z-10 overflow-hidden h-full flex flex-col justify-between">
                                <div className="relative z-10">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white mt-3 mb-1">{stat.value}</h3>
                                </div>

                                <div className="relative z-10">
                                    <p className="text-xs text-brand-blue font-medium flex items-center gap-1">
                                        <TrendingUp size={12} /> {stat.trend}
                                    </p>
                                </div>

                                {/* Watermark Icon */}
                                <div className={`absolute -right-6 -bottom-6 opacity-10 ${stat.textColor}`}>
                                    <stat.icon size={100} />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Announcements & Mock Chart */}
                <div className="lg:col-span-2 flex flex-col gap-8 h-full">
                    {/* Announcements */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Megaphone className="text-brand-blue" size={20} />
                                {t('dashboard.announcements.title')}
                            </h3>
                        </div>
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                [...Array(3)].map((_, i) => <ListItemSkeleton key={i} />)
                            ) : (announcements?.length || 0) === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                                    {t('dashboard.announcements.empty') || "E'lonlar yo'q"}
                                </p>
                            ) : (
                                announcements?.map((item, i) => (
                                    <div key={item.id || i} className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex gap-4">
                                        <div className={`w-1 h-full rounded-full ${item.type === 'error' ? 'bg-red-500' : item.type === 'warning' ? 'bg-yellow-500' : item.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.message}</p>
                                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(item.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Mock Progress Chart - Now with Real Data */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('dashboard.chart.title')}</h3>
                        {loading ? (
                            <ChartSkeleton />
                        ) : (chartData?.length || 0) === 0 ? (
                            <div className="flex-1 flex items-center justify-center min-h-[250px]">
                                <p className="text-gray-400">{t('dashboard.no_results')}</p>
                            </div>
                        ) : (
                            <div className="flex-1 w-full min-h-[250px] flex items-end justify-between gap-2">
                                {chartData?.map((result, i) => {
                                    // Calculate percentage (out of 189 max score)
                                    const percentage = Math.round((result.score / 189) * 100);
                                    return (
                                        <div key={i} className="w-full bg-gray-50 dark:bg-slate-800 rounded-t-lg relative group h-full flex flex-col justify-end" title={result.examTitle}>
                                            <motion.div
                                                className="w-full bg-brand-blue rounded-t-lg relative"
                                                initial={{ height: 0 }}
                                                animate={{ height: `${percentage}%` }}
                                                transition={{ duration: 1, type: "spring", delay: i * 0.1 }}
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {result.score} / 189
                                                </div>
                                            </motion.div>
                                            <span className="text-xs text-gray-400 text-center mt-2 truncate">{result.date}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Activity, Leaderboard & CTA */}
                <div className="flex flex-col gap-8 h-full">
                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="text-brand-blue" size={20} />
                            {t('dashboard.activity.title')}
                        </h3>
                        <div className="space-y-4">
                            {loading ? (
                                [...Array(3)].map((_, i) => <ListItemSkeleton key={i} />)
                            ) : (activityFeed?.length || 0) === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">{t('dashboard.activity.empty')}</p>
                            ) : (
                                activityFeed?.map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="mt-1">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {t('dashboard.activity.scored')}: <span className="font-medium text-brand-blue">{item.score}/{item.maxScore}</span>
                                            </p>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(item.date).toLocaleDateString(t('locale') === 'uz' ? 'uz-UZ' : t('locale') === 'ru' ? 'ru-RU' : 'en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex-1 flex flex-col min-h-[300px] relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Medal className="text-yellow-500" size={20} />
                                {t('dashboard.leaderboard.title')}
                            </h3>
                        </div>

                        <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2 mb-2">
                            {leaderboard?.map((user: any, i: number) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${user.id === currentUserId ? 'bg-brand-blue/10 border border-brand-blue/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold w-6 text-center ${user.rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>#{user.rank}</span>
                                        <span className="text-xl">{user.avatar}</span>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{user.name} {user.id === currentUserId && `(${t('dashboard.leaderboard.you')})`}</h4>
                                            <p className="text-xs text-gray-500">{user.points} coins</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sticky User Rank at Bottom */}
                        {userRank && (
                            <div className="pt-3 mt-auto border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold w-6 text-center text-brand-blue">#{userRank.rank}</span>
                                        <span className="text-xl">{userRank.avatar}</span>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{userRank.name} ({t('dashboard.leaderboard.you')})</h4>
                                            <p className="text-xs text-gray-500">{userRank.points} coins</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            </div>

            {/* My Courses Section - Moved to bottom */}
            <MyCourses />
        </div>
    );
}
