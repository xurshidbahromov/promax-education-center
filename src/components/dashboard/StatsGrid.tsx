"use client";

import { useDashboardStats } from "@/hooks/useDashboardData";
import { Coins, Target, FileCheck, Award } from "lucide-react";
import { StatsSkeleton } from "@/components/ui/Skeleton";
import AnimatedCounter from "./AnimatedCounter";

export default function StatsGrid({ userId }: { userId?: string }) {
  const { data: dashboardStats, isLoading: statsLoading } =
    useDashboardStats(userId);

  const stats = [
    {
      title: "Tangalar",
      value: dashboardStats?.totalCoins || 0,
      suffix: "",
      icon: Coins,
      iconStyle: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "O'rtacha natija",
      value: dashboardStats?.averageScore || 0,
      suffix: "%",
      icon: Target,
      iconStyle: "bg-brand-blue/10 text-brand-blue dark:text-blue-400",
    },
    {
      title: "Yechilgan testlar",
      value: dashboardStats?.totalTests || 0,
      suffix: "",
      icon: FileCheck,
      iconStyle: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
    },
    {
      title: "Eng yuqori natija",
      value: dashboardStats?.bestScore || 0,
      suffix: "%",
      icon: Award,
      iconStyle: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
    },
  ];

  if (statsLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <StatsSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl p-4 sm:p-5 rounded-[24px] border border-white/70 dark:border-slate-800/70 flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
                {stat.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.iconStyle}`}
              >
                <Icon size={17} strokeWidth={2.2} />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-fredoka tabular-nums leading-none">
              <AnimatedCounter value={stat.value} />
              {stat.suffix && (
                <span className="text-lg sm:text-xl font-bold text-slate-400 ml-0.5">
                  {stat.suffix}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
