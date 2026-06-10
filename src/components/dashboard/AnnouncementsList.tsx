"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useAnnouncements } from "@/hooks/useDashboardData";
import { Megaphone, Clock } from "lucide-react";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import { memo } from "react";

const AnnouncementItem = memo(({ item }: { item: any }) => {
 const { t } = useLanguage();
 return (
 <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md hover:bg-white/60 dark:hover:bg-slate-800/60 p-4 rounded-2xl border border-white/50 dark:border-slate-700/50 flex gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
 <div className={`w-1.5 h-full rounded-full shadow-sm ${item.type === 'error' ? 'bg-red-500 shadow-red-500/50' : item.type === 'warning' ? 'bg-yellow-500 shadow-yellow-500/50' : item.type === 'success' ? 'bg-green-500 shadow-green-500/50' : 'bg-brand-blue shadow-brand-blue/50'}`}></div>
 <div>
 <h4 className="font-medium text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors">{item.title}</h4>
 <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium leading-snug">{item.message}</p>
 <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1 font-semibold">
 <Clock size={12} /> {new Date(item.created_at).toLocaleDateString(t('locale') === 'uz' ? 'uz-UZ' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
 </p>
 </div>
 </div>
 );
});
AnnouncementItem.displayName = 'AnnouncementItem';

export default function AnnouncementsList() {
 const { t } = useLanguage();
 const { data: announcements, isLoading } = useAnnouncements();

 return (
 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-white/60 dark:border-slate-800/60 shadow-lg relative overflow-hidden h-full flex flex-col group">
 <div className="absolute top-0 right-0 w-40 h-40 bg-brand-blue/10 rounded-full blur-[60px] -z-10 pointer-events-none transition-all duration-700 group-hover:scale-150"></div>
 
 <div className="flex items-center justify-between mb-6 relative z-10">
 <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2 font-fredoka tracking-wide ">
 <Megaphone className="text-brand-blue " size={24} />
 {t('dashboard.announcements.title')}
 </h3>
 </div>
 
 <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
 {isLoading ? (
 [...Array(3)].map((_, i) => <ListItemSkeleton key={i} />)
 ) : (announcements?.length || 0) === 0 ? (
 <div className="flex-1 flex items-center justify-center min-h-[150px]">
 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium text-center">
 {t('dashboard.announcements.empty') || "E'lonlar yo'q"}
 </p>
 </div>
 ) : (
 announcements?.map((item, i) => (
 <AnnouncementItem key={item.id || i} item={item} />
 ))
 )}
 </div>
 </div>
 );
}
