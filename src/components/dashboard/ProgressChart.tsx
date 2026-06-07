"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useChartData } from "@/hooks/useDashboardData";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";

export default function ProgressChart({ userId }: { userId?: string }) {
    const { t } = useLanguage();
    const { data: chartData, isLoading } = useChartData(userId);

    return (
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/60 dark:border-slate-800/60 shadow-lg flex-1 flex flex-col relative overflow-hidden h-full min-h-[280px] group">
            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-brand-blue/10 to-transparent pointer-events-none -z-10 transition-opacity duration-700 group-hover:opacity-70"></div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-fredoka tracking-wide relative z-10 drop-shadow-sm">
                {t('dashboard.chart.title')}
            </h3>
            
            {isLoading ? (
                <ChartSkeleton />
            ) : (chartData?.length || 0) === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400 font-medium">{t('dashboard.no_results')}</p>
                </div>
            ) : (
                <div className="flex-1 w-full flex items-end justify-between gap-3 relative z-10">
                    {chartData?.map((result, i) => {
                        const percentage = Math.round((result.score / 189) * 100);
                        return (
                            <div key={i} className="w-full bg-white/30 dark:bg-slate-800/50 backdrop-blur-sm rounded-t-xl relative group/bar h-full flex flex-col justify-end border border-white/40 dark:border-slate-700/40 border-b-0 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors">
                                <motion.div
                                    className="w-full bg-gradient-to-t from-brand-blue to-brand-blue/70 rounded-t-xl relative shadow-[0_0_15px_rgba(0,86,210,0.2)] group-hover/bar:shadow-[0_0_20px_rgba(0,86,210,0.4)] transition-shadow"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${percentage}%` }}
                                    transition={{ duration: 1.5, type: "spring", bounce: 0.4, delay: i * 0.1 }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900/90 dark:bg-white/90 backdrop-blur text-white dark:text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl transform translate-y-2 group-hover/bar:translate-y-0 z-20">
                                        {result.score} / 189
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/90 dark:bg-white/90 rotate-45"></div>
                                    </div>
                                </motion.div>
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 text-center mt-3 truncate px-1 pb-1">
                                    {result.date}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
