"use client";

import { useLanguage } from "@/context/LanguageContext";
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
    Gamepad2,
    Crown
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getDashboardStats, getRecentResultsForChart } from "@/lib/supabase-queries";

export default function DashboardPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [userFullName, setUserFullName] = useState<string>("Student");
    const [dashboardStats, setDashboardStats] = useState({
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        totalCoins: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    // Fetch user and dashboard data
    useEffect(() => {
        async function fetchDashboardData() {
            const supabase = createClient();

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            setUserFullName(user.user_metadata?.full_name || "Student");

            // Get dashboard stats
            const stats = await getDashboardStats(user.id);
            setDashboardStats(stats);

            // Get recent results for chart
            const recentResults = await getRecentResultsForChart(user.id);
            setChartData(recentResults);

            setLoading(false);
        }

        fetchDashboardData();
    }, []);

    // Stats cards with real data
    const stats = [
        {
            title: t('dashboard.stats.coins'),
            value: loading ? "..." : `${dashboardStats.totalCoins}`,
            icon: Trophy,
            color: "bg-brand-orange",
            textColor: "text-brand-orange",
            trend: loading ? "" : `+${Math.floor(dashboardStats.totalCoins / 10)} ${t('dashboard.stats.coins.trend')}`
        },
        {
            title: t('dashboard.stats.average_score'),
            value: loading ? "..." : `${dashboardStats.averageScore.toFixed(1)}`,
            icon: Target,
            color: "bg-brand-blue",
            textColor: "text-brand-blue",
            trend: loading ? "" : t('dashboard.stats.average_score.trend')
        },
        {
            title: t('dashboard.stats.exams_count'),
            value: loading ? "..." : `${dashboardStats.totalTests}`,
            icon: BookOpen,
            color: "bg-indigo-500",
            textColor: "text-indigo-500",
            trend: loading ? "" : t('dashboard.stats.exams_count.trend')
        },
        {
            title: t('dashboard.stats.next_exam'),
            value: loading ? "..." : t('dashboard.stats.next_exam.value'),
            icon: Calendar,
            color: "bg-green-500",
            textColor: "text-green-500",
            trend: t('dashboard.stats.next_exam.trend')
        },
    ];

    const announcements = [
        { title: "Katta Mock Imtihon!", date: "Ertaga, 09:00", type: "urgent", message: "Barcha o'quvchilar pasport nusxasi bilan kelishi shart." },
        // TODO: We can localize mock announcements later or keep them dynamic from DB
        { title: "Speaking Club", date: "Shanba, 14:00", type: "info", message: "Mr. John bilan bepul speaking darsi." },
        { title: "Yangi 'Game Zone' ochildi", date: "Bugun", type: "success", message: "Tanaffusda stol tennisi o'ynashingiz mumkin." },
    ];

    const leaderboard = [
        { name: "Aziz Rahimov", points: 2400, rank: 1, avatar: "🥇" },
        { name: "Malika Karimova", points: 2150, rank: 2, avatar: "🥈" },
        { name: t('dashboard.leaderboard.you'), points: 1250, rank: 15, avatar: "👤" },
    ];

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
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-brand-blue/30 flex items-center gap-2">
                        <Gamepad2 size={18} />
                        {t('dashboard.game_zone')}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative group"
                    >
                        {/* Soft Glow Behind Box */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${stat.color.replace('bg-', 'from-')} to-transparent opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-2xl`} />

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative z-10 overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
                                <p className="text-xs text-brand-blue font-medium mt-2 flex items-center gap-1">
                                    <TrendingUp size={12} /> {stat.trend}
                                </p>
                            </div>

                            {/* Watermark Icon */}
                            <div className={`absolute -right-6 -bottom-6 opacity-10 ${stat.textColor}`}>
                                <stat.icon size={100} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Announcements & Mock Chart */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Announcements */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Megaphone className="text-brand-blue" size={20} />
                                {t('dashboard.announcements.title')}
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {announcements.map((item, i) => (
                                <div key={i} className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 flex gap-4">
                                    <div className={`w-1 h-full rounded-full ${item.type === 'urgent' ? 'bg-red-500' : item.type === 'info' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.message}</p>
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Clock size={12} /> {item.date}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mock Progress Chart - Now with Real Data */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{t('dashboard.chart.title')}</h3>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <p className="text-gray-400">Loading...</p>
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="h-64 flex items-center justify-center">
                                <p className="text-gray-400">{t('dashboard.no_results')}</p>
                            </div>
                        ) : (
                            <div className="h-64 flex items-end justify-between gap-2">
                                {chartData.map((result, i) => {
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
                                            <span className="text-xs text-gray-400 text-center mt-2 truncate">{result.week}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Leaderboard & Online Tests */}
                <div className="space-y-8">
                    {/* Leaderboard */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Medal className="text-yellow-500" size={20} />
                                {t('dashboard.leaderboard.title')}
                            </h3>
                            <button className="text-sm text-brand-blue hover:underline">{t('dashboard.leaderboard.view_all')}</button>
                        </div>
                        <div className="space-y-4">
                            {leaderboard.map((user, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${user.rank === 15 ? 'bg-brand-blue/10 border border-brand-blue/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold w-6 text-center ${user.rank <= 3 ? 'text-yellow-500' : 'text-gray-400'}`}>#{user.rank}</span>
                                        <span className="text-xl">{user.avatar}</span>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</h4>
                                            <p className="text-xs text-gray-500">{user.points} coins</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Online Tests CTA */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-2xl text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">{t('dashboard.onlinetests.title')}</h3>
                            <p className="text-purple-100 text-sm mb-4">{t('dashboard.onlinetests.desc')}</p>
                            <button className="w-full py-2 bg-white text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors">
                                {t('dashboard.onlinetests.button')}
                            </button>
                        </div>
                        <Gamepad2 className="absolute -bottom-4 -right-4 text-white opacity-10" size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
}
