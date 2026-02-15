"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Info, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "@/lib/supabase-queries";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { uz, enUS, ru } from "date-fns/locale";
import Link from "next/link";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t, language } = useLanguage();
    const supabase = createClient();

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const data = await getNotifications(20);
        setNotifications(data as Notification[]);
        setLoading(false);
    };

    const fetchUnreadCount = async () => {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
    };

    useEffect(() => {
        fetchUnreadCount();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${(async () => (await supabase.auth.getUser()).data.user?.id)()}` // This is tricky in realtime, usually handled by filtering on client or secure channel
                },
                (payload) => {
                    // Simple refresh on any change for now
                    fetchUnreadCount();
                    if (isOpen) fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, isOpen]);

    // Fetch list when opening dropdown
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle size={18} className="text-green-500" />;
            case "warning": return <AlertCircle size={18} className="text-yellow-500" />;
            case "error": return <XCircle size={18} className="text-red-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    const getDateLocale = () => {
        switch (language) {
            case 'UZ': return uz;
            case 'RU': return ru;
            default: return enUS;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Xabarlar</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-brand-blue hover:text-blue-600 font-medium flex items-center gap-1"
                            >
                                <Check size={14} />
                                Barchasini o'qish
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400">
                                <div className="animate-spin w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full mx-auto mb-2"></div>
                                Yuklanmoqda...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Yangi xabarlar yo'q</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className={`text-sm font-semibold truncate ${!notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="text-gray-400 hover:text-brand-blue"
                                                            title="O'qildi deb belgilash"
                                                        >
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full block"></span>
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: getDateLocale() })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
