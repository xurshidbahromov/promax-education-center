"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  Banknote,
  FileText,
  Layers,
  UserPlus,
  PlusCircle,
  CreditCard,
  BookOpen,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  Activity
} from "lucide-react";
import { useAdminStats, useRecentActivity } from "@/hooks/useAdminData";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: activity = [], isLoading: activityLoading } = useRecentActivity();

  const todayDate = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  }, []);

  const safeStats = {
    totalStudents: stats?.totalStudents || 0,
    activeTeachers: stats?.activeTeachers || 0,
    totalGroups: stats?.totalGroups || 0,
    totalTests: stats?.totalTests || 0,
    monthlyRevenue: stats?.monthlyRevenue || "0"
  };

  const statCards = [
    {
      title: "Jami O'quvchilar",
      value: `${safeStats.totalStudents} ta`,
      icon: Users,
      color: "text-blue-500",
      link: "/admin/students"
    },
    {
      title: "Faol O'qituvchilar",
      value: `${safeStats.activeTeachers} ta`,
      icon: GraduationCap,
      color: "text-purple-500",
      link: "/admin/teachers"
    },
    {
      title: "Faol Guruhlar",
      value: `${safeStats.totalGroups} ta`,
      icon: Layers,
      color: "text-amber-500",
      link: "/admin/courses"
    },
    {
      title: "Joriy Oy Tushumi",
      value: `${safeStats.monthlyRevenue} so'm`,
      icon: Banknote,
      color: "text-emerald-500",
      link: "/admin/payments"
    }
  ];

  const quickActions = [
    { label: "Yangi O'quvchi", icon: UserPlus, href: "/admin/students", color: "text-blue-500" },
    { label: "Yangi O'qituvchi", icon: GraduationCap, href: "/admin/teachers", color: "text-purple-500" },
    { label: "Test Yaratish", icon: PlusCircle, href: "/admin/tests/create", color: "text-emerald-500" },
    { label: "To'lov Qabul Qilish", icon: CreditCard, href: "/admin/payments", color: "text-amber-500" },
    { label: "Fanlar & Darslar", icon: BookOpen, href: "/admin/courses", color: "text-indigo-500" }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-sans-pro">
            Boshqaruv Paneli
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
            Promax Education Center — tizim holati va umumiy tahlil
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs font-bold self-start md:self-auto">
          <Clock size={15} className="text-slate-400" />
          <span className="capitalize">{todayDate}</span>
        </div>
      </div>

      {/* Goldilocks Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s, i) => (
          <Link
            key={i}
            href={s.link}
            className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-3xl transition-colors hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between min-w-0"
          >
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate mb-1">{s.title}</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">{s.value}</p>
            </div>
            
            {/* Box-free icon */}
            <s.icon size={26} className={`${s.color} shrink-0 opacity-90`} />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Tezkor Amallar
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {quickActions.map((act, i) => (
            <Link
              key={i}
              href={act.href}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-5 rounded-2xl transition-colors hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-3"
            >
              <act.icon size={20} className={`${act.color} shrink-0`} />
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {act.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Split Section: Recent Activity & Top Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Timeline */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-slate-400" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">So'nggi Harakatlar</h3>
              </div>
            </div>

            {activityLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <Clock size={26} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">Hozircha harakatlar mavjud emas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.slice(0, 5).map((act: any) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 font-bold text-xs text-slate-700 dark:text-slate-200">
                        {act.user?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{act.user}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{act.action}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 shrink-0 ml-2">
                      {new Date(act.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/50">
            <Link
              href="/admin/students"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <span>Barcha o'quvchilarni ko'rish</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Top Performers / Recent Results */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-5 sm:p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-slate-400" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Imtihon Natijalari</h3>
              </div>

              <Link href="/admin/results" className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                Barchasi
              </Link>
            </div>

            {activityLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {activity.filter((a: any) => a.type === 'exam').length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <FileText size={26} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">Hozircha natijalar yo'q</p>
                  </div>
                ) : (
                  activity.filter((a: any) => a.type === 'exam').slice(0, 5).map((res: any) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{res.user}</p>
                          <p className="text-xs text-emerald-600 font-bold mt-0.5">{res.action}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 shrink-0 ml-2">
                        {new Date(res.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/50">
            <Link
              href="/admin/results"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <span>Imtihonlar va Natijalarni ko'rish</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
