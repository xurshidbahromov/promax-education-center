"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard,
  LibraryBig,
  FileCheck,
  TrendingUp,
  Gamepad2,
  CircleUserRound,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  BellRing
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

  // Students, teachers, and staff can all access the dashboard
  // Only redirect to admin if they are ONLY admin (not student/teacher using dashboard)
  if (profile.role === 'admin') {
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
    { name: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.lessons') || 'Darslar', href: '/dashboard/lessons', icon: LibraryBig },
    { name: t('sidebar.onlinetests'), href: '/dashboard/tests', icon: FileCheck },
    { name: t('sidebar.results'), href: '/dashboard/results', icon: TrendingUp },
    { name: t('sidebar.games'), href: '/dashboard/games', icon: Gamepad2, beta: true },
    { name: t('sidebar.shop') || 'Do\'kon', href: '/dashboard/shop', icon: ShoppingBag },
    { name: t('sidebar.profile'), href: '/dashboard/profile', icon: CircleUserRound },
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
 flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] transition-all duration-300 group relative overflow-hidden
 ${isActive
 ? "text-brand-blue bg-brand-blue/10 dark:bg-brand-blue/20 shadow-sm border border-brand-blue/20"
 : "text-slate-500 dark:text-slate-400 active:bg-slate-100/60 dark:active:bg-slate-800/60 active:text-slate-800 dark:active:text-slate-200"
 }
 `}
 >
 <item.icon size={20} className={isActive ? "" : "group-active:scale-95 transition-transform"} />
 <span className="font-medium">{item.name}</span>
 </Link>
 );
 })}
 </nav>

 {/* User Profile & Logout */}
 <div className="p-4 border-t border-gray-200/50 dark:border-slate-800/50">
 <button
 onClick={handleLogout}
 className="flex items-center gap-3 px-4 py-3 text-red-500 active:bg-red-50 dark:active:bg-red-900/10 rounded-xl w-full transition-colors"
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
  <div className="hidden lg:flex absolute top-4 right-6 z-50 justify-end pointer-events-none">
  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center gap-3 px-4 py-2 shadow-xl shadow-brand-blue/5 pointer-events-auto transition-all duration-300">
  <SidebarBetaWidget variant="pill" />
  <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />
  <NotificationBell />
  </div>
  </div>
  )}

  {/* Mobile Top Bar (Split Islands) */}
  {!isTakeTestPage && (
  <div className="lg:hidden absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
  {/* Logo Island */}
  <Link href="/dashboard" className="h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center justify-center gap-2.5 px-4 shadow-lg shadow-brand-blue/5 pointer-events-auto">
  <div className="relative w-5 h-5 flex-shrink-0">
  <Image src="/favicon.ico" alt="Logo" fill className="object-contain" />
  </div>
  <div className="flex flex-col">
  <span className="font-sans-pro font-black text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-none">
  Promax
  </span>
  <span className="text-[6px] font-semibold text-brand-orange dark:text-brand-orange tracking-[0.2em] uppercase leading-none mt-0.5 pl-[0.5px]">
  Education
  </span>
  </div>
  </Link>
  
  {/* Bell & Test Rejimi Island */}
  <div className="h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-slate-800/50 rounded-full flex items-center justify-center gap-2 px-3 shadow-lg shadow-brand-blue/5 pointer-events-auto">
  <SidebarBetaWidget variant="pill" />
  <NotificationBell />
  </div>
  </div>
  )}

 {/* Page Content */}
 <main className={`flex-1 overflow-y-auto w-full relative z-0 ${isTakeTestPage ? '' : 'p-4 pt-20 pb-20 lg:p-6 lg:pt-16 lg:pb-6'}`}>
 <div className={`w-full max-w-full mx-auto min-h-full ${isTakeTestPage ? 'pt-safe' : ''}`}>
 {children}
 </div>
 </main>
 </div>

 {/* Mobile Bottom Navigation */}
 {!isTakeTestPage && (
 <div className="lg:hidden fixed bottom-3 left-4 right-4 z-50 flex justify-center pointer-events-none">
 <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-700/50 px-1.5 py-1.5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,86,210,0.1)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] w-full max-w-md pointer-events-auto safe-area-pb">
 <div className="flex items-center justify-between gap-1 relative">
 {menuItems.map((item) => {
 const isActive = pathname === item.href;
 return (
 <Link
 key={item.href}
 href={item.href}
 className={`relative flex items-center justify-center flex-1 h-12 rounded-full transition-all duration-300 active:scale-95 ${
 isActive ? "text-brand-blue" : "text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300"
 }`}
 >
 {isActive && (
 <motion.div
 layoutId="mobile-nav-active-pill"
 className="absolute inset-0 bg-brand-blue/10 dark:bg-brand-blue/20 rounded-full"
 transition={{ type: "spring", stiffness: 400, damping: 30 }}
 />
 )}
 <div className="relative z-10 flex items-center justify-center">
 <item.icon size={22} className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"} />
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
