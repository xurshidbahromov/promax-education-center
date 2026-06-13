"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useChartData } from "@/hooks/useDashboardData";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";

export default function ProgressChart({ userId }: { userId?: string }) {
 const { t } = useLanguage();
 const { data: chartData, isLoading } = useChartData(userId);

 return (
 <div className="bg-black/5 dark:bg-white/5 backdrop-blur-xl p-5 sm:p-7 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-lg flex-1 flex flex-col relative overflow-hidden h-full min-h-[320px] group hover:bg-black/10 dark:hover:bg-white/10 hover:border-yellow-500/20 transition-colors duration-500">
 <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/5 blur-2xl transition-all duration-700 pointer-events-none -z-10"></div>
 <h3 className="text-xl font-medium text-slate-800 dark:text-white mb-8 font-fredoka tracking-wide relative z-10 flex items-center justify-between">
 <span>{t('dashboard.chart.title')}</span>
 <span className="text-xs text-yellow-600 dark:text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">{t('dashboard.chart.monthly') === 'dashboard.chart.monthly' ? "Oylik" : t('dashboard.chart.monthly')}</span>
 </h3>
 
 {isLoading ? (
 <ChartSkeleton />
 ) : (chartData?.length || 0) === 0 ? (
 <div className="flex-1 flex items-center justify-center">
 <p className="text-gray-400 font-medium">{t('dashboard.no_results')}</p>
 </div>
 ) : (
 <div className="flex-1 w-full flex items-end justify-between gap-2 sm:gap-4 relative z-10">
 {chartData?.map((result, i) => {
 const percentage = Math.round((result.score / 189) * 100);
 return (
 <div key={i} className="flex-1 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full relative group/bar h-full flex flex-col justify-end border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors mx-1 max-w-[40px] overflow-visible">
 <motion.div
 className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-full relative shadow-[0_0_15px_rgba(234,179,8,0.3)] group-hover/bar:shadow-[0_0_25px_rgba(234,179,8,0.6)] transition-shadow"
 initial={{ height: 0 }}
 animate={{ height: `${percentage}%` }}
 transition={{ duration: 1.5, type: "spring", bounce: 0.3, delay: i * 0.1 }}
 >
 <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 backdrop-blur-md text-slate-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 whitespace-nowrap shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] transform translate-y-2 group-hover/bar:translate-y-0 z-20">
 {result.score} <span className="text-slate-500 dark:text-zinc-500 font-normal">/ 189</span>
 <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-900 border-b border-r border-slate-200 dark:border-white/10 rotate-45"></div>
 </div>
 </motion.div>
 <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-medium text-zinc-500 whitespace-nowrap">
 {result.date.split(' ')[0]}
 </span>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
