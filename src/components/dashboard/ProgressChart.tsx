"use client";

import { useChartData } from "@/hooks/useDashboardData";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { motion } from "framer-motion";
import Link from "next/link";
import { BarChart3 } from "lucide-react";

export default function ProgressChart({ userId }: { userId?: string }) {
  const { data: chartData = [], isLoading } = useChartData(userId);

  return (
    <div className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl p-5 sm:p-6 rounded-[24px] border border-white/70 dark:border-slate-800/70 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-fredoka leading-tight">
            So&apos;nggi natijalar dinamikasi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Oxirgi {chartData.length || 6} ta test bo&apos;yicha foiz ko&apos;rsatkichi
          </p>
        </div>
        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
          0 – 100%
        </span>
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : chartData.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <BarChart3 size={22} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Hozircha grafik uchun natijalar yo&apos;q
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Birinchi online testni yeching va o&apos;sish dinamikangizni shu yerda kuzating.
            </p>
          </div>
          <Link
            href="/dashboard/tests"
            className="mt-1 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
          >
            Test yechish
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bar Chart Area */}
          <div className="relative h-48 pt-6 pb-1 px-1">
            {/* Subtle Horizontal Guides */}
            <div className="absolute inset-x-0 top-6 bottom-1 flex flex-col justify-between pointer-events-none">
              {[100, 50, 0].map((mark) => (
                <div
                  key={mark}
                  className="border-t border-dashed border-slate-200/80 dark:border-slate-800 w-full"
                />
              ))}
            </div>

            <div className="relative z-10 h-full flex items-end justify-around gap-2 sm:gap-4">
              {chartData.map((item, i) => {
                const pct = Math.min(
                  100,
                  Math.max(
                    0,
                    typeof item.percentage === "number"
                      ? item.percentage
                      : Math.round((Number(item.score || 0) / 100) * 100)
                  )
                );
                const barColor =
                  pct >= 80
                    ? "from-emerald-500 to-emerald-400"
                    : pct >= 55
                    ? "from-brand-blue to-blue-400"
                    : "from-amber-500 to-amber-400";

                return (
                  <div
                    key={`${item.date}-${i}`}
                    title={`${item.examTitle}: ${item.score}/${item.maxScore} (${pct}%)`}
                    className="flex-1 max-w-[44px] h-full flex flex-col items-center justify-end gap-1.5"
                  >
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 tabular-nums">
                      {pct}%
                    </span>
                    <div className="w-full flex-1 bg-slate-100/90 dark:bg-slate-800/70 rounded-full flex items-end overflow-hidden p-0.5">
                      <motion.div
                        className={`w-full bg-gradient-to-t ${barColor} rounded-full`}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct, 6)}%` }}
                        transition={{
                          duration: 0.65,
                          ease: [0.16, 1, 0.3, 1],
                          delay: i * 0.06,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dates & Titles Row */}
          <div className="flex items-start justify-around gap-2 sm:gap-4 px-1">
            {chartData.map((item, i) => (
              <div
                key={`lbl-${item.date}-${i}`}
                className="flex-1 max-w-[56px] text-center"
              >
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums block">
                  {item.date}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
                  {item.examTitle}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
