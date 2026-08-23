"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Loader2,
  AlertCircle,
  BookOpen,
  DollarSign,
  Library,
  ChevronRight,
  CalendarCheck,
  ShoppingBag,
  Trophy,
  Globe
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";
import RealtimeSyncEnabler from "@/components/RealtimeSyncEnabler";
import SidebarBetaWidget from "@/components/ui/SidebarBetaWidget";
import AdminReveal from "@/components/ui/AdminReveal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  } | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createClient();

  // Check authentication and role
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/login");
          return;
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.error("Error fetching profile:", profileError);
          setLoading(false);
          return;
        }

        const allowedRoles = ['admin', 'teacher', 'staff'];
        if (!allowedRoles.includes(profile.role)) {
          console.warn("❌ Access DENIED - User role not allowed:", profile.role);
          router.push("/dashboard");
          return;
        }

        setUserInfo({
          name: profile.full_name || user.email?.split('@')[0] || "Foydalanuvchi",
          email: user.email || "user@promax.uz",
          role: profile.role,
          avatarUrl: profile.avatar_url
        });

        setAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error("Access check error:", error);
        router.push("/login");
      }
    };

    checkAccess();
  }, []);

  // Route protection based on sub-path & role
  useEffect(() => {
    if (!userInfo || !authorized) return;

    // Protection rules for Teacher role
    if (userInfo.role === 'teacher') {
      const restrictedForTeacher = ['/admin/payments', '/admin/teachers', '/admin/settings', '/admin/shop'];
      if (restrictedForTeacher.some(path => pathname.startsWith(path))) {
        toast.error("Ushbu bo'limga faqat Bosh Admin kirishi mumkin");
        router.push('/admin');
      }
    }

    // Protection rules for Staff role
    if (userInfo.role === 'staff') {
      const restrictedForStaff = ['/admin/teachers', '/admin/settings'];
      if (restrictedForStaff.some(path => pathname.startsWith(path))) {
        toast.error("Ushbu bo'limga faqat Bosh Admin kirishi mumkin");
        router.push('/admin');
      }
    }
  }, [pathname, userInfo, authorized]);

  // Format date on client
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('uz-UZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formatted);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };  // Show unauthorized state fallback (only once checked and not authorized)
  if (!loading && !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="text-center max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white">Ruxsat Berilmadi</h2>
          <p className="text-xs text-slate-400 font-medium">Ushbu admin bo'limiga kirish huquqiga ega emassiz.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-md shadow-brand-blue/10"
          >
            Kabinetga Qaytish
          </Link>
        </div>
      </div>
    );
  }

  // Menu items with explicit role access permissions
  const allMenuItems = [
    { icon: LayoutDashboard, label: "Bosh Sahifa", href: "/admin", roles: ['admin', 'teacher', 'staff'] },
    { icon: Users, label: "O'quvchilar", href: "/admin/students", roles: ['admin', 'teacher', 'staff'] },
    { icon: GraduationCap, label: "O'qituvchilar", href: "/admin/teachers", roles: ['admin'] },
    { icon: Library, label: "Fanlar & Darslar", href: "/admin/courses", roles: ['admin', 'teacher', 'staff'] },
    { icon: CalendarCheck, label: "Davomat & Vazifalar", href: "/admin/attendance", roles: ['admin', 'teacher', 'staff'] },
    { icon: BookOpen, label: "Testlar", href: "/admin/tests", roles: ['admin', 'teacher', 'staff'] },
    { icon: Trophy, label: "Milliy Musobaqalar", href: "/admin/tournaments", roles: ['admin', 'staff'] },
    { icon: Globe, label: "Xalqaro Musobaqalar", href: "/admin/international", roles: ['admin', 'staff'] },
    { icon: FileText, label: "Natijalar", href: "/admin/results", roles: ['admin', 'teacher', 'staff'] },
    { icon: DollarSign, label: "To'lovlar", href: "/admin/payments", roles: ['admin', 'staff'] },
    { icon: ShoppingBag, label: "Do'kon & Buyurtmalar", href: "/admin/shop", roles: ['admin', 'staff'] },
    { icon: Bell, label: "E'lonlar", href: "/admin/announcements", roles: ['admin', 'teacher', 'staff'] },
    { icon: Settings, label: "Sozlamalar", href: "/admin/settings", roles: ['admin'] },
  ];

  // Filter menu items dynamically based on current user's role
  const visibleMenuItems = allMenuItems.filter(item =>
    !userInfo?.role || item.roles.includes(userInfo.role)
  );

  return (
    <>
      {/* Admin Reveal Animation */}
      <AdminReveal isLoading={loading} role={userInfo?.role} />

      {!loading && (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}

      {/* Professional Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen z-50 w-72 bg-slate-900/95 backdrop-blur-2xl text-slate-200 border-r border-slate-800/80 transition-transform duration-300 ease-in-out shrink-0 flex flex-col justify-between shadow-2xl lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/70 bg-slate-900/50">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/Logo_without_sentence.png"
                  alt="Promax Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-wider text-white uppercase font-sans-pro">
                    Promax
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-brand-blue/20 text-brand-blue border border-brand-blue/30 uppercase tracking-wider">
                    {userInfo?.role === 'teacher' ? 'Ustoz' : userInfo?.role === 'staff' ? 'Xodim' : 'Admin'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium tracking-tight">
                  Ta'lim Markazi
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Role-filtered Navigation */}
          <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto custom-scrollbar">
            <div className="px-3 pb-3 text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
              <span>Boshqaruv Menyu</span>
              <span className="text-[9px] font-extrabold text-brand-blue uppercase bg-brand-blue/10 px-2 py-0.5 rounded-full">
                {userInfo?.role === 'teacher' ? "O'qituvchilar uchun" : userInfo?.role === 'staff' ? "Xodimlar uchun" : "Bosh Admin"}
              </span>
            </div>

            {visibleMenuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 relative overflow-hidden
                    ${
                      isActive
                        ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/25"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }
                  `}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      size={20}
                      className={`transition-transform duration-200 ${
                        isActive ? "text-white scale-105" : "text-slate-400 group-hover:text-slate-200 group-hover:scale-110"
                      }`}
                    />
                    <span className="tracking-tight text-[14px]">{item.label}</span>
                  </div>

                  {/* Sliding Arrow on Hover & Active */}
                  <ChevronRight
                    size={16}
                    className={`transition-all duration-300 ease-out transform ${
                      isActive
                        ? "opacity-100 translate-x-0 text-white"
                        : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-300"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-800/70 bg-slate-900/40">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                {userInfo?.avatarUrl ? (
                  <img
                    src={userInfo.avatarUrl}
                    alt={userInfo.name}
                    className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/20 border border-brand-blue/30 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                    {userInfo?.name.charAt(0) || "A"}
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-100 truncate">
                    {userInfo?.name}
                  </span>
                  <span className="text-[10px] font-semibold text-brand-blue capitalize tracking-wide truncate">
                    {userInfo?.role === 'teacher' ? "O'qituvchi" : userInfo?.role === 'staff' ? "Xodim" : "Bosh Admin"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                title="Chiqish"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <SidebarBetaWidget variant="pill" />
              <span className="hidden sm:flex px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tizim Faol
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">
              {currentDate}
            </span>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

            {/* Quick Actions / Notifications */}
            <Link
              href="/admin/announcements"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-brand-blue hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
              title="E'lonlar va Bildirishnomalar"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-blue rounded-full ring-2 ring-white dark:ring-slate-900" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <RealtimeSyncEnabler />
          {children}
        </main>
      </div>
    </div>
      )}
    </>
  );
}
