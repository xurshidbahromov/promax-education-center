"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck,
    Bell,
    Loader2,
    AlertCircle,
    BookOpen,
    DollarSign
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState("");
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
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

                // Check user role from profiles table
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError || !profile) {
                    console.error("Error fetching profile:", profileError);
                    console.error("Profile data:", profile);
                    // Don't redirect immediately, might be temporary network
                    setLoading(false);
                    return;
                }

                console.log("🔍 Admin Access Check:", {
                    userId: user.id,
                    userEmail: user.email,
                    profileRole: profile.role,
                    allowedRoles: ['admin', 'teacher', 'staff']
                });

                // Only allow admin, teacher, and staff roles
                const allowedRoles = ['admin', 'teacher', 'staff'];
                if (!allowedRoles.includes(profile.role)) {
                    console.warn("❌ Access DENIED - User role not allowed:", profile.role);
                    router.push("/dashboard");
                    return;
                }

                console.log("✅ Access GRANTED - User is authorized");
                setAuthorized(true);
                setLoading(false);
            } catch (error) {
                console.error("Access check error:", error);
                router.push("/login");
            }
        };

        checkAccess();
    }, []); // Only run once on mount

    // Render date only on client to avoid hydration mismatch
    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('uz-UZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Show unauthorized state (shouldn't reach here due to redirects, but as fallback)
    if (!authorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to access this area.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 h-10 px-6 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }


    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
        { icon: Users, label: "Students", href: "/admin/students" },
        { icon: GraduationCap, label: "Teachers", href: "/admin/teachers" },
        { icon: BookOpen, label: "Tests", href: "/admin/tests" },
        { icon: FileText, label: "Results", href: "/admin/results" },
        { icon: DollarSign, label: "Payments", href: "/admin/payments" },
        { icon: Bell, label: "Announcements", href: "/admin/announcements" },
        { icon: Settings, label: "Settings", href: "/admin/settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-slate-950">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Distinct Dark Theme for Admin */}
            <aside
                className={`
                    fixed lg:sticky top-0 h-screen z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                `}
            >
                <div className="h-full flex flex-col">
                    {/* Admin Brand */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-lg font-bold">
                                Promax <span className="text-red-500">Admin</span>
                            </span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden ml-auto text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
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
                                            ? "bg-red-600/10 text-red-500 border border-red-600/20"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        }
                                    `}
                                >
                                    <item.icon size={20} className={isActive ? "" : "group-hover:scale-110 transition-transform"} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Admin Profile */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-bold">
                                A
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">Administrator</p>
                                <p className="text-xs text-slate-400 truncate">admin@promax.uz</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <span className="hidden md:block text-sm font-medium text-gray-500 dark:text-gray-400">
                            {currentDate}
                        </span>
                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 hidden md:block" />
                        <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
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
