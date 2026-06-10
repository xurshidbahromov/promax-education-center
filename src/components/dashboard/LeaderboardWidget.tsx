"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useLeaderboard, useUserRank } from "@/hooks/useDashboardData";
import { Crown } from "lucide-react";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import AnimatedCounter from "./AnimatedCounter";

export default function LeaderboardWidget({ userId }: { userId?: string }) {
 const { t } = useLanguage();
 const { data: leaderboard, isLoading } = useLeaderboard();
 const { data: userRank } = useUserRank(userId);

 return (
 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/60 dark:border-slate-800/60 shadow-lg flex-1 flex flex-col min-h-[300px] relative overflow-hidden h-full group">
 <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-400/10 rounded-full blur-[70px] pointer-events-none -z-10 transition-transform duration-700 group-hover:scale-125"></div>
 
 <div className="flex items-center justify-between mb-6 relative z-10">
 <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 font-fredoka tracking-wide ">
 <Crown className="text-yellow-500 " size={26} />
 {t('dashboard.leaderboard.title')}
 </h3>
 </div>

 <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2 mb-3 relative z-10">
 {isLoading ? (
 [...Array(4)].map((_, i) => <ListItemSkeleton key={i} />)
 ) : (
 leaderboard?.map((user: any, i: number) => {
 const isCurrentUser = user.id === userId;
 return (
 <div key={i} className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 border ${
 isCurrentUser 
 ? 'bg-brand-blue/10 border-brand-blue/30 shadow-lg shadow-brand-blue/5' 
 : 'bg-white/40 dark:bg-slate-800/40 border-white/50 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:-translate-y-1 hover:shadow-lg'
 }`}>
 <div className="flex items-center gap-4">
 <span className={`font-semibold w-6 text-center text-lg ${
 user.rank === 1 ? 'text-yellow-500 scale-110' : 
 user.rank === 2 ? 'text-slate-400 scale-105' : 
 user.rank === 3 ? 'text-amber-600 scale-105' : 
 'text-gray-400 dark:text-gray-500'
 }`}>
 #{user.rank}
 </span>
 <div className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-xl border border-white/60 dark:border-slate-700">
 {user.avatar}
 </div>
 <div>
 <h4 className="font-medium text-slate-800 dark:text-slate-100 text-sm">
 {user.name} {isCurrentUser && <span className="text-brand-blue ml-1 ">({t('dashboard.leaderboard.you')})</span>}
 </h4>
 <p className="text-xs font-medium text-brand-orange mt-0.5 flex items-center gap-1">
 <AnimatedCounter value={user.points} duration={1.5} /> coins
 </p>
 </div>
 </div>
 </div>
 )
 })
 )}
 </div>

 {/* Sticky User Rank at Bottom */}
 {userRank && (
 <div className="pt-4 mt-auto border-t border-white/40 dark:border-slate-800/50 relative z-10">
 <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-brand-blue/10 to-transparent border border-brand-blue/30 backdrop-blur-md shadow-xl shadow-brand-blue/10 hover:shadow-brand-blue/20 transition-all duration-300">
 <div className="flex items-center gap-4">
 <span className="font-semibold w-6 text-center text-xl text-brand-blue ">#{userRank.rank}</span>
 <div className="w-11 h-11 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md flex items-center justify-center text-2xl border border-brand-blue/30">
 {userRank.avatar}
 </div>
 <div>
 <h4 className="font-medium text-slate-800 dark:text-slate-100 text-sm">
 {userRank.name} <span className="text-brand-blue ml-1">({t('dashboard.leaderboard.you')})</span>
 </h4>
 <p className="text-sm font-semibold text-brand-orange mt-0.5 ">
 <AnimatedCounter value={userRank.points} duration={1} /> coins
 </p>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
