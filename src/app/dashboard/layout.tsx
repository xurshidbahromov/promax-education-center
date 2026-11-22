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
  Trophy,
  BellRing,
  Loader2,
  Flame
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import DashboardReveal from "@/components/ui/DashboardReveal";
import StreakPill from "@/components/dashboard/StreakPill";
import SoundToggle from "@/components/ui/SoundToggle";
import PhoneVerifyModal from "@/components/dashboard/PhoneVerifyModal";
import { checkAndUpdateDailyStreak } from "@/lib/streak";
import { soundFx } from "@/lib/sound-effects";
import toast from "react-hot-toast";

import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import SidebarBetaWidget from "@/components/ui/SidebarBetaWidget";
import { Background } from "@/components/Background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { t } = useLanguage();

  // Global event-driven cache invalidation for coins and profile updates
  useEffect(() => {
    const handleSync = () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['fullUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    };
    window.addEventListener("promax_coins_updated", handleSync);
    window.addEventListener("promax_profile_updated", handleSync);
    return () => {
      window.removeEventListener("promax_coins_updated", handleSync);
      window.removeEventListener("promax_profile_updated", handleSync);
    };
  }, [queryClient]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/login");
          return;
        }

        // Fetch profile once and seed React Query cache to eliminate double-fetch waterfall
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, coins, role, avatar_url')
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

        // Seed React Query cache so child pages render immediately with 0 extra requests
        queryClient.setQueryData(['currentUser'], user);
        queryClient.setQueryData(['userProfile', user.id], profile);

        setLoading(false);

        // Check and update daily streak
        checkAndUpdateDailyStreak(user.id).then((res) => {
          if (res.newlyAwarded) {
            window.dispatchEvent(new CustomEvent("promax_streak_updated"));
            window.dispatchEvent(new CustomEvent("promax_coins_updated"));
            soundFx.playCoin();
            toast.custom(
              (tObj) => (
                <div
                  className={`${
                    tObj.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
                  } mt-12 lg:mt-0 pointer-events-auto flex items-center gap-3 w-full max-w-[325px] sm:max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.08)] rounded-2xl px-3.5 py-2.5 transition-all duration-300`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Flame size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold font-fredoka text-slate-900 dark:text-white leading-tight truncate">
                      Kunlik faollik • {res.streak.currentStreak}-kun
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Hisobingizga +{res.rewardCoins} tanga qo&apos;shildi
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold tabular-nums shrink-0">
                    +{res.rewardCoins}
                  </span>
                  <button
                    type="button"
                    onClick={() => toast.dismiss(tObj.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                    aria-label="Yopish"
                  >
                    <X size={14} />
                  </button>
                </div>
              ),
              { duration: 4500 }
            );
          }
        });
      } catch (err) {
        console.error('Auth check error:', err);
        router.push("/login");
      }
    };

    checkUser();
  }, [router, supabase, queryClient]);

  // Global tactile click & navigation micro-sounds
  useEffect(() => {
    const handleInteractiveClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        'button, a[href], [role="button"], input[type="checkbox"], input[type="radio"]'
      ) as HTMLElement | null;
      if (!interactive) return;
      if (interactive.dataset.noSound === "true" || interactive.closest('[data-no-sound="true"]')) return;
      if ((interactive as HTMLButtonElement).disabled || interactive.getAttribute("aria-disabled") === "true") return;

      if (interactive.tagName === "A") {
        soundFx.playNavigate();
      } else {
        soundFx.playTap();
      }
    };

    document.addEventListener("click", handleInteractiveClick, true);
    return () => document.removeEventListener("click", handleInteractiveClick, true);
  }, []);

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

 const mobileMenuItems = [
    { name: t('sidebar.dashboard') || 'Asosiy', shortName: 'Asosiy', href: '/dashboard', icon: LayoutDashboard, matchPrefixes: ['/dashboard'] },
    { name: t('sidebar.lessons') || 'Darslar', shortName: 'Darslar', href: '/dashboard/lessons', icon: LibraryBig, matchPrefixes: ['/dashboard/lessons', '/dashboard/subjects'] },
    { name: t('sidebar.onlinetests') || 'Testlar', shortName: 'Testlar', href: '/dashboard/tests', icon: FileCheck, matchPrefixes: ['/dashboard/tests', '/dashboard/olympiads', '/dashboard/international'] },
    { name: t('sidebar.shop') || "Do'kon", shortName: "Do'kon", href: '/dashboard/shop', icon: ShoppingBag, matchPrefixes: ['/dashboard/shop'] },
    { name: t('sidebar.profile') || 'Profil', shortName: 'Profil', href: '/dashboard/profile', icon: CircleUserRound, matchPrefixes: ['/dashboard/profile'] },
 ];

  const isTakeTestPage = pathname.includes('/take');

  return (
    <>
      {/* Seamless Reveal & Loading Animation */}
      <DashboardReveal isLoading={loading} />
      {!loading && <PhoneVerifyModal />}

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
 const isActive =
 item.href === "/dashboard"
 ? pathname === "/dashboard"
 : pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === "/dashboard/lessons" && pathname.startsWith("/dashboard/subjects"));
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
  {/* Unified Responsive Top Bar (mounts NotificationBell & StreakPill only ONCE) */}
  {!isTakeTestPage && (
  <div className="absolute top-3.5 sm:top-4 left-3.5 right-3.5 sm:left-4 sm:right-4 lg:left-auto lg:right-6 z-50 flex items-center justify-between gap-2 lg:justify-end pointer-events-none">
    {/* Mobile Logo Island */}
    <Link href="/dashboard" className="lg:hidden h-10 sm:h-11 bg-white/95 dark:bg-slate-900/95 border border-gray-200/70 dark:border-slate-800/80 rounded-full flex items-center justify-center gap-2 px-3 sm:px-4 shadow-md shadow-brand-blue/5 pointer-events-auto shrink-0">
      <div className="relative w-5 h-5 flex-shrink-0">
        <Image src="/favicon.ico" alt="Logo" fill className="object-contain" />
      </div>
      <div className="flex flex-col">
        <span className="font-sans-pro font-black text-[13px] sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider leading-none">
          Promax
        </span>
        <span className="text-[6px] font-semibold text-brand-orange dark:text-brand-orange tracking-[0.2em] uppercase leading-none mt-0.5 pl-[0.5px]">
          Education
        </span>
      </div>
    </Link>

    {/* Unified Status Island (Streak, Test Rejimi, Sound & Notifications) */}
    <div className="h-10 sm:h-11 lg:h-auto bg-white/95 dark:bg-slate-900/95 lg:bg-white/90 lg:dark:bg-slate-900/90 lg:backdrop-blur-md border border-gray-200/70 dark:border-slate-800/80 rounded-full flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2.5 px-2 sm:px-3 lg:px-4 lg:py-2 shadow-md lg:shadow-lg shadow-brand-blue/5 pointer-events-auto transition-all duration-300 shrink-0">
      <StreakPill />
      <div className="hidden lg:block w-px h-5 bg-slate-200 dark:bg-slate-800" />
      <SidebarBetaWidget variant="pill" />
      <div className="hidden lg:block w-px h-5 bg-slate-200 dark:bg-slate-800" />
      <SoundToggle />
      <div className="hidden lg:block w-px h-5 bg-slate-200 dark:bg-slate-800" />
      <NotificationBell />
    </div>
  </div>
  )}

 {/* Page Content */}
 <main className={`flex-1 overflow-y-auto w-full relative z-0 ${isTakeTestPage ? '' : 'p-4 pt-20 pb-24 lg:p-6 lg:pt-16 lg:pb-6'}`}>
 <div className={`w-full max-w-full mx-auto min-h-full ${isTakeTestPage ? 'pt-safe' : ''}`}>
 {children}
 </div>
 </main>
 </div>

 {/* Mobile Bottom Navigation (5 Primary Labeled Tabs) */}
 {!isTakeTestPage && (
 <div className="lg:hidden fixed bottom-3 left-3.5 right-3.5 z-50 flex justify-center pointer-events-none">
 <nav
 aria-label="Asosiy navigatsiya"
 className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 px-1.5 py-1.5 rounded-[1.75rem] shadow-[0_10px_28px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.4)] w-full max-w-md pointer-events-auto safe-area-pb"
 >
 <div className="grid grid-cols-5 gap-0.5 relative">
 {mobileMenuItems.map((item) => {
 const isActive =
 item.href === '/dashboard'
 ? pathname === '/dashboard'
 : item.matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
 return (
 <Link
 key={item.href}
 href={item.href}
 className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-[1.25rem] transition-colors duration-200 active:scale-95 ${
 isActive
 ? "text-brand-blue dark:text-blue-400"
 : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
 }`}
 >
 {isActive && (
 <motion.div
 layoutId="mobile-nav-active-pill"
 className="absolute inset-0 bg-brand-blue/[0.09] dark:bg-brand-blue/20 rounded-[1.25rem]"
 transition={{ type: "spring", stiffness: 420, damping: 32 }}
 />
 )}
 <item.icon size={19} className={`relative z-10 ${isActive ? "stroke-[2.3]" : "stroke-[1.85]"}`} />
 <span className={`relative z-10 text-[10px] leading-none tracking-tight truncate max-w-full px-0.5 ${isActive ? "font-bold" : "font-medium"}`}>
 {item.shortName}
 </span>
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
