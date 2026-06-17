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
 Gamepad2,
 PlayCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";

import DashboardReveal from "@/components/ui/DashboardReveal";
import { motion } from "framer-motion";
import SidebarBetaWidget from "@/components/ui/SidebarBetaWidget";
import { Background } from "@/components/Background";

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
 { icon: PlayCircle, label: "Darslar", href: "/dashboard/lessons" },
 { icon: BookOpen, label: t('sidebar.onlinetests'), href: "/dashboard/tests" },
 { icon: GraduationCap, label: t('sidebar.results'), href: "/dashboard/results" },
 { icon: Gamepad2, label: t('sidebar.games'), href: "/dashboard/games" },
 { icon: User, label: t('sidebar.profile'), href: "/dashboard/profile" },
 ];

 const isTakeTestPage = pathname.includes('/take');

 return (
 <>
 {/* Seamless Reveal & Loading Animation */}
 <DashboardReveal isLoading={loading} />

 {!loading && (
 <div className="min-h-screen bg-transparent flex relative overflow-hidden">
 {/* Landing Page Background */}
 <Background />

 {/* Desktop Sidebar */}
 {!isTakeTestPage && (
 <aside
 className="hidden lg:flex flex-col sticky top-4 h-[calc(100vh-2rem)] z-50 w-64 ml-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl shadow-brand-blue/5"
 >
 <div className="h-full flex flex-col">
 {/* Logo */}
 <div className="h-20 flex items-center px-6 border-b border-gray-200/50 dark:border-slate-800/50">
 <Link href="/" className="flex items-center gap-3">
 <div className="relative w-10 h-10 flex-shrink-0">
 <Image
 src="/favicon.ico"
 alt="Promax Logo"
 fill
 className="object-contain"
 />
 </div>
 <div className="flex flex-col">
 <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-sans-pro uppercase tracking-wider leading-none">
 Promax
 </span>
 <span className="text-[9px] font-semibold text-brand-orange dark:text-brand-orange tracking-[0.35em] uppercase leading-none mt-1.5 pl-[1px]">
 Education
 </span>
 </div>
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
 )}

 {/* Main Content */}
 <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
 {/* Desktop Header (Island Style) */}
 {!isTakeTestPage && (
 <div className="hidden lg:flex absolute top-4 right-8 z-50 justify-end pointer-events-none">
 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center gap-2 px-4 py-2 shadow-xl shadow-brand-blue/5 pointer-events-auto transition-all duration-300 hover:shadow-2xl hover:shadow-brand-blue/10">
 <NotificationBell />
 </div>
 </div>
 )}

 {/* Mobile Top Bar (Split Islands) */}
 {!isTakeTestPage && (
 <div className="lg:hidden absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
 {/* Logo Island */}
 <Link href="/dashboard" className="h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center justify-center gap-2.5 px-5 shadow-lg shadow-brand-blue/5 pointer-events-auto">
 <div className="relative w-6 h-5 flex-shrink-0">
 <Image src="/favicon.ico" alt="Logo" fill className="object-contain" />
 </div>
 <div className="flex flex-col">
 <span className="font-sans-pro font-black text-base text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-none">
 Promax
 </span>
 <span className="text-[7px] font-semibold text-brand-orange dark:text-brand-orange tracking-[0.25em] uppercase leading-none mt-0.5 pl-[0.5px]">
 Education
 </span>
 </div>
 </Link>
 
 {/* Bell Island */}
 <div className="h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center justify-center px-3 shadow-lg shadow-brand-blue/5 pointer-events-auto">
 <NotificationBell />
 </div>
 </div>
 )}

 {/* Page Content */}
 <main className={`flex-1 overflow-y-auto w-full relative z-0 ${isTakeTestPage ? '' : 'p-4 pt-24 pb-32 lg:p-8 lg:pt-24 lg:pb-8'}`}>
 <div className={`w-full max-w-full mx-auto min-h-full ${isTakeTestPage ? 'pt-safe' : ''}`}>
 {children}
 </div>
 </main>
 </div>

 {/* Mobile Bottom Navigation */}
 {!isTakeTestPage && (
 <div className="lg:hidden fixed bottom-3 left-4 right-4 z-50 flex justify-center pointer-events-none">
 <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-white/70 dark:border-slate-700/60 px-2 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,86,210,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] w-full max-w-md pointer-events-auto safe-area-pb">
 <div className="flex items-center justify-between gap-1">
 {menuItems.map((item) => {
 const isActive = pathname === item.href;
 return (
 <Link
 key={item.href}
 href={item.href}
 className={`flex items-center justify-center flex-1 h-12 rounded-full transition-transform active:scale-90 ${
 isActive ? "text-brand-blue" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
 }`}
 >
 <div className="relative z-10 flex items-center justify-center">
 <item.icon size={24} className={isActive ? "stroke-[2.5px] fill-current" : "stroke-[2px]"} />
 </div>
 </Link>
 );
 })}
 </div>
 </nav>
 </div>
 )}
 </div>
 )}
 </>
 );
}
