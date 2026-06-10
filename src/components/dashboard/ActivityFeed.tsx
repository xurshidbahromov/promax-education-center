"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useActivityFeed } from "@/hooks/useDashboardData";
import { Clock, CheckCircle2 } from "lucide-react";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import { memo } from "react";

const ActivityItem = memo(({ item }: { item: any }) => {
 const { t } = useLanguage();
 return (
 <div className="flex gap-4 items-start p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 dark:hover:bg-slate-800/70 border border-white/40 dark:border-slate-700/40 hover:border-white/80 dark:hover:border-slate-600/60 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1">
 <div className="mt-1 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full text-green-600 dark:text-green-400 shadow-sm group-hover:scale-110 transition-transform">
 <CheckCircle2 size={16} />
 </div>
 <div>
 <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-brand-orange transition-colors">{item.title}</h4>
 <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-1">
 {t('dashboard.activity.scored')}: <span className="font-medium text-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20 px-1.5 py-0.5 rounded-md ml-1">{item.score}/{item.maxScore}</span>
 </p>
 <span className="text-[10px] font-medium text-gray-500 mt-2 block uppercase tracking-wider">
 {new Date(item.date).toLocaleDateString(t('locale') === 'uz' ? 'uz-UZ' : t('locale') === 'ru' ? 'ru-RU' : 'en-US', {
 day: 'numeric',
 month: 'short',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </span>
 </div>
 </div>
 );
});
ActivityItem.displayName = 'ActivityItem';

export default function ActivityFeed({ userId }: { userId?: string }) {
 const { t } = useLanguage();
 const { data: activityFeed, isLoading } = useActivityFeed(userId);

 return (
 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/60 dark:border-slate-800/60 shadow-lg relative overflow-hidden h-full flex flex-col group">
 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-orange/10 rounded-full blur-[60px] -z-10 pointer-events-none transition-transform duration-700 group-hover:scale-125"></div>
 
 <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2 font-fredoka tracking-wide relative z-10">
 <Clock className="text-brand-orange " size={24} />
 {t('dashboard.activity.title')}
 </h3>
 
 <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
 {isLoading ? (
 [...Array(3)].map((_, i) => <ListItemSkeleton key={i} />)
 ) : (activityFeed?.length || 0) === 0 ? (
 <div className="flex-1 flex items-center justify-center min-h-[150px]">
 <p className="text-sm font-medium text-gray-500 text-center">{t('dashboard.activity.empty')}</p>
 </div>
 ) : (
 activityFeed?.map((item, i) => (
 <ActivityItem key={i} item={item} />
 ))
 )}
 </div>
 </div>
 );
}
