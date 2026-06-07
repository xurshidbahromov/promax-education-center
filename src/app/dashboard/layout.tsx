"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
    Loader2,
    BookOpen,
    GraduationCap,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    User,
    Gamepad2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";

import DashboardReveal from "@/components/ui/DashboardReveal";
import { motion } from "framer-motion";
import SidebarBetaWidget from "@/components/ui/SidebarBetaWidget";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();
    const pathname = usePathname();
    const { t } = useLanguage();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    router.push("/login");
                    return;
                }

                // Check user's role from profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile) {
                    console.error('Profile error:', profileError);
                    await supabase.auth.signOut();
                    router.push("/login");
                    return;
                }

                // Only students can access dashboard
                if (profile.role !== 'student') {
                    console.log('Non-student trying to access dashboard, redirecting to admin');
                    router.push("/admin");
                    return;
                }

                setLoading(false);
            } catch (err) {
                console.error('Auth check error:', err);
                router.push("/login");
            }
        };

        checkUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const menuItems = [
        { icon: LayoutDashboard, label: t('sidebar.dashboard'), href: "/dashboard" },
        { icon: BookOpen, label: t('sidebar.onlinetests'), href: "/dashboard/tests" },
        { icon: GraduationCap, label: t('sidebar.results'), href: "/dashboard/results" },
        { icon: Gamepad2, label: t('sidebar.games'), href: "/dashboard/games" },
        { icon: Settings, label: t('sidebar.settings'), href: "/dashboard/settings" },
    ];

    return (
        <>
            {/* Seamless Reveal & Loading Animation */}
            <DashboardReveal isLoading={loading} />

            {!loading && (
                <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex relative overflow-hidden">
                    {/* Ambient Background Orbs */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-gray-50/50 dark:bg-slate-950/50">
                        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-brand-blue/15 dark:bg-brand-blue/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }}></div>
                        <div className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-brand-orange/15 dark:bg-brand-orange/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '12s' }}></div>
                        <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
                    </div>



            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:flex flex-col sticky top-4 h-[calc(100vh-2rem)] z-50 w-64 ml-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl shadow-brand-blue/5"
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-6 border-b border-gray-200/50 dark:border-slate-800/50">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative w-12 h-8">
                                <Image
                                    src="/favicon.ico"
                                    alt="Promax Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent font-fredoka uppercase tracking-wide">
                                Promax
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden
                                        ${isActive
                                            ? "text-white shadow-lg shadow-brand-blue/20 bg-brand-blue"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 hover:text-brand-blue"
                                        }
                                    `}
                                >
                                    <item.icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Beta Widget */}
                    <SidebarBetaWidget />

                    {/* User Profile & Logout */}
                    <div className="p-4 border-t border-gray-200/50 dark:border-slate-800/50">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl w-full transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">{t('sidebar.logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
                {/* Desktop Header (Island Style) */}
                <div className="hidden lg:flex absolute top-4 right-8 z-50 justify-end pointer-events-none">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center gap-2 px-4 py-2 shadow-xl shadow-brand-blue/5 pointer-events-auto transition-all duration-300 hover:shadow-2xl hover:shadow-brand-blue/10">
                        <NotificationBell />
                        <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1" />
                        <Link href="/dashboard/profile">
                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue hover:bg-brand-blue/20 transition-colors">
                                <User size={20} />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Mobile Top Bar (Split Islands) */}
                <div className="lg:hidden absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
                    {/* Logo Island */}
                    <Link href="/dashboard" className="h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center justify-center gap-2 px-5 shadow-lg shadow-brand-blue/5 pointer-events-auto">
                        <div className="relative w-6 h-5">
                            <Image src="/favicon.ico" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="font-fredoka font-bold text-lg text-slate-800 dark:text-white uppercase tracking-wide">Promax</span>
                    </Link>
                    
                    {/* Profile/Bell Island */}
                    <div className="h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center justify-center gap-2 px-3 shadow-lg shadow-brand-blue/5 pointer-events-auto">
                        <NotificationBell />
                        <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 mx-1" />
                        <Link href="/dashboard/profile">
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                <User size={16} />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 pt-24 pb-32 lg:p-8 lg:pt-24 lg:pb-8 overflow-y-auto w-full relative z-0">
                    <div className="max-w-7xl mx-auto min-h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-800/50 z-50 px-2 py-2 safe-area-pb">
                <div className="flex items-center justify-around">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 relative ${
                                    isActive ? "text-brand-blue" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                }`}
                            >
                                {isActive && (
                                    <motion.div 
                                        layoutId="bottomNavIndicator"
                                        className="absolute inset-0 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-xl"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className="relative z-10 flex flex-col items-center gap-1">
                                    <item.icon size={22} className={isActive ? "scale-110 transition-transform" : ""} />
                                    <span className="text-[10px] font-medium tracking-tight truncate w-full text-center px-1">
                                        {item.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
        )}
        </>
    );
}
