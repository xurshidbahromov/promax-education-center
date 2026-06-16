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
  <div className="grid grid-cols-2 gap-3 sm:gap-6">
  {[...Array(4)].map((_, i) => (
  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="relative group h-full">
  <StatsSkeleton />
  </motion.div>
  ))}
  </div>
  );
  }

  return (
  <div className="grid grid-cols-2 gap-4 sm:gap-6">
  {stats.map((stat, index) => (
  <motion.div
  key={index}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
  className="relative group h-full"
  >
  <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/5 blur-xl transition-all duration-500 rounded-[1.5rem]" />

  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 sm:p-6 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-brand-blue/30 dark:hover:border-brand-blue/30 hover:-translate-y-1 transition-all duration-300 relative z-10 overflow-hidden h-full flex flex-col justify-between group">
  <div className="relative z-10">
  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-bold tracking-wider uppercase mb-3">{stat.title}</p>
  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 dark:text-white mb-1 font-fredoka truncate tracking-wide">
  {stat.isString ? stat.value : <AnimatedCounter value={stat.value as number} />}
  </h3>
  </div>

  <div className="relative z-10 mt-4 pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
  <p className={`text-[10px] sm:text-xs font-bold flex items-center gap-1.5 truncate ${stat.textColor === "text-brand-orange" ? "text-brand-orange" : "text-green-500"}`}>
  <TrendingUp size={14} className="hidden sm:block" /> <span className="truncate">{stat.trend}</span>
  </p>
  </div>

  {/* Luxury Watermark Icon */}
  <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.03] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500 text-slate-900 dark:text-white">
  <stat.icon size={120} strokeWidth={1} />
  </div>
  </div>
  </motion.div>
  ))}
  </div>
 );
}
