"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Info, AlertCircle, CheckCircle, XCircle, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
 getNotifications,
 getUnreadNotificationCount,
 markNotificationAsRead,
 markAllNotificationsAsRead,
 getAnnouncements
} from "@/lib/supabase-queries";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { uz, enUS, ru } from "date-fns/locale";
import toast from "react-hot-toast";
import { soundFx } from "@/lib/sound-effects";

interface Notification {
 id: string;
 title: string;
 message: string;
 type: 'info' | 'success' | 'warning' | 'error';
 is_read: boolean;
 created_at: string;
 is_announcement?: boolean;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const userIdRef = useRef<string | undefined>(undefined);
  const { language } = useLanguage();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const fetchNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const [notifsData, announcementsData] = await Promise.all([
      getNotifications(20, userIdRef.current),
      getAnnouncements(10)
    ]);

    // Only include announcements that are intended for the bell (not cabinet banners)
    const mappedAnnouncements: Notification[] = (announcementsData || [])
      .filter((a: any) => !a.is_featured)
      .map((a: any) => ({
        id: `announcement-${a.id}`,
        title: a.title,
        message: a.message,
        type: a.type || 'info',
        is_read: true, // Announcements don't have read status per user in DB
        created_at: a.created_at,
        is_announcement: true
      }));

    const combined = [...(notifsData as Notification[]), ...mappedAnnouncements].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setNotifications(combined);
    if (showLoading) setLoading(false);
  };

  const fetchUnreadCount = async (uid?: string) => {
    const count = await getUnreadNotificationCount(uid || userIdRef.current);
    setUnreadCount(count);
  };

  useEffect(() => {
    let activeChannel: any = null;
    let isMounted = true;

    async function initRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;
      userIdRef.current = user.id;

      await fetchUnreadCount(user.id);
      if (!isMounted) return;

      activeChannel = supabase
        .channel(`user_notifications_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload: any) => {
            fetchUnreadCount(user.id);
            if (payload?.new?.type === 'coin_credit') {
              soundFx.playCoin();
              window.dispatchEvent(new CustomEvent('promax_coins_updated'));
            } else {
              soundFx.playNotification();
            }
            if (isOpenRef.current) {
              fetchNotifications(false);
            } else if (payload?.new?.title) {
              toast(payload.new.title, { duration: 4000 });
            }
          }
        )
        .subscribe();
    }

    initRealtime();

    return () => {
      isMounted = false;
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [supabase]);

 // Fetch list when opening dropdown
 useEffect(() => {
 if (isOpen) {
 fetchNotifications(notifications.length === 0);
 }
 }, [isOpen]);

 const pendingReadIdsRef = useRef<Set<string>>(new Set());

 const handleMarkAsRead = async (id: string) => {
   if (id.startsWith('announcement-') || pendingReadIdsRef.current.has(id)) return;
   const target = notifications.find((n) => n.id === id);
   if (!target || target.is_read) return;

   pendingReadIdsRef.current.add(id);
   // Optimistic update immediately to prevent double-decrement on rapid clicks
   setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
   setUnreadCount(prev => Math.max(0, prev - 1));
   try {
     await markNotificationAsRead(id);
   } finally {
     pendingReadIdsRef.current.delete(id);
   }
 };

 const handleMarkAllRead = async () => {
 await markAllNotificationsAsRead();
 setNotifications(prev => prev.map(n => n.is_announcement ? n : { ...n, is_read: true }));
 setUnreadCount(0);
 };

 const getIconTile = (type: string) => {
   switch (type) {
     case "success":
       return (
         <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
           <CheckCircle size={16} />
         </div>
       );
     case "warning":
       return (
         <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
           <AlertCircle size={16} />
         </div>
       );
     case "error":
       return (
         <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
           <XCircle size={16} />
         </div>
       );
     default:
       return (
         <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
           <Info size={16} />
         </div>
       );
   }
 };

 const getDateLocale = () => {
   switch (language) {
     case 'UZ': return uz;
     case 'RU': return ru;
     default: return enUS;
   }
 };

  const notificationSheet = (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.98 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900 border-t border-x sm:border border-slate-200/80 dark:border-slate-800 rounded-t-[32px] sm:rounded-[32px] max-w-md w-full shadow-2xl relative flex flex-col max-h-[82vh] overflow-hidden text-left text-slate-800 dark:text-white"
          >
            {/* Sticky Header (Shop / Streak style) */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base font-fredoka leading-tight truncate">
                      Xabarlar
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {unreadCount > 0 ? `${unreadCount} ta o'qilmagan xabar` : "Barcha xabarlar o'qilgan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check size={13} strokeWidth={2.5} />
                      <span>O&apos;qildi</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Yopish"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 custom-scrollbar">
              {loading ? (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex gap-3 animate-pulse">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2 py-0.5">
                        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 px-4 text-center flex flex-col items-center gap-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Bell size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Yangi xabarlar yo&apos;q
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Muhim yangiliklar va mukofotlar shu yerda ko&apos;rinadi
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((notification) => {
                  const isUnread = !notification.is_read && !notification.is_announcement;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => { if (isUnread) handleMarkAsRead(notification.id); }}
                      className={`p-3.5 rounded-2xl border transition-colors ${
                        isUnread
                          ? "bg-amber-50/70 dark:bg-amber-500/10 border-amber-200/70 dark:border-amber-500/20 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/15"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50"
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        {getIconTile(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-xs sm:text-[13px] font-bold leading-snug ${isUnread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>
                              {notification.title}
                            </h4>
                            {isUnread && (
                              <span
                                className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"
                                title="O'qilmagan"
                              />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-3">
                            {notification.message}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-2">
                            {(() => {
                              const dt = notification.created_at ? new Date(notification.created_at) : null;
                              if (!dt || Number.isNaN(dt.getTime())) return "Hozirgina";
                              return formatDistanceToNow(dt, { addSuffix: true, locale: getDateLocale() });
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full relative transition-colors active:scale-95 flex items-center justify-center cursor-pointer shrink-0 ${
          unreadCount > 0
            ? "bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400"
            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
        }`}
        aria-label="Xabarlar"
      >
        <Bell size={16} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-amber-500 text-white text-[9px] font-extrabold rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center tabular-nums leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {mounted && createPortal(notificationSheet, document.body)}
    </div>
  );
}
