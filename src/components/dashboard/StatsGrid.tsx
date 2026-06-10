"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDashboardStats } from "@/hooks/useDashboardData";
import { motion } from "framer-motion";
import { Trophy, Target, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { StatsSkeleton } from "@/components/ui/Skeleton";
import AnimatedCounter from "./AnimatedCounter";

export default function StatsGrid({ userId }: { userId?: string }) {
 const { t } = useLanguage();
 const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats(userId);

 const stats = [
 {
 title: t('dashboard.stats.coins'),
 value: dashboardStats?.totalCoins || 0,
 icon: Trophy,
 color: "bg-brand-orange",
 textColor: "text-brand-orange",
 trend: statsLoading ? "" : `+${Math.floor((dashboardStats?.totalCoins || 0) / 10)} ${t('dashboard.stats.coins.trend')}`
 },
 {
 title: t('dashboard.stats.average_score'),
 value: dashboardStats?.averageScore || 0,
 icon: Target,
 color: "bg-brand-blue",
 textColor: "text-brand-blue",
 trend: statsLoading ? "" : t('dashboard.stats.average_score.trend')
 },
 {
 title: t('dashboard.stats.exams_count'),
 value: dashboardStats?.totalTests || 0,
 icon: BookOpen,
 color: "bg-indigo-500",
 textColor: "text-indigo-500",
 trend: statsLoading ? "" : t('dashboard.stats.exams_count.trend')
 },
 {
 title: t('dashboard.stats.next_exam'),
 value: t('dashboard.stats.next_exam.value'),
 icon: Calendar,
 color: "bg-green-500",
 textColor: "text-green-500",
 trend: t('dashboard.stats.next_exam.trend'),
 isString: true
 },
 ];

 if (statsLoading) {
 return (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
 {[...Array(4)].map((_, i) => (
 <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative group h-full">
 <StatsSkeleton />
 </motion.div>
 ))}
 </div>
 );
 }

 return (
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
 {stats.map((stat, index) => (
 <motion.div
 key={index}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.1 }}
 className="relative group h-full"
 >
 <div className={`absolute inset-0 bg-gradient-to-r ${stat.color.replace('bg-', 'from-')} to-transparent opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500 rounded-3xl`} />

 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/60 dark:border-slate-800/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative z-10 overflow-hidden h-full flex flex-col justify-between group-hover:border-white/80 dark:group-hover:border-slate-700/80">
 <div className="relative z-10">
 <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-semibold tracking-wide">{stat.title}</p>
 <h3 className="text-2xl sm:text-4xl font-medium text-slate-800 dark:text-slate-100 mt-2 mb-1 font-fredoka truncate ">
 {stat.isString ? stat.value : <AnimatedCounter value={stat.value as number} />}
 </h3>
 </div>

 <div className="relative z-10">
 <p className={`text-[10px] sm:text-xs font-medium flex items-center gap-1 truncate mt-2 ${stat.textColor}`}>
 <TrendingUp size={12} className="hidden sm:block" /> <span className="truncate">{stat.trend}</span>
 </p>
 </div>

 {/* Watermark Icon */}
 <div className={`absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 ${stat.textColor}`}>
 <stat.icon size={100} />
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 );
}
