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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();
    const pathname = usePathname();
    const { t } = useLanguage();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push("/login");
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
            </div>
        );
    }

    const menuItems = [
        { icon: LayoutDashboard, label: t('sidebar.dashboard'), href: "/dashboard" },
        { icon: BookOpen, label: t('sidebar.onlinetests'), href: "/dashboard/tests" },
        { icon: GraduationCap, label: t('sidebar.results'), href: "/dashboard/results" },
        { icon: Gamepad2, label: t('sidebar.games'), href: "/dashboard/games" },
        { icon: Settings, label: t('sidebar.settings'), href: "/dashboard/settings" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-0 h-screen z-50 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-gray-200 dark:border-slate-800 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                <div className="h-full flex flex-col">


                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-200/50 dark:border-slate-800/50">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="relative w-12 h-8">
                                <Image
                                    src="/favicon.ico"
                                    alt="Promax Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
                                Promax LMS
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
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                                            ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20"
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
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <Link href="/dashboard/profile">
                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold hover:bg-brand-blue/20 transition-colors">
                                <User size={18} />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
