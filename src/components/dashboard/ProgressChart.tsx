"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useChartData } from "@/hooks/useDashboardData";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";

export default function ProgressChart({ userId }: { userId?: string }) {
 const { t } = useLanguage();
 const { data: chartData, isLoading } = useChartData(userId);

 return (
  <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-5 sm:p-7 rounded-[1.5rem] border border-white/60 dark:border-slate-700/50 shadow-sm hover:shadow-md flex-1 flex flex-col relative overflow-hidden h-full min-h-[320px] transition-all duration-300">
  <h3 className="text-[18px] font-bold text-slate-800 dark:text-white mb-8 font-fredoka tracking-wide relative z-10 flex items-center justify-between">
  <span>{t('dashboard.chart.title')}</span>
  <span className="text-[11px] text-brand-blue font-bold bg-brand-blue/10 dark:bg-brand-blue/20 px-3 py-1.5 rounded-full border border-brand-blue/20 uppercase tracking-widest">{t('dashboard.chart.monthly') === 'dashboard.chart.monthly' ? "Oylik" : t('dashboard.chart.monthly')}</span>
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
  <div key={i} className="flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full relative group/bar h-full flex flex-col justify-end border border-gray-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-colors mx-1 max-w-[40px] overflow-visible">
  <motion.div
  className="w-full bg-gradient-to-t from-brand-blue to-blue-400 rounded-full relative shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover/bar:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-shadow"
  initial={{ height: 0 }}
  animate={{ height: `${percentage}%` }}
  transition={{ duration: 1.5, type: "spring", bounce: 0.3, delay: i * 0.1 }}
  >
  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 backdrop-blur-md text-slate-800 dark:text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg transform translate-y-2 group-hover/bar:translate-y-0 z-20">
  {result.score} <span className="text-slate-500 dark:text-slate-400 font-medium">/ 189</span>
  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-b border-r border-gray-200 dark:border-slate-700 rotate-45"></div>
  </div>
  </motion.div>
  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
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
