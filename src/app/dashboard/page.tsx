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

export default function DashboardPage() {
    const { t } = useLanguage();
    // import { useAuth } from "@/hooks/useAuth"; // Assuming hook exists or use context
    // For now using mock user data
    const userPoints = 1250;
    // const userRank = "Silver"; // Removed per user request

    const stats = [
        { title: "Promax Coins", value: `${userPoints}`, icon: Trophy, color: "bg-brand-orange", textColor: "text-brand-orange", trend: "+50 this week" },
        { title: "O'rtacha Mock Balli", value: "86%", icon: Target, color: "bg-brand-blue", textColor: "text-brand-blue", trend: "Top 10%" },
        { title: "Topshirilgan Mocklar", value: "12", icon: BookOpen, color: "bg-indigo-500", textColor: "text-indigo-500", trend: "Istiqbolli" },
        { title: "Keyingi Mock", value: "Yakshanba", icon: Calendar, color: "bg-green-500", textColor: "text-green-500", trend: "09:00 da" },
    ];

    const announcements = [
        { title: "Katta Mock Imtihon!", date: "Ertaga, 09:00", type: "urgent", message: "Barcha o'quvchilar pasport nusxasi bilan kelishi shart." },
        { title: "Speaking Club", date: "Shanba, 14:00", type: "info", message: "Mr. John bilan bepul speaking darsi." },
        { title: "Yangi 'Game Zone' ochildi", date: "Bugun", type: "success", message: "Tanaffusda stol tennisi o'ynashingiz mumkin." },
    ];

    const leaderboard = [
        { name: "Aziz Rahimov", points: 2400, rank: 1, avatar: "🥇" },
        { name: "Malika Karimova", points: 2150, rank: 2, avatar: "🥈" },
        { name: "Siz", points: 1250, rank: 15, avatar: "👤" },
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
                        Bugun: {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-gradient-to-r from-brand-blue to-indigo-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-brand-blue/30 flex items-center gap-2">
                        <Gamepad2 size={18} />
                        Game Zone
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
                                Muhim E'lonlar
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

                    {/* Mock Progress Chart (Keep existing placeholder logic but rename) */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Mock Exam Natijalari (Haftalik)</h3>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="w-full bg-gray-50 dark:bg-slate-800 rounded-t-lg relative group h-full flex flex-col justify-end">
                                    <motion.div
                                        className="w-full bg-brand-blue rounded-t-lg relative"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, type: "spring" }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </motion.div>
                                    <span className="text-xs text-gray-400 text-center mt-2">Week {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Leaderboard & Online Tests */}
                <div className="space-y-8">
                    {/* Leaderboard */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Medal className="text-yellow-500" size={20} />
                                Top O'quvchilar
                            </h3>
                            <button className="text-sm text-brand-blue hover:underline">View All</button>
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
                            <h3 className="font-bold text-lg mb-2">Online Testlar</h3>
                            <p className="text-purple-100 text-sm mb-4">O'z bilimingizni sinab ko'ring va coin ishlang!</p>
                            <button className="w-full py-2 bg-white text-purple-600 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors">
                                Testni boshlash
                            </button>
                        </div>
                        <Gamepad2 className="absolute -bottom-4 -right-4 text-white opacity-10" size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
}
